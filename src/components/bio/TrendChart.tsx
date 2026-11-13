import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { SeriesPoint } from "@/lib/types";

/** RMSSD (area) and resting HR (line) from the same 28-day series, each on its own scale. */
export function TrendChart({ series }: { series: SeriesPoint[] }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 180;
  const n = Math.max(series.length - 1, 1);
  const scale = (vals: (number | null)[]) => {
    const v = vals.filter((x): x is number => x !== null);
    const min = Math.min(...v);
    const max = Math.max(...v);
    return { min, span: max - min || 1, ok: v.length > 1 };
  };
  const hrv = scale(series.map((s) => s.rmssd_ms));
  const rhr = scale(series.map((s) => s.resting_hr));
  const x = (i: number) => (i / n) * W;
  const y = (v: number, s: { min: number; span: number }) =>
    H - 10 - ((v - s.min) / s.span) * (H - 30);
  const path = (key: "rmssd_ms" | "resting_hr", s: { min: number; span: number }) =>
    series
      .map((p, i) => (p[key] === null ? null : `${x(i)},${y(p[key] as number, s)}`))
      .filter(Boolean)
      .map((pt, i) => `${i ? "L" : "M"}${pt}`)
      .join(" ");
  const hrvLine = hrv.ok ? path("rmssd_ms", hrv) : "";
  const rhrLine = rhr.ok ? path("resting_hr", rhr) : "";
  const first = series.findIndex((p) => p.rmssd_ms !== null);
  const last = series.length - 1 - [...series].reverse().findIndex((p) => p.rmssd_ms !== null);
  const hrvArea = hrvLine ? `${hrvLine} L${x(last)},${H} L${x(first)},${H} Z` : "";
  const h = hover !== null ? series[hover] : null;

  if (!hrv.ok && !rhr.ok) return null;
  return (
    <figure className="panel overflow-hidden p-5 sm:p-7">
      <figcaption className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xl font-light sm:text-2xl">Trend autonomico</p>
          <p className="mt-1 text-sm text-muted-foreground">
            HRV (RMSSD) e frequenza cardiaca a riposo, stessi 28 giorni.
          </p>
        </div>
        <div className="tnum flex gap-5 font-mono text-xs">
          <span className="flex items-center gap-2 text-primary-glow">
            <i className="h-0.5 w-4 rounded bg-primary-glow" /> RMSSD {h?.rmssd_ms ?? "–"} ms
          </span>
          <span className="flex items-center gap-2 text-warning">
            <i className="h-0.5 w-4 rounded bg-warning" /> FC {h?.resting_hr ?? "–"} bpm
          </span>
        </div>
      </figcaption>
      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H + 20}`}
          className="w-full min-w-[34rem]"
          role="img"
          aria-label="Andamento di RMSSD e frequenza cardiaca a riposo"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const i = Math.round(((e.clientX - r.left) / r.width) * n);
            setHover(Math.max(0, Math.min(series.length - 1, i)));
          }}
        >
          <defs>
            <linearGradient id="hrv-a" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--primary-glow)" stopOpacity="0.3" />
              <stop offset="1" stopColor="var(--primary-glow)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.33, 0.66].map((g) => (
            <line
              key={g}
              x1="0"
              x2={W}
              y1={H * g}
              y2={H * g}
              stroke="var(--border)"
              strokeDasharray="2 6"
            />
          ))}
          {hrvArea && (
            <motion.path
              d={hrvArea}
              fill="url(#hrv-a)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5 }}
            />
          )}
          {hrvLine && (
            <motion.path
              d={hrvLine}
              fill="none"
              stroke="var(--primary-glow)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 6px var(--primary))" }}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
          {rhrLine && (
            <motion.path
              d={rhrLine}
              fill="none"
              stroke="var(--level-yellow)"
              strokeWidth="1.4"
              strokeDasharray="4 4"
              strokeOpacity="0.85"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
          {hover !== null && h && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="var(--border-strong)" />
              {h.rmssd_ms !== null && (
                <circle cx={x(hover)} cy={y(h.rmssd_ms, hrv)} r="4" fill="var(--primary-glow)" />
              )}
              {h.resting_hr !== null && (
                <circle
                  cx={x(hover)}
                  cy={y(h.resting_hr, rhr)}
                  r="3.5"
                  fill="var(--level-yellow)"
                />
              )}
              <text
                x={Math.min(Math.max(x(hover), 30), W - 30)}
                y={H + 16}
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted-foreground)"
                fontFamily="var(--font-mono)"
              >
                {h.day.slice(5)}
              </text>
            </g>
          )}
          <line x1="0" x2={W} y1={H} y2={H} stroke="var(--border-strong)" />
        </svg>
      </div>
    </figure>
  );
}
