import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const EMBEDDINGS_PATH = join(__dirname, '..', '_data', 'embeddings.json')

let cached = null

async function loadEmbeddings() {
  if (cached) return cached
  const raw = await readFile(EMBEDDINGS_PATH, 'utf8')
  const parsed = JSON.parse(raw)
  // Pre-compute magnitudes for faster cosine-sim
  for (const c of parsed.chunks) {
    let sum = 0
    for (const v of c.embedding) sum += v * v
    c._mag = Math.sqrt(sum)
  }
  cached = parsed
  return cached
}

function cosineSim(a, b, bMag) {
  let dot = 0
  let aMag = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    aMag += a[i] * a[i]
  }
  return dot / (Math.sqrt(aMag) * bMag)
}

export async function embedQuery(query, apiKey, model = 'voyage-3-lite', dim = 512) {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: [query],
      model,
      output_dimension: dim,
      input_type: 'query',
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Voyage embed failed (${res.status}): ${body}`)
  }
  const json = await res.json()
  return json.data[0].embedding
}

export async function retrieve(queryEmbedding, topK = 3) {
  const db = await loadEmbeddings()
  const scored = db.chunks.map((c) => ({
    chunk: c,
    score: cosineSim(queryEmbedding, c.embedding, c._mag),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK).map(({ chunk, score }) => ({
    id: chunk.id,
    post_id: chunk.post_id,
    newsletter_number: chunk.newsletter_number,
    post_date: chunk.post_date,
    title: chunk.title,
    subtitle: chunk.subtitle,
    slug: chunk.slug,
    url: chunk.url,
    heading: chunk.heading,
    text: chunk.text,
    score,
  }))
}

// Deduplicate source brev (so multiple chunks from same brev don't show 2 chips)
export function dedupeSources(results) {
  const seen = new Map()
  for (const r of results) {
    if (!seen.has(r.post_id)) {
      seen.set(r.post_id, {
        post_id: r.post_id,
        newsletter_number: r.newsletter_number,
        post_date: r.post_date,
        title: r.title,
        subtitle: r.subtitle,
        url: r.url,
      })
    }
  }
  return Array.from(seen.values())
}
