---
name: rc-publicar
description: >
  Publicar un juego de Roblox paso a paso, siempre lo hace la persona: privado primero con amigos y
  dispositivos distintos, una compra real barata, varios jugadores, luego público; lista antes de
  publicar con comprobación en Luau; página del juego (nombre, icono, miniaturas originales); cuestionario
  de clasificación de contenido; requisitos de cuenta para público y para ganar Robux; lugares aparte,
  actualizar servidores, Studio Access to API Services y Open Cloud con permiso. Úsala para publicar o
  actualizar (publish, release, content ratings, maturity questionnaire, thumbnails, icon, game page,
  playtest, DevEx). No para precios o ventas (rc-economia) ni para el sonido (rc-sonido).
---

# rc-publicar · Lo dejas listo; ella pulsa

Publicar es la última etapa del director. **Siempre publica la persona**: tú preparas, compruebas y le
dices qué pulsar, de uno en uno, con el nombre exacto del botón (en los dos idiomas si Studio está en
otro). Nunca publicas, cambias precios ni pones nada a la venta por ella.

Última comprobación: 2026-11-18 (documentación de Roblox, URLs en `referencias/fuentes.md`). Roblox cambia a menudo las normas de publicación: si ha pasado tiempo, mira
las páginas antes de afirmar requisitos.

## Cuándo usarla
- El juego (o una actualización grande) está terminado y probado, y la persona quiere publicarlo.
- Hay que preparar la página del juego, el icono, las miniaturas o el cuestionario de contenido.
- La persona pregunta qué necesita su cuenta para publicar en público o para ganar Robux.
- Hay varios lugares en el juego, o hay que actualizar sin romper partidas.

## El camino (en orden; no te saltes pasos)
1. **Lista de Claude** en verde (comprobación ejecutable abajo) y **revisión independiente** de
   seguridad hecha (agente `revisor-seguridad-datos`, solo lectura; ver `rc-servidor` y `rc-datos`) y
   de textos y ventas (agente `revisor-textos-ventas`).
2. **Respaldo**: la persona guarda una copia del lugar con nombre y fecha y lo confirma.
3. **Página del juego** preparada (Paso A) y **cuestionario de contenido** rellenado (Paso B).
4. **Privado primero**: en el Creator Dashboard → Publish settings → Manage Audience, pestaña
   **Playtest**: hasta 10 amigos de edad parecida como primeros probadores. Probad juntos:
   - **dispositivos distintos** (ordenador, teléfono, tableta; consola si se puede);
   - **varios jugadores a la vez** en el mismo servidor;
   - **una compra real barata** (si hay ventas): que llegue, y que siga ahí al salir y volver a entrar.
5. Arregla lo que salga (otra fase pequeña, con su prueba) y repite el paso 4 si el arreglo fue grande.
6. **Público** cuando ella esté contenta: pestaña **Public** de Manage Audience. Con «Friends» activado
   solo entran amigos y probadores; desactivado, cualquiera (según edad y país).
7. **Después**: mira los errores del juego publicado (Creator Dashboard → analíticas / registro de
   errores) y apunta en `CLAUDE.md` qué versión se publicó y cuándo.

**Comprobación del camino:** cada paso tiene su marca en
`../ultimate-roblox-creator/plantillas/lista-antes-de-publicar.md` (de la directora), y la persona entró al juego publicado desde otro aparato y te contó qué ve.

## Paso A · La página del juego
- **Nombre** original y corto: nada de marcas, juegos ni personajes ajenos; que diga qué es el juego.
- **Descripción**: qué se hace en una frase, controles, novedades; las **atribuciones CC BY** del sonido
  (las imprime la comprobación de `rc-sonido`); si hay ventas, qué se compra y qué no.
- **Icono**: cuadrado, **512 × 512** como mínimo. Se ve muy pequeño (~150 px): una figura grande y clara,
  poco texto.
- **Miniaturas**: **16:9, a ser posible 1920 × 1080**, hasta **10** imágenes o vídeos. Vídeos: **3 al
  mes** y no se ven en Xbox, PlayStation ni VR. Todo **original**: capturas del propio juego, nada de
  arte de otros juegos.
- Se suben en el Creator Dashboard → el juego → Configurations → Places → lugar de inicio → Icon /
  Thumbnails. Pasan moderación.
- Tú escribes los textos y propones qué capturas hacer; **ella los aprueba y los sube**.

**Comprobación del paso:** ella aprobó nombre y descripción; el icono se miró a ~150 px y se entiende;
las miniaturas son del propio juego.

## Paso B · Cuestionario de clasificación de contenido
Antes se llamaba «cuestionario de madurez»; ahora es **Content ratings** (Creator Dashboard → Publish
settings → Content ratings). Datos del 2026-11-18:
- Cuatro partes: tipo de app, preguntas IARC, preguntas de Roblox y vista previa. Lleva de 15 min a 1 h.
- **Sin clasificación, Roblox limita el juego para todos los jugadores.** Respuestas falsas → moderación
  del juego y de la cuenta.
