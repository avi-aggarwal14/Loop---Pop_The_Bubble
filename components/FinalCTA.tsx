'use client'

import { useState } from 'react'

export default function FinalCTA() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Early access signup:', email)
    setSubmitted(true)
  }

  return (
    <section id="get-access" className="py-28 px-6 border-t border-white/[0.06]">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-serif text-5xl font-bold text-white italic leading-tight mb-4">
          Stop guessing.<br />Start growing.
        </h2>
        <p className="text-white/40 mb-10">Early access is free. Connect in 2 minutes.</p>

        {submitted ? (
          <div className="px-6 py-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-400">
            You&apos;re on the list. We&apos;ll be in touch soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
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
        <p className="mt-3 text-xs text-white/25">No credit card. Cancel anytime.</p>
      </div>
    </section>
  )
}
