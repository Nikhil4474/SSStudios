import Reveal from './Reveal'

const SERVICES = [
  {
    name: 'Event Coverage',
    price: 'inquire for pricing',
    desc: 'Weddings, birthdays, and celebrations of every size.',
  },
  {
    name: 'Real Estate',
    price: 'inquire for pricing',
    desc: 'Listing photography that helps properties stand out.',
  },
  {
    name: 'Desi Celebrations',
    price: 'inquire for pricing',
    desc: 'Mehndi, Sangeet, Haldi, and other cultural celebrations, captured in full color and detail.',
  },
  {
    name: 'Portraits & Headshots',
    price: 'inquire for pricing',
    desc: 'Individual, family, and professional headshot sessions.',
  },
  {
    name: 'Commercial',
    price: 'inquire for pricing',
    desc: 'Brand, product, and marketing shoots tailored to your business.',
  },
  {
    name: 'Product Photography',
    price: 'inquire for pricing',
    desc: 'Clean, catalog-ready product shots for e-commerce and marketing.',
  },
  {
    name: 'Aerial',
    price: 'inquire for pricing',
    desc: 'Drone photo and video for events, real estate, and more.',
  },
]

export default function Services() {
  return (
    <section id="services" className="bg-paper-alt py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gold">Services</p>
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            What I offer
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.1}>
              <div className="group h-full rounded-lg border border-line bg-paper p-8 transition-colors hover:border-gold">
                <h3 className="font-display text-xl text-ink">{s.name}</h3>
                <p className="mt-2 text-sm uppercase tracking-wider text-gold">{s.price}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{s.desc}</p>
                <a
                  href="#booking"
                  className="mt-6 inline-block text-sm uppercase tracking-wider text-ink/70 group-hover:text-gold"
                >
                  Book this &rarr;
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={SERVICES.length * 0.1} className="mt-8 text-center">
          <div className="rounded-lg border border-dashed border-gold/50 bg-paper px-8 py-6">
            <p className="text-ink">
              Need something else? <span className="text-gold">Inquire</span> — happy to work with you on custom requests.
            </p>
            <a
              href="#booking"
              className="mt-4 inline-block rounded-full border border-gold px-6 py-2 text-sm uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-cream"
            >
              Get in Touch
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
