// AJUSTES de MEWS!: todo lo que se puede tocar sin miedo.
// Cambia un número, guarda y recarga la página. El código que los usa está en main.js.

// ----- Ritmo (en segundos) -----
// toca -> INTRO -> RUN -> CALM -> 1ª noticia -> FIRST_GAP -> 2ª -> FIRST_GAP·ACCEL -> 3ª -> ...
const INTRO_SECONDS = 7;      // lo que el neko tarda en explicar antes de irse
const RUN_SECONDS = 1.6;      // lo que tarda en correr del centro a su esquina
const CALM_SECONDS = 3;       // calma desde que llega a su esquina hasta la 1ª noticia
const FIRST_GAP = 2;          // segundos entre la 1ª y la 2ª noticia
const ACCEL = 0.8;            // aceleración: cada hueco dura esto × el anterior
                              // 0.88 = un 12% más corto · 1 = sin aceleración · 0.8 = acelera más
const MIN_GAP = 0.6;          // el hueco nunca baja de aquí

// ----- Fondo y música -----
const MAX_NEWS = 25;          // con esta cantidad el velo es negro total y la música calla
const BASE_DIM = 0.35;        // oscuridad del fondo sin noticias (los presets son muy brillantes)
const MUSIC_VOLUME = 0.6;
const PRESET_SECONDS = 25;    // cada cuánto cambia de fondo
const BLEND_SECONDS = 4;      // fundido entre presets

// ----- Noticias -----
// Cuando exista la API del compañero: poner su URL aquí y ajustar el campo en textoDe()
const API_URL = '';
const FALLBACK_URL = 'noticias.json';
const textoDe = (n) => (typeof n === 'string' ? n : n?.titulo ?? n?.title);

// ----- La calma cuando apartas todas las noticias -----
// paras de hacer scroll -> el neko se rasca con el pensamiento encima -> bosteza -> se duerme
// y vuelve la 1ª noticia
const PENSAMIENTOS_URL = 'pensamientos.json'; // lo que piensa (mismo formato que noticias.json)
const THOUGHT_SECONDS = 6;    // lo que dura el pensamiento (rascarse + el bostezo final de 1,5 s)

// ----- Tocar al neko en su esquina -----
const HELP_SECONDS = 4;       // lo que dura el bocadillo de ayuda (el texto está en index.html, #msg-ayuda)
