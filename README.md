# Valdemar y sus portales

Juego web en HTML + JavaScript (un solo archivo), con inicio de sesión, partida guardada y récords en Firebase.

## Estructura
- `criptas.html`: el juego completo (copia de trabajo)
- `sitio/`: carpeta que se publica (Netlify / Vercel); `sitio/index.html` es el juego
- `firebase.js`: conexión con Firebase (la configuración web es pública; la seguridad la ponen las reglas)
- `firestore.rules`, `firestore.indexes.json`, `firebase.json`, `.firebaserc`: configuración de Firebase
- `netlify.toml`: Netlify publica la carpeta `sitio`
- `*.png`, `logo.webp`: personajes y logo

## Jugar en local
Abre `sitio/index.html` con un servidor estático, por ejemplo:

    npx serve sitio
