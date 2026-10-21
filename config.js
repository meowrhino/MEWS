// AJUSTES de MEWS!: todo lo que se puede tocar sin miedo.
// Cambia un número, guarda y recarga la página. El código que los usa está en main.js.

// ----- Ritmo (en segundos) -----
// toca -> (2 clics del neko) -> RUN -> CALM -> 1ª noticia -> FIRST_GAP -> 2ª -> FIRST_GAP·ACCEL -> 3ª -> ...
const RUN_SECONDS = 1.6;      // lo que tarda en correr del centro a su esquina
const CALM_SECONDS = 10;      // calma desde que vuelve a su esquina hasta la 1ª noticia
const FIRST_GAP = 2;          // segundos entre la 1ª y la 2ª noticia
const ACCEL = 0.45;           // aceleración: cada hueco dura esto × el anterior
                              // 0.88 = un 12% más corto · 1 = sin aceleración · 0.8 = acelera más
const MIN_GAP = 0.6;          // el hueco nunca baja de aquí

// ----- Fondo y música -----
const MAX_NEWS = 25;          // con esta cantidad el velo es negro total y la música calla
const BASE_DIM = 0.35;        // oscuridad del fondo sin noticias (los presets son muy brillantes)
const MUSIC_VOLUME = 0.6;
const BLEND_SECONDS = 4;      // fundido entre presets (el fondo cambia al limpiar la pantalla de noticias)
const MAX_VEIL = 0.97;        // opacidad del velo con MAX_NEWS noticias (no llega a 1 para que el fondo asome)
const VOLUME_CURVE = 1.5;     // cómo cae la música con el velo: 1 = lineal, más alto = calla antes

// ----- Noticias -----
// Array JSON de textos o de objetos con `titulo`/`title` (ver textoDe)
const NOTICIAS_URL = 'noticias.json';
const NEWS_AREA = 0.85;       // las noticias salen en el 85% de arriba de la pantalla
const NEWS_DRIFT = 0.3;       // y se desplazan a los lados hasta ±15% del ancho (este valor es el total)
const textoDe = (n) => (typeof n === 'string' ? n : n?.titulo ?? n?.title);

// ----- Aviso «haz scroll» (fijo, aparece entre MAX_NEWS y HINT_FULL_NEWS noticias) -----
const HINT_FULL_NEWS = 40;    // con tantas noticias el aviso está a opacidad 1
const HINT_CURVE = 1.5;       // 1 = sube lineal · más alto = aparece más tarde y de golpe al final

// ----- La calma cuando apartas todas las noticias -----
// paras de hacer scroll -> el neko se rasca con el pensamiento encima -> bosteza -> se duerme
// y vuelve la 1ª noticia
const PENSAMIENTOS_URL = 'pensamientos.json'; // lo que piensa (mismo formato que noticias.json)
const THOUGHT_SECONDS = 6;    // lo que dura el pensamiento (rascarse + el bostezo final de 1,5 s)

// ----- Tocar al neko en su esquina -----
const HELP_SECONDS = 4;       // lo que dura el bocadillo de ayuda (el texto está en index.html, #msg-ayuda)

// ----- Neko (en milisegundos) -----
const RUN_MS = 150;           // sigue corriendo un poco tras el último scroll (llega a saltos)
const AWAKE_MS = 4000;        // despierto antes de bostezar
const YAWN_MS = 1500;         // lo que dura un bostezo
const FADE_SECONDS = 0.6;     // lo que tardan los bocadillos en aparecer o irse (igual que en style.css)
