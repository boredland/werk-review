# 📚 werk.review

**werk.review** ist eine moderne, blitzschnelle Datenbank und Review-Plattform für klassische Literatur. Sie bietet einen kuratierten Überblick über die wichtigsten Autoren und Werke der Weltliteratur, ergänzt durch Community-Bewertungen, Volltexte und Hörbuch-Links.

![werk.review Preview](https://werk.review/og-image.png)

## ✨ Features

- **Kuratierte Datenbank**: Umfassende Liste klassischer Autoren und ihrer wichtigsten Werke.
- **Automatisierte Enrichment**: 
  - **Wikipedia-Integration**: Plots und biografische Details werden automatisch bezogen.
  - **KI-Unterstützung**: Fehlende Inhaltsangaben werden via Gemini-Modell generiert.
  - **Volltext-Links**: Automatische Verknüpfung mit Projekt Gutenberg-DE und LibriVox (Hörbücher).
- **Community & User-Features**:
  - **Bewertungen & Reviews**: Werke bewerten und Rezensionen schreiben.
  - **Leseliste & Gelesen**: Persönliche Bibliotheksverwaltung.
  - **D1 Database**: Persistente Nutzerdaten auf Cloudflare D1.
- **Performance**: Läuft als Edge-App auf Cloudflare Workers mit in-memory JSON-Caching für maximale Geschwindigkeit.

## 🛠 Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Datenbank**: [Cloudflare D1](https://developers.cloudflare.com/d1/) mit [Drizzle ORM](https://orm.drizzle.team/)
- **Caching**: [Cloudflare KV](https://developers.cloudflare.com/kv/) & In-Memory Storage
- **Pipeline**: GitHub Actions für Google Sheets Sync & Enrichment

## 🚀 Architektur & Daten-Pipeline

Das Herzstück von werk.review ist die automatisierte Daten-Pipeline:

1. **Source of Truth**: Ein Google Sheet dient als CMS für Autoren und Werke.
2. **Sync**: Ein GitHub Action (`sheets-sync.yml`) zieht alle 6 Stunden die Daten.
3. **Enrichment**:
   - `enrich-links.mjs`: Findet passende Volltexte und Hörbücher.
   - `enrich-wikipedia.mjs`: Lädt Plot-Zusammenfassungen und Wikipedia-Links (parallelisiert).
4. **Static JSON**: Die Ergebnisse werden als statische JSON-Dateien in `data/` committed und zur Edge deployed.

## 💻 Entwicklung

### Voraussetzungen

- Node.js 22+
- Wrangler (für Cloudflare D1/KV Emulation)

### Setup

1. Repository klonen:
   ```bash
   git clone https://github.com/boredland/werk-review.git
   cd werk-review
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. Lokale Datenbank vorbereiten:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. Dev-Server starten:
   ```bash
   npm run dev
   ```

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Die Dateninhalte (Zusammenfassungen etc.) unterliegen den jeweiligen Lizenzen der Quellen (z.B. Creative Commons bei Wikipedia).

---

Erstellt mit ❤️ für die Welt der Literatur.
