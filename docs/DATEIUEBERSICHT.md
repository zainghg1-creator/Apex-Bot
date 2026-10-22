# Dateiübersicht und Wartung

## Weboberfläche
- `index.html`, `startseite.css`, `startseite.js`: öffentliche Startseite.
- `dashboard.html`, `dashboard.css`, `dashboard-inline.js`, `dashboard.js`: Server-Dashboard.
- `style.css`: vorhandene Styles; vor Änderungen zuerst Referenzen prüfen.

## Backend
- `server-secure.js`: prüft die Umgebung und lädt den Server.
- `server.js`: Express-Routen, Discord-Anmeldung und MongoDB; schützt Dashboard-Routen und sperrt interne Dateien vor dem Static-Server.
- `security-middleware.js`: globale API-Sicherheitsprüfungen, Admin-Berechtigungen, Origin-Prüfung für alle schreibenden Requests und Rate-Limit.
- `session-token.js`: verschlüsselt OAuth-Zugriffstoken mit AES-256-GCM, damit sie nicht lesbar im signierten Cookie liegen.
- `oauth-state.js`: erzeugt und vergleicht OAuth-State-Werte zur Abwehr von Login-CSRF.
- `tests/security-middleware.test.js`: Regressionstests für zentrale Sicherheitsfälle.
- `main.py`: Discord-Bot in Python.

## Sicherheit
- `/dashboard` und `/dashboard.html` müssen durch `server-secure.js` laufen, damit der Login-Check greift.
- Der Static-Server darf keine Backend-Quellen, Konfigurationsdateien oder Ordner wie `docs/` und `scripts/` ausliefern. Auf Vercel müssen diese Pfade vor der allgemeinen Static-Route zum Server-Handler geleitet werden.
- Nach Änderungen an `vercel.json` oder der Reihenfolge von Express-Middleware den Asset- und Routencheck aus `npm run check` ausführen.

## Vor dem Veröffentlichen
1. `npm install` und `npm start` lokal prüfen.
2. Den Bot in einer virtuellen Umgebung mit den Paketen aus `requirements.txt` starten.
3. Login, Berechtigungen, Dashboard-Speichern, Ticket-Interaktionen und Bot-Start testen.
4. Niemals echte Tokens oder eine produktive Datenbank-URL in Git speichern.

## Nächster sinnvoller Umbau
Die Python-Botdatei sollte in fachliche Discord-Cogs aufgeteilt werden, zum Beispiel Tickets, Bewerbungen, Teamverwaltung, Schichten und Minispiele. Das braucht eine gemeinsame Datenbank- und Konfigurationsschicht. Ein bloßes Verschieben von Funktionen könnte bestehende Interaktionen beschädigen.
