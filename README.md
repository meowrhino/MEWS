# MEWS!

Prototipo web móvil (se abre desde un QR). Fondo generativo + música binaural generada en el navegador. Las noticias van llenando la pantalla, cada vez más rápido, y tapan el fondo y la música. Haciendo scroll hacia abajo las empujas fuera de la pantalla y vuelve la calma.

## Probar en local

```bash
python3 -m http.server 8765
```

Abrir http://localhost:8765 y tocar la pantalla (el audio necesita un toque en móvil). Con auriculares, mejor.

## Conectar la API

En `config.js`:

- `API_URL`: la URL del endpoint. Si está vacía o falla, se usa `noticias.json`.
- `textoDe()`: de qué campo sale el texto de cada noticia (ahora acepta `titulo` o `title`).

La API tiene que devolver un array JSON y permitir CORS desde el dominio de la web.

## Ajustes rápidos (`config.js`)

- `MAX_NEWS`: cuántas noticias hacen falta para que la pantalla quede negra.
- `MUSIC_VOLUME`, `PRESET_SECONDS`.
- Ritmo: `INTRO_SECONDS`, `RUN_SECONDS`, `CALM_SECONDS`, `FIRST_GAP`, `ACCEL`, `MIN_GAP`.
- Textos del neko: en `index.html`, dentro de `#bubble`.
- Fondos: salen al azar de todo el pack base de Butterchurn (sin repetir seguido) y cambian cada `PRESET_SECONDS` y al apartar todas las noticias.
- «sobre MEWS!» (abajo a la derecha): descripción y créditos, en `index.html` dentro de `#about`.
- Pensamientos del neko: `pensamientos.json`, mismo formato que `noticias.json`. Al apartar todas las noticias el neko se rasca con el pensamiento encima y bosteza (todo dentro de `THOUGHT_SECONDS`), se duerme y vuelven las noticias.
- `neko/` tiene todos los sprites de Neko98 (correr en 8 direcciones, arañar paredes `*claw*`, lavarse `wash2`, huellas `fp_*`…), aunque no se usen todos.
- Tocar al neko en su esquina: bocadillo de ayuda (`#msg-ayuda` en `index.html`, `HELP_SECONDS`).

## QR

- `qr/qr-gato.svg` y `qr/qr-neko.svg`: QR listos para imprimir, con un dibujo pixel art en el centro.
- Hacedor visual: abrir `/qr/` (https://meowrhino.github.io/monicas_1/qr/). Puedes cambiar la URL, los colores y editar el dibujo. Te dice si el QR se sigue leyendo y lo descarga en PNG o SVG.
- Para regenerar los SVG desde la terminal (comprueba que se leen antes de guardarlos):

```bash
node qr/qr.js
```

Los dibujos están en `DIBUJOS`, en `qr/qr.js`. Usa `.` para blanco, `#` para tinta, `o` para el color y `p` para rosa.

## Créditos

- Visualizador: [Butterchurn](https://github.com/jberg/butterchurn) de Jordan Berg (MIT), versión web de MilkDrop de Ryan Geiss. Presets de [butterchurn-presets](https://github.com/jberg/butterchurn-presets) (MIT), cada uno de su autor. Las licencias van en `vendor/butterchurn*/LICENSE`.
- QR: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT) y [jsQR](https://github.com/cozmo/jsQR) (Apache 2.0) para comprobar la lectura.
- Neko: sprites de [Neko98](https://github.com/leiqunni/Neko98), Neko original de Masayuki Koba, versión para Windows de David Harvey.
