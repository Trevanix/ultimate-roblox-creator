# Trabajar con o sin el MCP de Roblox Studio

## Cómo saber si está
Mira tus herramientas. Si hay algunas como `list_roblox_studios`, `execute_luau`, `script_read`,
`script_search`, `multi_edit`, `start_stop_play`, `get_console_output`, `screen_capture`, `inspect_instance`,
está el MCP de Studio. Los nombres pueden cambiar según la versión: usa los que veas.

## Con el MCP
- Lista los Studios abiertos y elige el correcto (el id cambia si Studio se reinicia).
- Lee antes de escribir: árbol del juego, scripts que vas a tocar.
- Cambios de código en **Edit** (no en Play). Si la persona está jugando, pregúntale antes de parar.
- Prueba: batería en Edit, luego Play con `start_stop_play`, consola y capturas.
- **Nunca publiques el lugar** con el MCP, aunque haya una herramienta para ello: publica siempre la
  persona. **Guardar**, solo si te lo pide para esa vez concreta.
- No insertes modelos de la Caja de herramientas; si hay herramientas para generar mallas o materiales,
  úsalas para piezas originales y apúntalo, pero **pide permiso antes de cada generación o subida** y di
  qué se creará en su cuenta.
- Si hay herramientas de Open Cloud, cada acción en Roblox (nombres, iconos, productos) con permiso.

## Sin el MCP
- Da el código entero listo para pegar, en bloques cortos, y para cada uno di:
  1. **Dónde** va: servicio y carpeta (p. ej. `ServerScriptService > Services`).
  2. **Qué tipo** de script: `Script`, `LocalScript` o `ModuleScript`, y su nombre exacto.
  3. **Qué ver** al probar: «Pulsa Play. En la ventana Salida debe salir `Guardado OK`».
- Pide que te pegue lo que sale en la ventana **Salida** si hay errores.
- Para la batería: dale una línea para la barra de comandos (Ver → Barra de comandos) y que te pegue el
  resultado.
- Mantén tú una copia de todo el código en archivos de la carpeta del proyecto, para que la siguiente
  sesión sepa qué hay.

## En los dos casos
- El `CLAUDE.md` del proyecto dice cómo se conecta, cómo se prueba y qué está protegido.
- Si se usa Rojo u otra herramienta de sincronización, apúntalo y no mezcles: o se edita en archivos, o en
  Studio, no las dos cosas a la vez.
