export default function SocialProof() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-2xl mx-auto text-center">
        <div className="relative p-10 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <div className="font-serif text-5xl text-[#2563EB]/30 leading-none mb-6 select-none">&ldquo;</div>
          <blockquote className="font-serif text-2xl text-white italic leading-relaxed mb-7">
            I used to spend an hour every Sunday making sense of my analytics. Synapse gives me the answer in 30 seconds.
          </blockquote>
          <cite className="font-mono text-[11px] uppercase tracking-widest text-white/35 not-italic">
            — Founder, early access user
          </cite>
        </div>
      </div>
    </section>
  )
}
