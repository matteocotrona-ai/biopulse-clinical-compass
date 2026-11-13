import type { Level } from "./types";

/** Colors are CSS variables from the design system (src/styles.css). */
export const LEVEL: Record<
  Level,
  { label: string; color: string; soft: string; mark: string; text: string }
> = {
  green: {
    label: "Ottimale",
    color: "var(--level-green)",
    soft: "color-mix(in oklab, var(--level-green) 14%, transparent)",
    mark: "✓",
    text: "Nessun segnale critico rilevato nei dati disponibili; non equivale a un'idoneità all'allenamento.",
  },
  yellow: {
    label: "Attenzione",
    color: "var(--level-yellow)",
    soft: "color-mix(in oklab, var(--level-yellow) 14%, transparent)",
    mark: "!",
    text: "Segnale di attenzione: interpretalo nel contesto e chiedi un parere se necessario.",
  },
  red: {
    label: "Sovraccarico",
    color: "var(--level-red)",
    soft: "color-mix(in oklab, var(--level-red) 14%, transparent)",
    mark: "✕",
    text: "Priorità al recupero. Le indicazioni personalizzate sono trattenute; la revisione di un professionista non è garantita.",
  },
  unknown: {
    label: "Dati insufficienti",
    color: "var(--level-unknown)",
    soft: "color-mix(in oklab, var(--level-unknown) 14%, transparent)",
    mark: "?",
    text: "Servono più giorni di dati per valutare.",
  },
};
