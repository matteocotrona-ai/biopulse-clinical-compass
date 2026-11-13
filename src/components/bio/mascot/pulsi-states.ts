export type PulsiState =
  | "idle"
  | "welcome"
  | "privacy_shield"
  | "pairing_sync"
  | "analyzing_whitebox"
  | "optimal"
  | "fatigue_warning"
  | "critical_hitl_lock"
  | "celebration"
  | "security_guard"
  | "puzzled";

export type EyeShape = "open" | "happy" | "drowsy" | "wide" | "flat" | "scan" | "hidden";

export interface PulsiStateConfig {
  label: string;
  message: string;
  /** CSS variable holding the state accent color */
  tone: "teal" | "emerald" | "amber" | "crimson" | "slate";
  eyes: EyeShape;
  /** heartbeat cycle duration in seconds */
  beat: number;
  trackCursor: boolean;
}

export const PULSI_STATES: Record<PulsiState, PulsiStateConfig> = {
  idle: {
    label: "Riposo",
    message: "Sono qui se ti servo. Prenditi il tuo tempo.",
    tone: "teal",
    eyes: "open",
    beat: 1.4,
    trackCursor: true,
  },
  welcome: {
    label: "Benvenuto",
    message: "Ciao! Sono Pulsi, il tuo compagno BioPulse. Iniziamo a conoscerci?",
    tone: "teal",
    eyes: "happy",
    beat: 1.1,
    trackCursor: true,
  },
  privacy_shield: {
    label: "Privacy",
    message: "Non guardo, promesso. I tuoi dati restano tuoi.",
    tone: "teal",
    eyes: "hidden",
    beat: 1.4,
    trackCursor: false,
  },
  pairing_sync: {
    label: "Sincronizzazione",
    message: "Sto collegando il tuo smartwatch…",
    tone: "teal",
    eyes: "open",
    beat: 0.9,
    trackCursor: false,
  },
  analyzing_whitebox: {
    label: "Analisi",
    message: "Analizzo i tuoi dati passo dopo passo, in modo trasparente.",
    tone: "teal",
    eyes: "scan",
    beat: 0.5,
    trackCursor: false,
  },
  optimal: {
    label: "Ottimale",
    message: "Carico perfetto! Il tuo corpo è pronto.",
    tone: "emerald",
    eyes: "happy",
    beat: 1.0,
    trackCursor: true,
  },
  fatigue_warning: {
    label: "Affaticamento",
    message: "Ti vedo un po' stanco. Oggi meglio un recupero attivo.",
    tone: "amber",
    eyes: "drowsy",
    beat: 1.8,
    trackCursor: true,
  },
  critical_hitl_lock: {
    label: "Blocco medico",
    message: "Carico troppo alto. Ho chiesto la conferma del medico prima di procedere.",
    tone: "crimson",
    eyes: "wide",
    beat: 0.45,
    trackCursor: false,
  },
  celebration: {
    label: "Festa",
    message: "Evviva! Approvato, sei pronto a ripartire!",
    tone: "emerald",
    eyes: "happy",
    beat: 0.7,
    trackCursor: false,
  },
  security_guard: {
    label: "Sicurezza",
    message: "Richiesta non consentita. Proteggo il sistema.",
    tone: "slate",
    eyes: "flat",
    beat: 1.2,
    trackCursor: false,
  },
  puzzled: {
    label: "Dubbio",
    message: "Hmm, qualcosa non torna nei dati. Puoi ricontrollare?",
    tone: "amber",
    eyes: "open",
    beat: 1.3,
    trackCursor: true,
  },
};

export const PULSI_STATE_LIST = Object.keys(PULSI_STATES) as PulsiState[];
