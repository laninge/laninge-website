#!/usr/bin/env node
// Evaluation script: runs a set of queries through the embedding + retrieval
// pipeline and prints top-K results for manual inspection. Use this to
// judge whether Voyage embeddings give usable Swedish retrieval before
// wiring up the LLM generation step.
//
// Usage:
//   VOYAGE_API_KEY=xxx node scripts/eval-queries.mjs

import { embedQuery, retrieve } from '../api/_lib/retrieve.js'

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY
if (!VOYAGE_API_KEY) {
  console.error('ERROR: VOYAGE_API_KEY env var is required.')
  process.exit(1)
}

const QUERIES = [
  'Vad säger forskningen om att bilda sparvanor?',
  'Hur påverkar AI vårt beteende?',
  'Vad är EAST-ramverket?',
  'Vilka är de vanligaste sparfällorna?',
  'Hur funkar habituering?',
  'Vad har Niklas skrivit om YouTube?',
  'Vad säger beteendeekonomi om matsvinn?',
  'Hur kan vi få fler att vaccinera sig?',
  'Varför är sociala bevis så starka?',
  'Vad är gapet mellan intention och handling?',
]

const TOP_K = 3

async function main() {
  for (const query of QUERIES) {
    console.log(`\n\n═══════════════════════════════════════════════════════════`)
    console.log(`FRÅGA: ${query}`)
    console.log(`═══════════════════════════════════════════════════════════`)

    try {
      const embedding = await embedQuery(query, VOYAGE_API_KEY)
      const results = await retrieve(embedding, TOP_K)

      results.forEach((r, i) => {
        console.log(`\n  [${i + 1}] score=${r.score.toFixed(4)} | brev #${r.newsletter_number || '?'} | ${r.heading || '(intro)'}`)
        console.log(`      ${r.url}`)
        console.log(`      ${r.text.slice(0, 240).replace(/\s+/g, ' ')}…`)
      })
    } catch (err) {
      console.error(`  ERROR: ${err.message}`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
