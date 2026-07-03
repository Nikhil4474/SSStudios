// One-time helper: run `npm run get-token` to authorize this app against your
// Google account and print a refresh token to paste into backend/.env.
import 'dotenv/config'
import { google } from 'googleapis'
import * as readline from 'node:readline/promises'

const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET
const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob'

if (!clientId || !clientSecret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env first.')
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar'],
})

console.log('\n1. Open this URL in a browser and sign in with the Google account whose calendar you want to book against:\n')
console.log(authUrl)
console.log('\n2. After approving, copy the code Google shows you and paste it below.\n')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const code = await rl.question('Paste the authorization code here: ')
rl.close()

const { tokens } = await oauth2Client.getToken(code.trim())

if (!tokens.refresh_token) {
  console.error('\nNo refresh token returned. Revoke prior access at https://myaccount.google.com/permissions and try again.')
  process.exit(1)
}

console.log('\nSuccess! Add this to backend/.env:\n')
console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
