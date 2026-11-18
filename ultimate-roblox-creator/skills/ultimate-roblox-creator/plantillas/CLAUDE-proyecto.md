# <Nombre del juego> — reglas de trabajo y estado

Cópialo como `CLAUDE.md` en la carpeta del proyecto nuevo. Se carga solo en cada sesión: es la memoria
del proyecto. Mantenlo corto: el estado de hoy arriba, la historia en los informes.

## Cómo trabajar con <la persona>
- Idioma: <…>. Palabras sencillas, una acción cada vez. Lee desde el móvil: <sí/no>.
- Ella decide diseño, balance, precios y cuándo publicar. Nada se marca VALIDADO sin su «sí».
- Claude nunca publica el lugar; solo lo guarda si ella se lo pide para esa vez.

## Reglas que no se rompen
- Protegidos (solo con permiso expreso, fase a fase): <DataService, Schema, arranque del servidor, ProcessReceipt…>
- Respaldo de la persona antes de tocar datos guardados, esquema o mucho del lugar.
- No cambiar balance (precios, premios, dificultad, probabilidades) sin aprobación.
- No escribir a mano en el DataStore. Almacén de prueba en Studio salvo prueba con datos reales autorizada.
- Nombres y arte originales; sin modelos gratis de la Caja de herramientas.
- Todo remoto validado en el servidor.

## Cómo se trabaja
- Conexión: <MCP de Studio / código para pegar>. Lugar: <nombre en Studio>.
- Copia del código: <carpeta, git, herramienta de exportar/inyectar, o ninguna>.
- Pruebas: `require(game.ServerStorage.Tests:Clone().Run).Execute()` → <n/n>.
- Revisión independiente: <agente>.
- Flujo de fase: plan → «sí» → respaldo si toca → código → pruebas → revisión → Play → informe → revisión de la persona.
- Cada dos fases cerradas: proponer sesión nueva con la frase de inicio.

## Referencias del mapa
- <pieza de referencia>: posición <x, y, z>. Si se mueve, se mueve todo lo que depende de ella.

## Léxico del juego
- <palabra>: <significado>. (Todo texto nuevo lo sigue.)

## Estado (<fecha>)
- Último guardado del lugar / respaldo más reciente: <…>
- Hecho y pendiente de revisión: <…>
- Validado: <…>
- Siguiente: <…>

## Decisiones (con fecha y frase de la persona)
- <fecha>: <decisión> («<sus palabras>»)
