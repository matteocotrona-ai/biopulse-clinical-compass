import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, InfoSection } from "@/components/bio/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy e dati — BioPulse" },
      {
        name: "description",
        content:
          "Cosa tratta oggi il prototipo BioPulse-Agent: dati, finalità, conservazione, cancellazione e limiti.",
      },
      { property: "og:title", content: "Privacy e dati — BioPulse" },
      {
        property: "og:description",
        content:
          "Cosa tratta oggi il prototipo BioPulse-Agent: dati, finalità, conservazione, cancellazione e limiti.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="01 / PRIVACY E DATI"
      title="I dati, con chiarezza."
      lead="Una descrizione leggibile di ciò che il prototipo BioPulse-Agent tratta oggi e di ciò che resta da decidere prima di un uso reale."
    >
      <InfoSection>
        <h2>1. Chi gestisce il prototipo</h2>
        <p>
          BioPulse-Agent è un progetto dimostrativo. L'identità del titolare del trattamento, i
          recapiti per le richieste e il processo per esercitare i diritti devono essere completati
          prima di qualunque pilota con persone. Non inserire dati reali o informazioni sanitarie
          identificabili in una demo non autorizzata.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>2. Quali dati possono comparire</h2>
        <ul>
          <li>Dati account: email, identificativo utente, ruolo e sessione di accesso.</li>
          <li>
            Profilo atleta: nome visualizzato e categoria descrittiva (standard, paralimpico o
            master); la categoria non modifica le formule del prototipo.
          </li>
          <li>
            Dati biometrici e di allenamento: nel flusso demo sono sintetici; il modello dati
            comprende HRV/RMSSD, frequenza cardiaca a riposo, sonno, SpO₂, temperatura, carico, RPE
            e note testuali.
          </li>
          <li>
            Consensi e attività: stato/versione dei consensi, conversazioni, memoria dell'agente,
            avvisi e casi di revisione possono essere registrati dai servizi.
          </li>
          <li>
            Preferenze browser: eventuale contatto del professionista e stato di orientamento
            restano nel local storage del browser, non sul server.
          </li>
        </ul>
      </InfoSection>
      <InfoSection>
        <h2>3. Finalità e funzionamento</h2>
        <p>
          Le informazioni demo servono a mostrare dashboard, calcoli White-Box, conversazione
          esplicabile e controlli di sicurezza. L'LLM è facoltativo: se configurato, il testo
          necessario alla risposta può essere trasmesso al provider del modello secondo la
          configurazione del backend. Il provider, i trasferimenti, le condizioni di conservazione e
          le garanzie devono essere verificati prima di usare dati personali reali.
        </p>
        <p>
          I dati biometrici non sono necessari per creare un account demo. Il consenso biometrico è
          separato e, per i nuovi account, disattivato inizialmente; senza tale consenso le funzioni
          che lo richiedono restano disabilitate.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>4. Conservazione e cancellazione</h2>
        <p>
          I valori tecnici attuali sono configurati a 365 giorni per metriche e memoria e 730 giorni
          per casi clinici chiusi, avvisi e storico consensi; i casi HITL aperti non scadono
          automaticamente. Sono parametri tecnici, non una policy approvata. Backup, log, copie del
          provider LLM e tempi effettivi di cancellazione richiedono una verifica separata.
        </p>
        <p>
          Nel profilo demo sono disponibili cancellazione della memoria e cancellazione del
          profilo/dati associati. L'eliminazione dal browser del contatto del professionista si
          effettua cancellandolo dalla sezione Profilo o rimuovendo i dati locali del sito. La
          cancellazione non è una procedura legale validata e va verificata in ogni archivio e
          backup prima di un pilota.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>5. Sicurezza e condivisione</h2>
        <p>
          L'accesso usa sessioni server-side con cookie HttpOnly e protezione CSRF; i ruoli limitano
          l'accesso ai profili assegnati. Non è attivo un account professionista per questo utente
          né un invio di messaggi/notifiche al contatto inserito. La registrazione è prevista per
          demo locale/sviluppo, non deve essere esposta in produzione.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>6. Diritti e basi giuridiche</h2>
        <p>
          Il prototipo non ha ancora un titolare e un canale di contatto definiti in questa pagina;
          pertanto non può descrivere in modo completo basi giuridiche, destinatari, trasferimenti o
          procedure per accesso, rettifica, opposizione e reclamo. Questi elementi, la valutazione
          d'impatto e l'eventuale disciplina dei dati particolari devono essere definiti con
          consulenti competenti prima del trattamento reale.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>7. Non è un servizio medico</h2>
        <p>
          Il sistema non è validato clinicamente e non è un dispositivo medico. Gli output non
          diagnosticano e non sostituiscono valutazioni sanitarie. In caso di sintomi urgenti,
          contatta i servizi di emergenza e non attendere l'agente.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
