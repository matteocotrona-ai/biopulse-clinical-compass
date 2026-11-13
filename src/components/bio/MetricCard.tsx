import { motion } from "framer-motion";
import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  unit,
  hint,
  values,
  tone = "var(--primary-glow)",
  alert = false,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  values: (number | null)[];
  tone?: string;
  alert?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "group panel flex flex-col overflow-hidden p-5 transition-colors duration-500 hover:border-primary/30",
        alert && "border-destructive/30",
      )}
    >
      <span
        className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40"
        style={{ background: tone }}
      />
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        <span
          className="size-1.5 rounded-full"
          style={{ background: tone, boxShadow: `0 0 10px ${tone}` }}
        />
      </div>
      <p className="mt-5 flex items-baseline gap-1.5">
        <span className="tnum font-display text-[2.6rem] leading-none font-light">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </p>
      <div className="mt-4">
        <Sparkline values={values} color={tone} />
      </div>
      {hint && (
        <p className="mt-3 border-t border-border pt-3 font-mono text-[0.7rem] text-muted-foreground">
          {hint}
        </p>
      )}
    </motion.div>
  );
}
