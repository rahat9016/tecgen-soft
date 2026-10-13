/** Fixed ambient glow behind the whole page — gives the glass surfaces soft light to frost. */
export default function AuroraBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="agency-blob-pulse absolute -top-[20%] -left-[15%] size-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.11),transparent_62%)]" />
      <div className="agency-blob-pulse agency-blob-pulse-delayed absolute top-[25%] -right-[25%] size-[65vmax] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07),transparent_62%)]" />
      <div className="absolute -bottom-[30%] left-[10%] size-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_62%)]" />

      {/* faint grid, faded toward the edges */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, #000 20%, transparent 75%)",
        }}
      />
    </div>
  );
}
