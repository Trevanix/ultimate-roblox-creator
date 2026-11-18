---
name: rc-mundo
description: >
  Mapa y niveles de un juego de Roblox que se juegan bien y van fluidos en un teléfono barato: huecos de
  salto ≈ 70 % del salto medido (95 % los opcionales), ritmo sin más de 2 momentos intensos seguidos, grafo
  de zonas y llaves sin atascos sin salida, medir antes de arreglar, StreamingEnabled, construir solo cerca,
  sombras, presupuesto con 20–30 % de margen en móvil, MicroProfiler y piezas de referencia del mapa. Úsala
  con mapa, niveles, obby, zonas o tirones (level design, map, jump gap, pacing, lag, FPS, streaming,
  optimization). No para colisiones o personajes (rc-personajes-fisica), NPC (rc-npc) ni cámara
  (rc-sensacion).
---

# rc-mundo · Un mapa que se entiende, se termina y no da tirones

Un nivel justo se mide: el salto del personaje tiene una longitud, y los huecos se ponen a partir de
ella. Un mapa fluido también se mide: primero se mira qué pesa y luego se arregla lo que más pesa, de uno
en uno.

Última comprobación: 2026-11-18 (API de StarterPlayer, Workspace.StreamingEnabled, ModelStreamingMode y
MicroProfiler; método y números de awesome-gamedev-agent-skills, ver `NOTICE` del plugin).

## Cuándo usarla
- Se diseña o se cambia un mapa, un nivel, un obby o las zonas del juego.
- Hay llaves, puertas, zonas que se desbloquean o caminos de un solo sentido.
- El juego va a tirones, tarda en cargar o se calienta el teléfono.
- Se construye o se reemplaza una parte del mapa con un script.

## Pasos (en orden)
1. **Grafo de zonas** con la persona: zonas, cómo se pasa de una a otra y qué llave pide cada paso.
2. **Mide el salto** del personaje (abajo) y pon los huecos a partir de él.
3. **Ritmo**: escribe la intensidad de cada tramo (bajo, medio, alto, clímax).
4. **Construye** el mapa por partes, con scripts guardados y forma de deshacer.
5. **Apunta las piezas de referencia** (aparición, zona segura, metas) y bloquéalas.
6. **Mide el rendimiento** antes de optimizar; arregla de uno en uno y vuelve a medir.
7. **Comprobación ejecutable:** los huecos salen sin «DEMASIADO», el grafo sale `OK`, las piezas de
   referencia salen sin «MOVIDA» y el informe de rendimiento no tiene nada por revisar sin explicar.

## Diseño de niveles

### Huecos y alturas a partir del salto medido
- **Obligatorios: ≈ 70 %** del salto medido (en distancia y en altura). Así casi todos lo pasan.
- **Opcionales** (atajos, premios escondidos): hasta **≈ 95 %**. Retan a los buenos sin cortar el paso.
- Si la persona cambia `WalkSpeed`, `JumpHeight` o la gravedad, **todo el nivel cambia**: vuelve a medir.
- El salto se calcula con la configuración de `StarterPlayer` (script de la comprobación) y se confirma
  en Play: dos plataformas a la distancia calculada, 10 saltos. En el teléfono se salta peor que con
  teclado: si el público juega en el móvil, quédate en el 70 %.

### Ritmo (pacing)
- **No más de 2 momentos intensos seguidos**: después, un tramo tranquilo (andar, mirar, recoger).
- **Descanso antes del clímax** (jefe, salto final, persecución): que llegue con ganas, no cansado.
- Lo nuevo se enseña primero en un sitio seguro (sin caída mortal) y luego se pide en uno difícil.
- Punto de control antes de cada parte difícil: perder mucho avance por un fallo hace que se vayan.
- Que se vea hacia dónde ir: luz, color o un camino. El jugador no lee carteles.

