const fs = require('node:fs');
const path = require('node:path');

const htmlFiles = ['index.html', 'dashboard.html'];
const missing = [];

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(path.join(__dirname, '..', htmlFile), 'utf8');
  const pattern = /(?:src|href)=["'](\/[^"'?#]+\.(?:css|js))(?:\?[^"']*)?["']/gi;

  for (const match of html.matchAll(pattern)) {
    const assetPath = path.join(__dirname, '..', match[1].replace(/^\//, ''));
    if (!fs.existsSync(assetPath)) {
      missing.push(htmlFile + ' -> ' + match[1]);
    }
  }
}

if (missing.length > 0) {
  console.error('Fehlende lokale CSS-/JavaScript-Dateien:');
  for (const entry of missing) console.error('- ' + entry);
  process.exitCode = 1;
} else {
  console.log('HTML-Dateien verweisen auf vorhandene lokale CSS-/JavaScript-Dateien.');
}
