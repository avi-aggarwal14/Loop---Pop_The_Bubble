'use client'

import { useState } from 'react'
import GrowthBriefCard from './GrowthBriefCard'

export default function Hero() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Early access signup:', email)
    setSubmitted(true)
  }

  return (
    <section className="min-h-screen pt-28 pb-20 px-6 flex items-center">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

        {/* Left: copy */}
        <div className="animate-fade-up">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#2563EB] mb-5">
            AI Growth Partner for Founders
          </p>

          <h1 className="font-serif text-5xl lg:text-[3.75rem] font-bold text-white italic leading-[1.1] mb-6">
            Your analytics, turned into one decision.
          </h1>

          <p className="text-lg text-white/50 leading-relaxed mb-10 max-w-lg">
            Synapse connects to your Shopify, Stripe, or Google Analytics and gives you a weekly Growth
            Brief — what&apos;s working, what to cut, and the one move that will actually move the needle.
            It remembers every brief, every action you took, and gets sharper every week.
          </p>

          {submitted ? (
            <div className="flex items-center gap-3 max-w-md">
              <div className="flex-1 px-4 py-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-400">
                You&apos;re on the list. We&apos;ll be in touch.
              </div>
            </div>
          ) : (
            <form id="get-access" onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/10 rounded-md text-white placeholder:text-white/25 focus:outline-none focus:border-[#2563EB]/50 transition-colors text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-blue-500 transition-colors whitespace-nowrap"
              >
                Get early access
              </button>
            </form>
          )}
          <p className="mt-3 text-xs text-white/25">No credit card. Free early access.</p>
        </div>

        {/* Right: Growth Brief Card */}
        <div
          className="flex justify-center lg:justify-end animate-fade-up"
          style={{ animationDelay: '250ms' }}
        >
          <GrowthBriefCard />
        </div>
      </div>
    </section>
  )
}