### Grafo de zonas y llaves, sin atascos sin salida
- Escribe cada zona con sus salidas y las llaves que hay dentro (formato de la comprobación). Es la
  «lista de verdad» del mapa: si se cambia el mapa, se cambia el grafo.
- **Atasco sin salida**: el jugador llega a un sitio desde el que ya no puede llegar a la meta (bajó por un
  hueco de un solo sentido, gastó la llave en otra puerta, su punto de control quedó al otro lado de una
  puerta cerrada). El script lo busca; los casos raros (llaves que se gastan) se recorren jugando.
- Una sala sin salida está bien si es un premio y reiniciar al personaje lo saca de allí; márcala.
- Cierra el mundo (barrera invisible) donde termina el mapa, y pon una zona que devuelva al jugador si cae
  al vacío.

### Construir el mapa con scripts
- Construye por fases con scripts guardados. Lo que reemplazas, guárdalo en `ServerStorage` (p. ej.
  `ServerStorage.CieloAnterior`) con una forma de deshacer: el cambio se vuelve atrás sin respaldo completo.
- **Nada de modelos gratis de la Caja de herramientas** sin revisar: traían scripts escondidos (lección
  real). Genera las piezas (con su permiso: se crean en su cuenta) o constrúyelas.

### Piezas de referencia
Las partes que el código usa como referencia (aparición, zona segura, caja de la partida, metas) se
apuntan en `CLAUDE.md` con su posición y se bloquean (`Locked = true`, así no se seleccionan sin querer).
Lección real: una pieza arrastrada sin querer movió la aparición, el suelo y la caja de la partida.
Guarda su posición en un atributo una vez, al colocarlas:
```luau
for _, p in workspace.Referencias:GetDescendants() do
	if p:IsA("BasePart") then p:SetAttribute("RefPos", p.Position); p.Locked = true end
end
```

## Rendimiento

### Medir primero
- En el juego publicado: **F9** (consola de desarrollador: memoria y red), **Shift+F5** (estadísticas y
  FPS) y el **MicroProfiler** (Ctrl+F6). En Studio, Shift+F5 **detiene la prueba**: usa Vista →
  Estadísticas (View → Stats) y el MicroProfiler con Ctrl+Alt+F6 o desde Vista (atajos por comprobar en
  la versión de Studio de la persona).
- **Presupuesto**: 60 FPS = 16,7 ms por fotograma. En el teléfono, deja un **20–30 % de margen** (apunta a
  12–13 ms): el móvil se calienta y baja la velocidad a los pocos minutos.
- Prueba en el aparato más flojo que tenga la persona; el emulador de Studio no mide un teléfono real.
- **Un arreglo cada vez** y vuelve a medir. Si no mejora, deshazlo.
- Escribe un informe corto: lo medido, hallazgos de más a menos importante, qué se arregla y qué no.

### Lo que más ayuda
- **StreamingEnabled** (ya viene activado en los lugares nuevos; compruébalo en los viejos): el cliente
  solo tiene lo que está cerca. Su código debe esperar a que lleguen las cosas (`WaitForChild` con tope o
  `ChildAdded`) y no romperse si algo se va.
  - Lo que el cliente necesita siempre (piezas de referencia, metas) va dentro de un `Model` con
    `ModelStreamingMode = Persistent` (la propiedad es del Model, no de las piezas sueltas). Antes de teletransportar lejos, en el servidor:
    `player:RequestStreamAroundAsync(destino)` dentro de `pcall`.
  - Cambiar el radio de streaming en un juego que ya funciona puede romper cosas que contaban con objetos
    lejanos: pruébalo en una fase aparte.
- **Construir solo cerca**: efectos, partículas, luces y objetos que giran, solo cerca de la cámara (abajo).
- **Sin sombra** en piezas pequeñas: `CastShadow = false` en lo de menos de ~4 studs.
- **Anclar** lo que no se mueve; física solo donde hace falta.
- `CanTouch = false` y `CanQuery = false` en adornos que no se tocan ni se apuntan.
- Mascotas o personajes que siguen al jugador: una pieza raíz y el resto soldado; si se mueven desde el
  servidor, mide la red.
