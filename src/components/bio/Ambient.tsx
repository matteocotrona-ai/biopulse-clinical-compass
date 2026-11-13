/** Fixed ambient lighting: drifting blue orbs, thin column rules and film grain. */
export function Ambient({ grid = true }: { grid?: boolean }) {
  return (
    <div className="ambient" aria-hidden>
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      {grid && <div className="absolute inset-0 bg-columns mask-fade-b opacity-80" />}
      <div className="grain" />
    </div>
  );
}
