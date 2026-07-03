# SSS Studios Website

Custom rebuild of ssstudios.me: React + Tailwind frontend, Node/Express backend with a
live Google Calendar booking flow, a YouTube Live section, and a gallery linking out to
the full photo album.

```
Website/
  frontend/   Vite + React + TypeScript + Tailwind, the public site
  backend/    Node + Express + TypeScript, booking API + Google Calendar integration
```

## 1. Local development

```bash
# Terminal 1
cd backend
cp .env.example .env      # fill in values, see section 3 below
npm install
npm run dev                # http://localhost:4000

# Terminal 2
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

While you don't yet have real Google credentials, set `MOCK_CALENDAR=true` in
`backend/.env` — the API will return fake availability and "book" instantly so you can
test the whole flow. Turn it off once real credentials are in place.

## 2. Content to swap in

- `frontend/src/config.ts` — studio name, tagline, contact info, socials, YouTube channel ID
- `frontend/src/components/About.tsx` — bio text and headshot image
- `frontend/src/components/Services.tsx` — real services/pricing
- `frontend/src/components/Gallery.tsx` — swap the placeholder Unsplash photos for real shots (the click-through link to `https://cloud.ssstudios.me/s/SSSshare` is already wired up and doesn't need to change)
- `frontend/src/components/Hero.tsx` — background image

## 3. Google Calendar setup (booking)

