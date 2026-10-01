// Cuando exista la API del compañero: poner su URL aquí y ajustar el campo en textoDe()
const API_URL = '';
const FALLBACK_URL = 'noticias.json';
const textoDe = (n) => (typeof n === 'string' ? n : n?.titulo ?? n?.title);

const MAX_NEWS = 25;          // con esta cantidad el velo es negro total
const BASE_DIM = 0.35;        // oscuridad del fondo sin noticias (los presets son muy brillantes)
const MUSIC_VOLUME = 0.6;
const PRESETS = [             // presets tranquilos (los mismos que el reproductor de diegosanmarcos)
    'martin - castle in the air',
    '_Mig_085',
    'Aderrasi - Potion of Spirits'
];
const PRESET_SECONDS = 25;
const BLEND_SECONDS = 4;

const $ = (id) => document.getElementById(id);
const canvas = $('bg'), veilEl = $('veil'), newsEl = $('news'), nekoEl = $('neko'), startEl = $('start');

let ctx, master, analyser, visualizer;
let titulares = [], cola = [];
let news = [];                // [{ el, x, y, h }]
let spawned = 0;              // noticias desde la última vez que la pantalla quedó vacía
let veil = 0;                 // 0 = fondo limpio, 1 = tapado del todo
let lastScroll = performance.now();

// ===== Audio: binaural + pad + ruido, todo generado =====
function startAudio() {
    // iOS: sin esto el audio web no suena con el móvil en silencio (iOS 17+)
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    analyser = ctx.createAnalyser();
    master.connect(analyser).connect(ctx.destination);

    // Binaural: 200 Hz izquierda, 206 Hz derecha -> pulso theta de 6 Hz
    const merger = ctx.createChannelMerger(2);
    [200, 206].forEach((f, ch) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = f;
        g.gain.value = 0.12;
        o.connect(g).connect(merger, 0, ch);
        o.start();
    });
    merger.connect(master);

    // Pad: acorde de La con respiración lenta en cada voz
    const pad = ctx.createBiquadFilter();
    pad.type = 'lowpass';
    pad.frequency.value = 900;
    pad.connect(master);
    [110, 164.81, 220, 277.18, 329.63].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = i % 2 ? 'sine' : 'triangle';
        o.frequency.value = f;
        o.detune.value = (Math.random() - 0.5) * 8;
        g.gain.value = 0.04;
        const lfo = ctx.createOscillator(), depth = ctx.createGain();
        lfo.frequency.value = 0.03 + Math.random() * 0.07;
        depth.gain.value = 0.035;
        lfo.connect(depth).connect(g.gain);
        o.connect(g).connect(pad);
        o.start();
        lfo.start();
    });

    // Ruido filtrado, como de mar lejano
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain();
    noise.buffer = buf;
    noise.loop = true;
    nf.type = 'lowpass';
    nf.frequency.value = 350;
    ng.gain.value = 0.05;
    noise.connect(nf).connect(ng).connect(master);
    noise.start();
}

// ===== Visualizador (Butterchurn) =====
function startVisualizer() {
    if (!window.butterchurn || !window.base) return console.warn('butterchurn no cargado');
    const all = window.base.default;
    // Los tranquilos primero, luego el resto del pack
    const keys = [...new Set([...PRESETS.filter((k) => all[k]), ...Object.keys(all)])];

    const w = innerWidth, h = innerHeight;
    canvas.width = w;
    canvas.height = h;
    try {
        visualizer = window.butterchurn.createVisualizer(ctx, canvas, { width: w, height: h, pixelRatio: 1, textureRatio: 1 });
    } catch (err) {
        return console.warn('WebGL no disponible:', err.message);
    }
    visualizer.connectAudio(analyser);

    // Desplegable abajo a la derecha: primera opción = ciclar sí/no, luego los presets
    const select = $('preset'), label = $('preset-name');
    const cycleOpt = new Option('', 'cycle');
    const group = document.createElement('optgroup');
    group.label = 'presets';
    group.append(...keys.map((k, i) => new Option(k, i)));
    select.append(cycleOpt, group);
    let cycling = true, current = 0, timer;
    const setPreset = (i, blend) => {
        current = i;
        select.value = i;
        label.textContent = `${cycling ? '⟳' : '‖'} ${keys[i]}`;
        cycleOpt.text = cycling ? '⟳ ciclando (tocar para fijar)' : '‖ fijo (tocar para ciclar)';
        visualizer.loadPreset(all[keys[i]], blend);
        clearInterval(timer);
        if (cycling) timer = setInterval(() => setPreset((current + 1) % keys.length, BLEND_SECONDS), PRESET_SECONDS * 1000);
    };
    select.addEventListener('change', () => {
        if (select.value === 'cycle') {
            cycling = !cycling;
            setPreset(current, 0);
        } else {
            setPreset(+select.value, BLEND_SECONDS);
        }
    });
    setPreset(0, 0);
    $('presets').hidden = false;

    addEventListener('resize', () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        visualizer.setRendererSize(innerWidth, innerHeight);
    });
    (function loop() {
        if (veil < 1) visualizer.render(); // tapado del todo: no se ve, no gastamos batería
        requestAnimationFrame(loop);
    })();
}

