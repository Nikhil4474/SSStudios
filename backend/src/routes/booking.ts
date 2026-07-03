import { Router } from 'express'
import { checkRangeAvailable, createBookingEvent, getDaySchedule, localToUtcIso } from '../googleCalendar.js'
import { sendBookingWhatsApp } from '../whatsapp.js'
import { sendBookingConfirmationEmail } from '../email.js'

const router = Router()

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Returns the day's already-booked periods, for the client-facing schedule graphic.
router.get('/day-schedule', async (req, res) => {
  const date = String(req.query.date || '')
  if (!DATE_RE.test(date)) {
    return res.status(400).json({ error: 'date (YYYY-MM-DD) is required' })
  }
  try {
    const schedule = await getDaySchedule(date)
    res.json({ date, ...schedule })
  } catch (err) {
    console.error('day-schedule error', err)
    res.status(502).json({ error: 'Could not reach Google Calendar. Check server credentials.' })
  }
})

// Checks whether a specific requested [startTime, endTime) range on a date is bookable.
router.get('/availability', async (req, res) => {
  const date = String(req.query.date || '')
  const startTime = String(req.query.startTime || '')
  const endTime = String(req.query.endTime || '')
  if (!DATE_RE.test(date) || !TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    return res.status(400).json({ error: 'date, startTime, and endTime are required' })
  }
  try {
    const start = localToUtcIso(date, startTime)
    const end = localToUtcIso(date, endTime)
    const result = await checkRangeAvailable(start, end)
    res.json({ ...result, start, end })
  } catch (err) {
    console.error('availability error', err)
    res.status(502).json({ error: 'Could not reach Google Calendar. Check server credentials.' })
  }
})

router.post('/book', async (req, res) => {
  const { date, startTime, endTime, name, phone, email, eventType, location, comments } = req.body || {}

  if (!DATE_RE.test(date) || !TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    return res.status(400).json({ error: 'A valid date, start time, and end time are required.' })
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required.' })
  }
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return res.status(400).json({ error: 'Phone number is required.' })
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email is required.' })
  }
  if (!eventType || typeof eventType !== 'string' || !eventType.trim()) {
    return res.status(400).json({ error: 'Event type is required.' })
  }
  if (!location || typeof location !== 'string' || !location.trim()) {
    return res.status(400).json({ error: 'Location is required.' })
  }

  try {
    const start = localToUtcIso(date, startTime)
    const end = localToUtcIso(date, endTime)

    // Re-check the range is still free right before booking to avoid double-booking races.
    const { available, reason } = await checkRangeAvailable(start, end)
    if (!available) {
      return res.status(409).json({ error: reason || 'That time is no longer available.' })
    }

    const event = await createBookingEvent({
      start,
      end,
      name: name.trim(),
      phone: phone.trim(),
      eventType: eventType.trim(),
      location: location.trim(),
      comments: typeof comments === 'string' ? comments.trim() : '',
    })
    res.json({ success: true, eventId: event.id, htmlLink: event.htmlLink })

    // Notify the owner on WhatsApp and email the client a confirmation (CC'd to the
    // business inbox). Both run after the response so a failure in either never blocks
    // or fails the client's booking.
    sendBookingWhatsApp({
      name: name.trim(),
      phone: phone.trim(),
      eventType: eventType.trim(),
      location: location.trim(),
      start,
      end,
    }).catch((err) => console.error('whatsapp notification error', err))

    sendBookingConfirmationEmail({
      clientEmail: email.trim(),
      name: name.trim(),
      phone: phone.trim(),
      eventType: eventType.trim(),
      location: location.trim(),
      comments: typeof comments === 'string' ? comments.trim() : '',
      start,
      end,
    }).catch((err) => console.error('confirmation email error', err))
  } catch (err) {
    console.error('booking error', err)
    res.status(502).json({ error: 'Could not create the booking. Check server credentials.' })
  }
})

export default router
