import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Cookie, Radio, UserRound, Watch } from "lucide-react";

import { Ambient } from "@/components/bio/Ambient";
import { Brand } from "@/components/bio/Brand";
import { Pulsi } from "@/components/bio/mascot/Pulsi";
import type { PulsiState } from "@/components/bio/mascot/pulsi-states";
import { EASE } from "@/components/bio/motion";
import { Notice } from "@/components/bio/Notice";
import { PortalLoader } from "@/components/bio/PortalLoader";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/api";
import { keys } from "@/lib/onboarding";
import type { SessionInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Orientamento — BioPulse" },
      { name: "description", content: "Configura il tuo spazio BioPulse: connessioni attive, confini della privacy e un tour in 30 secondi." },
      { property: "og:title", content: "Orientamento — BioPulse" },
      { property: "og:description", content: "Il tuo corpo parla. Impariamo ad ascoltarlo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = ["Il tuo spazio", "Connessioni", "Privacy", "Inizia"];
const PULSI: PulsiState[] = ["welcome", "pairing_sync", "privacy_shield", "celebration"];

function OnboardingPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [contact, setContact] = useState("");
  const [readPrivacy, setReadPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getSession()
      .then((value) => {
        if (!active) return;
        setSession(value);
        if (localStorage.getItem(keys.onboarding(value.user.id)) === "complete") navigate({ to: "/dashboard", replace: true });
        const savedStep = Number(localStorage.getItem(keys.step(value.user.id)));
        if (Number.isInteger(savedStep) && savedStep >= 0 && savedStep < STEPS.length) setStep(savedStep);
        setContact(localStorage.getItem(keys.contact(value.user.id)) ?? "");
        setReadPrivacy(localStorage.getItem(keys.privacy(value.user.id)) === "true");
        setPreferencesLoaded(true);
      })
      .catch(() => {
        if (active) navigate({ to: "/", replace: true });
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!session || !preferencesLoaded) return;
    localStorage.setItem(keys.step(session.user.id), String(step));
    localStorage.setItem(keys.contact(session.user.id), contact);
    localStorage.setItem(keys.privacy(session.user.id), String(readPrivacy));
  }, [session, preferencesLoaded, step, contact, readPrivacy]);

  function go(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  function finish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    if (!readPrivacy) {
      setError("Per continuare, conferma di aver consultato le informative prototipali.");
      return;
    }
    localStorage.setItem(keys.contact(session.user.id), contact.trim());
    localStorage.setItem(keys.cookie, "necessary-only");
    localStorage.setItem(keys.privacy(session.user.id), "true");
    localStorage.setItem(keys.onboarding(session.user.id), "complete");
    navigate({ to: "/dashboard", replace: true });
  }

  if (!session) return <PortalLoader label="Verifica accesso…" />;
  const athlete = session.athletes[0];
  const variants = {
    enter: (d: number) => ({ opacity: 0, x: reduceMotion ? 0 : d * 40, filter: "blur(6px)" }),
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (d: number) => ({ opacity: 0, x: reduceMotion ? 0 : d * -40, filter: "blur(6px)" }),
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Ambient />
      <header className="relative z-10 mx-auto flex max-w-[90rem] items-center justify-between px-5 py-6 sm:px-10">
        <Brand />
        <span className="eyebrow">
          <span className="hidden sm:inline">Configurazione iniziale </span>
          <b className="ml-2 font-medium text-foreground">0{step + 1} / 04</b>
        </span>
      </header>
      <div className="relative z-10 mx-auto max-w-[90rem] px-5 sm:px-10" aria-label={`Passaggio ${step + 1} di 4`}>
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((label, i) => (
            <div key={label}>
              <div className="h-[2px] overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full bg-gradient-primary"
                  initial={false}
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
              <p className={cn("mt-2 hidden font-mono text-[0.6rem] tracking-[0.14em] uppercase sm:block", i <= step ? "text-foreground/80" : "text-faint")}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[90rem] gap-8 px-5 py-10 sm:px-10 lg:grid-cols-[1fr_24rem] lg:py-16">
        <div className="min-w-0">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.section
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: EASE }}
            >
              {step === 0 && (
                <>
                  <p className="flex items-center gap-2 eyebrow">
                    <span className="glow-dot" /> Benvenuto, {athlete?.name?.toUpperCase() ?? "ATLETA"}
                  </p>
                  <Title>
                    Il tuo corpo parla.
                    <br />
                    <Accent>Impariamo ad ascoltarlo.</Accent>
                  </Title>
                  <Lead>
                    BioPulse organizza segnali di allenamento e recupero in una vista comprensibile. Non fa diagnosi, non
                    sostituisce il tuo giudizio né quello di un professionista.
                  </Lead>
                  <div className="mt-10 grid gap-3 md:grid-cols-3">
                    {[
                      ["Osserva", "Esplora metriche, trend e qualità dei dati senza trasformare un numero in una diagnosi."],
                      ["Comprendi", "Chiedi all'agente di spiegare i segnali e le incertezze che li accompagnano."],
                      ["Decidi con consapevolezza", "Usa le informazioni come supporto, confrontandoti con il tuo team quando serve."],
                    ].map(([t, d], i) => (
                      <motion.article
                        key={t}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.1, duration: 0.7, ease: EASE }}
                        className="panel p-5 transition-colors hover:border-primary/30"
                      >
                        <span className="font-mono text-xs text-primary-glow">0{i + 1}</span>
                        <h3 className="mt-6 font-display text-lg">{t}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
                      </motion.article>
                    ))}
                  </div>
                  <Actions>
                    <span />
                    <Button size="lg" onClick={() => go(1)}>
                      Configura il prototipo <ArrowRight />
                    </Button>
                  </Actions>
                </>
              )}

              {step === 1 && (
                <>
                  <p className="eyebrow">01 — Connessioni e profilo</p>
                  <Title>
                    Partiamo da ciò
                    <br />
                    <Accent>che è davvero attivo.</Accent>
                  </Title>
                  <div className="mt-10 grid gap-3">
                    <Connection icon={<Watch className="size-4" />} title="Wearable" status="SIMULATO">
                      Il collegamento a orologi reali non è attivo. Puoi provare dati e sincronizzazione{" "}
                      <strong className="font-medium text-foreground">interamente simulati</strong> dal profilo.
                    </Connection>
                    <Connection icon={<UserRound className="size-4" />} title="Allenatore o professionista" status="NON COLLEGATO" inactive>
                      Il contatto non è collegato a messaggi o notifiche. Se lo inserisci, resta salvato solo in questo
                      browser e non viene contattato.
                      <label className="mt-4 grid gap-2 text-xs font-medium text-muted-foreground">
                        Contatto (facoltativo)
                        <input
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          maxLength={160}
                          placeholder="Nome, email o numero — solo promemoria locale"
                          className="field"
                        />
                      </label>
                    </Connection>
                  </div>
                  <Notice className="mt-4">
                    <b className="font-medium text-foreground">Profilo: {athlete?.profile ?? "standard"}</b> — i profili
                    sono descrittivi e non modificano le formule. Il contatto professionista non abilita condivisione di dati.
                  </Notice>
                  <Actions>
                    <Button variant="ghost" onClick={() => go(0)}>
                      <ArrowLeft /> Indietro
                    </Button>
                    <Button size="lg" onClick={() => go(2)}>
                      Continua <ArrowRight />
                    </Button>
                  </Actions>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="eyebrow">02 — Informazioni e preferenze</p>
                  <Title>
                    Prima di entrare,
                    <br />
                    <Accent>conosci i confini.</Accent>
                  </Title>
                  <Lead>
                    Questi testi descrivono il prototipo attuale, non sono informative legali definitive. Devono essere
                    verificati da professionisti privacy e legali prima di un uso reale.
                  </Lead>
                  <div className="mt-8 grid gap-3 md:grid-cols-3">
                    {(
                      [
                        ["/privacy", "Privacy e trattamento dei dati", "Finalità, dati biometrici, conservazione e cancellazione"],
                        ["/cookies", "Cookie e archiviazione locale", "Cookie tecnici e preferenze salvate nel browser"],
                        ["/ethics", "Etica, limiti e possibili bias", "Limiti di validazione, inclusione e supervisione"],
                      ] as const
                    ).map(([to, t, d], i) => (
                      <Link key={to} to={to} className="group panel block p-5 transition-colors hover:border-primary/40">
                        <span className="flex items-center justify-between font-mono text-xs text-primary-glow">
                          0{i + 1}
                          <ArrowUpRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-glow" />
                        </span>
                        <b className="mt-5 block font-display text-base font-normal">{t}</b>
                        <small className="mt-2 block text-xs leading-relaxed text-muted-foreground">{d}</small>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 flex items-start gap-4 rounded-xl border border-border bg-surface/70 p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border-strong text-primary-glow">
                      <Cookie className="size-4" />
                    </span>
                    <div className="flex-1">
                      <b className="font-medium">Solo archiviazione necessaria</b>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Autenticazione e protezione CSRF richiedono cookie tecnici. Non risultano cookie analytics o
                        pubblicitari: non c'è un'opzione “accetta tutti”.
                      </p>
                    </div>
                    <span className="rounded-full border border-border-strong px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground">
                      NECESSARI
                    </span>
                  </div>
                  {error && <Notice tone="error" className="mt-4">{error}</Notice>}
                  <label
                    className={cn(
                      "mt-4 flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors",
                      readPrivacy ? "border-primary/50 bg-primary/[0.08]" : "border-border bg-surface/50 hover:border-border-strong",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={readPrivacy}
                      onChange={(e) => {
                        setReadPrivacy(e.target.checked);
                        setError("");
                      }}
                    />
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-all duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                        readPrivacy ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border-strong",
                      )}
                    >
                      {readPrivacy && <Check className="size-3.5" />}
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      Confermo di aver consultato i testi prototipali e scelgo di proseguire nella demo con i soli strumenti
                      tecnici necessari. Ho capito che non è un consenso a usare dati biometrici.
                    </span>
                  </label>
                  <Actions>
                    <Button variant="ghost" onClick={() => go(1)}>
                      <ArrowLeft /> Indietro
                    </Button>
                    <Button
                      size="lg"
                      disabled={!readPrivacy}
                      onClick={() => {
                        setError("");
                        go(3);
                      }}
                    >
                      Continua <ArrowRight />
                    </Button>
                  </Actions>
                </>
              )}

              {step === 3 && (
                <>
                  <p className="flex items-center gap-2 eyebrow">
                    <span className="glow-dot" /> Orientamento · 30 secondi
                  </p>
                  <Title>
                    Un portale.
                    <br />
                    <Accent>Tre prospettive.</Accent>
                  </Title>
                  <div className="mt-10 grid gap-3">
                    {[
                      ["Panoramica", "metriche, trend, livello di completezza e fonti demo."],
                      ["BioPulse AI", "chat esplicabile, con tracciamento dei passaggi e limiti dichiarati."],
                      ["Profilo", "consenso biometrico separato, dati simulati e strumenti di cancellazione."],
                    ].map(([t, d], i) => (
                      <motion.div
                        key={t}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.12, duration: 0.6, ease: EASE }}
                        className="flex items-center gap-5 border-b border-border py-5"
                      >
                        <span className="font-mono text-xs text-primary-glow">0{i + 1}</span>
                        <b className="w-32 shrink-0 font-display text-xl font-light sm:w-44">{t}</b>
                        <span className="text-sm text-muted-foreground">{d}</span>
                      </motion.div>
                    ))}
                  </div>
                  <form onSubmit={finish}>
                    <Actions>
                      <Button type="button" variant="ghost" onClick={() => go(2)}>
                        <ArrowLeft /> Rileggi informative
                      </Button>
                      <Button type="submit" size="lg" variant="hero">
                        Entra nella demo <ArrowUpRight />
                      </Button>
                    </Actions>
                  </form>
                </>
              )}
            </motion.section>
          </AnimatePresence>
        </div>

        <aside className="panel relative hidden overflow-hidden p-8 lg:block">
          <div className="pointer-events-none absolute inset-0 bg-spot" />
          <div className="relative flex justify-center pt-4">
            <Pulsi state={PULSI[step] ?? "welcome"} size={170} />
          </div>
          <p className="relative mt-8 eyebrow">BioPulse / orientamento</p>
          <h2 className="relative mt-4 font-display text-3xl leading-tight font-light">
            La tecnologia come alleata.
            <br />
            <span className="font-serif-accent text-primary-glow">Mai come verdetto.</span>
          </h2>
          <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
            Un punteggio non racconta tutta la persona. Tieni conto del contesto, dei tuoi sintomi e della voce dei
            professionisti.
          </p>
          <div className="relative mt-8 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/[0.06] p-4">
            <Radio className="size-4 shrink-0 text-warning" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Prototipo non validato clinicamente.
              <br />
              Non usare per diagnosi o decisioni urgenti.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <h1 className="mt-6 font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[0.98] font-light">{children}</h1>;
}
function Accent({ children }: { children: ReactNode }) {
  return <span className="font-serif-accent text-gradient-blue">{children}</span>;
}
function Lead({ children }: { children: ReactNode }) {
  return <p className="mt-6 max-w-2xl text-[0.975rem] leading-relaxed text-muted-foreground">{children}</p>;
}
function Actions({ children }: { children: ReactNode }) {
  return <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">{children}</div>;
}
function Connection({
  icon,
  title,
  status,
  inactive,
  children,
}: {
  icon: ReactNode;
  title: string;
  status: string;
  inactive?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary-glow">{icon}</span>
      <div className="flex-1">
        <h2 className="font-display text-lg">{title}</h2>
        <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</div>
      </div>
      <span
        className={cn(
          "self-start rounded-full border px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.12em]",
          inactive ? "border-warning/30 text-warning" : "border-primary/30 text-primary-glow",
        )}
      >
        {status}
      </span>
    </div>
  );
}
