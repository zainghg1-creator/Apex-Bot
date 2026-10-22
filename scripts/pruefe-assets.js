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
}

const serverSource = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const dashboardRouteIndex = serverSource.indexOf("app.get(['/dashboard.html', '/dashboard']");
const staticMiddlewareIndex = serverSource.indexOf('app.use(express.static(__dirname))');
if (dashboardRouteIndex === -1 || staticMiddlewareIndex === -1 || dashboardRouteIndex > staticMiddlewareIndex) {
  missing.push('server.js -> Dashboard-Loginprüfung muss vor express.static registriert sein');
}

let vercelConfig;
try {
  vercelConfig = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
} catch {
  missing.push('vercel.json -> ungültiges JSON');
}

if (vercelConfig) {
  for (const routePath of ['/dashboard', '/dashboard.html']) {
    const route = (vercelConfig.routes || []).find(entry => entry.src === routePath);
    if (!route || route.dest !== '/server-secure.js') {
      missing.push('vercel.json -> ' + routePath + ' muss durch server-secure.js laufen');
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