- Etiquetas y públicos: **Minimal** o **Mild** → Roblox Kids (5–8) y Select (9–15); **Moderate** →
  Select (9–15) y Roblox normal (16+); **Content May Vary** → solo 16+ con edad comprobada; **Restricted**
  → solo 18+ verificados.
- Roblox dice que está pasando a un sistema de clasificación nuevo: lo de arriba puede cambiar.
- **Tú preparas un borrador de respuestas** mirando lo que hay de verdad en el juego, y ella responde:

| Tema | Qué miras en el juego |
|---|---|
| Violencia | armas, golpes, muertes, cómo se ven |
| Sangre o heridas | partículas rojas, cuerpos |
| Miedo | sustos, oscuridad, sonidos fuertes |
| Lenguaje | textos, nombres, chat de NPC |
| Compras | productos, Game Pass, qué se gana pagando |
| Pago al azar | cajas, ruletas, mejoras que pueden fallar (`rc-economia`) |
| Social | chat, voz, intercambios, fotos o textos de jugadores |
| Otros | alcohol, apuestas, temas sensibles |

**Comprobación del paso:** Content ratings enseña una clasificación para el juego, y cada respuesta
cuadra con lo que hay en el juego.

## Paso C · Lo que pide la cuenta (comprobado 2026-11-18)
Esto lo comprueba la persona en su cuenta: **tú no pides documentos ni datos**, solo explicas.
- **Publicar para 16+**: cuenta en regla con al menos 2 días, comprobación de edad (estimación facial o
  documento) y la pregunta de contenido para mayores del cuestionario.
- **Publicar para todas las edades (Kids y Select)**: edad verificada, **verificación en dos pasos**,
  Roblox Plus o Premium 2 meses seguidos **o** una tasa reembolsable (1 000 Robux; 50 000 por revisión
  rápida), pasar la evaluación de Kids y Select, y clasificación Minimal, Mild o Moderate.
- Hasta **5 juegos nuevos** al día.
- **Vender en el juego** (productos y Game Pass): el juego tiene que estar publicado y accesible; precio
  de 1 a 1 000 000 000 Robux. Desde el **30 de mayo de 2026** no se venden productos de un juego desde
  otro juego.
- **Vender recursos con precio** en la Creator Store: verificar con documento oficial (13+) y crear una
  cuenta de vendedor.
- **Cambiar Robux por dinero (DevEx)**: mayores de 13 con al menos 30 000 Robux ganados (hay más
  condiciones en la ayuda de Roblox; léelas allí).

**Comprobación del paso:** ella dice qué le pide su cuenta para el público que quiere; lo que le falte
queda apuntado en `CLAUDE.md` (sin datos de la cuenta).

## Paso D · Datos, lugares y actualizaciones
- **El juego publicado guarda sin activar nada.** «**Enable Studio Access to API Services**» (Archivo →
  Configuración del juego → Seguridad / File → Experience Settings → Security) solo sirve para que Studio
  use el DataStore de verdad en pruebas, y Roblox pide **no activarlo en juegos en vivo** (las pruebas
  escribirían en partidas reales). Mejor: una **copia del juego para pruebas**; si se activó, apágalo.
- Almacén de prueba (`UseTestStorage` o como se llame en el proyecto): que **solo actúe en Studio**
  (`RunService:IsStudio()`, ver `rc-datos`). Así puede quedarse en `true` y la batería sigue pasando.
- **Varios lugares** (un tutorial, una zona aparte): cada lugar se publica **por separado** (Archivo →
  Publicar en Roblox como… / Publish to Roblox As… y elegir el lugar). Los viajes entre lugares no
  funcionan en Studio: se prueban publicados (**no verificado** hasta entonces). Si un lugar solo debe
  abrirse por viaje, impide la entrada directa en su configuración.
- **Actualizar**: al publicar, los servidores abiertos siguen con la versión vieja. Si cambió el esquema
  de datos o algo grande, la persona reinicia los servidores para que todos pasen a la nueva (la opción
  se ha llamado «Migrar a la última actualización» / «Migrate to Latest Update» o «Restart servers»;
  el nombre de hoy **no verificado** en la documentación). Antes, la migración de datos tiene que estar
  probada (`rc-datos`).
- **Open Cloud** (la API de Roblox con una clave): solo con permiso **para cada acción**, que la persona
  diga en el chat. Nunca publicar el lugar, cambiar precios ni poner a la venta por ella. La clave nunca
  va en el código del juego ni en archivos del proyecto. El cuestionario y la audiencia se hacen en el
  Creator Dashboard.

**Comprobación del paso:** «Enable Studio Access to API Services» apagado en el juego en vivo, la
comprobación de abajo dice `OK lista de Claude`, y cada lugar aparte está publicado.

