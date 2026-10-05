// monicas: fondo generativo + música binaural que las noticias van tapando.
//
// Flujo: pantalla negra con el neko -> toque (arranca audio y fondo) -> el neko explica
// -> corre a su esquina -> calma -> noticias cada vez más rápido. Si haces scroll y
// sacas todas las noticias de la pantalla, el neko se rasca pensando, se duerme y las
// noticias vuelven a empezar despacio.

// Los ajustes (tiempos, volumen, URLs…) están en config.js, que se carga antes que este archivo.

const $ = (id) => document.getElementById(id);
const canvas = $('bg'), veilEl = $('veil'), newsEl = $('news'), startEl = $('start');
const nekoBox = $('neko-box'), nekoEl = $('neko'), bubble = $('bubble'), thoughtEl = $('thought');
const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));

let ctx, master, analyser, visualizer;
let cambiarFondo = () => {};  // pasa al siguiente preset; la define startVisualizer()
let nextTitular = () => null, nextPensamiento = () => null; // se rellenan al cargar los JSON
let news = [];                // [{ el, x, y, h }]
let spawned = 0;              // noticias desde la última vez que la pantalla quedó vacía
let spawnTimer;
let premio = false;           // has apartado todas las noticias: el neko está en su rato de calma
let veil = 0;                 // 0 = fondo limpio, 1 = tapado del todo
let lastScroll = performance.now(); // el neko decide qué hace según el tiempo desde aquí

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
    // al limpiar la pantalla; si alguien ha fijado un preset en el menú, se respeta
    cambiarFondo = () => { if (cycling) setPreset((current + 1) % keys.length, BLEND_SECONDS); };

    // El cambio de tamaño se aplica dentro del bucle, después de un render:
    // setRendererSize() falla si se llama antes del primer fotograma
    let resized = false;
    addEventListener('resize', () => { resized = true; });
    (function loop() {
        if (veil < 1) { // tapado del todo: no se ve, no gastamos batería
            visualizer.render();
            if (resized) {
                resized = false;
                canvas.width = innerWidth;
                canvas.height = innerHeight;
                visualizer.setRendererSize(innerWidth, innerHeight);
            }
        }
        requestAnimationFrame(loop);
    })();
}

// ===== Noticias =====
// Prueba las URLs en orden y devuelve los textos de la primera que funcione ([] si ninguna)
async function loadList(...urls) {
    for (const url of urls.filter(Boolean)) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(res.status);
            const list = (await res.json()).map(textoDe).filter(Boolean);
            if (list.length) return list;
        } catch (err) {
            console.warn('No se pudo cargar', url, err.message);
        }
    }
    return [];
}

// Devuelve una función que saca los textos en orden aleatorio sin repetir hasta agotarlos
function baraja(list) {
    let cola = [];
    return () => {
        if (!cola.length) cola = [...list].sort(() => Math.random() - 0.5);
        return cola.pop() ?? null;
    };
}

function place(n) {
    n.el.style.transform = `translate(${n.x}px, ${n.y}px)`;
}