- Datos grandes: no en atributos del `Player` (llegan a todos), sí en algo que solo recibe su dueño (lección
  real: ~40 KB por jugador enviados a todos).

### Construir solo cerca (LocalScript en `StarterPlayerScripts`)
Dos radios, uno para encender y otro para apagar, para que no parpadee en el borde. Marca las piezas con
la etiqueta `EfectoCerca` y deja sus efectos apagados en Studio.
```luau
local CollectionService = game:GetService("CollectionService")
local camera = workspace.CurrentCamera
local ON, OFF = 350, 400
local active = setmetatable({}, { __mode = "k" }) -- si el streaming quita la pieza, se olvida sola

local function setEffects(part, on)
	for _, e in part:GetDescendants() do
		if e:IsA("ParticleEmitter") or e:IsA("Light") or e:IsA("Beam") then e.Enabled = on end
	end
end

while true do
	task.wait(0.5) -- no hace falta cada fotograma
	local camPos = camera.CFrame.Position
	for _, part in CollectionService:GetTagged("EfectoCerca") do
		if part:IsA("BasePart") then
			local d = (part.Position - camPos).Magnitude
			if not active[part] and d < ON then active[part] = true; setEffects(part, true)
			elseif active[part] and d > OFF then active[part] = nil; setEffects(part, false) end
		end
	end
end
```

### Bucles y conexiones
- `task.wait`, `task.delay`, `task.spawn`; nunca el `wait()` viejo.
- Lo que no necesita cada fotograma, cada 0,2–0,5 s. Un bucle para muchos objetos mejor que uno por objeto.
- Desconecta al irse el objeto o el jugador (`Destroying`, `PlayerRemoving`) y limpia las tablas por
  jugador. Si no, la memoria crece sin parar.
- Ningún bucle que espera algo sin tope (`os.clock()` + N).

## Comprobación ejecutable (Edit, por el MCP `execute_luau` o en la barra de comandos)
**1. Salto medido y huecos.** Pon las plataformas de un tramo en `workspace.Nivel.Plataformas`, llamadas
`1`, `2`, `3`… en el orden del camino; a las opcionales, el atributo `Opcional = true`.
```luau
local SP = game:GetService("StarterPlayer")
local g = workspace.Gravity
local v0 = SP.CharacterUseJumpPower and SP.CharacterJumpPower or math.sqrt(2 * g * SP.CharacterJumpHeight)
local height = v0 * v0 / (2 * g)
local function reach(dy) -- distancia horizontal hasta una plataforma dy studs más alta
	local disc = v0 * v0 - 2 * g * dy
	if disc < 0 then return 0 end
	return SP.CharacterWalkSpeed * (v0 + math.sqrt(disc)) / g
end
print(("Salto: %.1f studs de alto, %.1f de largo en llano"):format(height, reach(0)))

local nivel = workspace:FindFirstChild("Nivel")
local folder = nivel and nivel:FindFirstChild("Plataformas")
if not folder then return "Falta workspace.Nivel.Plataformas" end
local list = {}
for _, p in folder:GetChildren() do
	if p:IsA("BasePart") and tonumber(p.Name) then table.insert(list, p) end
end
table.sort(list, function(a, b) return tonumber(a.Name) < tonumber(b.Name) end)
local fails = {}
for i = 1, #list - 1 do
	local a, b = list[i], list[i + 1] -- distancia entre bordes; piezas sin girar (giradas: aproximado)
	local dx = math.max(0, math.abs(a.Position.X - b.Position.X) - (a.Size.X + b.Size.X) / 2)
	local dz = math.max(0, math.abs(a.Position.Z - b.Position.Z) - (a.Size.Z + b.Size.Z) / 2)
	local gap = math.sqrt(dx * dx + dz * dz)
	local dy = (b.Position.Y + b.Size.Y / 2) - (a.Position.Y + a.Size.Y / 2)
	local share = b:GetAttribute("Opcional") and 0.95 or 0.7
	local ok = gap <= share * reach(dy) and dy <= share * height
	print(("%s→%s hueco %.1f (máx %.1f) · sube %.1f (máx %.1f) %s"):format(
		a.Name, b.Name, gap, share * reach(dy), dy, share * height, ok and "" or "← DEMASIADO"))
	if not ok then table.insert(fails, a.Name .. "→" .. b.Name) end
end
return #fails == 0 and "OK huecos" or ("DEMASIADO: " .. table.concat(fails, ", "))
```
Con la configuración por defecto (WalkSpeed 16, JumpHeight 7,2, gravedad 196,2) el salto es de ~7,2
studs de alto y ~8,7 de largo entre bordes; el cuerpo del personaje da algo más, así que la cuenta es
prudente. Confírmalo en Play.