## Comprobación ejecutable (Edit, por el MCP `execute_luau` o en la barra de comandos)
Busca lo que más veces se olvida antes de publicar. No sustituye a la revisión independiente.
```luau
local out, recibos = {}, {}
for _, root in game:GetChildren() do -- todos los servicios: las puertas traseras se esconden en Lighting, Chat…
	local okList, list = pcall(function() return root:GetDescendants() end)
	if not okList then continue end
	for _, o in list do
		if o:GetAttribute("SoloPrueba") then table.insert(out, "QUITAR objeto de prueba: " .. o:GetFullName()) end
		if not o:IsA("LuaSourceContainer") then continue end
		local ok, src = pcall(function() return o.Source end)
		if not ok then continue end
		local n = o:GetFullName()
		if src:find("UseTestStorage%s*=%s*true") then table.insert(out, "REVISAR que el almacén de prueba solo actúa con IsStudio() (rc-datos): " .. n) end
		if src:find("MarketplaceService%.ProcessReceipt%s*=[^=]") then table.insert(recibos, n) end
		if src:find("TestMode") or src:find("Truco") or src:find("Cheat") then
			table.insert(out, "REVISAR a mano trucos o modo prueba (solo en Studio): " .. n)
		end
		if src:find("require%s*%(%s*%d") then table.insert(out, "PELIGRO require(número): " .. n) end
		if src:find("loadstring") or src:find("getfenv") then table.insert(out, "REVISAR loadstring/getfenv: " .. n) end
		if src:find("GetProductInfo%s*%(") or src:find("GetProductInfo%s*,") then
			table.insert(out, "CAMBIAR GetProductInfo (obsoleta) por GetProductInfoAsync: " .. n)
		end
		if root == workspace then table.insert(out, "REVISAR script en Workspace: " .. n) end
	end
end
if #recibos > 1 then table.insert(out, "HAY " .. #recibos .. " ProcessReceipt (debe haber uno): " .. table.concat(recibos, ", ")) end
if game.ServerStorage:FindFirstChild("TestModeFlag") then table.insert(out, "QUITAR ServerStorage.TestModeFlag (rc-servidor)") end
if game.PlaceId == 0 then table.insert(out, "INFO: este lugar aún no está publicado (normal la primera vez)") end
return if #out == 0 then "OK lista de Claude" else table.concat(out, "\n")
```
- Marca los objetos de prueba con el atributo `SoloPrueba` al crearlos; así esta comprobación los
  encuentra.
- Un «REVISAR» no es un fallo: míralo a mano (un `AntiCheat` saldrá ahí y está bien). Y que salga `OK`
  no prueba que no haya trampas: eso lo dice la revisión independiente.
- Si el juego tiene sonido, pasa también la comprobación de `rc-sonido` (`OK registro`): las
  atribuciones CC BY van en la descripción.
- Después, repasa con la persona el resto de `../ultimate-roblox-creator/plantillas/lista-antes-de-publicar.md`.

## Gotchas (síntoma → causa → arreglo)
- **Nadie puede entrar al juego** → sigue en Playtest o con «Friends» activado, o falta el cuestionario
  → mira Manage Audience y Content ratings.
- **El juego casi no aparece para nadie** → sin clasificación de contenido Roblox lo limita → rellenar
  Content ratings.
- **Las partidas de prueba se mezclaron con las reales** → «Enable Studio Access to API Services»
  activado en el juego en vivo → copia del juego para pruebas; apágalo.
- **Tras actualizar, unos jugadores tienen lo nuevo y otros no** → servidores viejos siguen abiertos →
  la persona reinicia los servidores (Paso D).
- **Una compra se cobró y no llegó** → varios `ProcessReceipt` o recibo sin guardado confirmado → uno solo
  e idempotente (`rc-datos`); la comprobación cuenta cuántos hay.
- **El tutorial publicado no tiene los cambios** → solo se publicó el lugar de inicio → cada lugar se
  publica por separado.
- **El viaje al otro lugar falla en Studio** → TeleportService no funciona en Studio → se prueba
  publicado; **no verificado** hasta entonces.
- **El icono no se entiende en el móvil** → mucho texto o detalles pequeños → una figura grande; míralo a
  150 px.
- **Roblox rechazó una miniatura o modera el juego** → arte o marcas ajenas, o respuestas del cuestionario
  que no cuadran → todo original y respuestas según lo que hay de verdad.
- **Se publicó algo sin querer** → alguien publicó por la persona → nunca: publica ella; con Open Cloud,
  permiso para cada acción.
- **Un script raro aparece al publicar** → modelo gratis de la Caja de herramientas → quítalo; la
  comprobación avisa de scripts en Workspace y de `require(número)` (lección real).

## Etiquetas de resultado
**ejecutado** (comprobación `OK lista de Claude`, batería en verde) · **verificado leyendo** (textos de la
página, borrador del cuestionario) · **preparado sin ejecutar** · **no verificado** (compras reales,
teléfono o consola reales, muchos jugadores, viajes entre lugares, requisitos de la cuenta de la persona:
eso lo ve ella en su cuenta).
