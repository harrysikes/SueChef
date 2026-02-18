const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Minimal 1x1 PNG (transparent pixel)
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

fs.writeFileSync(path.join(dir, 'icon.png'), minimalPng);
fs.writeFileSync(path.join(dir, 'splash.png'), minimalPng);
console.log('Created assets/icon.png and assets/splash.png. Replace with real images for production.');
