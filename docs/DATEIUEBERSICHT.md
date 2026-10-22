# Dateiübersicht und Wartung

## Weboberfläche
- `index.html`, `startseite.css`, `startseite.js`: öffentliche Startseite.
- `dashboard.html`, `dashboard.css`, `dashboard-inline.js`, `dashboard.js`: Server-Dashboard.
- `style.css`: vorhandene Styles; vor Änderungen zuerst Referenzen prüfen.

## Backend
- `server-secure.js`: prüft die Umgebung und lädt den Server.
- `server.js`: Express-Routen, Discord-Anmeldung und MongoDB.
- `security-middleware.js`: zusätzliche Sicherheitsprüfungen.
- `main.py`: Discord-Bot in Python.

## Vor dem Veröffentlichen
1. `npm install` und `npm start` lokal prüfen.
2. Den Bot in einer virtuellen Umgebung mit den Paketen aus `requirements.txt` starten.
3. Login, Berechtigungen, Dashboard-Speichern, Ticket-Interaktionen und Bot-Start testen.
4. Niemals echte Tokens oder eine produktive Datenbank-URL in Git speichern.

## Nächster sinnvoller Umbau
Die Python-Botdatei sollte in fachliche Discord-Cogs aufgeteilt werden, zum Beispiel Tickets, Bewerbungen, Teamverwaltung, Schichten und Minispiele. Das braucht eine gemeinsame Datenbank- und Konfigurationsschicht. Ein bloßes Verschieben von Funktionen könnte bestehende Interaktionen beschädigen.
