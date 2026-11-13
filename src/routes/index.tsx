import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

import heroAthlete from "@/assets/hero-athlete.jpg";
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
  const reduceMotion = useReducedMotion();
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
    <main className="relative min-h-screen overflow-hidden lg:grid lg:grid-cols-[1.15fr_1fr]">
      <Ambient />

      {/* Cinematic left stage */}
      <section className="relative z-10 flex min-h-[26rem] flex-col overflow-hidden px-6 pt-6 pb-10 sm:px-10 lg:min-h-screen lg:px-14 lg:pt-10 lg:pb-8">
        <motion.img
          src={heroAthlete}
          alt=""
          width={1280}
          height={1600}
          className="absolute inset-0 h-full w-full object-cover object-[62%_40%] opacity-80"
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 2.4, ease: EASE }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

        <div className="relative flex items-center justify-between">
          <Brand />
          <span className="hidden items-center gap-2 eyebrow sm:flex">
            <span className="glow-dot" /> Prototipo · bioERGOtech 2026
          </span>
        </div>

        <div className="relative mt-auto max-w-2xl pt-16 lg:mt-0 lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:pt-0">
          <motion.p
            className="eyebrow flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <span className="glow-dot" /> Scienza del movimento, spiegata
          </motion.p>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,6.2vw,5.6rem)] leading-[0.95] font-light text-foreground">
            <RiseText text="Ascolta i segnali." delay={0.35} />
            <br />
            <span className="font-serif-accent">
              <RiseText text="Comprendi il tuo" delay={0.55} wordClassName="text-gradient-blue pr-[0.06em]" />
            </span>
            <br />
            <RiseText text="recupero." delay={0.75} />
          </h1>
          <motion.p
            className="mt-7 max-w-md text-[0.975rem] leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.9, ease: EASE }}
          >
            Un compagno digitale che rende leggibili i dati di allenamento e recupero. Le decisioni restano sempre
            tue, insieme ai professionisti che ti seguono.
          </motion.p>

          <PulseLine />

          <motion.div
            className="mt-6 hidden grid-cols-3 gap-6 border-t border-border pt-5 sm:grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            {["Dati trasparenti", "Controllo umano", "Prototipo etico"].map((label, i) => (
              <div key={label}>
                <span className="font-mono text-[0.65rem] text-primary-glow">0{i + 1}</span>
                <p className="mt-1.5 text-xs tracking-wide text-muted-foreground">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
        <p className="relative mt-8 hidden font-mono text-[0.65rem] tracking-[0.12em] text-faint lg:block">
          BIOPULSE-AGENT · PROTOTIPO DIMOSTRATIVO, NON DISPOSITIVO MEDICO
        </p>
      </section>

      {/* Form side */}
      <section
        className="relative z-10 flex items-center justify-center px-5 pb-14 sm:px-10 lg:min-h-screen lg:border-l lg:border-border lg:bg-surface-sunken/60 lg:py-10"
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
                <h2 id="login-title" className="mt-4 font-display text-4xl font-light text-foreground">
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
              <Button type="submit" size="lg" variant="hero" className="mt-2 w-full" disabled={busy}>
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
                {registerMode ? "Hai già un account? Accedi" : "Nuovo alla demo? Crea un account atleta"}
              </button>
            )}

            <div className="mt-6 flex gap-3 rounded-xl border border-border bg-surface-sunken/60 p-3.5 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-glow" />
              <p>
                I dati biometrici sono facoltativi e il consenso si gestisce separatamente. La demo usa dati
                sintetici e non invia notifiche a professionisti.
              </p>
            </div>
          </div>
          <nav className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-faint">
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

function PulseLine() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mt-10 h-20 w-full max-w-xl" aria-label="Illustrazione astratta di un segnale biologico" role="img">
      <svg viewBox="0 0 640 130" className="h-full w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pl" x1="0" x2="1">
            <stop offset="0" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset=".45" stopColor="var(--primary-glow)" />
            <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
          <filter id="plg">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {[{ f: "url(#plg)", w: 4, o: 0.7 }, { f: undefined, w: 1.6, o: 1 }].map((s, i) => (
          <motion.path
            key={i}
            d="M0 70h125l24-2 17 2 20-6 15 9 23-19 20 48 27-85 26 72 22-27 21 9 24-1h276"
            fill="none"
            stroke="url(#pl)"
            strokeWidth={s.w}
            opacity={s.o}
            filter={s.f}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, delay: 1, ease: EASE }}
          />
        ))}
      </svg>
      <span className="absolute -bottom-2 left-0 eyebrow text-faint">Segnali</span>
      <span className="absolute right-0 -bottom-2 eyebrow text-faint">Consapevolezza</span>
    </div>
  );
}
