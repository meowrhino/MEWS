// QR con la cabeza del neko oficial (neko/Awake.ico) en el centro, en la misma cuadrícula.
// `node qr/qr.js` regenera qr/qr-neko.svg y comprueba que se lee.

const fs = require('fs'), path = require('path');
const qrcode = require('../vendor/qr/qrcode.js'), jsQR = require('../vendor/qr/jsQR.js');

const QR_URL = 'https://meowrhino.github.io/monicas_1/';
const QUIET = 4; // margen blanco obligatorio alrededor del QR, en módulos
const CABEZA = { x: 9, y: 3, w: 15, h: 15 }; // recorte de la cabeza dentro del sprite de 32x32

// Lee un .ico de 32x32 a 4 bits (los de Neko98): devuelve filas de colores CSS, null = transparente
function leerIco(file) {
    const b = fs.readFileSync(file);
    const off = b.readUInt32LE(18), hs = b.readUInt32LE(off), w = b.readInt32LE(off + 4), h = b.readInt32LE(off + 8) / 2;
    const pal = [];
    for (let i = 0; i < 16; i++) pal.push('#' + [2, 1, 0].map((k) => b[off + hs + i * 4 + k].toString(16).padStart(2, '0')).join(''));
    const px = off + hs + 64, stride = Math.ceil(w / 8) * 4, mask = px + stride * h, mstride = Math.ceil(w / 32) * 4;
    return Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => {
        const fy = h - 1 - y; // BMP va de abajo arriba
        if ((b[mask + fy * mstride + (x >> 3)] >> (7 - (x & 7))) & 1) return null;
        const by = b[px + fy * stride + (x >> 1)];
        return pal[x & 1 ? by & 15 : by >> 4];
    }));
}

// Devuelve { size, cells }: cells[y][x] = color CSS, size incluye el margen
function buildQR(text, dibujo, version) {
    const qr = qrcode(version, 'H'); // corrección máxima (~30%) para poder tapar el centro
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    const h = dibujo.length, w = dibujo[0].length;
    const ox = Math.floor((n - w) / 2), oy = Math.floor((n - h) / 2);
    const size = n + QUIET * 2;
    const cells = Array.from({ length: size }, () => Array(size).fill('#fff'));
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            const ax = x - ox, ay = y - oy;
            // dibujo + 1 módulo de aire blanco alrededor
            const enCaja = ax >= -1 && ax <= w && ay >= -1 && ay <= h;
            cells[y + QUIET][x + QUIET] = enCaja ? (dibujo[ay] || [])[ax] || '#fff' : qr.isDark(y, x) ? '#000' : '#fff';
        }
    }
    return { size, cells };
}

function toSVG({ size, cells }) {
    const porColor = {};
    cells.forEach((row, y) => row.forEach((c, x) => {
        if (c !== '#fff' && c !== '#ffffff') porColor[c] = (porColor[c] || '') + `M${x} ${y}h1v1h-1z`;
    }));
    const paths = Object.entries(porColor).map(([c, d]) => `<path fill="${c}" d="${d}"/>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/>${paths}</svg>`;
}

// Pasa el QR a píxeles RGBA (8 px por módulo) y lo lee con jsQR
function seLee({ size, cells }, text, px = 8) {
    const W = size * px, data = new Uint8ClampedArray(W * W * 4);
    const rgb = (c) => {
        const hex = c.length === 4 ? c.replace(/\w/g, '$&$&') : c;
        return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    };
    for (let y = 0; y < W; y++) {
        for (let x = 0; x < W; x++) data.set([...rgb(cells[Math.floor(y / px)][Math.floor(x / px)]), 255], (y * W + x) * 4);
    }
    const res = jsQR(data, W, W);
    return !!res && res.data === text;
}

const sprite = leerIco(path.join(__dirname, '../neko/Awake.ico'));
const cabeza = sprite.slice(CABEZA.y, CABEZA.y + CABEZA.h).map((r) => r.slice(CABEZA.x, CABEZA.x + CABEZA.w));
console.log(cabeza.map((r) => r.map((c) => (c ? (c === '#000000' ? '#' : '.') : ' ')).join('')).join('\n'));

// la versión más pequeña en la que la cabeza no rompe la lectura
for (let v = 1; v <= 40; v++) {
    let q;
    try { q = buildQR(QR_URL, cabeza, v); } catch { continue; } // URL no cabe en esta versión
    if (!seLee(q, QR_URL)) continue;
    fs.writeFileSync(path.join(__dirname, 'qr-neko.svg'), toSVG(q));
    console.log(`qr-neko.svg: versión ${v}, se lee bien`);
    return;
}
console.log('NO SE LEE en ninguna versión');
process.exitCode = 1;
