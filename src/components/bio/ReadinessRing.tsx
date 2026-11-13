import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";
import type { Report } from "@/lib/types";
import { LEVEL } from "@/lib/level";

const R = 92;
const C = 2 * Math.PI * R;

function Counter({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? to : 0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const controls = animate(mv, to, { duration: reduce ? 0 : 1.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [mv, to, reduce]);
  return <motion.span>{rounded}</motion.span>;
}

export function ReadinessRing({ report }: { report: Report }) {
  const reduce = useReducedMotion();
  const meta = LEVEL[report.level];
  const score = report.readiness ?? 0;
  const offset = C * (1 - score / 100);
  const flags = report.flags.filter((f) => f.severity !== "info");
  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className="relative size-64 shrink-0 sm:size-72"
        role="img"
        aria-label={`Indice di prontezza ${report.readiness ?? "non disponibile"} su 100, stato ${meta.label}`}
      >
        <div className="absolute inset-6 rounded-full blur-3xl opacity-30" style={{ background: meta.color }} />
        <svg viewBox="0 0 220 220" className="relative h-full w-full -rotate-90">
          <defs>
            <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={meta.color} stopOpacity="0.5" />
              <stop offset="1" stopColor={meta.color} />
            </linearGradient>
          </defs>
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const r1 = 106;
            const r2 = i % 5 === 0 ? 100 : 103;
            return (
              <line
                key={i}
                x1={110 + Math.cos(a) * r1}
                y1={110 + Math.sin(a) * r1}
                x2={110 + Math.cos(a) * r2}
                y2={110 + Math.sin(a) * r2}
                stroke="var(--border-strong)"
                strokeWidth="1"
              />
            );
          })}
          <circle cx="110" cy="110" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
          <motion.circle
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke="url(#ring-g)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: reduce ? offset : C }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: reduce ? 0 : 1.6, ease: [0.16, 1, 0.3, 1] }}
            key={`${report.as_of}-${score}`}
            style={{ filter: `drop-shadow(0 0 8px ${meta.color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="eyebrow text-faint">Prontezza</span>
          <span className="tnum mt-2 font-display text-7xl leading-none font-extralight" style={{ color: meta.color }}>
            {report.readiness === null ? "–" : <Counter to={score} />}
          </span>
          <span className="mt-2 font-mono text-xs text-muted-foreground">su 100</span>
        </div>
      </div>

      <div className="w-full max-w-md text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
          style={{ background: meta.soft, color: meta.color, borderColor: meta.soft }}
        >
          <span aria-hidden className="grid size-4 place-items-center rounded-full text-[0.6rem] text-background" style={{ background: meta.color }}>
            {meta.mark}
          </span>
          {meta.label}
        </span>
        <h2 className="mt-4 font-display text-3xl font-light">Indice di prontezza</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{meta.text}</p>
        <p className="mt-4 font-mono text-[0.7rem] text-faint">
          Dati al {report.as_of ?? "–"} · {report.data_days}/28 giorni · affidabilità{" "}
          {report.confidence === "full" ? "piena" : report.confidence === "partial" ? "parziale" : "insufficiente"}
        </p>
        {flags.length > 0 && (
          <ul className="mt-5 grid gap-2 text-left text-sm">
            {flags.map((f) => (
              <li
                key={f.code}
                className="flex gap-2.5 rounded-lg border border-border bg-surface-sunken/60 px-3 py-2 text-muted-foreground"
              >
                <span aria-hidden style={{ color: f.severity === "red" ? "var(--level-red)" : "var(--level-yellow)" }}>
                  {f.severity === "red" ? "✕" : "!"}
                </span>
                <span>{f.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
