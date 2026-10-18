PROTOTIPO DE IA PERSONAL - PRIMERA FASE

Qué incluye:
- Interfaz adaptable a Android.
- Nombre y personalidad editables.
- Historial guardado en localStorage.
- Exportación y borrado de los datos locales.
- Manifiesto PWA y service worker para cachear la interfaz.

IMPORTANTE:
Este prototipo TODAVÍA NO incluye un modelo de lenguaje. No puede generar respuestas reales sin conectar un motor local. El chat avisa de esta limitación para no fingir que funciona como IA.

Para que una PWA se instale y use service workers normalmente debe servirse por HTTPS (o localhost). Abrir index.html directamente desde un archivo puede no activar la instalación ni el modo offline.
El siguiente paso de desarrollo es servir esta carpeta por HTTPS, comprobar la instalación y luego integrar WebLLM como módulo empaquetado junto con el modelo. No basta con cargar una CDN si se requiere funcionamiento sin internet desde el primer arranque offline.
