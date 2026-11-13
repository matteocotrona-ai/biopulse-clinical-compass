import { motion } from "framer-motion";
import { BellRing, CheckCircle2, ChevronDown, Inbox, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { decideCase, getAlerts, getCases } from "@/lib/api";
import { LEVEL } from "@/lib/level";
import type { AlertItem, HitlCase } from "@/lib/types";
import { Notice } from "./Notice";

const STATUS = {
  pending: "In attesa",
  approved: "Approvato",
  modified: "Modificato e approvato",
  rejected: "Respinto",
} as const;

function Case({ c, onDone }: { c: HitlCase; onDone: () => void }) {
  const [text, setText] = useState(c.draft_text);
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const r = c.report;
  const meta = LEVEL[c.level];
  const act = async (decision: "approve" | "modify" | "reject") => {
    setBusy(decision);
    setErr(null);
    try {
      await decideCase(c.id, {
        decision,
        ...(note ? { note } : {}),
        ...(decision === "modify" ? { final_text: text } : {}),
      });
      toast.success(`Caso #${c.id}: decisione registrata`);
      onDone();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel overflow-hidden p-5 sm:p-6"
    >
      <span
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ background: meta.color, boxShadow: `0 0 16px ${meta.color}` }}
      />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-xl">
            {c.athlete_name ?? c.athlete_id} <span className="text-faint">· caso #{c.id}</span>
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Motivo: {c.trigger.replaceAll("_", " ").replaceAll("+", ", ")} ·{" "}
            {new Date(c.created_at).toLocaleString("it-IT")}
          </p>
        </div>
        <span
          className="rounded-full border px-3 py-1 text-xs font-medium"
          style={{ background: meta.soft, color: meta.color, borderColor: meta.soft }}
        >
          {meta.label}
        </span>
      </header>
      <dl className="tnum mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border text-sm sm:grid-cols-4">
        {(
          [
            ["ACWR", r.acwr],
            ["Z HRV", r.hrv_z],
            ["RMSSD (ms)", r.rmssd_ms],
            ["FC riposo", r.resting_hr],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="bg-surface-sunken px-3 py-2.5">
            <dt className="font-mono text-[0.6rem] tracking-[0.1em] text-faint uppercase">{k}</dt>
            <dd className="mt-1 font-display text-lg">{v ?? "–"}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-4 grid gap-1.5 text-sm text-muted-foreground">
        {r.flags
          .filter((f) => f.severity !== "info")
          .map((f) => (
            <li key={f.code} className="flex gap-2">
              <span
                style={{ color: f.severity === "red" ? "var(--level-red)" : "var(--level-yellow)" }}
              >
                •
              </span>
              {f.message}
            </li>
          ))}
      </ul>

      {c.status === "pending" ? (
        <div className="mt-5 grid gap-3">
          <label
            className="grid gap-2 text-xs font-medium text-muted-foreground"
            htmlFor={`d${c.id}`}
          >
            Bozza di protocollo (modificabile)
            <textarea
              id={`d${c.id}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="field h-auto py-3 leading-relaxed"
            />
          </label>
          <label
            className="grid gap-2 text-xs font-medium text-muted-foreground"
            htmlFor={`n${c.id}`}
          >
            Nota (obbligatoria se respingi)
            <input
              id={`n${c.id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="field"
            />
          </label>
          {err && <Notice tone="error">{err}</Notice>}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button disabled={busy !== null} onClick={() => act("approve")}>
              {busy === "approve" && <Loader2 className="animate-spin" />} Approva e invia
              all'atleta
            </Button>
            <Button
              variant="outline"
              disabled={busy !== null || text === c.draft_text}
              onClick={() => act("modify")}
            >
              {busy === "modify" && <Loader2 className="animate-spin" />} Invia la versione
              modificata
            </Button>
            <Button variant="destructive" disabled={busy !== null} onClick={() => act("reject")}>
              {busy === "reject" && <Loader2 className="animate-spin" />} Respingi
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-5 flex gap-2.5 rounded-xl border border-border bg-surface-sunken/70 p-3.5 text-sm text-muted-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-level-green" />
          <span>
            <strong className="font-medium text-foreground">{STATUS[c.status]}</strong> da{" "}
            {c.reviewer}. {c.final_text ?? c.reviewer_note}
          </span>
        </p>
      )}
    </motion.article>
  );
}

function Section({
  title,
  count,
  icon: Icon,
  children,
}: {
  title: string;
  count: number;
  icon: typeof Inbox;
  children: React.ReactNode;
}) {
  return (
    <Collapsible className="mt-6">
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm transition-colors hover:border-primary/30">
        <span className="flex items-center gap-2.5">
          <Icon className="size-4 text-primary-glow" /> {title}{" "}
          <span className="font-mono text-xs text-faint">({count})</span>
        </span>
        <ChevronDown className="size-4 text-faint transition-transform duration-300 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="mt-3 grid gap-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function HitlPanel({ refreshKey }: { refreshKey: number }) {
  const [cases, setCases] = useState<HitlCase[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const [c, a] = await Promise.all([getCases(), getAlerts()]);
      setCases(c);
      setAlerts(a);
      setErr(null);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, []);
  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load, refreshKey]);
  const pending = cases.filter((c) => c.status === "pending");
  const done = cases.filter((c) => c.status !== "pending");
  return (
    <div>
      {err && (
        <Notice tone="error" className="mb-4">
          {err}
        </Notice>
      )}
      <h3 className="flex items-baseline gap-3 font-display text-2xl font-light">
        Da validare{" "}
        <span className="tnum font-mono text-sm text-primary-glow">{pending.length}</span>
      </h3>
      <div className="mt-4 grid gap-4">
        {pending.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <Inbox className="size-6 text-faint" />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Nessun caso in attesa. Quando l'agente rileva un rischio alto, apparirà qui prima di
              raggiungere l'atleta.
            </p>
          </div>
        )}
        {pending.map((c) => (
          <Case key={c.id} c={c} onDone={load} />
        ))}
      </div>
      {done.length > 0 && (
        <Section title="Già valutati" count={done.length} icon={CheckCircle2}>
          {done.map((c) => (
            <Case key={c.id} c={c} onDone={load} />
          ))}
        </Section>
      )}
      {alerts.length > 0 && (
        <Section title="Avvisi inviati" count={alerts.length} icon={BellRing}>
          <ul className="grid gap-2 text-sm">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-border bg-surface-sunken/60 px-3 py-2 text-muted-foreground"
              >
                <span className="tnum font-mono text-xs text-faint">
                  {new Date(a.created_at).toLocaleTimeString("it-IT")}
                </span>{" "}
                · {a.body} {a.simulated && <em className="text-faint">(simulato)</em>}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
