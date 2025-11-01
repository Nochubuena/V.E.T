const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'web-build', 'index.html');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  // Replace backslash with forward slash in manifest.json path
  content = content.replace('href="\\manifest.json"', 'href="/manifest.json"');
  
  // Add dog paw favicon if not already present
  const faviconLink = '<link rel="icon" href="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>🐾</text></svg>">';
  if (!content.includes('rel="icon"')) {
    // Insert favicon in the head section, right after the title or in the head
    if (content.includes('</title>')) {
      content = content.replace('</title>', `</title>${faviconLink}`);
    } else if (content.includes('<head>')) {
      content = content.replace('<head>', `<head>${faviconLink}`);
    } else {
      // Fallback: add before closing head tag
      content = content.replace('</head>', `${faviconLink}</head>`);
    }
    console.log('Added dog paw favicon to index.html');
  }
  
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('Fixed manifest.json path and favicon in index.html');
} else {
  console.log('index.html not found, skipping fix');
}

