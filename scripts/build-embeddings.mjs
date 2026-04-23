#!/usr/bin/env node
// Parses Substack newsletter HTML archive, chunks on <h2> headings,
// embeds each chunk via Voyage AI, writes api/_data/embeddings.json.
//
// Usage:
//   NEWSLETTERS_DIR=/path/to/posts VOYAGE_API_KEY=xxx node scripts/build-embeddings.mjs
//
// Incremental: skips chunks whose content hash is already embedded.

import { readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { parse as parseCsv } from 'csv-parse/sync'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const OUTPUT_PATH = join(PROJECT_ROOT, 'api', '_data', 'embeddings.json')

const NEWSLETTERS_DIR = process.env.NEWSLETTERS_DIR
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY
const DRY_RUN = process.env.DRY_RUN === '1'
const VOYAGE_MODEL = 'voyage-3-lite'
const EMBEDDING_DIM = 512
const BATCH_SIZE = 64
const PREAMBLE_MAX_LEN = 240
const MIN_CHUNK_CHARS = 120

if (!NEWSLETTERS_DIR) {
  console.error('ERROR: NEWSLETTERS_DIR env var is required.')
  console.error('Example: NEWSLETTERS_DIR=~/Downloads/JTX1ZMHkTP_QRwBg_ZyAeQ/posts')
  process.exit(1)
}
if (!DRY_RUN && !VOYAGE_API_KEY) {
  console.error('ERROR: VOYAGE_API_KEY env var is required (or set DRY_RUN=1 to skip embedding).')
  process.exit(1)
}

const postsCsvPath = join(NEWSLETTERS_DIR, '..', 'posts.csv')
const postsDir = NEWSLETTERS_DIR

function hashText(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16)
}

async function loadPostsCsv() {
  const raw = await readFile(postsCsvPath, 'utf8')
  const rows = parseCsv(raw, { columns: true, skip_empty_lines: true })
  const map = new Map()
  for (const row of rows) {
    map.set(row.post_id, row)
  }
  return map
}

function parseFilename(filename) {
  const base = filename.replace(/\.html$/, '')
  const match = base.match(/^(\d+)\.(.+)$/)
  if (!match) return null
  return {
    numericId: match[1],
    slug: match[2],
    csvId: base,
  }
}

