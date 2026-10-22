# Bot-Backend

Hier wird der Python-Discord-Bot schrittweise organisiert.

- `cogs/`: Discord-Befehle und Events, nach Funktion getrennt
- `dienste/`: wiederverwendbare Geschäftslogik ohne direkte Command-Registrierung
- `datenbank/`: Datenbankzugriff und Modelle
- `utils/`: gemeinsame Hilfsfunktionen

`main.py` bleibt vorerst im Repository-Stamm, bis die Funktionen einzeln migriert und getestet sind. Nicht blind verschieben: Importpfade und Discord-Registrierung müssen dabei angepasst werden.
