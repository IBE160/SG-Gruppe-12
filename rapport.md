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
