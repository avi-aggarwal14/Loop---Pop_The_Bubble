import { PlugZap, FileText, Target } from 'lucide-react'

const steps = [
  {
    Icon: PlugZap,
    number: '01',
    title: 'Connect your data',
    body: 'Shopify, Stripe, or Google Analytics. Takes 2 minutes.',
  },
  {
    Icon: FileText,
    number: '02',
    title: 'Get your brief',
    body: "Plain-English summary of what moved, what didn't, and why.",
  },
  {
    Icon: Target,
    number: '03',
    title: 'Know your one move',
    body: 'One prioritised action every week. No fluff.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#2563EB] mb-3">How it works</p>
          <h2 className="font-serif text-4xl font-bold text-white italic">Three steps to clarity.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group p-7 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:border-[#2563EB]/30 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-[#2563EB]/10 text-[#2563EB] group-hover:bg-[#2563EB]/20 transition-colors">
                  <step.Icon size={17} />
                </div>
                <span className="font-mono text-xs text-white/20">{step.number}</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-white italic mb-2">{step.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
