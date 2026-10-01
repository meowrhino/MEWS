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

## Créditos

- Visualizador: [Butterchurn](https://github.com/jberg/butterchurn) (MIT), presets MilkDrop del pack base.
- Neko: sprites de [Neko98](https://github.com/leiqunni/Neko98), Neko original de Masayuki Koba, versión para Windows de David Harvey.
