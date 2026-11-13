import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, Check, Loader2, RotateCcw, Watch } from "lucide-react";
import { toast } from "sonner";

import { AthleteRail } from "@/components/bio/AthleteRail";
import { Item, Reveal, Stagger } from "@/components/bio/motion";
import { Notice } from "@/components/bio/Notice";
import { usePortal } from "@/components/bio/PortalProvider";
import { PageContainer, PageHeading } from "@/components/bio/PortalShell";
import { Button } from "@/components/ui/button";
import { updateAthleteProfile } from "@/lib/api";
import { keys } from "@/lib/onboarding";

export const Route = createFileRoute("/_portal/profile")({
  head: () => ({
    meta: [
      { title: "Il mio profilo — BioPulse" },
      {
        name: "description",
        content:
          "Gestisci profilo, consensi biometrici, dati demo e preferenze locali di BioPulse.",
      },
      { property: "og:title", content: "Il mio profilo — BioPulse" },
      {
        property: "og:description",
        content: "Impostazioni, consensi reversibili e controllo dei dati demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function Setting({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-6 sm:p-8">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl font-light sm:text-3xl">{title}</h2>
      {lead && (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{lead}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const { session, athleteId, data, setData } = usePortal();
  const isAthlete = session.user.role === "athlete";
  const [contact, setContact] = useState("");
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [profile, setProfile] = useState("standard");
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setContact(localStorage.getItem(keys.contact(session.user.id)) ?? "");
  }, [session.user.id]);
  useEffect(() => {
    if (!data) return;
    setDisplayName(data.athlete.name);
    setProfile(data.athlete.profile);
  }, [data]);

  function saveContact() {
    localStorage.setItem(keys.contact(session.user.id), contact.trim());
    setSaved(true);
    toast.success("Salvato su questo dispositivo");
    window.setTimeout(() => setSaved(false), 2500);
  }
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    setProfileBusy(true);
    setProfileError("");
    setProfileSaved(false);
    try {
      const updated = await updateAthleteProfile(athleteId, { name: displayName, profile });
      setData({
        ...data,
        athlete: { ...data.athlete, name: updated.name, profile: updated.profile },
      });
      setProfileSaved(true);
      toast.success("Profilo aggiornato.");
    } catch (reason) {
      setProfileError((reason as Error).message);
    } finally {
      setProfileBusy(false);
    }
  }

  const name = data?.athlete.name ?? session.athletes[0]?.name ?? "Atleta";

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Impostazioni e controllo"
        title={isAthlete ? "Il mio" : "Profilo"}
        accent={isAthlete ? "profilo." : "atleta."}
        lead={
          isAthlete
            ? "Gestisci le preferenze e controlla i dati demo associati all'account."
            : "Consulta il profilo atleta e lo stato dei dati demo assegnati."
        }
      />

      <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Stagger className="grid gap-6" gap={0.08}>
          <Item>
            <div className="panel relative flex flex-col items-start gap-5 overflow-hidden p-6 sm:flex-row sm:items-center sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-spot" />
              <div className="relative grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-primary font-display text-4xl font-light text-primary-foreground shadow-glow">
                {(data?.athlete.name ?? session.user.email).slice(0, 1).toUpperCase()}
              </div>
              <div className="relative min-w-0 flex-1">
                <p className="eyebrow">Account atleta</p>
                <h2 className="mt-2 truncate font-display text-3xl font-light">{name}</h2>
                <p className="mt-1 truncate text-sm text-muted-foreground">{session.user.email}</p>
              </div>
              <span className="relative rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs tracking-[0.1em] text-primary-glow uppercase">
                {data?.athlete.profile ?? "standard"}
              </span>
            </div>
          </Item>

          {isAthlete && (
            <Item>
              <Setting
                eyebrow="Personalizzazione"
                title="Come vuoi apparire?"
                lead="La categoria è descrittiva e non modifica i calcoli o le raccomandazioni."
              >
                <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
                  <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                    Nome visualizzato
                    <input
                      required
                      minLength={1}
                      maxLength={120}
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        setProfileSaved(false);
                      }}
                      className="field"
                    />
                  </label>
                  <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                    Profilo descrittivo
                    <select
                      value={profile}
                      onChange={(e) => {
                        setProfile(e.target.value);
                        setProfileSaved(false);
                      }}
                      className="field appearance-none"
                    >
                      <option value="standard">Standard</option>
                      <option value="paralympic">Paralimpico</option>
                      <option value="master">Master</option>
                    </select>
                  </label>
                  {profileError && (
                    <Notice tone="error" className="sm:col-span-2">
                      {profileError}
                    </Notice>
                  )}
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Button type="submit" disabled={profileBusy || !data}>
                      {profileBusy ? <Loader2 className="animate-spin" /> : null}
                      {profileBusy ? "Salvo…" : "Salva profilo"}
                    </Button>
                    {profileSaved && (
                      <span
                        role="status"
                        className="flex items-center gap-1.5 text-sm text-level-green"
                      >
                        <Check className="size-4" /> Profilo aggiornato.
                      </span>
                    )}
                  </div>
                </form>
              </Setting>
            </Item>
          )}

          {isAthlete && (
            <Item>
              <Setting
                eyebrow="Connessioni"
                title="Il tuo team"
                lead="Questo contatto è un promemoria conservato in questo browser. Non viene inviato né usato per notifiche."
              >
                <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                  Contatto allenatore o professionista
                  <input
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      setSaved(false);
                    }}
                    maxLength={160}
                    placeholder="Facoltativo · non collegato"
                    className="field"
                  />
                </label>
                <div className="mt-4 flex items-center gap-3">
                  <Button variant="outline" onClick={saveContact}>
                    Salva nel browser
                  </Button>
                  {saved && (
                    <span
                      role="status"
                      className="flex items-center gap-1.5 text-sm text-level-green"
                    >
                      <Check className="size-4" /> Salvato su questo dispositivo
                    </span>
                  )}
                </div>
                <div className="mt-6 flex items-start gap-4 rounded-xl border border-border bg-surface-sunken/60 p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary-glow">
                    <Watch className="size-4" />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-medium">Wearable</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Provider reale non configurato. La sincronizzazione resta sintetica e serve
                      solo a provare la demo.
                    </p>
                  </div>
                  <span className="rounded-full border border-primary/30 px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.12em] text-primary-glow">
                    SIMULATO
                  </span>
                </div>
              </Setting>
            </Item>
          )}

          <Item>
            <Setting
              eyebrow="Dati e consensi"
              title="Scelte reversibili"
              lead="Il consenso biometrico è separato dall'accesso. Puoi revocarlo quando vuoi o eliminare i dati demo."
            >
              {data ? (
                <AthleteRail
                  data={data}
                  athleteId={athleteId}
                  canManage={isAthlete}
                  demoMode={session.demo_mode}
                  onChange={setData}
                  onReset={() => navigate({ to: "/", replace: true })}
                />
              ) : (
                <div className="grid gap-3">
                  <div className="skeleton-block h-14" />
                  <div className="skeleton-block h-14" />
                </div>
              )}
            </Setting>
          </Item>

          <Item>
            <Setting eyebrow="Informazioni" title="Testi e limiti del prototipo">
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["/privacy", "Privacy e dati"],
                    ["/cookies", "Cookie e memoria locale"],
                    ["/ethics", "Etica, bias e validazione"],
                  ] as const
                ).map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex items-center justify-between rounded-xl border border-border bg-surface-sunken/60 px-4 py-3.5 text-sm transition-colors hover:border-primary/40"
                  >
                    {label}
                    <ArrowUpRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-glow" />
                  </Link>
                ))}
              </div>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => {
                  localStorage.removeItem(keys.onboarding(session.user.id));
                  localStorage.removeItem(keys.step(session.user.id));
                  localStorage.removeItem(keys.privacy(session.user.id));
                  navigate({ to: "/onboarding", replace: true });
                }}
              >
                <RotateCcw /> Rivedi l'orientamento iniziale
              </Button>
            </Setting>
          </Item>
        </Stagger>

        <Reveal delay={0.3}>
          <aside className="panel sticky top-28 overflow-hidden p-6">
            <div className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-primary/20 blur-3xl" />
            <span className="relative grid size-9 place-items-center rounded-full border border-warning/40 font-semibold text-warning">
              !
            </span>
            <p className="relative mt-5 eyebrow">Stato del prototipo</p>
            <h2 className="relative mt-3 font-display text-2xl font-light">
              Trasparenza{" "}
              <span className="font-serif-accent text-primary-glow">prima di tutto.</span>
            </h2>
            <ul className="relative mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border text-sm">
              {[
                ["Wearable", "simulato"],
                ["Coach", "non collegato"],
                ["Profili adattivi", "descrittivi"],
                ["Metriche", "non validate clinicamente"],
                ["Analytics", "non presenti"],
              ].map(([k, v]) => (
                <li
                  key={k}
                  className="flex items-center justify-between gap-3 bg-surface px-4 py-3"
                >
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-right font-mono text-[0.7rem] text-foreground/80">{v}</span>
                </li>
              ))}
            </ul>
          </aside>
        </Reveal>
      </div>
    </PageContainer>
  );
}
