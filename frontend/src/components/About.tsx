import Reveal from './Reveal'
import logo from '../assets/brand/logo-wordmark.png'

export default function About() {
  return (
    <section id="about" className="bg-paper py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 md:grid-cols-2">
        <Reveal>
          <div className="overflow-hidden rounded-lg shadow-sm transition-transform duration-500 hover:scale-105">
            <img src={logo} alt="Shutter Speed Studios" className="block h-auto w-full" />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gold">About</p>
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            Behind the lens
          </h2>
          <p className="mt-6 text-muted leading-relaxed">
            Hi, this is Shutter Speed Studios. We are passionate photographers
            dedicated to capturing life's beautiful moments. With years of
            experience, we strive to create timeless visuals that tell unique
            stories. Our goal is to exceed expectations and deliver exceptional
            quality in every project, ensuring lasting memories for our clients.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-6 border-t border-line pt-8">
            <div>
              <p className="font-display text-3xl text-gold">5+</p>
              <p className="text-xs uppercase tracking-wider text-muted">Years</p>
            </div>
            <div>
              <p className="font-display text-3xl text-gold">200+</p>
              <p className="text-xs uppercase tracking-wider text-muted">Events</p>
            </div>
            <div>
              <p className="font-display text-3xl text-gold">50k+</p>
              <p className="text-xs uppercase tracking-wider text-muted">Images</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
