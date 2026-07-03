import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Gallery from './components/Gallery'
import Live from './components/Live'
import Booking from './components/Booking'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-ink text-cream">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Live />
        <Booking />
      </main>
      <Footer />
    </div>
  )
}

export default App
