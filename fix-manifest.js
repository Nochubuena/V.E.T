const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'web-build', 'index.html');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  // Replace backslash with forward slash in manifest.json path
  content = content.replace('href="\\manifest.json"', 'href="/manifest.json"');
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Fixed manifest.json path in index.html');
} else {
  console.log('index.html not found, skipping fix');
}

