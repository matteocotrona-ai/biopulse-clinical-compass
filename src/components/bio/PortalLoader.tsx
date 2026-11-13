import { BrandMark } from "./Brand";
import { Ambient } from "./Ambient";

/** Full-screen loader: logo inside expanding rings with a shimmer bar. */
export function PortalLoader({ label }: { label: string }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden" role="status" aria-live="polite">
      <Ambient grid={false} />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative grid size-24 place-items-center">
          {[0, 0.8, 1.6].map((d) => (
            <span
              key={d}
              className="absolute inset-4 rounded-full border border-primary/50 animate-pulse-ring"
              style={{ animationDelay: `${d}s` }}
            />
          ))}
          <BrandMark className="size-12" />
        </div>
        <div className="w-48">
          <div className="h-px w-full overflow-hidden rounded bg-border">
            <div className="h-full w-full shimmer-line" />
          </div>
          <p className="mt-4 text-center eyebrow">{label}</p>
        </div>
      </div>
    </div>
  );
}
