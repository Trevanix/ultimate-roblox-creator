---
name: rc-prototipo
description: >
  Probar una idea de juego de Roblox en ~1 hora antes de construirla: un prototipo feo que responde UNA
  pregunta («¿esto engancha?»), criterios de quedarse o tirar escritos antes de jugar, medidor de partidas
  en Luau, lugar aparte que nunca se convierte en el juego; y el documento del juego de una página: cada
  dato en un solo sitio, estados idea → diseñado → en curso → hecho o cortado, y suposiciones marcadas.
  Úsala con una duda de diversión o una mecánica nueva (prototype, test an idea, game jam, greybox, game
  design document, GDD, feature status). No para la idea inicial (director ultimate-roblox-creator) ni
  para números por género (rc-generos).
---

# rc-prototipo · Una hora, una pregunta, una decisión

Antes de pasar semanas construyendo algo, se puede saber en una hora si engancha. El prototipo es feo a
propósito: piezas grises, sin guardado, sin tienda. Solo tiene que contestar **una** pregunta. Y después
se tira: el juego de verdad se construye bien, por fases.

Última comprobación: 2026-11-18 (método de awesome-gamedev-agent-skills, ver `NOTICE` del plugin;
plantilla `ficha-del-juego.md` del director).

## Cuándo usarla
- Hay una duda grande de diversión: «¿es divertido esquivar esto?», «¿se entiende sin explicarlo?».
- La persona quiere una mecánica nueva y no sabéis si funciona.
- Dos ideas compiten y hay que elegir una.
- Una game jam o un reto con poco tiempo (ver «Con poco tiempo»).
- Hay que ordenar el diseño: qué está decidido, qué falta y qué se cortó (documento de una página).

No hace falta para cosas que ya se sabe que funcionan (un botón de comprar, un guardado): esas se
construyen directamente.

## Pasos del prototipo (en orden)
1. **Una pregunta**, escrita con la persona en una frase. Si hay dos, son dos prototipos.
   - Bien: «¿Es divertido empujar a otros a la lava durante 5 minutos?»
   - Mal: «¿El juego funciona?» (no se puede contestar)
2. **Criterios ANTES de jugar**, escritos y con su «sí». Que se puedan contar:
   - Se queda si: «de 3 personas que lo prueban, 2 quieren otra partida sin que se lo pidamos» o «el
     medidor dice que jugaron más de 5 min seguidos».
   - Se tira si: «nadie entiende qué hacer en 1 min sin explicarlo».
   - Escribirlos después de jugar no vale: siempre acaban diciendo «se queda».
3. **Construye en ~1 hora**, en un **lugar aparte** (un Baseplate nuevo, no el del juego): piezas grises,
   un solo script si hace falta, textos en vez de interfaz, sin guardado, sin ventas, sin sonido salvo que
   la pregunta sea de sonido. Pon el **medidor** (abajo).
4. **Juega** 5–10 min la persona y, si puede, 1 o 2 personas más (en Studio: Prueba → Clientes y
   servidores / Test → Clients and Servers). No expliques nada antes: mira dónde se pierden.
5. **Decide con los criterios**: se queda, se cambia una cosa y se repite (otra hora como mucho), o se
   tira. Apunta el resultado en el documento del juego (abajo), con lo aprendido.
6. **El prototipo no se convierte en el juego.** Si se queda, se construye de nuevo en el lugar del juego,
   por fases, con las skills de cada sistema (`rc-servidor`, `rc-datos`…). Del prototipo se lleva lo
   aprendido y los números, no el código.
7. **Comprobación ejecutable:** antes de jugar, la comprobación de aislamiento dice `OK prototipo
   aislado`; después, el medidor ha impreso sus líneas y la decisión está escrita frente a los criterios.

### Reglas del prototipo
- **Se permite:** código feo, todo en un script, números a ojo, nada de interfaz bonita.
- **No se permite** (aunque sea un prototipo): modelos gratis de la Caja de herramientas sin revisar
  (traían puertas traseras: lección real), bucles que esperan sin tope (colgaron Studio: lección real),
  DataStore de verdad, ventas.
