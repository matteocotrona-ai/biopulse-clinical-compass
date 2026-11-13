import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function Sparkline({
  values,
  color = "var(--primary-glow)",
}: {
  values: (number | null)[];
  color?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const pts = values
    .map((v, i) => ({ v, i }))
    .filter((p): p is { v: number; i: number } => p.v !== null);
  const firstPt = pts[0];
  const lastPt = pts[pts.length - 1];
  if (pts.length < 2 || !firstPt || !lastPt) return <div className="h-12" />;
  const min = Math.min(...pts.map((p) => p.v));
  const max = Math.max(...pts.map((p) => p.v));
  const span = max - min || 1;
  const w = 160;
  const h = 48;
  const n = values.length - 1 || 1;
  const xy = (p: { v: number; i: number }) =>
    [(p.i / n) * w, h - 4 - ((p.v - min) / span) * (h - 10)] as const;
  const line = pts.map((p, idx) => `${idx ? "L" : "M"}${xy(p).join(",")}`).join(" ");
  const area = `${line} L${xy(lastPt)[0]},${h} L${xy(firstPt)[0]},${h} Z`;
  const [lx, ly] = xy(lastPt);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-12 w-full overflow-visible"
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`sa-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#sa-${uid})`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.4 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <circle cx={lx} cy={ly} r="5" fill={color} opacity="0.25" />
      <circle cx={lx} cy={ly} r="2.4" fill={color} />
    </svg>
  );
}
