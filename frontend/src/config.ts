// Central place for site-wide placeholders. Swap these out with real values.
export const SITE = {
  studioName: 'Shutter Speed Studios',
  shortName: 'SSStudios',
  tagline: 'Capturing Moments, Crafting Stories',
  email: 'ShutterSpeedStudiosDFW@gmail.com',
  phone: '469-712-0034',
  instagram: 'https://www.instagram.com/shutterspeed.studios/',
  youtubeChannel: 'https://www.youtube.com/channel/UCVaEXl5s1YIPfv31ljSXMrg',
}

// wa.me link derived from SITE.phone (assumes US "+1" — update the "1" prefix below if
// the business number is ever changed to a different country).
export const WHATSAPP_URL = `https://wa.me/1${SITE.phone.replace(/\D/g, '')}`

export const GALLERY_ALBUM_URL = 'https://cloud.ssstudios.me/s/SSSshare'

export const DESIGNER = {
  name: 'Nikhil I.',
  email: 'ninuganti15@gmail.com',
}

// Replace with the real YouTube channel ID (starts with "UC...").
// Find it at https://www.youtube.com/account_advanced
export const YT_CHANNEL_ID = import.meta.env.VITE_YT_CHANNEL_ID || 'UCXXXXXXXXXXXXXXXXXXXXXX'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