- Si a la hora no contesta la pregunta: **recorta**, no alargues. Quita lo que no es la pregunta.
- Si la persona se enamora del prototipo y quiere «seguir desde aquí», recuérdale por qué no: sin
  validación en el servidor ni guardado seguro, cada cosa añadida encima hay que rehacerla luego.

### Medidor del prototipo (`ServerScriptService/Medidor`, Script)
Cuenta cuánto juega cada uno y cuántas veces hace lo importante. Los otros scripts del prototipo avisan
así (pueden arrancar antes que el medidor, por eso esperan con tope):
`local medir = game.ServerStorage:WaitForChild("Medir", 5)` y luego
`if medir then medir:Fire(player, "empujon") end`.
```luau
local Players = game:GetService("Players")
local ServerStorage = game:GetService("ServerStorage")
local medir = Instance.new("BindableEvent")
medir.Name = "Medir"
medir.Parent = ServerStorage

local stats = {}
local function join(p) stats[p] = { t0 = os.clock(), counts = {} } end
for _, p in Players:GetPlayers() do join(p) end
Players.PlayerAdded:Connect(join)

medir.Event:Connect(function(p, what)
	local s = stats[p]
	if s and type(what) == "string" then s.counts[what] = (s.counts[what] or 0) + 1 end
end)

local function report(p)
	local s = stats[p]
	if not s then return end
	local parts = {}
	for what, n in s.counts do table.insert(parts, what .. "=" .. n) end
	print(("[Prototipo] jugador %d: %.1f min · %s"):format(p.UserId, (os.clock() - s.t0) / 60, table.concat(parts, " ")))
	stats[p] = nil
end
Players.PlayerRemoving:Connect(report)
game:BindToClose(function() for _, p in Players:GetPlayers() do report(p) end end)
```
Al parar la prueba, las líneas `[Prototipo]` salen en la Salida (Output). En Play con varios clientes, los
números de jugador en Studio son de prueba (negativos).

### Con poco tiempo (game jam)
- Por defecto, **cortar**: ante la duda, la función se queda fuera.
- Reserva **~20 % del tiempo** para la entrega (publicar, página, probar en otro aparato).
- El mismo método: una pregunta por día como mucho, criterios antes, jugar pronto.

## El documento del juego de una página
**Es la ficha del juego** (`FICHA_DEL_JUEGO.md`, plantilla
`../ultimate-roblox-creator/plantillas/ficha-del-juego.md`), no un documento nuevo. La plantilla ya trae tres secciones al final: **Funciones y
estado**, **Suposiciones por comprobar** y **Prototipos**.

### Cada dato en un solo sitio
- Un número, una regla o una decisión se escribe **una vez**. Los demás sitios dicen dónde está.
  - La ficha dice **qué** es el juego y el estado de cada función.
  - `CLAUDE.md` del proyecto dice **cómo** se trabaja (reglas, decisiones con fecha, piezas protegidas) y
    enlaza a la ficha.
  - Los números del juego viven en **un módulo de configuración** del código; la ficha dice «precios: ver
    `Config.Shop`», no los copia.
- Si un dato aparece en dos sitios, acabará siendo distinto en uno. Al cambiar algo, cámbialo en su sitio
  y borra copias.
- Que quepa en **una página**: lo largo va a una nota por función (`notas/tienda.md`) enlazada desde la
  ficha.

### Estados de cada función
`idea` → `diseñado` → `en curso` → `hecho`, o `cortado` (en cualquier momento).
- **idea**: alguien la propuso; nadie la ha aprobado.
- **diseñado**: la persona dijo «sí» a cómo será (con fecha).
- **en curso**: se está construyendo en una fase.
- **hecho**: construido, con su prueba `OK` y revisado por la persona.
- **cortado**: no se hará (de momento). Se deja escrito con el porqué: así no vuelve a salir cada semana.

Una función sin estado no existe. Solo hay **una o dos** `en curso` a la vez.

### Suposiciones marcadas
Lo que creemos pero no hemos comprobado se marca **(suposición)** con cómo se comprobará:
«Los jugadores entenderán el empujón sin tutorial (suposición: prototipo del día 3)». Cuando se comprueba,
pasa a dato o se corrige. Así nadie construye semanas sobre algo que nadie probó.

