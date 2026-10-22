# Apex Bot

Apex ist ein Discord-Bot mit einer Weboberfläche zur Serververwaltung.

## Schnellstart

### Web-Dashboard (Node.js 24)

1. Node.js 24 installieren.
2. Abhängigkeiten installieren: `npm install`
3. Die nötigen Umgebungsvariablen in `.env` eintragen.
4. Entwicklungsserver starten: `npm run dev`

Für einen normalen Start: `npm start`.

### Discord-Bot (Python)

1. Python und eine virtuelle Umgebung installieren.
2. Abhängigkeiten installieren: `python -m pip install -r requirements.txt`
3. Die benötigten Variablen in `.env` setzen.
4. Den Bot mit `python main.py` starten.

**Sicherheit:** Tokens, Datenbank-URLs und Sitzungsschlüssel gehören ausschließlich in `.env` oder die Umgebungsvariablen des Hosters. Niemals Geheimnisse committen.

## Dateiübersicht

| Datei | Aufgabe |
| --- | --- |
| `main.py` | Discord-Bot: Ereignisse, Befehle, Interaktionen und Hintergrundaufgaben |
| `server-secure.js` | Sicherer Einstiegspunkt für den Webserver |
| `server.js` | Express-Server, Anmeldung, API und Datenbankzugriff |
| `security-middleware.js` | Sicherheitsprüfungen für Dashboard-API-Aufrufe |
| `dashboard.html` | HTML-Grundgerüst des Dashboards |
| `dashboard.css` | Styles des Dashboards |
| `dashboard-inline.js` | Sternenhintergrund und Fallback-Funktionen des Dashboards |
| `dashboard.js` | Dashboard-Logik und API-Kommunikation |
| `index.html` | Öffentliche Startseite |
| `startseite.css` | Styles der Startseite |
| `startseite.js` | Jahreszahl und Sternenhintergrund der Startseite |
| `style.css` | Bereits vorhandene weitere Styles |
| `requirements.txt` | Python-Abhängigkeiten |
| `package.json` | Node.js-Abhängigkeiten und Startbefehle |
| `vercel.json` | Vercel-Builds und Weiterleitungen |

## Wartung

- Änderungen zuerst auf einem separaten Branch testen, nicht direkt auf `main`.
- Nach Änderungen an Login, Berechtigungen oder Datenbankzugriff auch die Sicherheitsprüfungen kontrollieren.
- Nach Änderungen am Dashboard Anmeldung, Serverauswahl, Speichern der Module und Fehlerzustände manuell testen.
- Die Python-Botdatei ist noch groß. Die Aufteilung in echte Discord-Cogs sollte schrittweise erfolgen, damit Datenbankzugriffe, Interaktionen und Hintergrundaufgaben zuverlässig bleiben.
