const fs = require('node:fs');
const path = require('node:path');

const htmlFiles = ['index.html', 'dashboard.html'];
const missing = [];
const inlineStyles = [];
const inlineScripts = [];

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(path.join(__dirname, '..', htmlFile), 'utf8');
  const pattern = /(?:src|href)=["'](\/[^"'?#]+\.(?:css|js))(?:\?[^"']*)?["']/gi;

  for (const match of html.matchAll(pattern)) {
    const assetPath = path.join(__dirname, '..', match[1].replace(/^\//, ''));
    if (!fs.existsSync(assetPath)) {
      missing.push(htmlFile + ' -> ' + match[1]);
    }
  }

  if (/\sstyle\s*=/i.test(html)) inlineStyles.push(htmlFile);
  if (/<script\b(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?<\/script>/i.test(html)) {
    inlineScripts.push(htmlFile);
  }
}

let failed = false;

if (missing.length > 0) {
  console.error('Fehlende lokale CSS-/JavaScript-Dateien:');
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
  console.log('Assets vorhanden; keine Inline-Styles oder Inline-Scripts in den HTML-Dateien.');
}
