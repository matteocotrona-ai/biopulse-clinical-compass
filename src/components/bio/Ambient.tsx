/** Fixed ambient lighting: drifting blue orbs, a fading grid and film grain. */
export function Ambient({ grid = true }: { grid?: boolean }) {
  return (
    <div className="ambient" aria-hidden>
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      {grid && <div className="absolute inset-0 bg-grid mask-radial opacity-60" />}
      <div className="grain" />
    </div>
  );
}
