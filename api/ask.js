import Anthropic from '@anthropic-ai/sdk'
import { embedQuery, retrieve, dedupeSources } from './_lib/retrieve.js'
import { buildSystemPrompt, buildUserMessage } from './_lib/prompt.js'
import { checkRateLimit, getCached, setCached, extractIp } from './_lib/ratelimit.js'

const MODEL = 'claude-sonnet-4-6'
const TOP_K = 4
const MAX_SOURCES = 4
const MAX_OUTPUT_TOKENS = 1024

function writeEvent(res, event) {
  res.write(JSON.stringify(event) + '\n')
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' })
    return
  }

  const query = typeof body.query === 'string' ? body.query.trim() : ''
  if (query.length < 3) {
    res.status(400).json({ error: 'Frågan måste vara minst 3 tecken.' })
    return
  }
  if (query.length > 500) {
    res.status(400).json({ error: 'Frågan är för lång (max 500 tecken).' })
    return
  }

  // Rate limit
  const ip = extractIp(req)
  const rl = await checkRateLimit(ip)
  if (!rl.ok) {
    res.status(429).json({
      error: 'Du har nått max antal frågor per timme. Försök igen senare.',
    })
    return
  }

  // Cache lookup
  const cached = await getCached(query)

  // Set up streaming response
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('X-Accel-Buffering', 'no')

  if (cached && cached.answer && cached.sources) {
    // Replay cached answer in small chunks so UX still streams
    const chunkSize = 40
    for (let i = 0; i < cached.answer.length; i += chunkSize) {
      writeEvent(res, { type: 'delta', text: cached.answer.slice(i, i + chunkSize) })
    }
    writeEvent(res, { type: 'sources', sources: cached.sources })
    writeEvent(res, { type: 'done', cached: true })
    res.end()
    return
  }

  const voyageKey = process.env.VOYAGE_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!voyageKey || !anthropicKey) {
    writeEvent(res, {
      type: 'error',
      message: 'Servern saknar API-nycklar. Kontakta admin.',
    })
    res.end()
    return
  }

  try {
    // 1. Embed query
    const queryEmbedding = await embedQuery(query, voyageKey)

    // 2. Retrieve top-K chunks
    const chunks = await retrieve(queryEmbedding, TOP_K)

    if (chunks.length === 0) {
      writeEvent(res, { type: 'delta', text: 'Jag hittar inga relevanta nyhetsbrev för den frågan.' })
      writeEvent(res, { type: 'sources', sources: [] })
      writeEvent(res, { type: 'done' })
      res.end()
      return
    }

    // 3. Deduplicate sources by post
    const sources = dedupeSources(chunks).slice(0, MAX_SOURCES)

    // 4. Stream Claude response
    const anthropic = new Anthropic({ apiKey: anthropicKey })
    let fullAnswer = ''

    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: buildSystemPrompt(),
      messages: [
        { role: 'user', content: buildUserMessage(query, chunks) },
      ],
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta?.type === 'text_delta' &&
        event.delta.text
      ) {
        fullAnswer += event.delta.text
        writeEvent(res, { type: 'delta', text: event.delta.text })
      }
    }

    writeEvent(res, { type: 'sources', sources })
    writeEvent(res, { type: 'done' })
    res.end()

    // Fire-and-forget cache write
    setCached(query, { answer: fullAnswer, sources }).catch(() => {})
  } catch (err) {
    console.error('ask handler error:', err)
    writeEvent(res, {
      type: 'error',
      message: err?.message || 'Något gick fel. Försök igen.',
    })
    res.end()
  }
}
