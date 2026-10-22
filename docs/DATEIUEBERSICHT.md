# Dateiübersicht und Wartung

## Neue Ordnerstruktur
- `bot/cogs/`, `bot/dienste/`, `bot/datenbank/`: vorbereitete Bereiche für die schrittweise Aufteilung des Python-Bots.
- `frontend/css/`, `frontend/js/`: Zielordner für Web-Assets; bestehende Dateien bleiben vorerst an ihren bisherigen Pfaden, bis Hosting- und Asset-Referenzen gemeinsam umgestellt werden.
- `backend/middleware/security-middleware.js`: echte Implementierung der Sicherheits-Middleware.
- `backend/oauth/session-token.js`: Verschlüsselung und Entschlüsselung von OAuth-Tokens.
- `backend/oauth/oauth-state.js`: sichere Erzeugung und Prüfung des OAuth-State-Werts.
- Die gleichnamigen Dateien im Stamm sind kleine Kompatibilitäts-Einstiegspunkte für bestehende Importe.
- `konfiguration/`: Dokumentation zur sicheren Konfiguration; keine Geheimnisse speichern.
- `tests/bot/`: Ziel für Bot-Tests.
- `docs/architektur/`: Architektur- und Migrationsdokumentation.

Die neuen Ordner sind absichtlich mit internen Dateien geschützt. Sicherheits-Middleware und OAuth-Helfer sind bereits in `backend/` umgezogen. Die übrigen Bereiche werden schrittweise befüllt, damit keine Imports, Hosting-Routen oder Frontend-Assets kaputtgehen.

## Weboberfläche
- `index.html`, `startseite.css`, `startseite.js`: öffentliche Startseite.
- `dashboard.html`, `dashboard.css`, `dashboard-inline.js`, `dashboard.js`: Server-Dashboard.
- `style.css`: vorhandene Styles; vor Änderungen zuerst Referenzen prüfen.

## Backend
- `server-secure.js`: prüft die Umgebung und lädt den Server.
- `server.js`: Express-Routen, Discord-Anmeldung und MongoDB; schützt Dashboard-Routen und sperrt interne Dateien vor dem Static-Server.
- `security-middleware.js`, `session-token.js`, `oauth-state.js`: Kompatibilitätsdateien, die auf die Implementierungen unter `backend/` verweisen.
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
