import { DESIGNER, SITE, WHATSAPP_URL } from '../config'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-paper py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <p className="font-display text-xl text-ink">{SITE.studioName}</p>
        <div className="flex gap-6 text-sm text-muted">
          <a href={`mailto:${SITE.email}`} className="hover:text-gold">
            {SITE.email}
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
            {SITE.phone}
          </a>
          <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
            Instagram
          </a>
        </div>
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} {SITE.studioName}. All rights reserved.
        </p>
        <p className="text-xs text-muted/70">
          Website designed by {DESIGNER.name} — interested in a similar website?{' '}
          <a href={`mailto:${DESIGNER.email}`} className="hover:text-gold">
            {DESIGNER.email}
          </a>
        </p>
      </div>
    </footer>
  )
}