The booking form reads real availability from your Google Calendar and creates an event
(with the client as an attendee, so they get an invite) when someone books. Do this once:

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create a new project.
2. **APIs & Services > Library** — enable the **Google Calendar API**.
3. **APIs & Services > OAuth consent screen** — set it to "External", add your own Google
   account as a test user (you don't need to publish the app).
4. **APIs & Services > Credentials > Create Credentials > OAuth client ID** — Application
   type: **Desktop app**. Copy the Client ID and Client Secret into `backend/.env`
   (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
5. From `backend/`, run:
   ```bash
   npm run get-token
   ```
   It prints a URL — open it, sign in with the Google account whose calendar you want
   bookings to land on, and approve access. Paste the code it gives you back into the
   terminal. It will print a `GOOGLE_REFRESH_TOKEN` — copy that into `backend/.env`.
6. Set `GOOGLE_CALENDAR_ID` (use `primary` for your main calendar, or a specific calendar's
   ID from Google Calendar's settings if you want bookings on a separate calendar).
7. Set `MOCK_CALENDAR=false` (or remove it).
8. Adjust `BUSINESS_TIMEZONE` and `BUSINESS_BUFFER_MINUTES` (the minimum gap kept between
   bookings for travel time) in `backend/.env` to match your setup. There's no fixed
   business-hours restriction — clients can request any date/time; only real calendar
   conflicts (plus the buffer) block a booking.

Restart the backend and do one real test booking to confirm it lands on your calendar.

## 4. WhatsApp booking notifications (optional)

When a client books, the backend can also ping your WhatsApp Business number with the
booking details. This uses Meta's WhatsApp Business Platform (Cloud API) directly — no
third-party service, free tier covers this easily.

1. Go to [developers.facebook.com](https://developers.facebook.com) and create an app of
   type "Business", then add the **WhatsApp** product to it.
2. In the WhatsApp product's **API Setup** page, Meta gives you a test phone number for
   free (or register your own business number under **WhatsApp > Configuration**). Note
   the **Phone number ID** shown there.
3. Generate a permanent access token: **Business Settings > System Users** — create a
   system user, assign it the WhatsApp app with `whatsapp_business_messaging`
   permission, and generate a token with no expiry.
4. Put `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` in `backend/.env`, plus
   `WHATSAPP_NOTIFY_NUMBER` — your own WhatsApp number in international format with no
   `+` (e.g. `15551234567`). While in test mode, this number also needs to be added as
   an allowed recipient under **API Setup > To**.
5. Business-initiated messages need a pre-approved template, which requires **Meta
   business verification** (legal business name + EIN or equivalent). If you don't have
   that yet:
   - Set `WHATSAPP_MESSAGE_MODE=text` in `backend/.env`. This sends plain free-form text
     instead of a template — no verification or template approval needed. The catch:
     it only works within 24 hours of `WHATSAPP_NOTIFY_NUMBER` sending a message to the
     test number first (WhatsApp's "customer service window" rule). Message the bot
     number from your phone whenever you want a fresh 24-hour window.
   - Once your business is verified, go to **WhatsApp Manager > Message Templates**,
     create one named `new_booking_notification` (Category: Utility) with this body:
     ```
     New booking request:
     Name: {{1}}
     Event type: {{2}}
     Date/time: {{3}}
     Location: {{4}}
     Phone: {{5}}
     ```
     Submit for approval (usually fast for Utility templates), then set
     `WHATSAPP_MESSAGE_MODE=template` (or just remove the line — it's the default) for
     notifications that work automatically, any time, with no daily re-ping needed.
6. Restart the backend. From then on, every confirmed booking also lands as a WhatsApp
   message on your number. If these env vars are left blank, this step is silently
   skipped and bookings work as normal.

## 5. Booking confirmation emails (optional)

When a client books, the backend emails them a confirmation and CCs your business inbox
— sent via Gmail using [Nodemailer](https://nodemailer.com), no third-party email service
needed.

1. Turn on 2-Step Verification on the Gmail account you want to send from (required for
   App Passwords) — [myaccount.google.com/security](https://myaccount.google.com/security).
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords),
   create a new App Password (name it something like "SSS Studios Website"), and copy the
   16-character password it generates.
3. In `backend/.env`, set:
   - `EMAIL_USER` — the Gmail address you're sending from
   - `EMAIL_APP_PASSWORD` — the 16-character App Password (not your normal Gmail password)
   - `EMAIL_FROM_NAME` — display name on outgoing emails (defaults to "Shutter Speed Studios")
   - `BUSINESS_EMAIL` — inbox CC'd on every confirmation (defaults to `EMAIL_USER` if left blank)
4. Restart the backend. If these env vars are left blank, this step is silently skipped
   and bookings still work as normal.

## 6. Live section

`frontend/src/config.ts` has `YT_CHANNEL_ID` — set it to your real YouTube channel ID
(Studio > Settings > Channel > Advanced settings, or from your channel URL if it's in the
`UC...` format). The embed auto-plays whatever is currently live on that channel; when
nothing is live, YouTube's own placeholder shows inside the frame.

## 7. Deploying without Docker (PM2 + nginx)

Since the site is proxied through your GoDaddy domain to your home server:

```bash
cd frontend && npm run build      # outputs frontend/dist
cd ../backend && npm run build    # outputs backend/dist
NODE_ENV=production npm start     # serves the API + the built frontend on one port
```

In production the Express server (`backend/src/server.ts`) serves the built frontend
directly, so you only need to run and expose one process/port (`PORT` in `backend/.env`,
default 4000).

Recommended setup:
- Run the backend with [PM2](https://pm2.keymetrics.io/) (`pm2 start dist/server.js --name sss-website`) so it restarts on crash/reboot.
- Put a reverse proxy (nginx, or your router if it supports it) in front of that port to
  terminate HTTPS and forward `ssstudios.me` traffic to it.
- Point your GoDaddy DNS `A` record at your home IP (and keep it updated if your ISP
  doesn't give you a static IP — consider a dynamic DNS service if not).
- Update `CORS_ORIGIN` in `backend/.env` to `https://ssstudios.me` and
  `VITE_API_BASE_URL` in `frontend/.env` to `https://ssstudios.me` (same origin, since one
  process serves both) before building for production.

## 8. Deploying with Docker + nginx

This is the alternative to section 7 — one containerized Node app (frontend + backend
built-in, same as above) behind an nginx container that terminates HTTPS. Files:

```
Website/
  Dockerfile           multi-stage build: frontend -> backend -> lean runtime image
  docker-compose.yml   "app" (the Node container) + "nginx" (reverse proxy)
  nginx/nginx.conf     nginx server blocks (HTTP -> HTTPS redirect, HTTPS reverse proxy)
  .dockerignore
```

1. Make sure `backend/.env` is fully filled in (Google Calendar, WhatsApp, email — same
   values as sections 3-5 above), with `CORS_ORIGIN` set to `https://ssstudios.me`.
2. In `nginx/nginx.conf`, replace `ssstudios.me` with your real domain (both places).
3. **First-time HTTPS certs** — nginx needs real certs before the HTTPS server block will
   start, so get them once via certbot in standalone mode *before* starting the stack
   (this temporarily needs port 80 free):
   ```bash
   sudo certbot certonly --standalone -d ssstudios.me -d www.ssstudios.me
   ```
   This writes certs to `/etc/letsencrypt/live/ssstudios.me/`, which `docker-compose.yml`
   already mounts read-only into the nginx container.
4. Build and start everything:
   ```bash
   docker compose up -d --build
   ```
   The frontend is built with `VITE_API_BASE_URL=https://ssstudios.me` baked in by default
   (see the `args:` in `docker-compose.yml`) — change it there if your domain differs.
5. Point your GoDaddy DNS `A` record at your home IP, same as section 7.
6. **Renewals**: Let's Encrypt certs expire every 90 days. Run
   `sudo certbot renew` periodically (a cron job or systemd timer) — the shared
   `certbot-webroot` volume lets the HTTP-01 challenge succeed without stopping the nginx
   container, since `/.well-known/acme-challenge/` is served from that volume.
7. Common commands: `docker compose logs -f app` to watch the app, `docker compose restart
   app` after changing `backend/.env`, `docker compose up -d --build` after a code change.

I wasn't able to actually build/run this Docker setup myself in this environment (Docker
isn't installed here) — do one `docker compose up -d --build` on your end and let me know
if anything needs adjusting.
