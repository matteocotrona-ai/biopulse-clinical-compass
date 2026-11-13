import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

import heroSculpt from "@/assets/hero-sculpt.jpg";
import { Ambient } from "@/components/bio/Ambient";
import { Brand } from "@/components/bio/Brand";
import { BackendNotice, Notice } from "@/components/bio/Notice";
import { EASE, RiseText } from "@/components/bio/motion";
import { Button } from "@/components/ui/button";
import { getAuthOptions, getSession, isNetworkError, login, registerAthlete } from "@/lib/api";
import { landingPath } from "@/lib/onboarding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Accedi — BioPulse Athlete Intelligence" },
      {
        name: "description",
        content:
          "Accedi al tuo spazio BioPulse: segnali di carico e recupero resi leggibili, con IA spiegabile e controllo umano.",
      },
      { property: "og:title", content: "BioPulse — Ascolta i segnali, comprendi il recupero" },
      {
        property: "og:description",
        content: "Un compagno digitale che rende leggibili i dati di allenamento e recupero.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function authError(reason: unknown) {
  const failure = reason as { message?: string };
  return isNetworkError(reason)
    ? "Servizio di accesso non raggiungibile. Verifica che il backend sia avviato."
    : (failure.message ?? "Accesso non riuscito. Riprova.");
}

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [backendDown, setBackendDown] = useState(false);

  useEffect(() => {
    let active = true;
    getAuthOptions()
      .then((value) => {
        if (active) setRegistrationEnabled(value.self_registration);
      })
      .catch((reason) => {
        if (!active) return;
        if (isNetworkError(reason)) setBackendDown(true);
        else setError(authError(reason));
      });
    getSession()
      .then((session) => {
        if (active) navigate({ to: landingPath(session.user.id), replace: true });
      })
      .catch((reason) => {
        if (!active || (reason as { status?: number }).status === 401) return;
        if (isNetworkError(reason)) setBackendDown(true);
        else setError(authError(reason));
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (registerMode && password !== confirmation) {
      setError("Le password non coincidono.");
      return;
    }
    setBusy(true);
    try {
      if (registerMode) await registerAthlete(email, password, name, "standard");
      else await login(email, password);
      const session = await getSession();
      navigate({ to: landingPath(session.user.id), replace: true });
    } catch (reason) {
      if (isNetworkError(reason)) setBackendDown(true);
      setError(authError(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden lg:grid lg:grid-cols-[1.2fr_1fr]">
      <Ambient />

      {/* Top bar spanning both columns */}
      <header className="absolute inset-x-0 top-0 z-30 flex h-20 items-center justify-between px-6 sm:px-10 lg:px-14">
        <Brand />
        <nav
          className="hidden items-center gap-9 font-mono text-[0.62rem] tracking-[0.24em] text-muted-foreground uppercase md:flex"
          aria-label="Documenti"
        >
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link to="/cookies" className="transition-colors hover:text-foreground">
            Cookie
          </Link>
          <Link to="/ethics" className="transition-colors hover:text-foreground">
            Etica
          </Link>
        </nav>
        <span className="hidden items-center gap-2 eyebrow sm:flex">
          <span className="glow-dot" /> IT · Prototipo 2026
        </span>
      </header>

      {/* Cinematic left stage */}
      <section className="relative z-10 flex min-h-[34rem] flex-col overflow-hidden px-6 pt-28 pb-10 sm:px-10 lg:min-h-screen lg:px-14 lg:pt-24 lg:pb-8">
        <motion.img
          src={heroSculpt}
          alt=""
          width={1280}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover object-[78%_30%] opacity-90"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ duration: 2.4, ease: EASE }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/70" />

        {/* Annotation callouts over the figure */}
        <Callout className="top-[24%] right-[14%]" delay={1.6} label="Variabilità cardiaca" />
        <Callout className="top-[52%] right-[46%]" delay={1.8} label="Carico acuto" side="left" />

        {/* Vertical signal rail */}
        <motion.ul
          aria-hidden
          className="absolute top-1/2 right-5 hidden -translate-y-1/2 flex-col gap-5 font-mono text-[0.58rem] tracking-[0.2em] text-faint lg:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          {["HRV", "FC", "SONNO", "CARICO", "RPE"].map((s) => (
            <li key={s} className="[writing-mode:vertical-rl]">
              {s}
            </li>
          ))}
        </motion.ul>

        <div className="relative mt-auto max-w-2xl lg:my-auto">
          <h1 className="relative isolate font-wide leading-none text-foreground">
            <motion.span
              aria-hidden
              className="absolute top-[-0.6rem] left-[-0.75rem] -z-10 h-[calc(100%+0.2rem)] w-[clamp(2.4rem,4.4vw,4.4rem)] origin-bottom bg-primary shadow-glow"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            />
            <span className="block text-[clamp(0.7rem,1.1vw,0.95rem)] font-normal tracking-[0.08em] uppercase">
              <RiseText text="Ascolta i segnali. Comprendi il tuo" delay={0.35} />
            </span>
            <span className="mt-3 block text-[clamp(2.7rem,7vw,6rem)] font-extralight tracking-[0.02em] uppercase">
              <RiseText text="Recupero" delay={0.55} />
            </span>
          </h1>
          <motion.p
            className="mt-8 max-w-sm border-l border-primary-glow/70 pl-4 text-[0.9rem] leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.9, ease: EASE }}
          >
            Un compagno digitale che rende leggibili i dati di allenamento e recupero. Le decisioni
            restano sempre tue, insieme ai professionisti che ti seguono.
          </motion.p>
        </div>

        <motion.div
          className="relative mt-10 hidden grid-cols-3 gap-px border border-border bg-border sm:grid lg:mt-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1, ease: EASE }}
        >
          {[
            ["Trasparenza", "Ogni indicazione mostra da quali dati nasce."],
            ["Controllo umano", "Le decisioni restano a te e ai professionisti."],
            ["Prototipo etico", "Dati sintetici, non è un dispositivo medico."],
          ].map(([title, text], i) => (
            <div key={title} className="glass border-0 p-4">
              <p className="font-mono text-[0.6rem] tracking-[0.22em] text-foreground uppercase">
                <span className="text-primary-glow">0{i + 1}</span> {title}
              </p>
              <p className="mt-2 text-[0.72rem] leading-relaxed text-faint">{text}</p>
            </div>
          ))}
        </motion.div>
        <p className="relative mt-6 hidden font-mono text-[0.6rem] tracking-[0.12em] text-faint lg:block">
          BIOPULSE-AGENT · PROTOTIPO DIMOSTRATIVO, NON DISPOSITIVO MEDICO
        </p>
      </section>

      {/* Form side */}
      <section
        className="relative z-10 flex items-center justify-center px-5 pb-14 sm:px-10 lg:min-h-screen lg:border-l lg:border-border lg:bg-surface-sunken/60 lg:pt-24 lg:pb-10"
        aria-labelledby="login-title"
      >
        <motion.div
          className="w-full max-w-[26rem]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
        >
          <div className="panel p-6 sm:p-8">
            <p className="eyebrow">Il tuo spazio personale</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={registerMode ? "r" : "l"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <h2
                  id="login-title"
                  className="mt-4 font-wide text-[2rem] text-foreground"
                >
                  {registerMode ? (
                    <>
                      Inizia <span className="font-serif-accent text-primary-glow">da qui.</span>
                    </>
                  ) : (
                    <>
                      Bentornato<span className="text-primary-glow">.</span>
                    </>
                  )}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {registerMode
                    ? "Crea un account atleta per la demo locale."
                    : "Accedi per esplorare il tuo spazio BioPulse."}
                </p>
              </motion.div>
            </AnimatePresence>

            {backendDown && <BackendNotice className="mt-6" />}
            {error && !backendDown && (
              <Notice tone="error" className="mt-6">
                {error}
              </Notice>
            )}

            <form onSubmit={submit} className="mt-6 grid gap-4">
              <AnimatePresence initial={false}>
                {registerMode && (
                  <motion.label
                    className="grid gap-2 text-xs font-medium text-muted-foreground"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    Nome visualizzato
                    <input
                      required
                      maxLength={120}
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Come vuoi essere chiamato?"
                      className="field"
                    />
                  </motion.label>
                )}
              </AnimatePresence>
              <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                Email
                <input
                  required
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@email.it"
                  className="field"
                />
              </label>
              <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                Password
                <span className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    minLength={registerMode ? 12 : 1}
                    autoComplete={registerMode ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={registerMode ? "Almeno 12 caratteri" : "La tua password"}
                    className="field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-12 place-items-center text-faint transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>
              <AnimatePresence initial={false}>
                {registerMode && (
                  <motion.label
                    className="grid gap-2 text-xs font-medium text-muted-foreground"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    Conferma password
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      minLength={12}
                      autoComplete="new-password"
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                      placeholder="Ripeti la password"
                      className="field"
                    />
                  </motion.label>
                )}
              </AnimatePresence>
              <Button
                type="submit"
                size="lg"
                variant="hero"
                className="mt-2 w-full"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" /> Un momento…
                  </>
                ) : (
                  <>
                    {registerMode ? "Crea account atleta" : "Accedi al portale"} <ArrowUpRight />
                  </>
                )}
              </Button>
            </form>

            {registrationEnabled && (
              <button
                className="mt-5 w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary-glow"
                onClick={() => {
                  setRegisterMode(!registerMode);
                  setError("");
                }}
              >
                {registerMode
                  ? "Hai già un account? Accedi"
                  : "Nuovo alla demo? Crea un account atleta"}
              </button>
            )}

            <div className="mt-6 flex gap-3 rounded-md border border-border bg-surface-sunken/60 p-3.5 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-glow" />
              <p>
                I dati biometrici sono facoltativi e il consenso si gestisce separatamente. La demo
                usa dati sintetici e non invia notifiche a professionisti.
              </p>
            </div>
          </div>
          <nav className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-faint md:hidden">
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              Informativa prototipale
            </Link>
            <Link to="/cookies" className="transition-colors hover:text-foreground">
              Cookie tecnici
            </Link>
            <Link to="/ethics" className="transition-colors hover:text-foreground">
              Etica e limiti
            </Link>
          </nav>
        </motion.div>
        <span className="absolute right-6 bottom-6 hidden font-mono text-[0.6rem] tracking-[0.2em] text-faint lg:block">
          BPA / 01 <span className="text-muted-foreground">ACCESSO</span>
        </span>
      </section>
    </main>
  );
}

function Callout({
  label,
  className,
  delay,
  side = "right",
}: {
  label: string;
  className: string;
  delay: number;
  side?: "left" | "right";
}) {
  return (
    <motion.div
      aria-hidden
      className={`absolute hidden items-center gap-2 font-mono text-[0.58rem] tracking-[0.22em] text-muted-foreground uppercase lg:flex ${side === "left" ? "flex-row-reverse" : ""} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.8 }}
    >
      <span className="size-1.5 rounded-full bg-primary-glow shadow-glow" />
      <motion.span
        className={`h-px w-14 bg-border-strong ${side === "left" ? "origin-right" : "origin-left"}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.8, ease: EASE }}
      />
      {label}
    </motion.div>
  );
}
