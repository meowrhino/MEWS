// AJUSTES de MEWS!: todo lo que se puede tocar sin miedo.
// Cambia un número, guarda y recarga la página. El código que los usa está en main.js.

// ----- Ritmo (en segundos) -----
// toca -> (2 clics del neko) -> RUN -> CALM -> 1ª noticia -> GAPS[0] -> 2ª -> GAPS[1] -> 3ª -> ...
const RUN_SECONDS = 1.6;      // lo que tarda en correr del centro a su esquina
const CALM_SECONDS = 8;       // calma desde que vuelve a su esquina hasta la 1ª noticia
// segundos entre una noticia y la siguiente: el 1º es de la 1ª a la 2ª, y así;
// a partir del último se repite siempre ese
const GAPS = [3.5, 1.6, 1.2, 1, 0.9, 0.8, 0.75, 0.7, 0.65, 0.6];

// ----- Fondo y música -----
const MAX_NEWS = 25;          // con esta cantidad el velo es negro total y la música calla
const BASE_DIM = 0.35;        // oscuridad del fondo sin noticias (los presets son muy brillantes)
const MUSIC_VOLUME = 0.6;
const BLEND_SECONDS = 4;      // fundido entre presets (el fondo cambia al limpiar la pantalla de noticias)
const MAX_VEIL = 0.97;        // opacidad del velo con MAX_NEWS noticias (no llega a 1 para que el fondo asome)
const VOLUME_CURVE = 1.5;     // cómo cae la música con el velo: 1 = lineal, más alto = calla antes

// ----- Noticias -----
// Array JSON de textos o de objetos con `title`; el title puede ir en tres idiomas
// { "es", "ca", "en" } y cada vez que sale una noticia se elige uno al azar
const NOTICIAS_URL = 'noticias.json';
const NEWS_AREA = 0.85;       // las noticias salen en el 85% de arriba de la pantalla
const NEWS_DRIFT = 0.3;       // y se desplazan a los lados hasta ±15% del ancho (este valor es el total)
const textoDe = (n) => (typeof n === 'string' ? n : n?.title ?? n?.titulo);

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
