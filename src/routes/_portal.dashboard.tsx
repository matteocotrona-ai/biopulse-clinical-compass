import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Asterisk } from "lucide-react";

import pulseWave from "@/assets/pulse-wave.jpg";
import { LoadChart } from "@/components/bio/LoadChart";
import { MetricCard } from "@/components/bio/MetricCard";
import { Item, Reveal, Stagger } from "@/components/bio/motion";
import { Notice } from "@/components/bio/Notice";
import { usePortal } from "@/components/bio/PortalProvider";
import { PageContainer, PageHeading, SectionLabel } from "@/components/bio/PortalShell";
import { ReadinessRing } from "@/components/bio/ReadinessRing";
import { TrendChart } from "@/components/bio/TrendChart";
import { Button } from "@/components/ui/button";
import { LEVEL } from "@/lib/level";

export const Route = createFileRoute("/_portal/dashboard")({
  head: () => ({
    meta: [
      { title: "Panoramica — BioPulse" },
      {
        name: "description",
        content: "Il tuo quadro di oggi: prontezza, HRV, carico e recupero in un'unica vista.",
      },
      { property: "og:title", content: "Panoramica — BioPulse" },
      {
        property: "og:description",
        content: "Prontezza indicativa, segnali e trend di carico e recupero.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { session, data, error, loading } = usePortal();
  const report = data?.report;
  const series = data?.series ?? [];
  const isAthlete = session.user.role === "athlete";
  const values = <K extends keyof (typeof series)[number]>(key: K) =>
    series.map((point) => point[key] as number | null);
  const name = data?.athlete.name ?? session.athletes[0]?.name ?? "atleta";

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Il tuo quadro di oggi"
        title={<>Ciao, {name}</>}
        accent="."
        lead="Un punto di partenza per osservare il recupero, non un verdetto sul tuo stato di salute."
        action={
          <Button asChild size="lg" variant="hero" className="self-start md:self-auto">
            <Link to="/assistant">
              {isAthlete ? "Parla con BioPulse" : "Apri l'area clinica"} <ArrowUpRight />
            </Link>
          </Button>
        }
      />

      <Reveal delay={0.15} className="mt-8">
        <Notice
          title="Ambiente dimostrativo."
          action={
            <Link
              to="/ethics"
              className="text-xs whitespace-nowrap text-primary-glow hover:underline"
            >
              Scopri i limiti ↗
            </Link>
          }
        >
          Dati e wearable sono simulati; indicatori e soglie non sono validati clinicamente.
        </Notice>
      </Reveal>

      {error && (
        <Notice tone="error" className="mt-4">
          {error}
        </Notice>
      )}

      {loading || (!data && !error) ? <DashboardSkeleton /> : null}

      {data && report && (
        <>
          {/* status strip */}
          <Stagger
            className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4"
            gap={0.05}
          >
            {[
              ["Stato", LEVEL[report.level].label, LEVEL[report.level].color],
              [
                "Confidenza",
                report.confidence === "full"
                  ? "Completa"
                  : report.confidence === "partial"
                    ? "Parziale"
                    : "Insufficiente",
              ],
              ["Giorni con dati", `${report.data_days} / 28`],
              ["Ultimo dato", report.as_of ?? "–"],
            ].map(([k, v, c]) => (
              <Item key={k} className="bg-surface/90 px-5 py-4">
                <p className="eyebrow text-faint">{k}</p>
                <p className="tnum mt-2 flex items-center gap-2 font-display text-lg">
                  {c && (
                    <span
                      className="size-2 rounded-full"
                      style={{ background: c, boxShadow: `0 0 10px ${c}` }}
                    />
                  )}
                  {v}
                </p>
              </Item>
            ))}
          </Stagger>

          <section className="mt-6 grid gap-6 xl:grid-cols-12" aria-label="Riepilogo biometrico">
            <Reveal className="xl:col-span-5">
              <div className="panel relative h-full overflow-hidden p-6 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-spot" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-primary/10 to-transparent animate-scan" />
                <div className="relative">
                  <SectionLabel index="01">Prontezza indicativa</SectionLabel>
                  <div className="mt-8">
                    <ReadinessRing report={report} />
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="xl:col-span-7">
              <Reveal>
                <SectionLabel index="02" note="Dati sintetici">
                  Segnali e trend
                </SectionLabel>
              </Reveal>
              <Stagger className="mt-5 grid gap-4 sm:grid-cols-2" delay={0.1}>
                <Item>
                  <MetricCard
                    label="HRV · RMSSD"
                    value={report.rmssd_ms?.toFixed(0) ?? "–"}
                    unit="ms"
                    values={values("rmssd_ms")}
                    hint={
                      report.hrv_z !== null
                        ? `Z-score ${report.hrv_z > 0 ? "+" : ""}${report.hrv_z}`
                        : "baseline in costruzione"
                    }
                    tone={
                      report.hrv_z !== null && report.hrv_z < -1.5
                        ? "var(--level-red)"
                        : "var(--primary-glow)"
                    }
                    alert={report.hrv_z !== null && report.hrv_z < -1.5}
                  />
                </Item>
                <Item>
                  <MetricCard
                    label="ACWR"
                    value={report.acwr?.toFixed(2) ?? "–"}
                    values={series.map((point) => point.load)}
                    hint={
                      report.acwr !== null ? "soglie demo, non validate" : "dato non disponibile"
                    }
                    tone={
                      report.acwr !== null && report.acwr > 1.5
                        ? "var(--level-red)"
                        : "var(--primary-glow)"
                    }
                    alert={report.acwr !== null && report.acwr > 1.5}
                  />
                </Item>
                <Item>
                  <MetricCard
                    label="Efficienza del sonno"
                    value={report.sleep_efficiency?.toFixed(0) ?? "–"}
                    unit="%"
                    values={values("sleep_efficiency")}
                    hint={`${series.at(-1)?.sleep_hours ?? "–"} h · ultima notte`}
                    tone="var(--chart-3)"
                  />
                </Item>
                <Item>
                  <MetricCard
                    label="Temperatura cutanea"
                    value={series.at(-1)?.skin_temp_c?.toFixed(1) ?? "–"}
                    unit="°C"
                    values={values("skin_temp_c")}
                    hint={`FC a riposo ${report.resting_hr?.toFixed(0) ?? "–"} bpm`}
                    tone="var(--level-yellow)"
                  />
                </Item>
              </Stagger>
            </div>
          </section>

          <section className="mt-12">
            <Reveal>
              <SectionLabel index="03" note="Storico simulato">
                Carico e recupero
              </SectionLabel>
            </Reveal>
            <div className="mt-5 grid gap-6">
              <Reveal>
                <LoadChart series={series} report={report} />
              </Reveal>
              <Reveal>
                <TrendChart series={series} />
              </Reveal>
            </div>
          </section>

          <Reveal className="mt-12">
            <section className="panel group relative overflow-hidden">
              <img
                src={pulseWave}
                alt=""
                loading="lazy"
                width={1600}
                height={912}
                className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-[2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
              <div className="relative flex flex-col gap-6 p-7 sm:p-10 md:flex-row md:items-end md:justify-between">
                <div className="max-w-lg">
                  <span className="grid size-10 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary-glow">
                    <Asterisk className="size-5" />
                  </span>
                  <p className="mt-6 eyebrow">
                    {isAthlete ? "Esplora contesto e incertezza" : "Revisione professionale"}
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-light sm:text-4xl">
                    {isAthlete ? (
                      <>
                        Un numero da solo{" "}
                        <span className="font-serif-accent text-primary-glow">non basta.</span>
                      </>
                    ) : (
                      <>
                        Contesto{" "}
                        <span className="font-serif-accent text-primary-glow">
                          prima della revisione.
                        </span>
                      </>
                    )}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {isAthlete
                      ? "Chiedi all'agente di spiegare i segnali e le informazioni che mancano. Non sostituisce un parere medico."
                      : "Apri l'area clinica per esaminare i casi disponibili."}
                  </p>
                </div>
                <Button asChild variant="glass" size="lg">
                  <Link to="/assistant">
                    {isAthlete ? "Apri la chat" : "Apri revisione"} <ArrowRight />
                  </Link>
                </Button>
              </div>
            </section>
          </Reveal>
        </>
      )}
    </PageContainer>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="mt-8 grid gap-6 xl:grid-cols-12"
      aria-label="Caricamento dei dati dimostrativi…"
      role="status"
    >
      <div className="skeleton-block h-[26rem] xl:col-span-5" />
      <div className="grid gap-4 sm:grid-cols-2 xl:col-span-7">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton-block h-48" style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <p className="eyebrow xl:col-span-12">Caricamento dei dati dimostrativi…</p>
    </div>
  );
}
