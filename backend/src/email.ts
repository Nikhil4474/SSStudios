import nodemailer from 'nodemailer'
import { config } from './config.js'

export type BookingConfirmationInput = {
  clientEmail: string
  name: string
  phone: string
  eventType: string
  location: string
  comments: string
  start: string // ISO datetime
  end: string // ISO datetime
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: config.business.timezone,
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: config.business.timezone,
    timeStyle: 'short',
  }).format(new Date(iso))
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: config.email.user, pass: config.email.appPassword },
    })
  }
  return transporter
}

// Emails the client a booking confirmation and CCs the business inbox. Requires
// EMAIL_USER + EMAIL_APP_PASSWORD env vars — see README for Gmail App Password setup.
// No-ops quietly if unconfigured, same pattern as the WhatsApp notification.
export async function sendBookingConfirmationEmail(input: BookingConfirmationInput) {
  if (!config.email.user || !config.email.appPassword) {
    console.warn('[email] Not configured — skipping confirmation email. Set EMAIL_USER and EMAIL_APP_PASSWORD to enable.')
    return
  }

  const dateTimeRange = `${formatDateTime(input.start)} - ${formatTime(input.end)}`

  const text = [
    `Hi ${input.name},`,
    '',
    `Your booking with Shutter Speed Studios is confirmed. Here are the details:`,
    '',
    `Event type: ${input.eventType}`,
    `Date/time: ${dateTimeRange}`,
    `Location: ${input.location}`,
    input.comments ? `Comments: ${input.comments}` : null,
    '',
    `We'll be in touch soon to finalize the details. If anything above is incorrect, just reply to this email.`,
    '',
    `— Shutter Speed Studios`,
  ]
    .filter((line) => line !== null)
    .join('\n')

  const html = `
    <p>Hi ${input.name},</p>
    <p>Your booking with <strong>Shutter Speed Studios</strong> is confirmed. Here are the details:</p>
    <ul>
      <li><strong>Event type:</strong> ${input.eventType}</li>
      <li><strong>Date/time:</strong> ${dateTimeRange}</li>
      <li><strong>Location:</strong> ${input.location}</li>
      ${input.comments ? `<li><strong>Comments:</strong> ${input.comments}</li>` : ''}
    </ul>
    <p>We'll be in touch soon to finalize the details. If anything above is incorrect, just reply to this email.</p>
    <p>— Shutter Speed Studios</p>
  `

  await getTransporter().sendMail({
    from: `"${config.email.fromName}" <${config.email.user}>`,
    to: input.clientEmail,
    cc: config.email.businessCc,
    subject: `Booking Confirmed — ${input.eventType} on ${formatDateTime(input.start)}`,
    text,
    html,
  })
}
