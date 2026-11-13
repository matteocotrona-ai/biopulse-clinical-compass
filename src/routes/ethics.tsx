import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, InfoSection } from "@/components/bio/InfoPage";

export const Route = createFileRoute("/ethics")({
  head: () => ({
    meta: [
      { title: "Etica, sicurezza e limiti — BioPulse" },
      {
        name: "description",
        content:
          "Trasparenza, baseline individuale, supervisione umana e bias: le scelte etiche di BioPulse-Agent.",
      },
      { property: "og:title", content: "Etica, sicurezza e limiti — BioPulse" },
      {
        property: "og:description",
        content:
          "Trasparenza, baseline individuale, supervisione umana e bias: le scelte etiche di BioPulse-Agent.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EthicsPage,
});

function EthicsPage() {
  return (
    <InfoPage
      eyebrow="03 / ETICA, SICUREZZA E LIMITI"
      title="La persona viene prima del punteggio."
      lead="Le scelte progettuali seguono il brief bioERGOtech: trasparenza, baseline individuale, supervisione umana e attenzione ai bias. Le salvaguardie sono ancora da validare nel mondo reale."
    >
      <InfoSection>
        <h2>Uso previsto e confini</h2>
        <p>
          BioPulse-Agent è un prototipo didattico per esplorare segnali di allenamento e recupero.
          Non è un dispositivo medico, non fornisce diagnosi e non deve guidare da solo decisioni di
          allenamento o salute. Le soglie e le raccomandazioni non sono state validate da
          specialisti.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>Come l'agente formula una risposta</h2>
        <p>
          Il motore deterministico calcola indicatori e livello di rischio; il modello linguistico
          può spiegarli, ma non dovrebbe sovrascrivere i vincoli. L'interfaccia mostra una traccia
          dei passaggi e distingue calcolo e interpretazione. Se le informazioni sono incomplete,
          l'esito può essere incerto. Le regole e i test sono prototipali e non dimostrano sicurezza
          clinica.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>Supervisione umana non garantita</h2>
        <p>
          I casi ad alto rischio possono essere trattenuti per revisione HITL, ma account
          professionista, assegnazioni di revisori e notifiche al contatto personale non sono
          collegati. Non presumere che un medico o allenatore abbia ricevuto o approvato una
          raccomandazione.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>Bias e inclusione</h2>
        <p>
          Il progetto evita intenzionalmente confronti con medie di popolazione e registra profili
          descrittivi standard/paralimpico/master. Tuttavia, non è stata svolta una validazione
          rappresentativa per età, sesso, disabilità, disciplina, farmaci o condizioni individuali.
          L'assenza di categorie o dati adeguati può produrre errori o disparità. I profili non
          correggono automaticamente tale rischio e non cambiano le formule correnti.
        </p>
      </InfoSection>
      <InfoSection>
        <h2>Rischi e comportamento prudente</h2>
        <ul>
          <li>
            HRV, ACWR, sonno e SpO₂ sono segnali contestuali, non diagnosi né predittori individuali
            garantiti.
          </li>
          <li>Le soglie sono provvisorie e l'ACWR è discusso in letteratura.</li>
          <li>Il testo generato può essere inesatto, incompleto o influenzato da dati e prompt.</li>
          <li>
            Per dolore toracico, svenimento, difficoltà respiratoria o altri sintomi urgenti,
            contatta subito i servizi di emergenza (112 in Italia); non usare la chat per decidere
            se attendere.
          </li>
          <li>
            Il contatto del professionista non riceve comunicazioni e i dati wearable sono simulati.
          </li>
        </ul>
      </InfoSection>
      <InfoSection>
        <h2>Metriche di validazione</h2>
        <p>
          I risultati disponibili provengono da scenari sintetici e test scritti dagli autori. Non
          equivalgono a accuratezza clinica o red-teaming esaustivo. SUS, adesione, usabilità
          inclusiva e sicurezza con specialisti non sono ancora stati misurati. Prima di un pilota
          servono protocollo etico, revisione specialistica, analisi di rischio e valutazione dei
          gruppi potenzialmente svantaggiati.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
