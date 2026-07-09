import { useEffect, useState } from 'react'
import { SITE } from '../config'

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#live', label: 'Live' },
  { href: '#booking', label: 'Book Now' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-gold/25 bg-[#0d0906]/95 shadow-lg shadow-black/30 backdrop-blur transition-shadow duration-300 ${
        scrolled ? 'shadow-xl' : ''
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-display text-xl tracking-wide text-cream">
          {SITE.studioName}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm uppercase tracking-wider text-cream/70 transition-colors hover:text-gold-light"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#booking"
          className="hidden rounded-full border border-gold-light px-5 py-2 text-sm uppercase tracking-wider text-gold-light transition-colors hover:bg-gold-light hover:text-ink md:inline-block"
        >
          Book Now
        </a>

        <button
          type="button"
          className="text-cream md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <ul className="flex flex-col gap-1 border-t border-cream/10 bg-ink px-6 pb-6 md:hidden">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm uppercase tracking-wider text-cream/70 hover:text-gold-light"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
