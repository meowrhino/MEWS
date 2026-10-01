// Hacedor de QR con un dibujo pixel art en el centro, en la misma cuadrícula.
// Navegador: lo usa qr/index.html. Terminal: `node qr/qr.js` regenera los SVG de esta carpeta.

const QR_URL = 'https://meowrhino.github.io/monicas_1/';
const QUIET = 4; // margen blanco obligatorio alrededor del QR, en módulos

// Dibujos: '.' blanco, '#' tinta, 'o' color del dibujo, 'p' rosa
const DIBUJOS = {
    gato: [
        'o.......o',
        'oo.....oo',
        'ooooooooo',
        'oo#ooo#oo',
        'ooooooooo',
        'oooo#oooo',
        '.ooooooo.',
        '..ooooo..'
    ],
    neko: [
        '.#.....#.',
        '#.#...#.#',
        '#..###..#',
        '#.......#',
        '#.#...#.#',
        '#...p...#',
        '#.......#',
        '.#######.'
    ]
};

// Devuelve { size, cells }: cells[y][x] = color CSS, size incluye el margen
function buildQR(qrcode, text, dibujo, { tinta = '#000', color = '#e8553b' } = {}) {
    const qr = qrcode(0, 'H'); // corrección máxima (~30%) para poder tapar el centro
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    const h = dibujo.length, w = Math.max(...dibujo.map((r) => r.length));
    const ox = Math.floor((n - w) / 2), oy = Math.floor((n - h) / 2);
    const paleta = { '.': '#fff', '#': tinta, 'o': color, 'p': '#ff4fa3' };
    const size = n + QUIET * 2;
    const cells = Array.from({ length: size }, () => Array(size).fill('#fff'));
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            const ax = x - ox, ay = y - oy;
            // dibujo + 1 módulo de aire blanco alrededor
            const enCaja = ax >= -1 && ax <= w && ay >= -1 && ay <= h;
            const c = enCaja ? paleta[(dibujo[ay] || '')[ax]] || '#fff' : qr.isDark(y, x) ? tinta : '#fff';
            cells[y + QUIET][x + QUIET] = c;
        }
    }
    return { size, cells };
}

function toSVG({ size, cells }) {
    const porColor = {};
    cells.forEach((row, y) => row.forEach((c, x) => {
        if (c !== '#fff') porColor[c] = (porColor[c] || '') + `M${x} ${y}h1v1h-1z`;
    }));
    const paths = Object.entries(porColor).map(([c, d]) => `<path fill="${c}" d="${d}"/>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/>${paths}</svg>`;
}

// Pasa el QR a píxeles RGBA (escala px por módulo) para comprobarlo con jsQR
function toRGBA({ size, cells }, px = 8) {
    const W = size * px, data = new Uint8ClampedArray(W * W * 4);
    const rgb = (c) => {
        const hex = c.length === 4 ? c.replace(/\w/g, '$&$&') : c;
        return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    };
    for (let y = 0; y < W; y++) {
        for (let x = 0; x < W; x++) {
            const [r, g, b] = rgb(cells[Math.floor(y / px)][Math.floor(x / px)]);
            data.set([r, g, b, 255], (y * W + x) * 4);
        }
    }
    return { data, width: W, height: W };
}

function seLee(jsQR, qrData, text) {
    const img = toRGBA(qrData);
    const res = jsQR(img.data, img.width, img.height);
    return !!res && res.data === text;
}

if (typeof module !== 'undefined') {
    module.exports = { QR_URL, DIBUJOS, buildQR, toSVG, seLee };
    if (require.main === module) {
        const fs = require('fs'), path = require('path');
        const qrcode = require('../vendor/qr/qrcode.js'), jsQR = require('../vendor/qr/jsQR.js');
        for (const [nombre, dibujo] of Object.entries(DIBUJOS)) {
            const q = buildQR(qrcode, QR_URL, dibujo);
            const ok = seLee(jsQR, q, QR_URL);
            fs.writeFileSync(path.join(__dirname, `qr-${nombre}.svg`), toSVG(q));
            console.log(`qr-${nombre}.svg`, ok ? 'se lee bien' : 'NO SE LEE');
            if (!ok) process.exitCode = 1;
        }
    }
}
