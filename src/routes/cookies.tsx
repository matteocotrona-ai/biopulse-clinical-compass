import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InfoPage, InfoSection } from "@/components/bio/InfoPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie e archiviazione locale — BioPulse" },
      {
        name: "description",
        content:
          "Cookie tecnici di autenticazione e preferenze salvate nel browser dal prototipo BioPulse.",
      },
      { property: "og:title", content: "Cookie e archiviazione locale — BioPulse" },
      {
        property: "og:description",
        content:
          "Cookie tecnici di autenticazione e preferenze salvate nel browser dal prototipo BioPulse.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  const [message, setMessage] = useState("");
  function resetChoice() {
    localStorage.setItem("biopulse-cookie-choice", "necessary-only");
    setMessage("Preferenza aggiornata: solo strumenti necessari.");
  }
  return (
    <InfoPage
      eyebrow="02 / COOKIE E ARCHIVIAZIONE LOCALE"
      title="Solo ciò che serve."
      lead="Il prototipo non dichiara strumenti pubblicitari o analytics. Le preferenze di accesso e alcuni dati di configurazione possono essere conservati nel browser."
    >
      <InfoSection>
        <h2>Cookie tecnici di autenticazione</h2>
        <p>
          Il backend usa cookie di sessione HttpOnly e un cookie CSRF per proteggere le richieste.
          Sono necessari all'accesso e alle funzioni autenticate; non sono usati per pubblicità o
          profilazione. Durata sessione configurata: 8 ore, salvo modifiche di ambiente. Il cookie
          non è leggibile da JavaScript.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>Memoria locale del browser</h2>
        <p>
          Il prototipo può salvare localmente lo stato di completamento dell'orientamento iniziale,
          la scelta “solo strumenti necessari” e il contatto facoltativo del professionista.
          Quest'ultimo non viene inviato al server e non abilita notifiche. Cancellando i dati del
          sito potresti dover ripetere l'orientamento e perdere il promemoria.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>Cookie non necessari</h2>
        <p>
          Non risultano cookie di analytics, pubblicità o tracciamento di terze parti distribuiti
          dall'interfaccia. Per questo non mostriamo un pulsante “accetta tutti”. La configurazione
          del deployment e dei servizi esterni deve comunque essere controllata prima di una
          pubblicazione.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>Gestisci la preferenza</h2>
        <p>
          La scelta attuale è limitata agli strumenti tecnici necessari. Non è un consenso al
          trattamento di dati biometrici: quel controllo è separato nel profilo.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={resetChoice}>
            Conferma solo strumenti necessari
          </Button>
          {message && (
            <p role="status" className="text-sm text-level-green">
              {message}
            </p>
          )}
        </div>
      </InfoSection>
    </InfoPage>
  );
}
