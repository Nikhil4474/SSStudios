import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import bookingRouter from './routes/booking.js'
import liveRouter from './routes/live.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors({ origin: config.corsOrigins }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api', bookingRouter)
app.use('/api', liveRouter)

// In production, serve the built frontend from the same process.
// __dirname is dist/src (tsc preserves the src/ nesting), so climb one extra level
// to reach the backend package root before hopping over to ../frontend/dist.
const frontendDist = path.join(__dirname, '..', '..', '..', 'frontend', 'dist')
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist))
  // Catch-all for client-side routing (Express 5 requires named wildcards, so use bare middleware instead).
  app.use((_req, res) => res.sendFile(path.join(frontendDist, 'index.html')))
}

app.listen(config.port, () => {
  console.log(`SSS Studios API listening on http://localhost:${config.port}`)
})
