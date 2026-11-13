import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { ShieldAlert } from "lucide-react";

import { ChatPanel } from "@/components/bio/ChatPanel";
import { HitlPanel } from "@/components/bio/HitlPanel";
import { Reveal } from "@/components/bio/motion";
import { Notice } from "@/components/bio/Notice";
import { usePortal } from "@/components/bio/PortalProvider";
import { PageContainer, PageHeading } from "@/components/bio/PortalShell";

export const Route = createFileRoute("/_portal/assistant")({
  head: () => ({
    meta: [
      { title: "BioPulse AI — Conversazione esplicabile" },
      {
        name: "description",
        content:
          "Parla di allenamento e recupero con un agente che mostra ogni passaggio del suo ragionamento.",
      },
      { property: "og:title", content: "BioPulse AI — Conversazione esplicabile" },
      {
        property: "og:description",
        content: "Chat esplicabile con traccia del ragionamento e controlli di sicurezza.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const { session, athleteId, data, refresh } = usePortal();
  const afterChat = useCallback(() => {
    void refresh();
  }, [refresh]);
  const isAthlete = session.user.role === "athlete";
  return (
    <PageContainer>
      <PageHeading
        eyebrow={isAthlete ? "Conversazione esplicabile" : "Revisione professionale"}
        title={isAthlete ? "BioPulse" : "Area clinica"}
        accent={isAthlete ? "AI." : "."}
        lead={
          isAthlete
            ? "Parla di allenamento e recupero; chiedi spiegazioni e considera l'incertezza."
            : "Esamina i casi assegnati e registra una decisione professionale."
        }
        action={
          <span className="flex items-center gap-2 self-start rounded-full border border-border bg-surface/70 px-4 py-2 font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground md:self-auto">
            <span className="glow-dot" />{" "}
            {isAthlete ? "SUPPORTO, NON DIAGNOSI" : "REVISIONE CON SUPERVISIONE UMANA"}
          </span>
        }
      />
      {isAthlete && (
        <Reveal delay={0.1} className="mt-8">
          <Notice tone="warn" title="Prima di iniziare">
            L'agente può sbagliare e non è un professionista sanitario. In caso di sintomi urgenti,
            rivolgiti ai servizi di emergenza; non attendere una risposta dalla chat.
          </Notice>
        </Reveal>
      )}
      <Reveal delay={0.2} className="mt-6">
        {isAthlete ? (
          <ChatPanel
            athleteId={athleteId}
            disabled={!data || !data.athlete.consent_data}
            consentRequired={!!data && !data.athlete.consent_data}
            onInteraction={afterChat}
            level={data?.report.level ?? null}
          />
        ) : (
          <section className="panel p-5 sm:p-8">
            <p className="flex items-center gap-2 eyebrow">
              <ShieldAlert className="size-3.5 text-primary-glow" /> Supervisione professionale
            </p>
            <h2 className="mt-4 font-display text-3xl font-light">Revisione HITL</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Le proposte in attesa di revisione sono consultabili qui; la demo non garantisce una
              notifica al professionista.
            </p>
            <div className="mt-8">
              <HitlPanel refreshKey={0} />
            </div>
          </section>
        )}
      </Reveal>
    </PageContainer>
  );
}
