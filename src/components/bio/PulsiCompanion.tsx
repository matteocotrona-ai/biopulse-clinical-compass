import { AnimatePresence, motion } from "framer-motion";
import { Pulsi } from "./mascot/Pulsi";
import type { PulsiState } from "./mascot/pulsi-states";
import type { Level } from "@/lib/types";

interface CompanionStatus {
  state: PulsiState;
  label: string;
  message: string;
}

function getStatus(
  disabled: boolean,
  consentRequired: boolean,
  running: boolean,
  chatError: boolean,
  level: Level | null,
  hasConversation: boolean,
): CompanionStatus {
  if (consentRequired)
    return {
      state: "privacy_shield",
      label: "CHAT IN PAUSA",
      message: "Per usare la chat, consulta il profilo e gestisci separatamente il consenso ai dati biometrici.",
    };
  if (running)
    return {
      state: "analyzing_whitebox",
      label: "STO ANALIZZANDO",
      message: "Esamino il messaggio e i dati disponibili, controllando anche incertezza e limiti.",
    };
  if (disabled)
    return {
      state: "pairing_sync",
      label: "CARICO IL PROFILO",
      message: "Sto verificando il profilo e la disponibilità dei dati demo.",
    };
  if (chatError)
    return {
      state: "puzzled",
      label: "CONNESSIONE INTERROTTA",
      message: "La risposta non è arrivata. Puoi riprovare; non ho elaborato una raccomandazione.",
    };
  if (level === "red")
    return {
      state: "critical_hitl_lock",
      label: "PRUDENZA",
      message: "Nei dati demo compare un segnale critico. Non è confermata alcuna revisione da parte di un professionista.",
    };
  if (level === "yellow")
    return {
      state: "fatigue_warning",
      label: "SEGNALI DA CONTESTUALIZZARE",
      message: "Alcuni segnali richiedono attenzione; considera il contesto e, se serve, chiedi un parere professionale.",
    };
  if (level === "green")
    return {
      state: "optimal",
      label: "QUADRO DEMO REGOLARE",
      message: "Nei dati demo non risultano segnali critici. Questo non è un via libera all'attività.",
    };
  if (level === "unknown")
    return {
      state: "puzzled",
      label: "DATI INSUFFICIENTI",
      message: "Mancano informazioni per una valutazione affidabile. La demo non colma i dati assenti.",
    };
  return {
    state: hasConversation ? "idle" : "welcome",
    label: hasConversation ? "IN ASCOLTO" : "CIAO, SONO PULSI",
    message: hasConversation
      ? "Sono qui per aiutarti a esplorare i dati, senza sostituire il tuo giudizio o un professionista."
      : "Ciao! Ti accompagno nella lettura dei dati e dei loro limiti.",
  };
}

export function PulsiCompanion(props: {
  running: boolean;
  disabled: boolean;
  consentRequired: boolean;
  chatError: boolean;
  level: Level | null;
  hasConversation: boolean;
}) {
  const { running, disabled, consentRequired } = props;
  const status = getStatus(disabled, consentRequired, running, props.chatError, props.level, props.hasConversation);

  return (
    <header className="relative flex items-center gap-4 overflow-hidden border-b border-border px-4 py-4 sm:px-6" aria-label="Stato dell'agente BioPulse">
      <div className="pointer-events-none absolute -left-10 top-1/2 size-40 -translate-y-1/2 rounded-full bg-primary/25 blur-3xl" />
      <div className="relative -my-2 shrink-0">
        <Pulsi state={status.state} size={76} trackCursor={false} title={`Pulsi: ${status.label.toLowerCase()}`} />
      </div>
      <div className="relative min-w-0 flex-1" aria-live="polite">
        <p className="eyebrow flex items-center gap-2 text-faint">
          <span className="glow-dot" /> BioPulse / compagno digitale
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={status.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="mt-2 font-display text-lg">
              Pulsi <span className="text-faint">·</span>{" "}
              <span className="font-mono text-xs tracking-[0.14em] text-primary-glow">{status.label}</span>
            </h2>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{status.message}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="relative hidden shrink-0 flex-col items-end gap-2 md:flex" aria-hidden="true">
        <span className="signal-bars">
          {Array.from({ length: 7 }).map((_, i) => (
            <i key={i} style={running ? undefined : { animationPlayState: "paused", opacity: 0.4 }} />
          ))}
        </span>
        <small className="font-mono text-[0.6rem] tracking-[0.14em] text-faint">
          {running ? "ELABORAZIONE" : consentRequired ? "IN ATTESA" : disabled ? "CARICAMENTO" : "DEMO · DATI SINTETICI"}
        </small>
      </div>
    </header>
  );
}
