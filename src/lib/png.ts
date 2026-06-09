// Encodeur PNG minimal : génère un carré de couleur unie (RGBA).
// Sert à fournir les images requises par Apple Wallet (icon.png, logo.png)
// sans dépendance graphique. Le commerçant pourra plus tard mettre son logo.

import { deflateSync } from "zlib";

function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { r: 110, g: 16, b: 35 }; // bordeaux par défaut
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** PNG carré `size`×`size` rempli de la couleur `hex`. */
export function solidPng(size: number, hex: string): Buffer {
  const { r, g, b } = hexToRgb(hex);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // profondeur 8 bits
  ihdr[9] = 6; // type couleur 6 = RGBA

  const rowLen = size * 4 + 1;
  const raw = Buffer.alloc(rowLen * size);
  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filtre "none"
    for (let x = 0; x < size; x++) {
      const o = y * rowLen + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = 255;
    }
  }

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Couleur hex -> "rgb(r,g,b)" (format attendu par pass.json). */
export function hexToRgbString(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r},${g},${b})`;
}
