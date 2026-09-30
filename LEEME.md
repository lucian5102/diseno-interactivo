# Boceto / Texto final — Lucian

Página estática en HTML/CSS/JS, lista para GitHub Pages. Abrí `index.html` directamente o serví esta carpeta con `python3 -m http.server 8873 --bind 127.0.0.1`.

## Publicar en GitHub Pages

Necesitás Git y [GitHub CLI](https://cli.github.com/). Desde esta carpeta:

```sh
gh auth login
bash publicar.sh diseno-interactivo
```

El script crea **un repositorio público** en tu cuenta, sube los archivos, activa Pages desde `main` y muestra el enlace real devuelto por GitHub. La primera publicación puede tardar unos minutos. Si ese nombre ya existe, elegí otro:

```sh
bash publicar.sh mi-recorrido
```

No ejecutes de nuevo `publicar.sh` para actualizar una publicación. Después de editar archivos en la misma carpeta ya publicada:

```sh
git add index.html styles.css app.js content.js media.js assets
git commit -m "Actualizar recorrido"
git push
```

Para consultar el enlace y estado:

```sh
gh api 'repos/{owner}/{repo}/pages' --jq '{url: .html_url, estado: .status}'
```

Documentación de referencia: https://docs.github.com/en/rest/pages/pages . El script fue validado sintácticamente; no se ejecutó la publicación desde el chat.

## Interacciones

- Hover abre; clic/toque fija el panel y permite iniciar el video. Enter/Espacio también lo activa. Escape o × cierran y detienen el video.
- En móvil los paneles se colocan debajo de la hoja. En escritorio quedan a un lado, unidos por cuatro líneas.
- El primer manuscrito empieza en “Auditando reglas de DataViz”. El recorte es visual mediante CSS; la foto original permanece intacta.
- “Boceto / Texto final” realiza un deslizamiento horizontal de aproximadamente un segundo: hacia la derecha al pasar al texto y hacia la izquierda al volver al boceto. La preferencia de movimiento reducido del sistema evita esa animación.
- El modo digital no tiene numeración lateral ni inicial capitular. Jev se subraya sólo en su primera aparición digital.
- La cita de frame analysis mantiene exactamente el texto anterior, con aparición letra por letra. Los marcos, los bloques y los tres rumbos conservan sus animaciones.
- La bolita de progreso recorre sólo la línea situada debajo de “MAS RECIENTE”.

## Texto y recursos

`content.js` conserva fielmente el PDF más reciente aportado desde Downloads: 9.798 caracteres con espacios normalizados. La transcripción completa se incluye en `assets/texto-final.txt`. Los tres primeros párrafos, sin equivalente manuscrito, aparecen sólo en modo digital.

- **Jev**: `assets/jev-launch.mp4`, lanzamiento de TypeSafe, 176 segundos, 720p, video H.264 y audio AAC. Se guardó desde la URL de reproducción suministrada en el HTML del reproductor de Vimeo. No usa un blob ni una URL temporal para reproducirse. Sonido habilitado; el clic inicia reproducción. El navegador puede requerir pulsar Play si la apertura fue sólo por hover.
- **VR glasses**: `assets/vr-glasses.mp4`, archivo aportado en la carpeta Diseño Interactivo, 86 segundos. Siempre silenciado.
- **2da slide / segunda slide**: `assets/segunda-slide.png`, “El problema que identificamos”.
- **haptics**: `assets/haptics.png`, imagen de las ventanas y el teclado virtual aportada en el chat.
- **eye tracking**: `assets/eye-tracking.png`, imagen “Look to navigate” aportada en el chat.
- **afortunada**: `assets/afortunada.jpg`, foto del autor junto al auto naranja.
- **HCI** (una sola aparición interactiva en el texto final, en «haberle pegado» a esta visión sobre el futuro de la HCI): navegador embebido de la Wikipedia inglesa, https://en.wikipedia.org/wiki/Human%E2%80%93computer_interaction . Es una página real desplazable y requiere Internet; incluye enlace para abrirla aparte.
- **Muse**: video aportado, guardado localmente (10 segundos).

Los videos y las imágenes se incluyen en la carpeta para no depender de los enlaces temporales de las plataformas. El sitio no tiene bibliotecas ni necesita compilación. Todos los archivos individuales quedan por debajo de 100 MB.

Cita de Schön: “Frame analysis may help practitioners to become aware of their tacit frames […]”, *The Reflective Practitioner*, 1983, p. 311. Se conservan la cita y el enlace de la versión anterior. La misma frase figura en la lectura de Dan Saffer aportada por el autor.

## Editar

- `index.html`: estructura.
- `styles.css`: estilo, recortes visuales, transiciones y tamaños.
- `app.js`: hotspots, paneles, reproducción y animaciones.
- `content.js`: texto y coordenadas. Cada hotspot usa `[id,x,y,ancho,alto]` en porcentajes de la foto orientada verticalmente, antes del recorte CSS.
- `media.js`: recursos. Admite `video`, `image`, `link` y `null` para dejar un recurso pendiente. `muted: true` mantiene un video silenciado.

No se incorporaron textos editoriales al recorrido, excepto la breve indicación de interacción que pidió el autor y los controles mínimos.