**2. Grafo de zonas, llaves y ritmo** (cambia `Z` por el del juego):
```luau
local Z = {
	start = "Entrada", goal = "Castillo",
	zones = { -- salida: "Zona" o { to = "Zona", need = "llave" }
		Entrada = { exits = { "Bosque" } },
		Bosque = { exits = { "Entrada", "Cueva", "Premio" }, keys = { "llaveRoja" } },
		Cueva = { exits = { "Bosque", { to = "Castillo", need = "llaveRoja" } } },
		Premio = { exits = {}, deadEndOk = true }, -- sala sin salida a propósito
		Castillo = { exits = {} },
	},
	ritmo = { "bajo", "medio", "alto", "alto", "bajo", "climax" }, -- tramos en orden
}
local function explore(from, startKeys)
	local keys, seen, changed = table.clone(startKeys), { [from] = true }, true
	while changed do
		changed = false
		local list = {}
		for name in seen do table.insert(list, name) end
		for _, name in list do
			local z = Z.zones[name]
			if not z then error("zona sin definir: " .. name) end
			for _, k in z.keys or {} do
				if not keys[k] then keys[k] = true; changed = true end
			end
			for _, e in z.exits or {} do
				local to, need = e, nil
				if type(e) == "table" then to, need = e.to, e.need end
				if not seen[to] and (need == nil or keys[need]) then seen[to] = true; changed = true end
			end
		end
	end
	return seen, keys
end
local fromStart, allKeys = explore(Z.start, {})
local fails = {}
if not fromStart[Z.goal] then table.insert(fails, "la meta no se alcanza") end
for name, z in Z.zones do
	if not fromStart[name] then table.insert(fails, "no se llega a " .. name)
	elseif fromStart[name] and name ~= Z.goal and not z.deadEndOk and not (explore(name, allKeys))[Z.goal] then
		table.insert(fails, "atasco sin salida en " .. name)
	end
end
local run = 0
for i, r in Z.ritmo do
	run = (r == "alto" or r == "climax") and run + 1 or 0
	if run > 2 then table.insert(fails, "más de 2 tramos intensos seguidos (tramo " .. i .. ")") end
	if r == "climax" and i > 1 and Z.ritmo[i - 1] ~= "bajo" then table.insert(fails, "sin descanso antes del clímax") end
end
return #fails == 0 and "OK grafo y ritmo" or ("FALLOS: " .. table.concat(fails, "; "))
```
Con el ejemplo sale `OK grafo y ritmo`. La búsqueda de atascos es aproximada: supone que el jugador ya
tiene todas las llaves que se pueden alcanzar. Con llaves que se gastan, recórrelo jugando.

