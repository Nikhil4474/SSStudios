import { google } from 'googleapis'
import { fromZonedTime } from 'date-fns-tz'
import { config } from './config.js'

function getOAuthClient() {
  const client = new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri,
  )
  client.setCredentials({ refresh_token: config.google.refreshToken })
  return client
}

function getCalendar() {
  return google.calendar({ version: 'v3', auth: getOAuthClient() })
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd
}

// Combines a date (YYYY-MM-DD) and time (HH:MM, 24h) entered by the client, interpreted
// in the studio's configured timezone, into a UTC ISO instant.
export function localToUtcIso(date: string, time: string): string {
  return fromZonedTime(`${date}T${time}:00`, config.business.timezone).toISOString()
}

// Formats a UTC ISO instant back into a human-readable wall-clock time in the studio's
// configured timezone, e.g. "9:15 AM".
export function formatTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: config.business.timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

async function getBusyPeriods(dateStr: string): Promise<{ start: Date; end: Date }[]> {
  if (config.mockCalendar) {
    // A couple of fake busy blocks so the day-schedule graphic has something to show.
    return [
      { start: fromZonedTime(`${dateStr}T11:00:00`, config.business.timezone), end: fromZonedTime(`${dateStr}T12:30:00`, config.business.timezone) },
    ]
  }

  const dayStartUtc = fromZonedTime(`${dateStr}T00:00:00`, config.business.timezone)
  const dayEndUtc = fromZonedTime(`${dateStr}T23:59:59`, config.business.timezone)

  const calendar = getCalendar()
  const freebusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: dayStartUtc.toISOString(),
      timeMax: dayEndUtc.toISOString(),
      timeZone: 'UTC',
      items: [{ id: config.google.calendarId }],
    },
  })

  return (freebusy.data.calendars?.[config.google.calendarId]?.busy || []).map((b) => ({
    start: new Date(b.start as string),
    end: new Date(b.end as string),
  }))
}

export type BusyBlock = { start: string; end: string; label: string; endLabel: string }

// Returns the day's actual booked periods (not buffer-expanded) for display in the
// booking graphic. The frontend pads each block visually using bufferMinutes.
export async function getDaySchedule(dateStr: string): Promise<{ busy: BusyBlock[]; bufferMinutes: number }> {
  const busy = await getBusyPeriods(dateStr)
  return {
    busy: busy.map((b) => ({
      start: b.start.toISOString(),
      end: b.end.toISOString(),
      label: formatTimeLabel(b.start.toISOString()),
      endLabel: formatTimeLabel(b.end.toISOString()),
    })),
    bufferMinutes: config.business.bufferMinutes,
  }
}

export type AvailabilityResult = { available: boolean; reason?: string }

// Checks whether a client-chosen [start, end) range is free, requiring at least
// bufferMinutes of gap before and after every existing booking (for travel time).
export async function checkRangeAvailable(startIso: string, endIso: string): Promise<AvailabilityResult> {
  const start = new Date(startIso)
  const end = new Date(endIso)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { available: false, reason: 'That is not a valid date/time.' }
  }
  if (end <= start) {
    return { available: false, reason: 'End time must be after the start time.' }
  }
  if (start.getTime() < Date.now()) {
    return { available: false, reason: 'That time has already passed.' }
  }

  const dateStr = startIso.slice(0, 10)
  const busy = await getBusyPeriods(dateStr)
  const bufferMs = config.business.bufferMinutes * 60_000

  const conflict = busy.some((b) =>
    overlaps(start, end, new Date(b.start.getTime() - bufferMs), new Date(b.end.getTime() + bufferMs)),
  )

  return conflict
    ? {
        available: false,
        reason: `That time is too close to another booking — we keep a ${config.business.bufferMinutes}-minute gap between sessions for travel. Please choose another time.`,
      }
    : { available: true }
}

export type BookingInput = {
  start: string
  end: string
  name: string
  phone: string
  eventType: string
  location: string
  comments: string
}

export async function createBookingEvent(input: BookingInput) {
  if (config.mockCalendar) {
    return { id: 'mock-event-id', htmlLink: 'https://calendar.google.com/mock-event' }
  }

  const calendar = getCalendar()

  const description = [
    `Booked via website by ${input.name}`,
    `Event type: ${input.eventType}`,
    `Phone: ${input.phone}`,
    `Location: ${input.location}`,
    input.comments ? `Comments: ${input.comments}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const event = await calendar.events.insert({
    calendarId: config.google.calendarId,
    requestBody: {
      summary: `${input.eventType} — ${input.name}`,
      description,
      location: input.location,
      start: { dateTime: input.start, timeZone: config.business.timezone },
      end: { dateTime: input.end, timeZone: config.business.timezone },
    },
  })

  return event.data
}