function spawn() {
    const texto = !document.hidden && nextTitular();
    if (texto) {
        const el = document.createElement('p');
        el.className = 'noticia';
        el.textContent = texto;
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
    // Cada vez más rápido (si no se añadió ninguna, se reintenta con el mismo hueco)
    scheduleSpawn(Math.max(MIN_GAP, FIRST_GAP * ACCEL ** Math.max(0, spawned - 1)));
}

function scheduleSpawn(seconds) {
    clearTimeout(spawnTimer);
    spawnTimer = setTimeout(spawn, seconds * 1000);
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
    const had = news.length;
    news = news.filter((n) => {
        n.y -= dy;
        if (n.y + n.h < 0) {
            n.el.remove();
            return false;
        }
        place(n);
        return true;
    });
    if (had && !news.length) { // pantalla limpia: fondo nuevo y paran las noticias hasta que el neko se duerma (ver Neko)
        spawned = 0;
        clearTimeout(spawnTimer);
        premio = true;
        thoughtEl.textContent = nextPensamiento() ?? '';
        bubble.classList.add('hidden'); // la ayuda no se monta encima del pensamiento
        cambiarFondo();
    }
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
// Modos: 'intro' quieto en el centro hablando · 'run' corre a su esquina · 'free' reacciona al scroll.
// En 'free' el sprite depende de cuánto hace que paraste de hacer scroll (idle):
//   normal: corre (mientras haces scroll) -> despierto -> bosteza -> duerme
//   premio: corre -> se rasca con el pensamiento encima -> bosteza -> duerme y vuelven las noticias
const RUN_MS = 150;           // sigue corriendo un poco tras el último scroll (llega a saltos)
const AWAKE_MS = 4000;        // despierto antes de bostezar
const YAWN_MS = 1500;         // lo que dura un bostezo
let nekoMode = 'intro';
let tick = 0;                 // sube cada 120 ms: marca el paso de las animaciones

// precarga, para que no parpadee al cambiar de sprite
['Awake', 'Down1', 'down2', 'scratch1', 'scratch2', 'yawn2', 'yawn3', 'sleep1', 'sleep2']
    .forEach((s) => { new Image().src = `neko/${s}.ico`; });

// alterna dos fotogramas, cambiando cada `cada` ticks
const anda = (a, b, cada = 1) => (Math.floor(tick / cada) % 2 ? a : b);
// bostezo en tres tiempos: cierra los ojos, abre la boca, cierra los ojos (ms = tiempo dentro del bostezo)
const bostezo = (ms) => (ms > YAWN_MS / 3 && ms < YAWN_MS * 2 / 3 ? 'yawn3' : 'yawn2');

function nekoSprite(idle) {
    const yawnAt = THOUGHT_SECONDS * 1000 - YAWN_MS; // en el premio, el bostezo cierra el pensamiento
    if (nekoMode === 'intro') return 'Awake';
    if (nekoMode === 'run' || idle < RUN_MS) return anda('Down1', 'down2');
    if (premio) return idle < yawnAt ? anda('scratch1', 'scratch2') : bostezo(idle - yawnAt);
    if (idle < AWAKE_MS) return 'Awake';
    if (idle < AWAKE_MS + YAWN_MS) return bostezo(idle - AWAKE_MS);
    return anda('sleep1', 'sleep2', 5);
}

setInterval(() => {
    tick++;
    const idle = performance.now() - lastScroll;
    if (premio && idle >= THOUGHT_SECONDS * 1000) { // se ha dormido: fin de la calma, vuelven las noticias
        premio = false;
        scheduleSpawn(0);
    }
    thoughtEl.classList.toggle('hidden', !(premio && idle >= RUN_MS && thoughtEl.textContent));
    const s = nekoSprite(idle);
    if (nekoEl.dataset.s !== s) {
        nekoEl.dataset.s = s;
        nekoEl.src = `neko/${s}.ico`;
    }
}, 120);

// El neko explica, se calla y corre a su esquina. Tocarlo (o al bocadillo) se salta la explicación
async function nekoIntro() {
    $('msg-hola').hidden = true;
    $('msg-instrucciones').hidden = false;
    nekoBox.style.pointerEvents = 'auto';
    await Promise.race([wait(INTRO_SECONDS), new Promise((r) => nekoBox.addEventListener('click', r, { once: true }))]);
    nekoBox.style.pointerEvents = '';
    bubble.classList.add('hidden');
    nekoMode = 'run';
    nekoBox.style.transition = `transform ${RUN_SECONDS}s ease-in-out`;
    nekoBox.classList.remove('intro');
    await wait(RUN_SECONDS);
    nekoMode = 'free';
    lastScroll = performance.now() - AWAKE_MS; // llega cansado: bosteza enseguida y se duerme
}

// En su esquina: tocarlo lo despierta y recuerda cómo navegar (no interrumpe su rato de calma)
let helpTimer;
nekoEl.addEventListener('click', () => {
    if (nekoMode !== 'free' || premio) return;
    lastScroll = performance.now() - RUN_MS; // despierto, sin pasar por la animación de correr
    $('msg-instrucciones').hidden = true;
    $('msg-ayuda').hidden = false;
    bubble.classList.remove('hidden');
    clearTimeout(helpTimer);
    helpTimer = setTimeout(() => bubble.classList.add('hidden'), HELP_SECONDS * 1000);
});

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
    // las listas se cargan mientras habla el neko
    const loading = Promise.all([
        loadList(API_URL, FALLBACK_URL).then((l) => { nextTitular = baraja(l); }),
        loadList(PENSAMIENTOS_URL).then((l) => { nextPensamiento = baraja(l); })
    ]);
    await nekoIntro();
    await loading;
    scheduleSpawn(CALM_SECONDS);
}, { once: true });
