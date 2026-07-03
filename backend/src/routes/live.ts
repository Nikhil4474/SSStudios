import { Router } from 'express'
import { getLiveStatus } from '../youtube.js'

const router = Router()

router.get('/live-status', async (_req, res) => {
  try {
    const status = await getLiveStatus()
    res.json(status)
  } catch (err) {
    console.error('live-status error', err)
    // Fail closed: treat an API error as "not live" rather than surfacing a broken player.
    res.json({ live: false })
  }
})

export default router
