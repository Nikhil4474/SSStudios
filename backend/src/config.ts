import 'dotenv/config'

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback
  if (!value) {
    console.warn(`[config] Missing env var ${name} — Google Calendar features will fail until it's set.`)
    return ''
  }
  return value
}

export const config = {
  port: Number(process.env.PORT || 4000),
  // Comma-separated list of allowed origins, e.g. for testing through an ngrok tunnel
  // alongside normal local dev.
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()),
  // Lets the booking flow be demoed/tested before real Google credentials exist.
  mockCalendar: process.env.MOCK_CALENDAR === 'true',

  google: {
    clientId: required('GOOGLE_CLIENT_ID'),
    clientSecret: required('GOOGLE_CLIENT_SECRET'),
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob',
    refreshToken: required('GOOGLE_REFRESH_TOKEN'),
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  },

  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    // Your own number that should receive the booking notification, e.g. 15551234567 (no "+")
    notifyNumber: process.env.WHATSAPP_NOTIFY_NUMBER || '',
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'new_booking_notification',
    templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US',
    // "template" requires an approved template + business verification.
    // "text" sends plain free-form text, but only works within 24h of the recipient
    // messaging the business number first — a stopgap until verification is done.
    messageMode: process.env.WHATSAPP_MESSAGE_MODE === 'text' ? 'text' : 'template',
  },

  email: {
    // Gmail address to send confirmation emails from (App Password, not your login password)
    user: process.env.EMAIL_USER || '',
    appPassword: process.env.EMAIL_APP_PASSWORD || '',
    fromName: process.env.EMAIL_FROM_NAME || 'Shutter Speed Studios',
    // Business inbox CC'd on every booking confirmation. Defaults to the sending address.
    businessCc: process.env.BUSINESS_EMAIL || process.env.EMAIL_USER || '',
  },

  business: {
    timezone: process.env.BUSINESS_TIMEZONE || 'America/New_York',
    daysAhead: Number(process.env.BUSINESS_DAYS_AHEAD || 60),
    // Minimum gap required between the end of one booking and the start of the next,
    // to allow for travel time.
    bufferMinutes: Number(process.env.BUSINESS_BUFFER_MINUTES || 60),
  },

  youtube: {
    // YouTube Data API v3 key (console.cloud.google.com > APIs & Services > Credentials).
    // Used to check whether the channel is actually live before embedding the player.
    apiKey: process.env.YOUTUBE_API_KEY || '',
    channelId: process.env.YOUTUBE_CHANNEL_ID || '',
  },
}
