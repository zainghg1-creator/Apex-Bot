# Web-Backend

- `middleware/security-middleware.js`: Sicherheits- und Request-Middleware
- `oauth/oauth-state.js`: Discord-OAuth-State
- `oauth/session-token.js`: Token-Verschlüsselung und -Entschlüsselung
- `routen/`: API- und Seitenrouten, sobald sie aus `server.js` extrahiert werden

`server.js` bleibt vorerst der Einstiegspunkt, damit die bestehende Hosting-Konfiguration weiter funktioniert.
