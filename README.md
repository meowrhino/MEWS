# MEWS!

Prototipo web móvil (se abre desde un QR). Fondo generativo + música binaural generada en el navegador. Las noticias van llenando la pantalla, cada vez más rápido, y tapan el fondo y la música. Haciendo scroll hacia abajo las empujas fuera de la pantalla y vuelve la calma.

## Probar en local

```bash
python3 -m http.server 8765
```

Abrir http://localhost:8765 y tocar la pantalla (el audio necesita un toque en móvil). Con auriculares, mejor.

## Noticias

Salen de `noticias.json` (`NOTICIAS_URL` en `config.js`): un array de textos, o de objetos con `titulo`/`title` (`textoDe()` decide el campo).

## Ajustes rápidos (`config.js`)

- `MAX_NEWS`: cuántas noticias hacen falta para que la pantalla quede negra.
- `MUSIC_VOLUME`, `BLEND_SECONDS`.
- Ritmo: `INTRO_SECONDS`, `RUN_SECONDS`, `CALM_SECONDS`, `FIRST_GAP`, `ACCEL`, `MIN_GAP`.
- Textos del neko: en `index.html`, dentro de `#bubble`.
- Fondos: salen al azar de todo el pack base de Butterchurn (sin repetir seguido) y cambian solo al apartar todas las noticias (con «sobre MEWS!» abierto todo se pausa).
- «sobre MEWS!» (abajo a la derecha): el neko corre al centro y abre un bocadillo con la descripción y los créditos, en `index.html` dentro de `#about`. Otras versiones del texto en `textos.txt`.
- Pensamientos del neko: `pensamientos.json`, mismo formato que `noticias.json`. Al apartar todas las noticias el neko se rasca con el pensamiento encima y bosteza (todo dentro de `THOUGHT_SECONDS`), se duerme y vuelven las noticias.
- `neko/` tiene todos los sprites de Neko98 (correr en 8 direcciones, arañar paredes `*claw*`, lavarse `wash2`, huellas `fp_*`…), aunque no se usen todos.
- Tocar al neko en su esquina: bocadillo de ayuda (`#msg-ayuda` en `index.html`, `HELP_SECONDS`).


## QR

- `qr/qr-neko.svg`: QR listo para imprimir, con la cabeza del neko (`neko/Awake.ico`) en el centro. Se ve en `/qr/` (https://meowrhino.github.io/MEWS/qr/).
- Para regenerarlo (comprueba que se lee antes de guardarlo):

```bash
node qr/qr.js
```

La URL está en `QR_URL` y el recorte de la cabeza en `CABEZA`, en `qr/qr.js`.

## Créditos

- Visualizador: [Butterchurn](https://github.com/jberg/butterchurn) de Jordan Berg (MIT), versión web de MilkDrop de Ryan Geiss. Presets de [butterchurn-presets](https://github.com/jberg/butterchurn-presets) (MIT), cada uno de su autor. Las licencias van en `vendor/butterchurn*/LICENSE`.
- QR: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT) y [jsQR](https://github.com/cozmo/jsQR) (Apache 2.0) para comprobar la lectura.
- Neko: sprites de [Neko98](https://github.com/leiqunni/Neko98), Neko original de Masayuki Koba, versión para Windows de David Harvey.