// ===== Noticias =====
async function loadNews() {
    for (const url of [API_URL, FALLBACK_URL].filter(Boolean)) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(res.status);
            const list = (await res.json()).map(textoDe).filter(Boolean);
            if (list.length) return (titulares = list);
        } catch (err) {
            console.warn('No se pudieron cargar noticias de', url, err.message);
        }
    }
}

function nextTitular() {
    if (!cola.length) cola = [...titulares].sort(() => Math.random() - 0.5);
    return cola.pop();
}

function place(n) {
    n.el.style.transform = `translate(${n.x}px, ${n.y}px)`;
}

function spawn() {
    if (titulares.length && !document.hidden) {
        const el = document.createElement('p');
        el.className = 'noticia';
        el.textContent = nextTitular();
        newsEl.append(el);
        const h = el.offsetHeight;
        const n = {
            el,
            h,
            x: (Math.random() - 0.5) * innerWidth * 0.3,
            y: Math.random() * Math.max(0, innerHeight * 0.85 - h)
        };
        place(n);
        news.push(n);
        requestAnimationFrame(() => el.classList.add('visible'));
        spawned++;
        updateVeil();
    }
    // Cada vez más rápido: 6 s la primera, hasta 0,6 s
    setTimeout(spawn, Math.max(600, 6000 * 0.88 ** spawned));
}

function updateVeil() {
    veil = Math.min(1, news.length / MAX_NEWS);
    veilEl.style.opacity = BASE_DIM + (0.97 - BASE_DIM) * veil;
    if (master) master.gain.setTargetAtTime(MUSIC_VOLUME * (1 - veil) ** 1.5, ctx.currentTime, 0.8);
}

// ===== Scroll virtual: solo hacia abajo, lo que sale por arriba se pierde =====
function scrollDown(dy) {
    if (dy <= 0) return;
    lastScroll = performance.now();
    news = news.filter((n) => {
        n.y -= dy;
        if (n.y + n.h < 0) {
            n.el.remove();
            return false;
        }
        place(n);
        return true;
    });
    if (!news.length) spawned = 0;
    updateVeil();
}

addEventListener('wheel', (e) => {
    e.preventDefault();
    scrollDown(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY);
}, { passive: false });

let touchY = null;
addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', (e) => {
    e.preventDefault();
    const y = e.touches[0].clientY;
    scrollDown(touchY - y);
    touchY = y;
}, { passive: false });

// ===== Neko =====
['Down1', 'down2', 'yawn2', 'sleep1', 'sleep2'].forEach((s) => { new Image().src = `neko/${s}.ico`; }); // precarga
let tick = 0;
setInterval(() => {
    tick++;
    const idle = performance.now() - lastScroll;
    let s;
    if (idle < 150) s = tick % 2 ? 'Down1' : 'down2';
    else if (idle < 4000) s = 'Awake';
    else if (idle < 5500) s = 'yawn2';
    else s = Math.floor(tick / 5) % 2 ? 'sleep1' : 'sleep2';
    if (nekoEl.dataset.s !== s) {
        nekoEl.dataset.s = s;
        nekoEl.src = `neko/${s}.ico`;
    }
}, 120);

// Pestaña oculta o móvil bloqueado: silencio (y spawn() no añade noticias)
document.addEventListener('visibilitychange', () => {
    if (ctx) document.hidden ? ctx.suspend() : ctx.resume();
});

// ===== Inicio (el audio necesita un toque en móvil) =====
startEl.addEventListener('click', async () => {
    startEl.classList.add('hidden');
    startAudio();
    await ctx.resume();
    updateVeil();
    startVisualizer();
    await loadNews();
    setTimeout(spawn, 4000); // unos segundos de calma antes de la primera noticia
}, { once: true });