**3. Piezas de referencia e informe de rendimiento:**
```luau
local out, moved = {}, 0
for _, d in workspace:GetDescendants() do
	local ref = d:IsA("BasePart") and d:GetAttribute("RefPos")
	if ref and (d.Position - ref).Magnitude > 0.01 then
		moved += 1
		table.insert(out, "MOVIDA " .. d:GetFullName())
	end
end
local c = { piezas = 0, sinAnclar = 0, sombraPeque = 0, luces = 0, particulas = 0 }
for _, d in workspace:GetDescendants() do
	if d:IsA("BasePart") then
		c.piezas += 1
		if not d.Anchored then c.sinAnclar += 1 end
		if d.CastShadow and math.max(d.Size.X, d.Size.Y, d.Size.Z) < 4 then c.sombraPeque += 1 end
	elseif d:IsA("Light") then c.luces += 1
	elseif d:IsA("ParticleEmitter") then c.particulas += 1
	elseif d:IsA("LuaSourceContainer") then table.insert(out, "REVISAR script en Workspace: " .. d:GetFullName())
	end
end
table.insert(out, ("StreamingEnabled = %s"):format(tostring(workspace.StreamingEnabled)))
for k, v in c do table.insert(out, k .. " = " .. v) end
if c.sombraPeque > 0 then table.insert(out, "REVISAR: piezas pequeñas con sombra") end
return table.concat(out, "\n")
```
Cada «MOVIDA» se devuelve a su sitio (o, si se movió a propósito, se actualiza `RefPos` y `CLAUDE.md`).
Cada «REVISAR» se arregla o se explica: un script en Workspace que no escribisteis puede ser una puerta
trasera. Los números de piezas no tienen un límite fijo: compáralos antes y después de cada cambio, junto
con los milisegundos del MicroProfiler en el aparato más flojo.

## Gotchas (síntoma → causa → arreglo)
- **Casi nadie pasa un salto** → hueco puesto a ojo, cerca del 100 % del salto → 70 % del salto medido;
  comprobación 1.
- **El nivel de repente es imposible** → alguien cambió `WalkSpeed`, `JumpHeight` o la gravedad → vuelve a
  medir y revisa todos los huecos.
- **Los jugadores se van a mitad del nivel** → muchos tramos difíciles seguidos o se pierde mucho avance al
  fallar → ritmo con descansos y puntos de control antes de lo difícil.
- **Un jugador se queda encerrado** → camino de un solo sentido o punto de control tras una puerta cerrada →
  grafo de zonas; nunca guardar punto de control donde no se puede salir.
- **La zona de aparición, el suelo o la meta se movieron** → pieza de referencia arrastrada sin querer →
  `Locked`, atributo `RefPos` y comprobación 3 (lección real).
- **Aparece un script raro en el mapa** → modelo gratis de la Caja de herramientas → quítalo y busca
  scripts en Workspace (lección real).
- **Error «X is not a valid member» solo en el teléfono o lejos** → con StreamingEnabled ese objeto aún no
  ha llegado al cliente → `WaitForChild` con tope o `ModelStreamingMode = Persistent` para lo imprescindible.
- **Tras teletransportar, el jugador cae al vacío** → el mapa del destino no había llegado →
  `RequestStreamAroundAsync` antes de mover.
- **Va bien en el ordenador y a tirones en el móvil** → sin margen; el móvil se calienta → apunta a 12–13 ms
  y mide en el aparato flojo.
- **Se «optimizó» y va igual o peor** → se arregló sin medir o varias cosas a la vez → mide, un cambio, mide.
- **Los efectos parpadean al acercarse** → un solo radio para encender y apagar → dos radios (350 / 400).
- **La memoria sube sin parar** → conexiones y tablas por jugador que no se limpian → desconectar y borrar
  en `PlayerRemoving` y `Destroying`.

## Etiquetas de resultado
**ejecutado** (comprobaciones 1–3 vistas, salto confirmado en Play, milisegundos medidos en un aparato) ·
**verificado leyendo** (revisaste el grafo y el ritmo con la persona) · **preparado sin ejecutar** · **no
verificado** (rendimiento en un teléfono real que no se probó, streaming con mala conexión). Nunca digas
«va fluido» sin medidas **ejecutadas** en el aparato más flojo.
