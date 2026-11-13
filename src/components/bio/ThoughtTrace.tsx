import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Workflow, X } from "lucide-react";
import type { TraceEvent } from "@/lib/types";

const KIND: Record<string, { tag: string; solid: boolean }> = {
  input_check: { tag: "calcolato", solid: true },
  consent: { tag: "calcolato", solid: true },
  perception: { tag: "misurato", solid: true },
  whitebox: { tag: "calcolato", solid: true },
  safety: { tag: "calcolato", solid: true },
  self_check: { tag: "calcolato", solid: true },
  hitl: { tag: "calcolato", solid: true },
  subjective: { tag: "dal tuo testo", solid: false },
  memory: { tag: "storico", solid: true },
  rag: { tag: "letteratura", solid: false },
  llm: { tag: "interpretato dal modello", solid: false },
  internal_error: { tag: "errore gestito", solid: true },
};
const TONE = { ok: "var(--level-green)", warn: "var(--level-yellow)", error: "var(--level-red)" } as const;

function Values({ d }: { d: Record<string, unknown> }) {
  const keys: [string, string][] = [
    ["acwr", "ACWR"],
    ["rmssd_ms", "RMSSD"],
    ["hrv_z", "Z HRV"],
    ["readiness", "Prontezza"],
  ];
  const shown = keys.filter(([k]) => d[k] !== undefined && d[k] !== null);
  if (!shown.length) return null;
  return (
    <dl className="mt-3 flex flex-wrap gap-1.5 text-xs">
      {shown.map(([k, label]) => (
        <div key={k} className="flex gap-1.5 rounded-md border border-border bg-surface-sunken/70 px-2 py-1">
          <dt className="text-faint">{label}</dt>
          <dd className="tnum font-mono text-foreground">{String(d[k])}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ThoughtTrace({ events, running }: { events: TraceEvent[]; running: boolean }) {
  const reduce = useReducedMotion();
  return (
    <section aria-label="Traccia di ragionamento dell'agente" className="panel flex h-full min-h-[24rem] flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2.5 font-display text-xl font-light">
          <Workflow className="size-4 text-primary-glow" /> Come ha ragionato l'agente
        </h3>
        {running && (
          <span className="flex items-center gap-2 font-mono text-xs text-primary-glow" role="status">
            <span className="glow-dot animate-pulse" /> in corso…
          </span>
        )}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-faint">
        Linea piena: dato misurato o calcolato con formule. Linea tratteggiata: testo interpretato dal modello o dalla
        letteratura.
      </p>
      {events.length === 0 ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
          <div className="relative grid size-14 place-items-center">
            <span className="absolute inset-0 rounded-full border border-primary/30 animate-pulse-ring" />
            <Workflow className="size-5 text-faint" />
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Scrivi un messaggio: qui vedrai ogni passaggio, dai dati del dispositivo ai controlli di sicurezza.
          </p>
        </div>
      ) : (
        <ol className="relative mt-6 grid gap-3" aria-live="polite">
          <span className="absolute top-2 bottom-2 left-[11px] w-px bg-gradient-to-b from-primary/50 via-border to-transparent" aria-hidden />
          <AnimatePresence initial={false}>
            {events.map((e, i) => {
              const k = KIND[e.step] ?? { tag: e.step, solid: true };
              const Icon = e.status === "ok" ? Check : e.status === "warn" ? null : X;
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative pl-9"
                >
                  <span
                    aria-hidden
                    className="absolute top-3 left-0 grid size-6 place-items-center rounded-full border bg-background text-[0.65rem] font-semibold"
                    style={{ borderColor: TONE[e.status], color: TONE[e.status], boxShadow: `0 0 12px -2px ${TONE[e.status]}` }}
                  >
                    {Icon ? <Icon className="size-3" /> : "!"}
                  </span>
                  <div
                    className="rounded-xl bg-surface-raised/50 p-3.5"
                    style={{ border: `1px ${k.solid ? "solid" : "dashed"} color-mix(in oklab, ${TONE[e.status]} 35%, transparent)` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{e.title}</p>
                        <p className="mt-1 break-words text-sm leading-relaxed text-muted-foreground">{e.detail}</p>
                        <Values d={e.data} />
                      </div>
                      <div className="shrink-0 text-right font-mono text-[0.65rem] text-faint">
                        <p>{k.tag}</p>
                        <p className="tnum mt-1">{e.t_ms} ms</p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      )}
    </section>
  );
}
