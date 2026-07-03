import { config } from './config.js'

export type BookingNotification = {
  name: string
  phone: string
  eventType: string
  location: string
  start: string // ISO datetime
  end: string // ISO datetime
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: config.business.timezone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: config.business.timezone,
    timeStyle: 'short',
  }).format(new Date(iso))
}

function formatDateTimeRange(startIso: string, endIso: string) {
  return `${formatDateTime(startIso)} - ${formatTime(endIso)}`
}

// Sends a WhatsApp notification (via Meta's Cloud API) to the studio owner's
// WhatsApp number whenever a client books. Requires WHATSAPP_* env vars — see README
// for the Meta app + template setup. No-ops quietly if unconfigured.
export async function sendBookingWhatsApp(input: BookingNotification) {
  const { accessToken, phoneNumberId, notifyNumber, templateName, templateLanguage, messageMode } = config.whatsapp

  if (!accessToken || !phoneNumberId || !notifyNumber) {
    console.warn('[whatsapp] Not configured — skipping booking notification. Set WHATSAPP_* env vars to enable.')
    return
  }

  const body =
    messageMode === 'text'
      ? {
          messaging_product: 'whatsapp',
          to: notifyNumber,
          type: 'text',
          text: {
            body: [
              'New booking request:',
              `Name: ${input.name}`,
              `Event type: ${input.eventType}`,
              `Date/time: ${formatDateTimeRange(input.start, input.end)}`,
              `Location: ${input.location}`,
              `Phone: ${input.phone}`,
            ].join('\n'),
          },
        }
      : {
          messaging_product: 'whatsapp',
          to: notifyNumber,
          type: 'template',
          template: {
            name: templateName,
            language: { code: templateLanguage },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: input.name },
                  { type: 'text', text: input.eventType },
                  { type: 'text', text: formatDateTimeRange(input.start, input.end) },
                  { type: 'text', text: input.location },
                  { type: 'text', text: input.phone },
                ],
              },
            ],
          },
        }

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`WhatsApp API error (${res.status}): ${await res.text()}`)
  }
}