### Las tres secciones de la ficha (ejemplo relleno)
```markdown
## Funciones y estado
| Función | Estado | Fase o fecha | Nota |
|---|---|---|---|
| Empujar a otros | hecho | F2 | notas/empujon.md |
| Tienda de aspectos | diseñado | 2026-11-20 | precios: Config.Shop |
| Mascotas | cortado | 2026-11-21 | demasiado para la primera versión |

## Suposiciones por comprobar
- Se entiende sin tutorial (suposición: prototipo 1).

## Prototipos
- P1 · ¿Engancha empujar a la lava? · Criterio: 2 de 3 piden otra · Resultado: 3 de 3 → se queda.
```

## Comprobación ejecutable (Edit, por el MCP `execute_luau` o en la barra de comandos)
**1. Aislamiento del prototipo** (en el lugar del prototipo, antes de jugar):
```luau
local out = {}
for _, root in { game.ServerScriptService, game.ServerStorage, game.ReplicatedStorage, game.ReplicatedFirst, game.StarterPlayer, game.StarterGui, game.StarterPack, workspace } do
	for _, s in root:GetDescendants() do
		if s:IsA("LuaSourceContainer") then
			local ok, src = pcall(function() return s.Source end)
			if ok and (src:find("DataStoreService") or src:find("ProcessReceipt") or src:find("MarketplaceService")) then
				table.insert(out, "QUITAR (guardado o ventas en un prototipo): " .. s:GetFullName())
			end
			if ok and src:find("require%s*%(%s*%d") then table.insert(out, "PELIGRO require(número), típico de puertas traseras: " .. s:GetFullName()) end
			if root == workspace then table.insert(out, "REVISAR script en Workspace: " .. s:GetFullName()) end
		end
	end
end
if not game.ServerStorage:FindFirstChild("Medir") and not game.ServerScriptService:FindFirstChild("Medidor") then
	table.insert(out, "FALTA el medidor (ServerScriptService/Medidor)")
end
return #out == 0 and "OK prototipo aislado" or table.concat(out, "\n")
```
`Medir` solo existe en Play (lo crea el medidor); en Edit basta con que esté el script `Medidor`.

**2. Después de jugar:** copia las líneas `[Prototipo]` de la Salida al apartado «Prototipos» de la ficha,
compáralas con los criterios escritos antes y apunta la decisión con el «sí» de la persona.

**3. Documento:** cada función de la ficha tiene uno de los 5 estados, no hay más de dos `en curso` y
cada suposición dice cómo se comprobará (**verificado leyendo**).

## Gotchas (síntoma → causa → arreglo)
- **El prototipo dura una semana** → contestaba varias preguntas o se pulía → una pregunta, una hora;
  recorta lo que no es la pregunta.
- **Siempre sale «se queda»** → los criterios se escribieron después de jugar → escríbelos antes, que se
  puedan contar.
- **El juego final arrastra fallos raros** → se siguió construyendo sobre el prototipo → se rehace por
  fases; del prototipo, solo lo aprendido.
- **Un prototipo tocó partidas de verdad** → usaba DataStore o estaba en el lugar del juego → lugar
  aparte y sin guardado (comprobación 1).
- **Nadie sabe qué está decidido** → datos copiados en varios sitios o funciones sin estado → cada dato
  en un sitio y estado para cada función.
- **La misma idea cortada vuelve cada semana** → se cortó sin escribirlo → estado `cortado` con el porqué.
- **Semanas construyendo algo que no gusta** → una suposición nunca comprobada → márcala y pruébala con un
  prototipo.
- **Studio se cuelga en el prototipo** → `repeat … until` sin tope «porque es solo una prueba» → también
  aquí, todo bucle que espera lleva plazo (lección real).

## Etiquetas de resultado
**ejecutado** (aislamiento `OK`, medidor con sus líneas tras jugar) · **verificado leyendo** (criterios
escritos antes, ficha con estados) · **preparado sin ejecutar** · **no verificado** (si engancha a
jugadores de verdad: un prototipo con 3 personas orienta, no lo demuestra; dilo así).
