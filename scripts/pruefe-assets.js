const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const htmlFiles = ['index.html', 'dashboard.html'];
const missing = [];
const inlineStyles = [];
const inlineScripts = [];

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(path.join(root, htmlFile), 'utf8');
  const pattern = /(?:src|href)=["'](\/[^"'?#]+\.(?:css|js))(?:\?[^"']*)?["']/gi;

  for (const match of html.matchAll(pattern)) {
    const assetPath = path.join(root, match[1].replace(/^\//, ''));
    if (!fs.existsSync(assetPath)) {
      missing.push(htmlFile + ' -> ' + match[1]);
    }
  }

  if (/\sstyle\s*=/i.test(html)) inlineStyles.push(htmlFile);
  if (/<script\b(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/i.test(html)) {
    inlineScripts.push(htmlFile);
  }

  const cssFile = htmlFile === 'dashboard.html' ? 'dashboard.css' : 'startseite.css';
  const css = fs.readFileSync(path.join(root, cssFile), 'utf8');
  const extractedClasses = new Set([...html.matchAll(/\b(extracted-inline-(?:dashboard|home)-\d+)\b/g)].map(match => match[1]));
  for (const className of extractedClasses) {
    const selector = new RegExp('\\.' + className + '\\.' + className + '\\s*\\{');
    if (!selector.test(css)) {
      missing.push(htmlFile + ' -> CSS-Regel fehlt für ' + className + ' in ' + cssFile);
    }
  }
}

const backendModules = [
  'backend/middleware/security-middleware.js',
  'backend/oauth/session-token.js',
  'backend/oauth/oauth-state.js'
];
for (const modulePath of backendModules) {
  if (!fs.existsSync(path.join(root, modulePath))) {
    missing.push('Backend-Modul fehlt: ' + modulePath);
  }
}

const serverSource = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
for (const modulePath of [
  "require('./backend/middleware/security-middleware')",
  "require('./backend/oauth/session-token')",
  "require('./backend/oauth/oauth-state')"
]) {
  if (!serverSource.includes(modulePath)) {
    missing.push('server.js -> neues Backend-Modul wird nicht eingebunden: ' + modulePath);
  }
}
const sessionMiddlewareIndex = serverSource.indexOf('app.use(cookieSession({');
const tokenDecryptIndex = serverSource.indexOf('req.accessToken = decryptAccessToken(req.session?.encryptedAccessToken);');
const securityMiddlewareIndex = serverSource.indexOf('app.use(securityMiddleware);');
const firstGuildApiIndex = serverSource.indexOf("app.get('/api/guilds'");
if (
  sessionMiddlewareIndex === -1 ||
  tokenDecryptIndex < sessionMiddlewareIndex ||
  securityMiddlewareIndex < tokenDecryptIndex ||
  firstGuildApiIndex === -1 ||
  securityMiddlewareIndex > firstGuildApiIndex
) {
  missing.push('server.js -> Token-Entschlüsselung und securityMiddleware müssen nach cookieSession und vor API-Routen laufen');
}
if (
  serverSource.includes('req.session.accessToken') ||
  serverSource.includes('req.session?.accessToken') ||
  !serverSource.includes('req.session.encryptedAccessToken = encryptAccessToken(tokenData.access_token)')
) {
  missing.push('server.js -> OAuth-Token darf nur verschlüsselt in der Cookie-Session liegen');
}
if (
  !serverSource.includes('const state = createOAuthState();') ||
  !serverSource.includes('if (!isValidOAuthState(state, expectedState))')
) {
  missing.push('server.js -> OAuth-State-Prüfung fehlt');
}
const dashboardRouteIndex = serverSource.indexOf("app.get(['/dashboard.html', '/dashboard']");
const privateFilesGuardIndex = serverSource.indexOf('const PRIVATE_STATIC_PATHS = new Set([');
const staticMiddlewareIndex = serverSource.indexOf('app.use(express.static(__dirname, { index: false, dotfiles: \'deny\' }))');
if (dashboardRouteIndex === -1 || staticMiddlewareIndex === -1 || dashboardRouteIndex > staticMiddlewareIndex) {
  missing.push('server.js -> Dashboard-Loginprüfung muss vor express.static registriert sein');
}
if (privateFilesGuardIndex === -1 || privateFilesGuardIndex > staticMiddlewareIndex) {
  missing.push('server.js -> Schutz interner Dateien muss vor express.static registriert sein');
}
for (const privatePath of ['/main.py', '/server.js', '/server-secure.js', '/security-middleware.js', '/session-token.js', '/oauth-state.js', '/package.json', '/requirements.txt', '/vercel.json']) {
  if (!serverSource.includes("'" + privatePath + "'")) {
    missing.push('server.js -> interne Datei nicht gesperrt: ' + privatePath);
  }
}

let vercelConfig;
try {
  vercelConfig = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
} catch {
  missing.push('vercel.json -> ungültiges JSON');
}

if (vercelConfig) {
  const vercelRoutes = vercelConfig.routes || [];
  for (const routePath of ['/dashboard', '/dashboard.html']) {
    const route = vercelRoutes.find(entry => entry.src === routePath);
    if (!route || route.dest !== '/server-secure.js') {
      missing.push('vercel.json -> ' + routePath + ' muss durch server-secure.js laufen');
    }
  }

  const privateRoutePatterns = [
    '/.env.example', '/.gitignore', '/README.md', '/main.py',
    '/package.json', '/requirements.txt', '/security-middleware.js',
    '/session-token.js', '/oauth-state.js', '/server-secure.js', '/server.js', '/vercel.json',
    '/.github/(.*)', '/docs/(.*)', '/scripts/(.*)', '/backend/(.*)', '/bot/(.*)', '/konfiguration/(.*)', '/tests/(.*)'
  ];
  for (const routePath of privateRoutePatterns) {
    const route = vercelRoutes.find(entry => entry.src === routePath);
    if (!route || route.dest !== '/server-secure.js') {
      missing.push('vercel.json -> interne Route fehlt oder ist nicht geschützt: ' + routePath);
    }
  }
}

let failed = false;

if (missing.length > 0) {
  console.error('Fehlende Dateien oder notwendige Sicherheits-Routen:');
  for (const entry of missing) console.error('- ' + entry);
  failed = true;
}

if (inlineStyles.length > 0) {
  console.error('Inline-Styles gefunden in: ' + inlineStyles.join(', '));
  failed = true;
}

if (inlineScripts.length > 0) {
  console.error('Inline-Scripts gefunden in: ' + inlineScripts.join(', '));
  failed = true;
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log('Assets vorhanden; keine Inline-Styles oder Inline-Scripts; Dashboard-Routen geschützt.');
}
