ELYR — PROTOTIPO CON MOTOR LOCAL (FASE EXPERIMENTAL)

Archivos:
- index.html, style.css: interfaz
- app.js: identidad, historial local y conexión WebLLM
- manifest.webmanifest, sw.js: base PWA

USO:
1. Sube/reemplaza estos archivos en la raíz del repositorio de GitHub Pages.
2. Abre la página publicada con conexión a internet.
3. Pulsa "Cargar cerebro de Elyr" y espera a que termine. La primera descarga puede ser grande y tardar; mantén la pestaña abierta y el teléfono conectado a corriente si es posible.
4. Después prueba con un mensaje sencillo.

MODELO:
Qwen2.5-1.5B-Instruct-q4f16_1-MLC mediante @mlc-ai/web-llm desde esm.run. Requiere WebGPU compatible y suficiente RAM/espacio. Android/Brave puede no ser compatible en algunos dispositivos; si falla, copia el mensaje exacto de error.

PRIVACIDAD:
El historial se guarda en localStorage de este navegador. La descarga del motor se sirve desde una CDN y el modelo se descarga de infraestructura de WebLLM. No se envían intencionalmente los mensajes a una API de chat remota por este código, pero la página necesita internet para cargar la biblioteca y obtener el modelo. No guardes secretos ni datos sensibles.

LIMITACIONES IMPORTANTES:
- Esta es una integración inicial/experimental, no una APK.
- No se puede garantizar que funcione offline tras la primera descarga: la biblioteca de JavaScript se carga desde CDN y el navegador puede eliminar datos almacenados.
- La memoria actualmente es historial de chat; el campo memories existe para una futura función de recuerdos explícitos, todavía no hay extracción automática de recuerdos.
- Si aparece error de WebGPU o del modelo, no cambies configuración al azar: envía el texto exacto del error.
