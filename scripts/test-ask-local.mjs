#!/usr/bin/env node
// End-to-end smoke test of /api/ask — calls the handler directly with a mock
// request/response and prints streamed output. Lets us verify retrieval +
// Claude + streaming without starting vercel dev.
//
// Usage:
//   node scripts/test-ask-local.mjs "din fråga här"

import { PassThrough } from 'node:stream'

const query = process.argv[2] || 'Vad är EAST-ramverket?'

const handler = (await import('../api/ask.js')).default

const req = {
  method: 'POST',
  headers: { 'x-forwarded-for': '127.0.0.1' },
  socket: { remoteAddress: '127.0.0.1' },
  body: { query },
}

const chunks = []
const res = new PassThrough()
res.setHeader = (k, v) => {
  console.log(`[header] ${k}: ${v}`)
}
res.status = (code) => {
  console.log(`[status] ${code}`)
  return res
}
res.json = (obj) => {
  console.log('[json]', JSON.stringify(obj, null, 2))
  res.end()
  return res
}

res.on('data', (c) => chunks.push(c))
res.on('end', () => {
  const full = Buffer.concat(chunks).toString('utf8')
  console.log('\n\n━━━ RAW STREAM ━━━\n')
  console.log(full)

  // Parse NDJSON events
  console.log('\n━━━ PARSED ━━━\n')
  let answer = ''
  let sources = []
  for (const line of full.split('\n')) {
    if (!line.trim()) continue
    try {
      const e = JSON.parse(line)
      if (e.type === 'delta') answer += e.text
      else if (e.type === 'sources') sources = e.sources
      else if (e.type === 'error') console.error('ERROR:', e.message)
    } catch {}
  }
  console.log('ANSWER:\n' + answer)
  console.log('\nSOURCES:')
  for (const s of sources) {
    console.log(`  #${s.newsletter_number} — ${s.title} — ${s.url}`)
  }
})

console.log(`Query: ${query}\n`)
await handler(req, res)
