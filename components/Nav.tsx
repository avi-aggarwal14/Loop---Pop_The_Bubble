export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0A0A0A]/90 backdrop-blur-sm">
      <span className="font-serif text-xl font-bold text-white tracking-tight">Synapse</span>
      <a
        href="#get-access"
        className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-blue-500 transition-colors"
      >
        Get early access
      </a>
    </nav>
  )
}
