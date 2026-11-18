# Método de trabajo

Cómo se trabaja con una persona que crea su juego, aunque no sepa programar. Sale de semanas de trabajo
real en un juego publicado.

## Quién hace qué
- **La persona:** tiene la idea, decide el diseño, el balance (precios, recompensas, dificultad,
  probabilidades) y cuándo publicar. Guarda los respaldos. Valida lo entregado.
- **Claude:** escribe el código, prueba, revisa, explica y documenta. Es el único que toca el código.
  Si la persona no sabe exportar, comparar archivos o preparar un respaldo, Claude se lo prepara y le dice
  exactamente qué pulsar.
- **Revisor independiente:** otro agente de solo lectura que revisa cada fase con ojos nuevos.

## Hablar con la persona
- Su idioma. Palabras sencillas. Una idea por frase.
- **Una sola acción cada vez**: «Pulsa **Archivo → Guardar en archivo como…** (File → Save to File As…) y
  ponle el nombre `MiJuego_ANTES_GUARDADO_2026-01-20`». No cinco pasos juntos.
- Si Studio está en inglés, di el nombre del menú en los dos idiomas (Salida = Output, Barra de comandos =
  Command Bar).
- Si lee desde el móvil: mensajes cortos, sin tablas anchas, la pregunta al final.
- Cierra cada mensaje con: qué se hizo · qué no se comprobó · la pregunta con sus opciones.
- Nunca escribas «VALIDADO» por tu cuenta. Usa «hecho y probado, pendiente de tu revisión».

## Decisiones numeradas con recomendación
Cada propuesta de diseño:
```
D1. Cómo se guarda el progreso
  A (recomendada): guardar al salir y cada 2 minutos. Por qué: si se cae el servidor pierdes 2 min como mucho.
  B: guardar solo al salir. Más simple, pero si el servidor se cae se pierde la sesión.
  Coste: A = media fase; B = nada extra.
```
- 2 o 3 opciones, una recomendada, el porqué en una frase, y lo que cuesta.
- La persona responde «sí a todo», «D2 la B», o lo cambia. Apunta lo decidido, con fecha, en `CLAUDE.md`.
- Si dice «sí, apruebo todo», no vuelvas a preguntar lo ya aprobado; pregunta solo lo nuevo.

## Fases pequeñas
- **Un objetivo por fase.** «Guardado del progreso», no «guardado, tienda y tutorial».
- Orden que suele funcionar: bucle principal jugable (aunque sea feo) → guardado → interfaz básica →
  contenido (mapa, niveles) → pulido y dispositivos → ventas → publicación.
- Lo caro de cambiar va pronto: qué se guarda y cómo, qué decide el servidor.
- No amplíes el alcance sin permiso: si ves algo más que arreglar, apúntalo como «para después».

## Flujo de una fase
1. Plan breve (qué, dónde, pruebas, si hace falta respaldo). «Sí» de la persona si cambia diseño o balance.
2. Comprueba que Studio está igual a como lo dejaste (si guardas copia del código en archivos, compáralos).
3. Respaldo de la persona si la fase toca datos, esquema o mucho del lugar. Espera a que confirme.
4. Escribe el código. Lógica en módulos puros; scripts finos que solo conectan.
5. Pruebas nuevas para cada comportamiento nuevo + batería entera.
6. Revisión independiente. Corrige lo razonable; lo que no apliques, dilo y por qué.
7. Prueba en Play. Di lo que no pudiste mirar (teléfono real, mando real, varios jugadores, compras reales).
8. Informe de la fase (`plantillas/informe-de-fase.md`) y `CLAUDE.md` al día.
9. Espera la revisión de la persona.

## Respaldos
- Antes de: cambiar el esquema de datos, migraciones, tocar el guardado, cambios grandes del mapa, pruebas
  con datos reales.
- Nombre claro: `<Juego>_<FASE>_<ESTADO>_<AAAA-MM-DD>.rbxl` (p. ej. `MiJuego_ANTES_TIENDA_2026-01-20.rbxl`).
- Lo guarda la persona (Archivo → Guardar en archivo como…). Claude espera su «respaldo hecho».

## Piezas protegidas
En `CLAUDE.md` apunta qué no se toca sin permiso expreso: el servicio de datos, el esquema, el arranque
del servidor, las compras. Así ninguna sesión futura los cambia «de paso».

## Sesiones largas
- Cada dos fases cerradas, propone abrir una sesión nueva y da la frase de inicio para pegar:
  «Lee CLAUDE.md, comprueba que Studio está igual al último guardado y dime en qué punto estamos.»
- **Nunca dos sesiones a la vez sobre el mismo Studio o la misma carpeta**: se pisan los cambios.
- El `CLAUDE.md` del proyecto es la memoria: estado, decisiones con fecha, protegidos, cómo probar.

## Copia del código fuera de Studio (recomendado)
Si se puede, guarda una copia del código en archivos (con git local) y una forma de comparar Studio con
esos archivos. Permite ver qué cambió, volver atrás y revisar. Herramientas posibles: Rojo, o un script que
exporte e inyecte por el MCP. Si la persona no quiere herramientas, al menos guarda los scripts en texto
al cerrar cada fase.
