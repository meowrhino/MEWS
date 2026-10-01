# monicas

Prototipo web móvil (se abre desde un QR). Fondo generativo tranquilo + música binaural generada en el navegador. Las noticias van llenando la pantalla, cada vez más rápido, y tapan el fondo y la música. Haciendo scroll hacia abajo las empujas fuera de la pantalla y vuelve la calma.

## Probar en local

```bash
python3 -m http.server 8765
```

Abrir http://localhost:8765 y tocar la pantalla (el audio necesita un toque en móvil). Con auriculares, mejor.

## Conectar la API

En `main.js`:

- `API_URL`: la URL del endpoint. Si está vacía o falla, se usa `noticias.json`.
- `textoDe()`: de qué campo sale el texto de cada noticia (ahora acepta `titulo` o `title`).

La API tiene que devolver un array JSON y permitir CORS desde el dominio de la web.

## Ajustes rápidos (`main.js`, arriba del todo)

- `MAX_NEWS`: cuántas noticias hacen falta para que la pantalla quede negra.
- `MUSIC_VOLUME`, `PRESETS`, `PRESET_SECONDS`.
- Ritmo de aparición: `spawn()`, `Math.max(600, 6000 * 0.88 ** spawned)`.

## QR

- `qr/qr-gato.svg` y `qr/qr-neko.svg`: QR listos para imprimir, con un dibujo pixel art en el centro.
- Hacedor visual: abrir `/qr/` (https://meowrhino.github.io/monicas_1/qr/). Puedes cambiar la URL, los colores y editar el dibujo. Te dice si el QR se sigue leyendo y lo descarga en PNG o SVG.
- Para regenerar los SVG desde la terminal (comprueba que se leen antes de guardarlos):

```bash
node qr/qr.js
```

Los dibujos están en `DIBUJOS`, en `qr/qr.js`. Usa `.` para blanco, `#` para tinta, `o` para el color y `p` para rosa.

## Créditos

- Visualizador: [Butterchurn](https://github.com/jberg/butterchurn) (MIT), presets MilkDrop del pack base.
- QR: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT) y [jsQR](https://github.com/cozmo/jsQR) (Apache 2.0) para comprobar la lectura.
- Neko: sprites de [Neko98](https://github.com/leiqunni/Neko98), Neko original de Masayuki Koba, versión para Windows de David Harvey.
