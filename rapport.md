# Rapport – SG-Gruppe-12

Dette dokumentet beskriver arbeidet i prosjektet **"CV Application App"** i faget *IBE160 Programmering med KI*.  
Prosjektet er delt inn i flere deler, og hvert gruppemedlem har hatt ansvar for en spesifikk del av fase 1.

---

## Fase 1 – Workflow status *(Martin Reppen)*

### Mål
Målet mitt var å sette opp et GitHub Actions-oppsett (en workflow) som automatisk kjører hver gang noen oppdaterer koden.  
Dette gjør at gruppen enkelt kan se om prosjektet bygger riktig, ved hjelp av en “status-badge” i README-filen.

### Hva jeg gjorde
- Lagde en ny mappe i prosjektet: `.github/workflows/`
- Opprettet en fil kalt `ci.yml`
- La inn en enkel GitHub Actions workflow som sjekker at alt fungerer
- Satte opp workflowen til å kjøre automatisk ved **push** og **pull request** til `main`
- La til en badge øverst i `README.md` som viser grønn (passing) eller rød (failing) status

### Koden jeg brukte (workflow-filen)
```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "CI is working ✅"
Resultat

Når workflowen kjører uten feil, vises “CI passing” i README.
Hvis noe går galt i koden, blir den rød og viser “CI failing”.
Dette fungerer som en enkel form for Continuous Integration (CI), som hjelper oss å oppdage feil tidlig.

Kort oppsummering

Jeg har satt opp en automatisk workflow som fungerer som en test av koden vår.
Badgen i README viser om alt fungerer, og gir gruppen en rask statusoversikt.
---

## Fase 1 – Brainstorming & Idédugnad *(Kaylee Floden)*

### Mål
Målet med brainstorming-sesjonene var å dypt forstå problemene jobbsøkere står overfor, og å forme en konkret løsning for "AI CV and Application" prosjektet. Vi ønsket å identifisere de største frustrasjonene og definere kjernefunksjonaliteten for en MVP.

### Hva jeg gjorde
- **Identifiserte Brukerproblemer:** Analyserte og definerte de sentrale utfordringene for jobbsøkere, inkludert vage stillingsannonser, mangel på standardisering av ferdigheter, og den raske teknologiske utviklingen.
- **Formet Løsningskonseptet:** Utviklet ideer for kjernefunksjonalitet, som ble delt inn i to hovedgrener:
    1.  **CV-oppretting og -håndtering:** Et smart system for å hente inn brukerens data og automatisk organisere og generere CV-er.
    2.  **Jobbsøknad og -tilpasning:** Et system for å analysere stillingsannonser, sammenligne med brukerens profil, og generere skreddersydde søknader og følgebrev.
- **Prioriterte Funksjoner for MVP:** Definerte de tre viktigste funksjonene for en første versjon av produktet:
    1.  Et intelligent system for datainntak (Smart Intake System).
    2.  En generator for CV og søknad.
    3.  Et system for matching og skreddersøm av søknader.
- **Skisserte Teknisk Arkitektur:** Bidro til å skissere en overordnet teknisk arkitektur, inkludert en Node.js/Express backend, en React frontend, og en PostgreSQL database.

### Resultat
Resultatet av disse sesjonene var en klar og prioritert liste over funksjonalitet for MVP-en, en felles forståelse av brukerens smertepunkter, og et teknisk fundament for videre utvikling. Disse innsiktene ble direkte brukt i utformingen av Product Brief-dokumentet.

### Kort oppsummering
Gjennom brainstorming har jeg bidratt til å forme kjernen av produktet, fra problemforståelse til en konkret, prioritert plan for funksjonalitet og teknisk arkitektur.
---

## Fase 1 – Product Brief *(Kaylee Floden)*

### Mål
Målet mitt var å definere og dokumentere produktvisjonen for "AI CV and Application" prosjektet, og å skape et solid grunnlag for videre utvikling. Dette inkluderte å klargjøre hva vi bygger, for hvem, hvorfor det er viktig, og hvordan vi måler suksess.

### Hva jeg gjorde
- **Definerte Produktvisjonen:** Samarbeidet for å etablere en klar visjon for "AI CV and Application" som en global plattform.
- **Klarla Problemet og Løsningen:** Artikulert det største frustrasjonspunktet for jobbsøkere (gjetting og tidssløsing med tilpasning av søknader) og hvordan vår AI-drevne løsning adresserer dette.
- **Identifiserte Målbrukere:** Beskrev den ideelle primærbrukeren ("Den Utmattede Jobbsøkeren") og deres reise fra frustrasjon til effektivitet.
- **Satte Suksesskriterier:** Etablerte målbare suksessmetrikker, forretningsmål og KPIer for de første 6-12 månedene, med fokus på brukerengasjement og reell effekt.
- **Definerte MVP-omfang:** Klargjorde Minimum Viable Product (MVP) med kjernefunksjoner (autentisering, CV-inntak, AI-jobbanalyse, generering av skreddersydd CV/søknad) og hva som er utenfor omfanget.
- **Bidro til Strategiske Dimensjoner:** Ga innspill til finansielle betraktninger (monetiseringsstrategi), og gjennomgikk markedsanalyse, tekniske preferanser og tidslinjebegrensninger.
- **Sikret Globalt Fokus:** Justerte dokumentet for å reflektere en global ambisjon, med regional fokus som et strategisk startpunkt.
- **Versjonskontroll:** Fullførte Product Brief-dokumentet, committet det til `main`-branchen, og omdøpte den tilhørende feature-branchen fra `project-brief` til `product-brief`.

### Resultat
Et omfattende Product Brief-dokument (`docs/product-brief-ibe160-2025-11-18.md`) som gir en klar og detaljert oversikt over prosjektet. Dette dokumentet fungerer som et veikart for videre utvikling og sikrer at alle teammedlemmer har en felles forståelse av produktets mål og retning.

### Kort oppsummering
Jeg har ledet arbeidet med å definere produktets kjerne, fra visjon til MVP, og sikret at vi har et solid fundament for å bygge "AI CV and Application" prosjektet.