export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* warm paper base */}
      <div className="absolute inset-0 bg-ink" />
      {/* faint engineering grid, fading out toward the page */}
      <div className="absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_85%_55%_at_50%_0%,#000_18%,transparent_72%)]" />
    </div>
  );
}
