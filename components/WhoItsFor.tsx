import { ShoppingBag, TrendingUp, Globe } from 'lucide-react'

const archetypes = [
  {
    Icon: ShoppingBag,
    title: 'E-commerce founders',
    body: 'Connect Shopify. See which products, channels, and campaigns are actually converting.',
  },
  {
    Icon: TrendingUp,
    title: 'SaaS founders',
    body: 'Connect Stripe. Track MRR, churn, and the levers that move them.',
  },
  {
    Icon: Globe,
    title: 'Any business with a website',
    body: 'Connect Google Analytics. Know which pages, sources, and actions are driving growth.',
  },
]

export default function WhoItsFor() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#2563EB] mb-3">Who it&apos;s for</p>
          <h2 className="font-serif text-4xl font-bold text-white italic">
            Built for founders who&apos;d rather act than analyse.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {archetypes.map((a) => (
            <div
              key={a.title}
              className="p-7 rounded-xl border border-white/[0.08] bg-white/[0.02]"
            >
              <div className="mb-5 inline-flex p-2.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                <a.Icon size={19} />
              </div>
              <h3 className="font-serif text-xl font-bold text-white italic mb-2">{a.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
