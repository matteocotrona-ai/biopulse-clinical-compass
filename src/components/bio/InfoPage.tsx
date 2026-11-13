import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, FileWarning } from "lucide-react";
import type { ReactNode } from "react";

import { Ambient } from "./Ambient";
import { Brand } from "./Brand";
import { EASE, RiseText } from "./motion";

const DOCS = [
  { to: "/privacy", label: "Privacy" },
  { to: "/cookies", label: "Cookie" },
  { to: "/ethics", label: "Etica e limiti" },
] as const;

export function InfoPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Ambient />
      <header className="sticky top-0 z-20 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Brand />
          <Link
            to="/onboarding"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />{" "}
            <span className="hidden sm:inline">Torna al portale</span>
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[13rem_1fr] lg:py-20">
        <nav className="hidden lg:block" aria-label="Documenti">
          <div className="sticky top-28 grid gap-1">
            <p className="mb-3 eyebrow text-faint">Documenti</p>
            {DOCS.map((d) => (
              <Link
                key={d.to}
                to={d.to}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-accent text-foreground" }}
              >
                {d.label}
              </Link>
            ))}
          </div>
        </nav>

        <article className="min-w-0">
          <motion.p
            className="flex items-center gap-2 eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="glow-dot" /> {eyebrow}
          </motion.p>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.98] font-light">
            <RiseText text={title} delay={0.1} />
          </h1>
          <motion.p
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
          >
            {lead}
          </motion.p>
          <motion.div
            className="mt-10 flex gap-4 rounded-xl border border-warning/30 bg-warning/[0.05] p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          >
            <FileWarning className="mt-0.5 size-5 shrink-0 text-warning" />
            <div>
              <b className="font-mono text-[0.7rem] tracking-[0.14em] text-warning">
                DOCUMENTO PROTOTIPALE · BOZZA NON APPROVATA
              </b>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Descrive le funzionalità attuali del prototipo. Non costituisce consulenza legale né
                informativa definitiva; prima di un pilota o rilascio deve essere verificato dal
                titolare e da professionisti privacy/legali.
              </p>
            </div>
          </motion.div>
          <div className="prose-info mt-12 grid gap-4">{children}</div>
          <div className="mt-14 flex flex-wrap gap-2 border-t border-border pt-8">
            {DOCS.map((d) => (
              <Link
                key={d.to}
                to={d.to}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {d.label}
              </Link>
            ))}
            <Link
              to="/"
              className="ml-auto flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm text-background transition-colors hover:bg-primary-glow"
            >
              Accedi <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

/** One numbered document section with scroll reveal. */
export function InfoSection({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      className="panel p-6 sm:p-8"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {children}
    </motion.section>
  );
}
