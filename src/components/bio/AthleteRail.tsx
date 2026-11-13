import { motion } from "framer-motion";
import { Brain, Loader2, RefreshCw, Trash2, Watch } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { eraseData, getDashboard, seedDemo, setConsent, syncWearable } from "@/lib/api";
import type { Dashboard, Scenario } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCENARIOS: { id: Scenario; title: string; text: string }[] = [
  { id: "normal", title: "Atleta in equilibrio", text: "Carico stabile, HRV nella norma." },
  { id: "overload", title: "Sovraccarico", text: "Ultima settimana quasi doppia: ACWR in zona di pericolo." },
  { id: "hrv_drop", title: "Calo della HRV", text: "Carico regolare ma HRV in forte calo da 3 giorni." },
  { id: "recovery", title: "Settimana di scarico", text: "Carico ridotto dopo un blocco intenso." },
];

export function AthleteRail({
  data,
  athleteId,
  canManage,
  demoMode,
  onChange,
  onReset,
}: {
  data: Dashboard | null;
  athleteId: string;
  canManage: boolean;
  demoMode: boolean;
  onChange: (d: Dashboard) => void;
  onReset: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"memory" | "all" | null>(null);
  const consentOk = !!data?.athlete.consent_data;

  async function load(s: Scenario) {
    setBusy(s);
    setMsg(null);
    try {
      onChange(await seedDemo(athleteId, s));
      toast.success("Scenario caricato", { description: SCENARIOS.find((x) => x.id === s)?.title });
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function synchronizeWearable() {
    setBusy("wearable");
    setMsg(null);
    try {
      const result = await syncWearable(athleteId);
      onChange(await getDashboard(athleteId));
      setMsg(
        `Fonte sintetica sincronizzata: ${result.records_accepted} record riletti, ultimo giorno ${result.cursor_day}.`,
      );
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function consent(k: "consent_data" | "consent_alerts", v: boolean) {
    if (!data) return;
    try {
      await setConsent(athleteId, k === "consent_data" ? { consent_data: v } : { consent_alerts: v });
      onChange({ ...data, athlete: { ...data.athlete, [k]: v } });
      toast(v ? "Consenso attivato" : "Consenso revocato");
    } catch (e) {
      setMsg((e as Error).message);
    }
  }
  async function erase(scope: "memory" | "all") {
    try {
      await eraseData(athleteId, scope);
      setMsg(scope === "all" ? "Tutti i dati sono stati cancellati." : "Memoria dell'agente cancellata.");
      if (scope === "all") onReset();
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  return (
    <div className="grid gap-6 text-sm" aria-label="Profilo e dati demo">
      {canManage && (
        <fieldset className="grid gap-3">
          <legend className="mb-3 eyebrow">Consenso biometrico e avvisi</legend>
          {(
            [
              ["consent_data", "Autorizzo l'analisi dei miei dati biometrici"],
              ["consent_alerts", "Autorizzo gli avvisi tramite il canale configurato dal gestore"],
            ] as const
          ).map(([k, label]) => (
            <label
              key={k}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-surface-sunken/60 px-4 py-3.5 transition-colors hover:border-primary/30"
            >
              <span className="text-foreground/90">{label}</span>
              <Switch disabled={!data} checked={!!data?.athlete[k]} onCheckedChange={(v) => consent(k, v)} />
            </label>
          ))}
          <p className="text-xs leading-relaxed text-faint">
            Il contatto salvato in questo browser non è collegato. L'eventuale invio esterno dipende dalla
            configurazione server; questa scelta tecnica non sostituisce un consenso o un'informativa legale.
          </p>
        </fieldset>
      )}

      {canManage && demoMode && (
        <fieldset className="grid gap-3">
          <legend className="mb-3 eyebrow">Sincronizzazione wearable</legend>
          <p className="text-xs text-faint">Sorgente sintetica di test: nessun dispositivo o dato personale collegato.</p>
          <Button onClick={synchronizeWearable} disabled={busy !== null || !consentOk} className="justify-start">
            {busy === "wearable" ? <Loader2 className="animate-spin" /> : <Watch />}
            {busy === "wearable" ? "Sincronizzo…" : "Sincronizza wearable simulato"}
          </Button>
        </fieldset>
      )}

      {canManage && demoMode && (
        <fieldset>
          <legend className="mb-3 eyebrow">Scenario di dati simulati</legend>
          {!consentOk && <p className="mb-3 text-xs text-warning">Attiva il consenso biometrico per caricare uno scenario.</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            {SCENARIOS.map((s, i) => (
              <motion.button
                key={s.id}
                onClick={() => load(s.id)}
                disabled={busy !== null || !consentOk}
                whileHover={{ y: -2 }}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border bg-surface-raised/40 p-4 text-left transition-colors hover:border-primary/40 disabled:pointer-events-none disabled:opacity-45",
                  busy === s.id && "border-primary/60",
                )}
              >
                <span className="font-mono text-[0.6rem] text-primary-glow">0{i + 1}</span>
                <span className="mt-2 flex items-center gap-2 font-medium text-foreground">
                  {busy === s.id && <Loader2 className="size-3.5 animate-spin" />}
                  {busy === s.id ? "Carico…" : s.title}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{s.text}</span>
                <RefreshCw className="absolute top-4 right-4 size-3.5 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            ))}
          </div>
        </fieldset>
      )}

      {canManage && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={() => setConfirm("memory")} className="justify-start">
            <Brain /> Cancella la memoria dell'agente
          </Button>
          <Button variant="destructive" onClick={() => setConfirm("all")} className="justify-start">
            <Trash2 /> Cancella tutti i miei dati
          </Button>
        </div>
      )}
      {msg && (
        <p role="status" className="rounded-xl border border-primary/25 bg-primary/[0.07] p-3.5 text-muted-foreground">
          {msg}
        </p>
      )}

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent className="glass rounded-2xl border-border-strong bg-popover/90 shadow-lift">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-light">
              {confirm === "all" ? "Cancellare tutti i dati?" : "Cancellare la memoria?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              {confirm === "all"
                ? "Cancellare profilo, account e tutti i dati associati (metriche, memoria, casi, avvisi e consensi)? L'azione è definitiva."
                : "Cancellare la memoria dell'agente su questo atleta?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full border-border-strong bg-transparent">Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirm && erase(confirm)}
            >
              Conferma cancellazione
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
