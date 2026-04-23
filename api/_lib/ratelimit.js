// IP-based rate limit + query-hash cache backed by Upstash Redis.
// If UPSTASH env vars are missing (dev), all operations become no-ops.

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createHash } from 'node:crypto'

const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

let redis = null
let limiter = null

if (hasUpstash) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: false,
    prefix: 'laninge:ask',
  })
}

export async function checkRateLimit(ip) {
  if (!limiter) return { ok: true, remaining: Infinity }
  const { success, remaining, reset } = await limiter.limit(ip || 'unknown')
  return { ok: success, remaining, reset }
}

function hashQuery(query) {
  return createHash('sha256').update(query.trim().toLowerCase()).digest('hex').slice(0, 32)
}

const CACHE_TTL_SECONDS = 60 * 60 * 24 // 24h

export async function getCached(query) {
  if (!redis) return null
  const key = `laninge:ask:cache:${hashQuery(query)}`
  const raw = await redis.get(key)
  if (!raw) return null
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return null
  }
}

export async function setCached(query, value) {
  if (!redis) return
  const key = `laninge:ask:cache:${hashQuery(query)}`
  await redis.set(key, JSON.stringify(value), { ex: CACHE_TTL_SECONDS })
}

export function extractIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string') return fwd.split(',')[0].trim()
  if (Array.isArray(fwd) && fwd.length) return fwd[0]
  return req.socket?.remoteAddress || 'unknown'
}