function extractNewsletterNumber(title, slug) {
  const fromTitle = title?.match(/#(\d+)/)
  if (fromTitle) return parseInt(fromTitle[1], 10)
  const fromSlug = slug.match(/nyhetsbrev-(\d+)/)
  if (fromSlug) return parseInt(fromSlug[1], 10)
  return null
}

function extractPreamble($) {
  const firstP = $('p').first().text().trim()
  if (firstP.length <= PREAMBLE_MAX_LEN) return firstP
  return firstP.slice(0, PREAMBLE_MAX_LEN).replace(/\s+\S*$/, '') + '…'
}

// Strip iframe/figure/picture/blockquote-internal noise but keep text
function cleanTextNode($, el) {
  return $(el)
    .clone()
    .find('iframe, picture source, .pencraft, .image-link-expand, .restack-image, .view-image, button, svg')
    .remove()
    .end()
    .text()
    .replace(/\s+/g, ' ')
    .trim()
}

function chunkByH2($, preamble) {
  const chunks = []
  const allElements = $('body').children().toArray()
  // cheerio wraps body, but our input has no <body>; operate on root
  const roots = $.root().children().toArray()
  const topLevel = roots.length > 0 ? roots : allElements

  let current = { heading: null, parts: [] }

  const flush = () => {
    if (!current.parts.length) return
    const text = current.parts.join('\n\n').trim()
    if (text.length < MIN_CHUNK_CHARS && chunks.length > 0) {
      // Merge trivial trailing chunk into previous
      chunks[chunks.length - 1].text += '\n\n' + text
      return
    }
    chunks.push({ heading: current.heading, text })
  }

  for (const node of topLevel) {
    const tag = node.tagName?.toLowerCase()
    if (tag === 'h2') {
      flush()
      current = { heading: $(node).text().trim(), parts: [] }
    } else if (tag === 'h1') {
      // rare, treat like h2
      flush()
      current = { heading: $(node).text().trim(), parts: [] }
    } else {
      const text = cleanTextNode($, node)
      if (text) current.parts.push(text)
    }
  }
  flush()

  // Fallback: no h2 in post → single chunk
  if (chunks.length === 0) {
    const allText = $.root()
      .text()
      .replace(/\s+/g, ' ')
      .trim()
    if (allText.length >= MIN_CHUNK_CHARS) {
      chunks.push({ heading: null, text: allText })
    }
  }

  // Prepend preamble to first chunk (tonality anchor)
  if (chunks.length > 0 && preamble && chunks[0].text.indexOf(preamble) !== 0) {
    // Only prepend preamble to the first section
    chunks[0].preamble = preamble
  }

  return chunks
}

function buildChunkText(preamble, heading, body, newsletterNumber, subtitle) {
  const parts = []
  if (newsletterNumber) {
    parts.push(`Brev #${newsletterNumber}${subtitle ? ' — ' + subtitle : ''}`)
  }
  if (heading) parts.push(heading)
  if (preamble) parts.push(preamble)
  parts.push(body)
  return parts.join('\n\n')
}

async function embedBatch(texts) {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: texts,
      model: VOYAGE_MODEL,
      output_dimension: EMBEDDING_DIM,
      input_type: 'document',
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Voyage API ${res.status}: ${body}`)
  }
  const json = await res.json()
  return json.data.map((d) => d.embedding)
}

async function loadExisting() {
  if (!existsSync(OUTPUT_PATH)) return null
  try {
    const raw = await readFile(OUTPUT_PATH, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function main() {
  console.log('Reading posts.csv…')
  const postsMap = await loadPostsCsv()
  console.log(`  ${postsMap.size} posts in CSV`)

  console.log(`Scanning ${postsDir}…`)
  const files = (await readdir(postsDir)).filter((f) => f.endsWith('.html'))
  console.log(`  ${files.length} HTML files`)

  console.log('Loading existing embeddings (for incremental build)…')
  const existing = await loadExisting()
  const existingByHash = new Map()
  if (existing?.chunks) {
    for (const c of existing.chunks) {
      if (c.hash) existingByHash.set(c.hash, c.embedding)
    }
    console.log(`  ${existingByHash.size} chunks can be reused by hash`)
  }

  const allChunks = []
  const unmatchedPosts = []

  for (const file of files) {
    const parsed = parseFilename(file)
    if (!parsed) {
      console.warn(`  ⚠ Unparseable filename: ${file}`)
      continue
    }

    const meta = postsMap.get(parsed.csvId)
    if (!meta) {
      unmatchedPosts.push(file)
    }

    const html = await readFile(join(postsDir, file), 'utf8')
    const $ = cheerio.load(html, null, false)

    const preamble = extractPreamble($)
    const rawChunks = chunkByH2($, preamble)

    const title = meta?.title || parsed.slug.replace(/-/g, ' ')
    const subtitle = meta?.subtitle || ''
    const postDate = meta?.post_date || ''
    const nrNumber = extractNewsletterNumber(title, parsed.slug)
    const url = `https://laninge.substack.com/p/${parsed.slug}`

    rawChunks.forEach((c, i) => {
      const embedText = buildChunkText(c.preamble, c.heading, c.text, nrNumber, subtitle)
      const hash = hashText(embedText)
      allChunks.push({
        id: `${parsed.numericId}#${i}`,
        post_id: parsed.numericId,
        newsletter_number: nrNumber,
        post_date: postDate,
        title,
        subtitle,
        slug: parsed.slug,
        url,
        heading: c.heading || null,
        text: c.text,
        embed_text: embedText,
        hash,
      })
    })
  }

  console.log(`\n  ${allChunks.length} chunks total`)
  if (unmatchedPosts.length) {
    console.warn(`  ⚠ ${unmatchedPosts.length} files had no CSV match (using filename-derived metadata):`)
    for (const f of unmatchedPosts.slice(0, 10)) console.warn(`    - ${f}`)
    if (unmatchedPosts.length > 10) console.warn(`    (+${unmatchedPosts.length - 10} more)`)
  }

  // Separate chunks needing new embedding from cached ones
  const needsEmbedding = []
  for (const c of allChunks) {
    const cached = existingByHash.get(c.hash)
    if (cached && cached.length === EMBEDDING_DIM) {
      c.embedding = cached
    } else {
      needsEmbedding.push(c)
    }
  }

  console.log(`\n  ${allChunks.length - needsEmbedding.length} cached, ${needsEmbedding.length} to embed`)

  if (DRY_RUN) {
    console.log('\n  DRY_RUN=1 — skipping embedding API calls.')
    console.log('  Sample chunks (first 3):')
    for (const c of allChunks.slice(0, 3)) {
      console.log(`\n  --- ${c.id} | ${c.title} ---`)
      console.log(`  heading: ${c.heading}`)
      console.log(`  text (first 200 chars): ${c.text.slice(0, 200)}…`)
    }
    console.log('\n  (no output file written in dry-run)')
    return
  }

  if (needsEmbedding.length > 0) {
    let done = 0
    for (let i = 0; i < needsEmbedding.length; i += BATCH_SIZE) {
      const batch = needsEmbedding.slice(i, i + BATCH_SIZE)
      const embeddings = await embedBatch(batch.map((c) => c.embed_text))
      batch.forEach((c, j) => {
        c.embedding = embeddings[j]
      })
      done += batch.length
      process.stdout.write(`\r  embedded ${done}/${needsEmbedding.length}`)
      // brief pause to be friendly to API
      if (i + BATCH_SIZE < needsEmbedding.length) {
        await new Promise((r) => setTimeout(r, 200))
      }
    }
    console.log()
  }

  // Strip embed_text before writing (we only kept it for hashing)
  const output = {
    model: VOYAGE_MODEL,
    dim: EMBEDDING_DIM,
    generated_at: new Date().toISOString(),
    count: allChunks.length,
    chunks: allChunks.map((c) => ({
      id: c.id,
      post_id: c.post_id,
      newsletter_number: c.newsletter_number,
      post_date: c.post_date,
      title: c.title,
      subtitle: c.subtitle,
      slug: c.slug,
      url: c.url,
      heading: c.heading,
      text: c.text,
      hash: c.hash,
      embedding: c.embedding,
    })),
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(output))
  const sizeMb = (JSON.stringify(output).length / 1024 / 1024).toFixed(2)
  console.log(`\n✓ Wrote ${OUTPUT_PATH} (${sizeMb} MB, ${allChunks.length} chunks)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
