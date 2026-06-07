// Generate icon PNGs from SVG source using sharp
const fs = require('fs');
const path = require('path');

async function generate() {
  // Try sharp - if not available, use a fallback simple PNG generator
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.log('sharp not available, using fallback PNG generator');
    generateFallback();
    return;
  }

  const sizes = [16, 48, 128];
  for (const size of sizes) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6e40c9"/>
          <stop offset="100%" style="stop-color:#3b1f8e"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="24" fill="url(#bg)"/>
      <path d="M92 84c-4 8-12 14-28 14-18 0-32-12-32-34 0-22 14-36 32-36 16 0 24 6 28 14l-12 6c-2-4-8-10-16-10-10 0-18 8-18 26 0 18 8 26 18 26 8 0 14-6 16-10l12 6z" fill="white"/>
      <path d="M50 58h28v10H50z" fill="white"/>
    </svg>`;

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `icon${size}.png`));
    console.log(`Generated icon${size}.png`);
  }
}

function generateFallback() {
  // Simple PNG generator without dependencies
  // Creates minimal valid PNG files using zlib
  const sizes = [16, 48, 128];

  for (const size of sizes) {
    const imgData = createSimplePNG(size);
    fs.writeFileSync(path.join(__dirname, `icon${size}.png`), imgData);
    console.log(`Generated icon${size}.png (fallback)`);
  }
}

function createSimplePNG(size) {
  // Create a simple colored square PNG
  // PNG structure: signature + IHDR + IDAT + IEND
  const zlib = require('zlib');

  // Create raw pixel data (RGBA)
  const rawData = Buffer.alloc((size * size * 4) + size);
  for (let y = 0; y < size; y++) {
    rawData[y * (size * 4 + 1)] = 0; // filter byte
    for (let x = 0; x < size; x++) {
      const offset = y * (size * 4 + 1) + 1 + x * 4;
      // Purple gradient
      rawData[offset] = 110 + Math.floor((x / size) * 20);     // R
      rawData[offset + 1] = 64 + Math.floor((y / size) * 20);  // G
      rawData[offset + 2] = 201 - Math.floor((x / size) * 30); // B
      rawData[offset + 3] = 255; // A
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // Build PNG
  function crc32(buf) {
    let c = 0xffffffff;
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let cc = n;
      for (let k = 0; k < 8; k++) {
        cc = (cc & 1) ? (0xedb88320 ^ (cc >>> 1)) : (cc >>> 1);
      }
      table[n] = cc;
    }
    for (let i = 0; i < buf.length; i++) {
      c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type);
    const combined = Buffer.concat([typeB, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(combined));
    return Buffer.concat([len, combined, crc]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

generate().catch(console.error);
