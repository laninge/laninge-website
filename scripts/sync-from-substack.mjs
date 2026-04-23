#!/usr/bin/env node
// Incremental sync: fetches Substack RSS, identifies newsletters that are
// NOT yet in api/_data/embeddings.json, chunks + embeds them, merges into
// the existing file. Does NOT re-embed existing chunks.
//
// Exits 0 always. If new chunks were added, prints a summary and writes
// the file. GitHub Actions diffs the file afterwards to decide whether
// to commit.
//
// Usage:
//   VOYAGE_API_KEY=xxx node scripts/sync-from-substack.mjs

import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const OUTPUT_PATH = join(PROJECT_ROOT, 'api', '_data', 'embeddings.json')

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY
const VOYAGE_MODEL = 'voyage-3-lite'
const EMBEDDING_DIM = 512
const BATCH_SIZE = 64
const PREAMBLE_MAX_LEN = 240
const MIN_CHUNK_CHARS = 120
// Fetch through our own domain — Substack blocks GitHub runner IPs
// even with browser UA, but Vercel egress passes through.
const FEED_URL = process.env.FEED_URL || 'https://laninge.com/api/feed'

if (!VOYAGE_API_KEY) {
  console.error('ERROR: VOYAGE_API_KEY env var is required.')
  process.exit(1)
}

function hashText(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16)
}

function slugFromLink(link) {
  const m = link.match(/\/p\/([^/?#]+)/)
  return m ? m[1] : null
}

function extractNewsletterNumber(title, slug) {
  const fromTitle = title?.match(/#(\d+)/)
  if (fromTitle) return parseInt(fromTitle[1], 10)
  const fromSlug = slug?.match(/nyhetsbrev-(\d+)/)
  if (fromSlug) return parseInt(fromSlug[1], 10)
  return null
}

function extractPreamble($) {
  const firstP = $('p').first().text().trim()
  if (firstP.length <= PREAMBLE_MAX_LEN) return firstP
  return firstP.slice(0, PREAMBLE_MAX_LEN).replace(/\s+\S*$/, '') + '…'
}

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
  const topLevel = $.root().children().toArray()

  let current = { heading: null, parts: [] }

  const flush = () => {
    if (!current.parts.length) return
    const text = current.parts.join('\n\n').trim()
    if (text.length < MIN_CHUNK_CHARS && chunks.length > 0) {
      chunks[chunks.length - 1].text += '\n\n' + text
      return
    }
    chunks.push({ heading: current.heading, text })
  }

  for (const node of topLevel) {
    const tag = node.tagName?.toLowerCase()
    if (tag === 'h2' || tag === 'h1') {
      flush()
      current = { heading: $(node).text().trim(), parts: [] }
    } else {
      const text = cleanTextNode($, node)
      if (text) current.parts.push(text)
    }
  }
  flush()

  if (chunks.length === 0) {
    const allText = $.root().text().replace(/\s+/g, ' ').trim()
    if (allText.length >= MIN_CHUNK_CHARS) {
      chunks.push({ heading: null, text: allText })
    }
  }

  if (chunks.length > 0 && preamble) {
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
    throw new Error(`Voyage API ${res.status}: ${await res.text()}`)
  }
  const json = await res.json()
  return json.data.map((d) => d.embedding)
}

async function fetchFeed() {
  const res = await fetch(FEED_URL, {
    headers: {
      // Substack blocks obvious bot UAs with 403. Use a realistic one.
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
  })
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`)
  return res.text()
}

// Minimal RSS parsing — enough for our needs, avoids XML dep
function parseFeed(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let m
  while ((m = itemRegex.exec(xml))) {
    const block = m[1]
    const title = extract(block, /<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]+))<\/title>/)
    const link = extract(block, /<link>([^<]+)<\/link>/)
    const pubDate = extract(block, /<pubDate>([^<]+)<\/pubDate>/)
    const description = extract(block, /<description>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*))<\/description>/)
    const contentMatch = block.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)
    const content = contentMatch ? contentMatch[1] : ''
    items.push({ title, link, pubDate, subtitle: description || '', content })
  }
  return items
}

function extract(block, regex) {
  const m = block.match(regex)
  if (!m) return ''
  return (m[1] || m[2] || '').trim()
}

async function loadExisting() {
  const raw = await readFile(OUTPUT_PATH, 'utf8')
  return JSON.parse(raw)
}

async function main() {
  console.log('Loading existing embeddings.json…')
  const db = await loadExisting()
  const existingSlugs = new Set(db.chunks.map((c) => c.slug))
  const existingHashes = new Map()
  for (const c of db.chunks) {
    if (c.hash) existingHashes.set(c.hash, c.embedding)
  }
  console.log(`  ${db.chunks.length} chunks from ${existingSlugs.size} unique posts`)

  console.log(`Fetching ${FEED_URL}…`)
  const xml = await fetchFeed()
  const items = parseFeed(xml)
  console.log(`  ${items.length} items in feed`)

  const newItems = items.filter((item) => {
    const slug = slugFromLink(item.link)
    return slug && !existingSlugs.has(slug) && item.content
  })

  if (newItems.length === 0) {
    console.log('\n✓ No new newsletters. Nothing to do.')
    return
  }

  console.log(`\n  ${newItems.length} new newsletter(s) to embed:`)
  for (const item of newItems) {
    console.log(`   - ${item.title}`)
  }

  const newChunks = []
  for (const item of newItems) {
    const slug = slugFromLink(item.link)
    const $ = cheerio.load(item.content, null, false)
    const preamble = extractPreamble($)
    const rawChunks = chunkByH2($, preamble)
    const nrNumber = extractNewsletterNumber(item.title, slug)
    const postDate = item.pubDate ? new Date(item.pubDate).toISOString() : ''
    const url = `https://laninge.substack.com/p/${slug}`

    rawChunks.forEach((c, i) => {
      const embedText = buildChunkText(c.preamble, c.heading, c.text, nrNumber, item.subtitle)
      const hash = hashText(embedText)
      newChunks.push({
        id: `${slug}#${i}`,
        post_id: slug, // no numeric ID in feed — use slug as stable key
        newsletter_number: nrNumber,
        post_date: postDate,
        title: item.title,
        subtitle: item.subtitle,
        slug,
        url,
        heading: c.heading || null,
        text: c.text,
        embed_text: embedText,
        hash,
      })
    })
  }

  console.log(`\n  ${newChunks.length} new chunk(s) total`)

  // Reuse embeddings for any identical hashes (unlikely but cheap)
  const needsEmbedding = []
  for (const c of newChunks) {
    const cached = existingHashes.get(c.hash)
    if (cached && cached.length === EMBEDDING_DIM) {
      c.embedding = cached
    } else {
      needsEmbedding.push(c)
    }
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
    }
    console.log()
  }

  // Merge into existing DB (newest first)
  const merged = [
    ...newChunks.map((c) => {
      const { embed_text, ...rest } = c
      return rest
    }),
    ...db.chunks,
  ]

  const output = {
    model: db.model || VOYAGE_MODEL,
    dim: db.dim || EMBEDDING_DIM,
    generated_at: new Date().toISOString(),
    count: merged.length,
    chunks: merged,
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(output))
  const sizeMb = (JSON.stringify(output).length / 1024 / 1024).toFixed(2)
  console.log(`\n✓ Added ${newChunks.length} chunk(s) from ${newItems.length} newsletter(s)`)
  console.log(`  New total: ${merged.length} chunks, ${sizeMb} MB`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
