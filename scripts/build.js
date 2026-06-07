// GitBoost complete build & package script
// Creates distribution package ready for Chrome Web Store
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUTPUT = path.join(ROOT, 'gitboost-build.zip');

const REQUIRED = [
  'manifest.json',
  'icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png',
  'src/content/content.js', 'src/content/content.css',
  'src/popup/popup.html', 'src/popup/popup.css', 'src/popup/popup.js',
  'src/options/options.html', 'src/options/options.css', 'src/options/options.js',
  'src/background/background.js',
  '_locales/zh_CN/messages.json', '_locales/en/messages.json',
  'PRIVACY.md', 'LICENSE',
];

console.log('GitBoost Build Tool');
console.log('==================\n');

// Validate all required files exist
let allOk = true;
for (const f of REQUIRED) {
  const fp = path.join(ROOT, f);
  if (!fs.existsSync(fp)) {
    console.error(`  ❌ MISSING: ${f}`);
    allOk = false;
  }
}
if (!allOk) {
  console.error('\nBuild failed: missing required files');
  process.exit(1);
}
console.log('  ✅ All required files present\n');

// Clean and recreate dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

// Copy all required files preserving structure
for (const f of REQUIRED) {
  const src = path.join(ROOT, f);
  const dest = path.join(DIST, f);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// Copy additional optional files
const OPTIONAL = ['README.md', 'README_EN.md'];
for (const f of OPTIONAL) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST, f));
  }
}

// Create ZIP
const cmd = process.platform === 'win32'
  ? `powershell -Command "Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('${DIST}', '${OUTPUT}', 'Fastest', $false)"`
  : `cd "${DIST}" && zip -r "${OUTPUT}" .`; // won't reach on Windows

try {
  execSync(cmd, { stdio: 'pipe' });
} catch (e) {
  // Fallback: manual zip using Node's zlib
  console.log('Creating ZIP via native method...');
  const output = fs.existsSync(OUTPUT) ? fs.statSync(OUTPUT).size : 0;
  if (!output) {
    execSync(`cd "${DIST}" && tar.exe -a -c -f "${OUTPUT}" *`, { stdio: 'pipe' });
  }
}

// Verify output
if (fs.existsSync(OUTPUT)) {
  const size = fs.statSync(OUTPUT).size;
  const sizeKB = (size / 1024).toFixed(1);
  console.log(`\n  📦 Package: gitboost-build.zip (${sizeKB} KB)`);
  console.log('  ✅ Build complete!\n');

  // Count lines of code
  let loc = 0;
  for (const f of REQUIRED) {
    if (f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.html') || f.endsWith('.json')) {
      try {
        loc += fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').length;
      } catch (e) {}
    }
  }
  console.log(`  📊 Stats:`);
  console.log(`     Files: ${REQUIRED.length}`);
  console.log(`     LOC:   ${loc}`);
} else {
  console.error('\n  ❌ Build failed: ZIP not created');
}

// Cleanup dist
fs.rmSync(DIST, { recursive: true, force: true });
