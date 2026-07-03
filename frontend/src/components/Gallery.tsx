import Reveal from './Reveal'
import { GALLERY_ALBUM_URL } from '../config'
import eventCoverage from '../assets/services/EventCoverage.webp'
import realEstate from '../assets/services/RealEstate.webp'
import desiCelebrations from '../assets/services/DesiCelebrations.webp'
import headshots from '../assets/services/Headshots.webp'
import commercial from '../assets/services/Commerical.webp'
import product from '../assets/services/Product.webp'
import aerial from '../assets/services/Aerial.webp'

const PHOTOS = [
  { src: eventCoverage, label: 'Event Coverage' },
  { src: realEstate, label: 'Real Estate' },
  { src: desiCelebrations, label: 'Desi Celebrations' },
  { src: headshots, label: 'Portraits & Headshots' },
  { src: commercial, label: 'Commercial' },
  { src: product, label: 'Product Photography' },
  { src: aerial, label: 'Aerial' },
]

export default function Gallery() {
  return (
    <section id="gallery" className="bg-paper py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gold">Gallery</p>
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            A glimpse of the work
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Click any photo to browse the full album.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PHOTOS.map((photo, i) => (
            <Reveal key={photo.src} delay={i * 0.06} className="aspect-square overflow-hidden rounded-lg">
              <a
                href={GALLERY_ALBUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block h-full w-full"
                aria-label={`View full photo album — ${photo.label}`}
              >
                <img
                  src={photo.src}
                  alt={photo.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/50">
                  <span className="text-xs uppercase tracking-[0.2em] text-gold-light opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {photo.label}
                  </span>
                  <span className="text-sm uppercase tracking-wider text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    View Album
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <a
            href={GALLERY_ALBUM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-gold px-8 py-3 text-sm uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-cream"
          >
            View Full Album
          </a>
        </Reveal>
      </div>
    </section>
  )
}
