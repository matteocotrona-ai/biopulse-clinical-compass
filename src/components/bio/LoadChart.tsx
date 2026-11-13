import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Report, SeriesPoint } from "@/lib/types";

export function LoadChart({ series, report }: { series: SeriesPoint[]; report: Report }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((s) => s.load));
  const W = 720;
  const H = 220;
  const bw = W / Math.max(series.length, 1);
  const acuteStart = series.length - 7;
  const hovered = hover !== null ? series[hover] : null;
  const acwrHigh = report.acwr !== null && report.acwr > 1.5;

  return (
    <figure className="panel overflow-hidden p-5 sm:p-7">
      <figcaption className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-xl font-light sm:text-2xl">Carico di allenamento, 28 giorni</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hovered ? (
              <span className="tnum">
                {hovered.day} · carico <b className="font-medium text-foreground">{Math.round(hovered.load)}</b>
                {hovered.rpe !== null && <> · RPE {hovered.rpe}</>}
              </span>
            ) : (
              "Passa sopra le barre per leggere ogni giornata."
            )}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border text-center">
          {[
            ["Acuto 7 g", report.acute_load ?? "–"],
            ["Cronico 28 g", report.chronic_load ?? "–"],
            ["ACWR", report.acwr?.toFixed(2) ?? "–"],
          ].map(([k, v], i) => (
            <div key={String(k)} className="bg-surface px-4 py-2.5">
              <dt className="font-mono text-[0.6rem] tracking-[0.12em] text-faint uppercase">{k}</dt>
              <dd
                className="tnum mt-1 font-display text-lg"
                style={i === 2 && acwrHigh ? { color: "var(--level-red)" } : undefined}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </figcaption>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H + 24}`}
          className="w-full min-w-[34rem]"
          role="img"
          aria-label={`Carico giornaliero degli ultimi ${series.length} giorni. ACWR ${report.acwr?.toFixed(2) ?? "non disponibile"}.`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="bar-a" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--primary-glow)" />
              <stop offset="1" stopColor="var(--primary-deep)" />
            </linearGradient>
            <linearGradient id="bar-c" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--chart-3)" stopOpacity="0.85" />
              <stop offset="1" stopColor="var(--chart-3)" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="acute-bg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--primary)" stopOpacity="0.14" />
              <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((g) => (
            <line key={g} x1="0" x2={W} y1={H - g * (H - 12)} y2={H - g * (H - 12)} stroke="var(--border)" strokeDasharray="2 6" />
          ))}
          {acuteStart >= 0 && (
            <>
              <rect x={acuteStart * bw} y={0} width={7 * bw} height={H} fill="url(#acute-bg)" rx="8" />
              <line x1={acuteStart * bw} x2={acuteStart * bw} y1={0} y2={H} stroke="var(--primary)" strokeOpacity="0.4" />
              <text x={acuteStart * bw + 8} y="16" fontSize="10" fill="var(--primary-glow)" fontFamily="var(--font-mono)" letterSpacing="1.5">
                ULTIMI 7 GIORNI
              </text>
            </>
          )}
          {series.map((s, i) => {
            const h = Math.max(2, (s.load / max) * (H - 28));
            const acute = i >= acuteStart;
            const dim = hover !== null && hover !== i;
            return (
              <g key={s.day} onMouseEnter={() => setHover(i)}>
                <rect x={i * bw} y={0} width={bw} height={H} fill="transparent" />
                <motion.rect
                  x={i * bw + bw * 0.18}
                  width={Math.max(bw * 0.64, 1)}
                  rx={Math.min(3, bw * 0.3)}
                  fill={acute ? "url(#bar-a)" : "url(#bar-c)"}
                  initial={reduce ? { y: H - h, height: h } : { y: H, height: 0 }}
                  whileInView={{ y: H - h, height: h }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: reduce ? 0 : i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                  opacity={dim ? 0.35 : 1}
                  style={{ transition: "opacity .25s" }}
                >
                  <title>{`${s.day}: carico ${Math.round(s.load)}`}</title>
                </motion.rect>
              </g>
            );
          })}
          <line x1="0" x2={W} y1={H} y2={H} stroke="var(--border-strong)" />
          <text x="0" y={H + 18} fontSize="10" fill="var(--faint)" fontFamily="var(--font-mono)">
            {series[0]?.day.slice(5)}
          </text>
          <text x={W} y={H + 18} fontSize="10" fill="var(--faint)" textAnchor="end" fontFamily="var(--font-mono)">
            {series[series.length - 1]?.day.slice(5)}
          </text>
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap gap-5 font-mono text-[0.65rem] tracking-[0.08em] text-faint">
        <span className="flex items-center gap-2"><i className="size-2 rounded-sm bg-primary-glow" /> FINESTRA ACUTA</span>
        <span className="flex items-center gap-2"><i className="size-2 rounded-sm bg-chart-3" /> STORICO CRONICO</span>
        <span>SOGLIE DEMO, NON VALIDATE</span>
      </div>
    </figure>
  );
}
