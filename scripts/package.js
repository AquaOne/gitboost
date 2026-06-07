// GitBoost packaging script
// Creates a ZIP file ready for Chrome Web Store upload
// Usage: node scripts/package.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUTPUT = path.join(ROOT, 'gitboost.zip');

// Files and directories to include in the package
const INCLUDE = [
  'manifest.json',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'src/',
  '_locales/',
  'PRIVACY.md',
];

console.log('📦 Packaging GitBoost for Chrome Web Store...');

// Create dist directory
if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST, { recursive: true });
}

// Clean dist
execSync(`rm -rf "${DIST}/*"`, { stdio: 'inherit' });

// Copy files
for (const item of INCLUDE) {
  const src = path.join(ROOT, item);
  const dest = path.join(DIST, item);

  if (fs.statSync(src).isDirectory()) {
    execSync(`cp -r "${src}" "${dest}"`, { stdio: 'inherit' });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
  console.log(`  ✅ ${item}`);
}

// Create ZIP
const zipCmd = process.platform === 'win32'
  ? `powershell -Command "Compress-Archive -Path '${DIST}\\*' -DestinationPath '${OUTPUT}' -Force"`
  : `cd "${DIST}" && zip -r "${OUTPUT}" .`;

try {
  execSync(zipCmd, { stdio: 'inherit', cwd: DIST });
  const stats = fs.statSync(OUTPUT);
  console.log(`\n✅ Package created: gitboost.zip (${(stats.size / 1024).toFixed(1)} KB)`);
  console.log('📤 Upload this file to Chrome Web Store Developer Dashboard');
} catch (err) {
  console.error('Failed to create ZIP:', err.message);
  console.log('\nManual packaging:');
  console.log('1. Zip the contents of the dist/ folder');
  console.log('2. Upload to Chrome Web Store');
}

// Clean up dist
fs.rmSync(DIST, { recursive: true, force: true });
