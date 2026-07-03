import { API_BASE_URL } from '../config'

// Bypasses ngrok's browser-warning interstitial, which would otherwise return an HTML
// page instead of JSON when testing through an ngrok tunnel. Harmless in production.
const FETCH_HEADERS = { 'ngrok-skip-browser-warning': 'true' }

export type BusyBlock = {
  start: string // ISO datetime
  end: string // ISO datetime
  label: string // human-readable, e.g. "9:00 AM"
  endLabel: string // human-readable, e.g. "10:00 AM"
}

export type DaySchedule = {
  date: string
  busy: BusyBlock[]
  bufferMinutes: number
}

export type LiveStatus = { live: boolean; videoId?: string }

export async function fetchLiveStatus(): Promise<LiveStatus> {
  const res = await fetch(`${API_BASE_URL}/api/live-status`, { headers: FETCH_HEADERS })
  if (!res.ok) throw new Error('Failed to check live status')
  return res.json()
}

export async function fetchDaySchedule(date: string): Promise<DaySchedule> {
  const res = await fetch(`${API_BASE_URL}/api/day-schedule?date=${date}`, { headers: FETCH_HEADERS })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to load schedule')
  return data
}

export type AvailabilityCheck = {
  available: boolean
  reason?: string
  start: string
  end: string
}

export async function checkAvailability(date: string, startTime: string, endTime: string): Promise<AvailabilityCheck> {
  const res = await fetch(
    `${API_BASE_URL}/api/availability?date=${date}&startTime=${startTime}&endTime=${endTime}`,
    { headers: FETCH_HEADERS },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to check availability')
  return data
}

export type BookingPayload = {
  date: string
  startTime: string
  endTime: string
  name: string
  phone: string
  email: string
  eventType: string
  location: string
  comments: string
}

export async function submitBooking(payload: BookingPayload) {
  const res = await fetch(`${API_BASE_URL}/api/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...FETCH_HEADERS },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Booking failed')
  return data
}
