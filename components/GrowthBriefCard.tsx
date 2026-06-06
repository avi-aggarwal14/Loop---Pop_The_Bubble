export default function GrowthBriefCard() {
  return (
    <div className="animate-glow-pulse relative rounded-2xl bg-[#0D1117] p-7 max-w-sm w-full border border-[#2563EB]/25">
      {/* Header */}
      <div className="mb-5 pb-5 border-b border-white/[0.07]">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#2563EB] mb-1">Growth Brief</p>
        <p className="font-serif text-xl font-bold text-white italic">Week of 2 June</p>
      </div>

      {/* Headline numbers */}
      <div className="mb-5">
        <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2">Headline numbers</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px]">
          <span className="text-emerald-400">Revenue ↑12% WoW</span>
          <span className="text-white/20">·</span>
          <span className="text-red-400">Sessions ↓3%</span>
          <span className="text-white/20">·</span>
          <span className="text-white/50">Conversion 2.4% →</span>
        </div>
      </div>

      {/* What's working */}
      <div className="mb-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1.5">What&apos;s working</p>
        <p className="text-sm text-white/75 leading-relaxed">
          Instagram traffic drove{' '}
          <span className="text-white font-medium">34% of new customers</span> this week, up from 18% last week.
        </p>
      </div>

      {/* What to cut */}
      <div className="mb-5">
        <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1.5">What to cut</p>
        <p className="text-sm text-white/75 leading-relaxed">
          Facebook ads:{' '}
          <span className="font-mono text-red-400">£180 spend, 0 conversions</span> — pause now.
        </p>
      </div>

      {/* One move */}
      <div className="rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 p-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#2563EB] mb-2">Your one move this week</p>
        <p className="text-sm text-white leading-relaxed">
          Post 3 product demo Reels this week. It&apos;s your only channel with positive ROAS right now.
        </p>
      </div>
    </div>
  )
}
