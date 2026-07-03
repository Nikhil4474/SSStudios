import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Reveal from './Reveal'
import DaySchedule from './DaySchedule'
import {
  checkAvailability,
  fetchDaySchedule,
  submitBooking,
  type DaySchedule as DayScheduleType,
} from '../lib/api'

function toDateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatTimeLabel(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

function formatRange(startTime: string, endTime: string) {
  const startLabel = formatTimeLabel(startTime)
  const endLabel = formatTimeLabel(endTime)
  const [startClock, startPeriod] = startLabel.split(' ')
  const [endClock, endPeriod] = endLabel.split(' ')
  return startPeriod === endPeriod ? `${startClock} - ${endClock} ${endPeriod}` : `${startLabel} - ${endLabel}`
}

type CheckStatus = 'idle' | 'checking' | 'available' | 'unavailable'
type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [schedule, setSchedule] = useState<DayScheduleType | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)

  const [checkStatus, setCheckStatus] = useState<CheckStatus>('idle')
  const [checkMessage, setCheckMessage] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [eventType, setEventType] = useState('')
  const [location, setLocation] = useState('')
  const [comments, setComments] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    setSchedule(null)
    if (!selectedDate) return
    setScheduleLoading(true)
    fetchDaySchedule(toDateKey(selectedDate))
      .then(setSchedule)
      .catch(() => setSchedule(null))
      .finally(() => setScheduleLoading(false))
  }, [selectedDate])

  useEffect(() => {
    if (!selectedDate || !startTime || !endTime) {
      setCheckStatus('idle')
      return
    }
    setCheckStatus('checking')
    const timer = setTimeout(() => {
      checkAvailability(toDateKey(selectedDate), startTime, endTime)
        .then((result) => {
          if (result.available) {
            setCheckStatus('available')
          } else {
            setCheckStatus('unavailable')
            setCheckMessage(result.reason || 'That time is not available.')
          }
        })
        .catch((err) => {
          setCheckStatus('unavailable')
          setCheckMessage(err instanceof Error ? err.message : 'Could not check availability.')
        })
    }, 500)
    return () => clearTimeout(timer)
  }, [selectedDate, startTime, endTime])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDate || checkStatus !== 'available') return
    setStatus('submitting')
    try {
      await submitBooking({
        date: toDateKey(selectedDate),
        startTime,
        endTime,
        name,
        phone,
        email,
        eventType,
        location,
        comments,
      })
      setStatus('success')
      setStatusMessage(
        `Your booking for ${eventType} (${formatRange(startTime, endTime)}) is confirmed. We'll be in touch soon to finalize the details. A confirmation has been emailed to ${email}.`,
      )
    } catch (err) {
      setStatus('error')
      setStatusMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const minDate = new Date()

  return (
    <section id="booking" className="bg-paper-alt py-28">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gold">Booking</p>
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            Reserve your session
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Pick a date and time range, and tell us about your event.
          </p>
        </Reveal>

        {status === 'success' ? (
          <Reveal className="rounded-lg border border-gold/40 bg-paper p-10 text-center">
            <p className="font-display text-2xl text-gold">Booking Confirmed</p>
            <p className="mt-3 text-muted">{statusMessage}</p>
          </Reveal>
        ) : (
          <Reveal>
            <div className="grid grid-cols-1 gap-10 rounded-lg border border-line bg-paper p-8 md:grid-cols-2 md:p-10">
              <div>
                <p className="mb-3 text-sm uppercase tracking-wider text-ink">1. Select a date</p>
                <DatePicker
                  selected={selectedDate}
                  onChange={(d: Date | null) => setSelectedDate(d)}
                  minDate={minDate}
                  inline
                  calendarClassName="sss-datepicker"
                />

                {selectedDate && (
                  <div className="mt-6">
                    <p className="mb-3 text-sm uppercase tracking-wider text-ink">2. Choose a time range</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-wider text-muted">Start</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-wider text-muted">End</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>

                    {checkStatus === 'checking' && (
                      <p className="mt-2 text-sm text-muted">Checking availability...</p>
                    )}
                    {checkStatus === 'available' && (
                      <p className="mt-2 text-sm text-gold">{formatRange(startTime, endTime)} is available</p>
                    )}
                    {checkStatus === 'unavailable' && (
                      <p className="mt-2 text-sm text-red-400">{checkMessage}</p>
                    )}

                    <DaySchedule
                      busy={schedule?.busy || []}
                      bufferMinutes={schedule?.bufferMinutes ?? 60}
                      loading={scheduleLoading}
                      selectedStart={startTime}
                      selectedEnd={endTime}
                    />
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="mb-1 text-sm uppercase tracking-wider text-ink">3. Your details</p>
                <input
                  required
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
                />
                <input
                  required
                  type="text"
                  placeholder="Event type (e.g. Wedding, Real Estate, Portraits)"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
                />
                <input
                  required
                  type="text"
                  placeholder="Location (address or venue)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
                />
                <textarea
                  placeholder="Additional comments (optional)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="resize-none rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
                />

                {status === 'error' && <p className="text-sm text-red-400">{statusMessage}</p>}

                <button
                  type="submit"
                  disabled={checkStatus !== 'available' || status === 'submitting'}
                  className="mt-2 rounded-full bg-gold px-8 py-3 text-sm uppercase tracking-wider text-cream transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === 'submitting' ? 'Booking...' : 'Confirm Booking'}
                </button>
                {checkStatus !== 'available' && (
                  <p className="text-xs text-muted">Select an available date and time range first.</p>
                )}
              </form>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
