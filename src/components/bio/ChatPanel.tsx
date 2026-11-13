import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  FlaskConical,
  Loader2,
  MessageSquareText,
  Stethoscope,
  Workflow,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getValidated, streamChat } from "@/lib/api";
import type { HitlCase, Level, MessageEvent, TraceEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PulsiCompanion } from "./PulsiCompanion";
import { ThoughtTrace } from "./ThoughtTrace";

interface Msg {
  role: "user" | "agent";
  text: string;
  meta?: MessageEvent;
}

const QUICK = [
  "Come mi alleno oggi?",
  "Ho dormito male, RPE 7 ieri",
  "Sto benissimo, voglio fare ripetute massimali",
  "Ho dolore al petto mentre corro",
];
const SOURCE: Record<string, string> = {
  llm: "scritto dal modello e verificato",
  deterministic: "calcolato dalle regole",
  guardrail: "corretto dai controlli di sicurezza",
  safety: "protocollo di sicurezza",
  fallback: "modalità di riserva",
  "safe-mode": "modalità sicura",
  system: "sistema",
};

export function ChatPanel({
  athleteId,
  disabled,
  consentRequired = false,
  onInteraction,
  level = null,
}: {
  athleteId: string;
  disabled: boolean;
  consentRequired?: boolean;
  onInteraction: () => void;
  level?: Level | null;
}) {
  const reduce = useReducedMotion();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [failure, setFailure] = useState("");
  const [validated, setValidated] = useState<HitlCase[]>([]);
  const [chatError, setChatError] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "trace">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [msgs, running, reduce]);
  useEffect(() => {
    let alive = true;
    const load = () =>
      getValidated(athleteId)
        .then((v) => alive && setValidated(v))
        .catch(() => undefined);
    load();
    const t = setInterval(load, 8000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [athleteId]);

  async function send(text: string) {
    if (running) return;
    setMsgs((m) => [...m, { role: "user", text: text.trim() || "(messaggio vuoto)" }]);
    setInput("");
    setTrace([]);
    setChatError(false);
    setRunning(true);
    try {
      await streamChat({ athlete_id: athleteId, message: text, simulate_failure: failure }, (e) => {
        if (e.type === "trace") setTrace((t) => [...t, e]);
        else if (e.type === "message")
          setMsgs((m) => [...m, { role: "agent", text: e.text, meta: e }]);
      });
    } catch (err) {
      setChatError(true);
      setMsgs((m) => [...m, { role: "agent", text: (err as Error).message }]);
    } finally {
      setRunning(false);
      onInteraction();
    }
  }

  return (
    <div>
      {/* Mobile segmented switch */}
      <div
        className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-border bg-surface p-1 lg:hidden"
        role="tablist"
      >
        {(
          [
            ["chat", "Conversazione", MessageSquareText],
            ["trace", "Ragionamento", Workflow],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={mobileTab === id}
            onClick={() => setMobileTab(id)}
            className={cn(
              "relative flex h-9 items-center justify-center gap-2 rounded-full text-sm transition-colors",
              mobileTab === id ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {mobileTab === id && (
              <motion.span
                layoutId="chat-tab"
                className="absolute inset-0 rounded-full bg-accent ring-1 ring-primary/30"
              />
            )}
            <Icon className="relative size-4" />
            <span className="relative">{label}</span>
            {id === "trace" && trace.length > 0 && (
              <span className="relative rounded-full bg-primary px-1.5 font-mono text-[0.6rem] text-primary-foreground">
                {trace.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <section
          aria-label="Conversazione con l'agente"
          className={cn(
            "panel flex h-[calc(100svh-17rem)] min-h-[32rem] flex-col overflow-hidden lg:h-[44rem]",
            mobileTab !== "chat" && "hidden lg:flex",
          )}
        >
          <PulsiCompanion
            running={running}
            disabled={disabled}
            consentRequired={consentRequired}
            chatError={chatError}
            level={level}
            hasConversation={msgs.length > 0}
          />

          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
            aria-live="polite"
          >
            {msgs.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-md pt-6 text-center"
              >
                <p className="font-display text-2xl font-light">
                  Come ti senti <span className="font-serif-accent text-primary-glow">oggi?</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Racconta come ti senti o chiedi cosa fare oggi. Puoi anche provare uno di questi
                  messaggi:
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {QUICK.map((q, i) => (
                    <motion.button
                      key={q}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.07 }}
                      disabled={disabled || running}
                      onClick={() => send(q)}
                      className="rounded-xl border border-border bg-surface-raised/40 px-4 py-3 text-left text-sm text-foreground/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-40"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            <AnimatePresence initial={false}>
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      m.role === "user"
                        ? "rounded-br-md bg-gradient-primary text-primary-foreground shadow-glow"
                        : "rounded-bl-md border border-border bg-surface-raised/70",
                    )}
                  >
                    <p className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    {m.meta && (
                      <p className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2 font-mono text-[0.65rem] text-faint">
                        <span>{SOURCE[m.meta.source] ?? m.meta.source}</span>
                        {m.meta.corrected && (
                          <span className="text-warning">corretto dall'autoverifica</span>
                        )}
                        {m.meta.held && (
                          <span className="text-primary-glow">
                            protocollo personalizzato in attesa di validazione
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {running && (
              <div className="flex justify-start" role="status" aria-label="L'agente sta scrivendo">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-surface-raised/70 px-4 py-3.5">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="size-1.5 rounded-full bg-primary-glow"
                      animate={reduce ? {} : { opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {validated.length > 0 && (
            <div className="border-t border-primary/25 bg-primary/[0.07] px-4 py-3 text-sm sm:px-6">
              <p className="flex items-center gap-2 font-medium text-primary-glow">
                <Stethoscope className="size-4" /> Dal tuo medico o preparatore
              </p>
              {validated.slice(0, 2).map((v) => (
                <p key={v.id} className="mt-1.5 text-muted-foreground">
                  {v.status === "rejected"
                    ? `Il tuo professionista ha chiesto di rivedere il piano: ${v.reviewer_note}`
                    : v.final_text}
                </p>
              ))}
            </div>
          )}

          <form
            className="border-t border-border bg-surface-sunken/50 p-3 sm:p-4"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <div className="flex items-center gap-2 rounded-full border border-input bg-background/70 p-1.5 pl-5 transition-[border-color,box-shadow] duration-300 focus-within:border-primary/60 focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]">
              <label className="sr-only" htmlFor="chat-input">
                Il tuo messaggio
              </label>
              <input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={disabled || running}
                maxLength={2000}
                placeholder="Come ti senti oggi? Scrivi anche RPE o dolori"
                className="min-w-0 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-faint disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={disabled || running}
                aria-label={running ? "Analizzo…" : "Invia"}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow transition-all duration-300 hover:scale-105 hover:bg-primary-glow disabled:pointer-events-none disabled:opacity-40"
              >
                {running ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </button>
            </div>
            <label className="mt-3 flex items-center gap-2 px-2 text-xs text-faint">
              <FlaskConical className="size-3.5" /> Simula un guasto (demo)
              <select
                value={failure}
                onChange={(e) => setFailure(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1 text-foreground outline-none focus:border-primary/60"
              >
                <option value="">nessuno</option>
                <option value="wearable">dispositivo/database non risponde</option>
                <option value="knowledge">letteratura non disponibile</option>
                <option value="llm">modello linguistico non disponibile</option>
              </select>
            </label>
          </form>
        </section>
        <div className={cn(mobileTab !== "trace" && "hidden lg:block")}>
          <ThoughtTrace events={trace} running={running} />
        </div>
      </div>
    </div>
  );
}
