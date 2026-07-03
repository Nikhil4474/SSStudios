import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import { SITE } from '../config'
import { fetchLiveStatus } from '../lib/api'

type State = 'checking' | 'live' | 'offline'

export default function Live() {
  const [state, setState] = useState<State>('checking')
  const [videoId, setVideoId] = useState<string | null>(null)

  useEffect(() => {
    fetchLiveStatus()
      .then((status) => {
        if (status.live && status.videoId) {
          setVideoId(status.videoId)
          setState('live')
        } else {
          setState('offline')
        }
      })
      .catch(() => setState('offline'))
  }, [])

  return (
    <section id="live" className="bg-paper-alt py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gold">Live</p>
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            Tune in live
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Whatever event is streaming on our channel plays here automatically.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-line bg-ink">
            {state === 'checking' && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-cream/70">Checking for a live stream...</p>
              </div>
            )}

            {state === 'offline' && (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6">
                <p className="text-cream">We're not currently live streaming.</p>
                <p className="text-sm text-cream/70">
                  Check back during our next event, or visit the channel directly.
                </p>
                <a
                  href={SITE.youtubeChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-gold-light px-6 py-2 text-sm uppercase tracking-wider text-gold-light transition-colors hover:bg-gold-light hover:text-ink"
                >
                  Visit Channel
                </a>
              </div>
            )}

            {state === 'live' && videoId && (
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="Live stream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
