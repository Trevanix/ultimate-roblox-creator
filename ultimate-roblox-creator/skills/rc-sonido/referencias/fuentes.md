# Fuentes de rc-sonido (leídas el 2026-11-18)

Solo se leyeron páginas; no se instaló ni ejecutó nada. Las páginas de Roblox no muestran fecha de
actualización: la fecha es la de lectura. Si ha pasado tiempo, vuelve a mirarlas antes de afirmar nada.

## Roblox
- https://create.roblox.com/docs/audio/assets — requisitos para subir (derechos, formatos, < 20 MB,
  < 7 min, ≤ 48 kHz, canales), cupo de 2 000 / 100 audios cada 30 días según verificación con documento,
  moderación, privacidad y permisos, Creator Store (> 100 000 efectos y temas), canciones en la página
  del juego.
- https://create.roblox.com/docs/audio/objects — `Sound`, `SoundGroup` y `SoundEffect` desaconsejados en
  favor de los objetos de audio; montaje 2D y 3D con `Wire`; `SoundService.ListenerLocation`.
- https://create.roblox.com/docs/audio — lista de objetos de audio y efectos.
- https://create.roblox.com/docs/reference/engine/classes/AudioPlayer — `Asset` (el `AssetId` viejo está
  obsoleto), `PlaybackSpeed`, `Volume`, `Looping`, `IsReady`, `Play`, `Ended`.
- https://create.roblox.com/docs/reference/engine/classes/AudioFader — `Volume`, `Bypass`.
- https://create.roblox.com/docs/reference/engine/classes/Wire — `SourceInstance`, `TargetInstance`.
- https://create.roblox.com/docs/reference/engine/classes/AudioDeviceOutput
- https://create.roblox.com/docs/reference/engine/classes/AudioEmitter y .../AudioListener
- https://create.roblox.com/docs/reference/engine/classes/Sound — `Pitch` obsoleto; `PlaybackSpeed`.

## Openverse
- https://api.openverse.org/v1/schema/ — `GET /v1/audio/`; `license` (by, by-nc, by-nc-nd, by-nc-sa,
  by-nd, by-sa, cc0, nc-sampling+, pdm, sampling+); `license_type` (all, all-cc, commercial,
  modification); `category`, `length`, `source` (de `/v1/audio/stats/`); tope de 10 000 resultados;
  registro `POST /v1/auth_tokens/register/` (nombre, descripción, correo; verificar el correo para subir
  límites) y token `client_credentials` en `/v1/auth_tokens/token/` (dura 36 000 s); `GET /v1/rate_limit/`.
- https://docs.openverse.org/api/reference/authentication_and_throttling.html — niveles de límite
  (sin cuenta, standard al autenticarse, enhanced a petición). **Las cifras no aparecen** en lo leído.

## Herramientas (código de terceros: nada instalado)
- https://github.com/Leonxlnx/earshot — MIT (código); modelos CLAP (Apache-2.0) y AST (BSD-3-Clause);
  uv + ffmpeg/ffprobe, solo CPU, ~1,1 GB de modelos; banco de 252 sonidos sin red; servidor MCP;
  opción `llm` que sube audio a Gemini con clave propia y consentimiento.
- https://github.com/Clipwing/skills y .../skills/real-sfx/README.md — Real SFX pone sonido a vídeos
  con tu propia biblioteca; scripts MIT; paquete `uisfx` de 78 sonidos de interfaz (código MIT, sonidos
  CC0); Python 3.9+ y FFmpeg; Node.js solo para el paquete de interfaz.

## Método
- awesome-gamedev-agent-skills (Apache-2.0), skill audio-design: grupos de sonido, bajar la música con
  voz o avisos, variación ±1 semitono ±2 dB. Escrito de nuevo con nuestras palabras (ver `NOTICE`).
