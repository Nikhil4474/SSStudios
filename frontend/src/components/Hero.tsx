import { motion } from 'framer-motion'
import { SITE } from '../config'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink to-gold/10" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-gold-light">
          Photography &amp; Videography, DFW
        </p>
        <h1 className="font-display text-5xl leading-tight text-cream sm:text-6xl md:text-7xl">
          {SITE.studioName}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-cream/70">{SITE.tagline}</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#booking"
            className="rounded-full bg-gold px-8 py-3 text-sm uppercase tracking-wider text-cream transition-transform hover:scale-105"
          >
            Book a Session
          </a>
          <a
            href="#gallery"
            className="rounded-full border border-cream/30 px-8 py-3 text-sm uppercase tracking-wider text-cream transition-colors hover:border-gold-light hover:text-gold-light"
          >
            View Gallery
          </a>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-cream/60">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 4v16m0 0l-6-6m6 6l6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}
