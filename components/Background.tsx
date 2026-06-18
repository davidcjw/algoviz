export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0 bg-ink" />
      {/* engineering grid */}
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_30%,transparent_80%)]" />
      {/* color glows mapped to the three pillars */}
      <div className="absolute -top-40 left-[8%] h-[36rem] w-[36rem] rounded-full bg-ds/20 blur-[140px]" />
      <div className="absolute top-[10%] right-[2%] h-[32rem] w-[32rem] rounded-full bg-algo/10 blur-[150px]" />
      <div className="absolute top-[55%] left-[35%] h-[34rem] w-[34rem] rounded-full bg-sys/10 blur-[160px]" />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(4,6,12,0.9)_100%)]" />
    </div>
  );
}
