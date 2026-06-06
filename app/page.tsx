import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import WhoItsFor from '@/components/WhoItsFor'
import SocialProof from '@/components/SocialProof'
import FinalCTA from '@/components/FinalCTA'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <HowItWorks />
      <WhoItsFor />
      <SocialProof />
      <FinalCTA />
      <footer className="border-t border-white/[0.06] py-10 px-6 text-center">
        <p className="font-serif text-xl font-bold text-white mb-2">Synapse</p>
        <p className="text-sm text-white/30">Built at Pop the Bubble Hackathon 2026</p>
      </footer>
    </main>
  )
}
