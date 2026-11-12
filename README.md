# Valdemar y sus portales

Rol y acción isométrica en el navegador (Canvas 2D + JavaScript), con inicio de sesión, partida guardada y récords en Firebase. Se desarrolla y compila con [Vite](https://vite.dev).

## Comandos
    npm install       # una vez
    npm run dev       # servidor de desarrollo con recarga automática (http://localhost:5173)
    npm run build     # versión optimizada para publicar, en dist/
    npm run preview   # probar dist/ en local

## Estructura
```
index.html            marcado del juego (HUD, menús, paneles)
public/               imágenes que se sirven tal cual (personajes, dragón, logo)
src/
  main.js             punto de entrada: estilos + juego + Firebase
  estilos.css         todos los estilos
  orden.json          orden en que se unen los archivos del juego
  motor/nucleo.js     constantes, lienzos, tamaño de pantalla, azar y utilidades
  datos/              temas (paletas), clases y atributos, atlas de sprites, tipos de enemigo
  objetos/objetos.js  generación de objetos, afijos y estadísticas
  render/             tileset, decorado, iconos, personajes y el dibujado de cada fotograma
  mundo/              generación de niveles, colisiones y línea de visión
  juego/              estado, acciones, entrada (teclado/táctil), actualización y bucle;
                      jefe.js: arena y Dragón tricéfalo (cada 10 profundidades)
  ui/                 HUD, inspector, menús/cuenta/récords, equipo y selección de clase
  servicios/          guardado (Firebase o navegador) y sonido
  arranque.js         arranque del juego
  firebase.js         conexión con Firebase (la configuración web es pública; la seguridad la ponen las reglas)
firestore.rules, firestore.indexes.json, firebase.json, .firebaserc   configuración de Firebase
netlify.toml, vercel.json   publicación (compilan con `npm run build` y publican `dist/`)
```

## Cómo están unidos los archivos (fase 1)
Los archivos de `src/` (salvo `main.js` y `firebase.js`) comparten las mismas variables globales del juego (`P`, `G`, `state`, `cam`…), igual que cuando todo estaba en un solo HTML. Un pequeño plugin en `vite.config.js` los une en un solo módulo siguiendo `src/orden.json`, con mapas de código para que los errores del navegador muestren el archivo y la línea reales.

- Para añadir un archivo nuevo, créalo en `src/` y agrégalo a `src/orden.json` en el lugar que le corresponda (después de lo que use al cargarse).
- El siguiente paso (fase 2) sería convertirlos en módulos con `import`/`export` reales y, si hace falta rendimiento, pasar el dibujado a WebGL con PixiJS.

## Probar el jefe en desarrollo
Con `npm run dev`, en la consola del navegador: `__dev.ir(10)` te lleva a la arena del dragón (solo existe en desarrollo, no en la versión publicada).
