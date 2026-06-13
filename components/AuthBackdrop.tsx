export default function AuthBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_32%),linear-gradient(135deg,#fff7f7_0%,#ffffff_48%,#f8fbff_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:64px_64px] opacity-70" />

      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-red-200/35 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />

      <div className="absolute left-1/2 top-8 h-16 w-[min(980px,92vw)] -translate-x-1/2 rounded-lg border border-white/80 bg-white/65 shadow-sm backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-red-600/75 shadow-sm" />
            <div className="h-4 w-32 rounded-full bg-slate-900/12" />
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="h-3 w-16 rounded-full bg-slate-900/10" />
            <div className="h-3 w-20 rounded-full bg-slate-900/10" />
            <div className="h-8 w-20 rounded-lg bg-red-600/15" />
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 top-32 hidden w-[min(760px,86vw)] -translate-x-1/2 rounded-lg border border-white/80 bg-white/55 p-8 shadow-xl backdrop-blur-sm sm:block">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-5 h-10 w-10 rounded-full bg-red-600/70" />
          <div className="mx-auto mb-4 h-9 w-4/5 rounded-full bg-slate-900/10" />
          <div className="mx-auto mb-2 h-3 w-2/3 rounded-full bg-slate-900/10" />
          <div className="mx-auto h-3 w-1/2 rounded-full bg-slate-900/10" />
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 grid w-[min(860px,90vw)] -translate-x-1/2 grid-cols-3 gap-4 opacity-80 blur-[0.5px]">
        <div className="h-28 rounded-lg border border-red-100 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="mb-4 h-7 w-7 rounded-lg bg-red-100" />
          <div className="mb-2 h-3 w-24 rounded-full bg-slate-900/10" />
          <div className="h-2.5 w-full rounded-full bg-slate-900/8" />
        </div>
        <div className="h-28 rounded-lg border border-blue-100 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="mb-4 h-7 w-7 rounded-lg bg-blue-100" />
          <div className="mb-2 h-3 w-28 rounded-full bg-slate-900/10" />
          <div className="h-2.5 w-full rounded-full bg-slate-900/8" />
        </div>
        <div className="h-28 rounded-lg border border-slate-100 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="mb-4 h-7 w-7 rounded-lg bg-slate-100" />
          <div className="mb-2 h-3 w-24 rounded-full bg-slate-900/10" />
          <div className="h-2.5 w-full rounded-full bg-slate-900/8" />
        </div>
      </div>

      <div className="absolute inset-0 bg-white/25 backdrop-blur-[1.5px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-white/65" />
    </div>
  )
}
