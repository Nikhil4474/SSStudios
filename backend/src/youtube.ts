import { config } from './config.js'

export type LiveStatus = { live: boolean; videoId?: string }

// Cache briefly so repeated page loads/polling don't burn YouTube API quota
// (search.list costs 100 quota units per call against a 10,000/day default quota).
let cached: { result: LiveStatus; expiresAt: number } | null = null
const CACHE_MS = 60_000

export async function getLiveStatus(): Promise<LiveStatus> {
  const { apiKey, channelId } = config.youtube
  if (!apiKey || !channelId) {
    return { live: false }
  }

  if (cached && cached.expiresAt > Date.now()) {
    return cached.result
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('channelId', channelId)
  url.searchParams.set('eventType', 'live')
  url.searchParams.set('type', 'video')
  url.searchParams.set('key', apiKey)

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`YouTube API error (${res.status}): ${await res.text()}`)
  }

  const data = await res.json()
  const videoId: string | undefined = data.items?.[0]?.id?.videoId
  const result: LiveStatus = videoId ? { live: true, videoId } : { live: false }

  cached = { result, expiresAt: Date.now() + CACHE_MS }
  return result
}
