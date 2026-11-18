---
name: rc-npc
description: >
  Enemigos y personajes no jugadores (NPC) de un juego de Roblox que se comportan bien y no tumban el
  servidor: elegir máquina de estados, árbol de comportamiento o utilidad, umbrales con histéresis (10 m
  para empezar a perseguir, 14 m para dejarlo), tiempo mínimo en cada estado, PathfindingService con
  Path.Status y recálculo, atascos, pensar a 5–15 veces por segundo, NPC movidos por el servidor, y
  diálogos como datos con IDs sin loadstring. Úsala con enemigos, monstruos, mascotas o diálogos (NPC, AI,
  enemy, pathfinding, state machine, behavior tree, dialogue). No para colisiones o reapariciones de
  jugadores (rc-personajes-fisica) ni validar remotos (rc-servidor).
---

# rc-npc · Personajes que piensan poco, deciden claro y no se atascan

Un buen enemigo no es listo: es **claro**. El jugador entiende qué hace y por qué, y puede aprender a
ganarle. Para eso bastan pocos estados, cambios entre ellos que no tiemblen y rutas que se recalculan
cuando hace falta, no a cada fotograma.

Última comprobación: 2026-11-18 (API de PathfindingService, Path.Status, Path.Blocked,
PathWaypointAction y Humanoid.MoveTo; método y números de awesome-gamedev-agent-skills, ver `NOTICE` del
plugin).

## Cuándo usarla
- Hay enemigos, monstruos, guardias, mascotas, vendedores o cualquier personaje que no es un jugador.
- Un NPC tiembla entre dos cosas, se queda atascado, atraviesa paredes o no encuentra el camino.
- El servidor va lento con muchos NPC.
- Hay conversaciones con NPC, misiones dadas por un NPC o historias con ramas.

## Pasos (en orden)
1. **Escribe con la persona qué hace el NPC** en frases: «patrulla; si te ve cerca, te persigue; si te
   alejas, vuelve a casa». Esas frases son los estados.
2. **Elige el cerebro** (tabla de abajo). Por defecto, máquina de estados.
3. **Módulo `Brain`** puro (estados, histéresis, tiempo mínimo, atasco) con su batería N1–N8.
4. **Bucle del servidor** que piensa a 10 veces por segundo para todos los NPC y usa rutas.
5. Daño y premios del NPC, en el servidor con enfriamiento (`rc-servidor`).
6. Si hay diálogos: **datos con IDs** y su comprobación.
7. **Comprobación ejecutable:** N1–N8 `OK 0 fallos`, el diálogo sin fallos y las rutas entre los puntos
   importantes en `Success`; después, en Play, 5 minutos con 2 jugadores sin NPC atascados ni temblando.

## Elegir el cerebro
| Caso | Usa | Por qué |
|---|---|---|
| 2–6 comportamientos claros (patrullar, perseguir, atacar, volver) | **Máquina de estados** (FSM) | Fácil de leer y de probar; sirve para casi todo en Roblox |
| Muchas prioridades y pasos en orden («si tiene poca vida, huye; si no, si ve al jugador, ataca; si no…») | **Árbol de comportamiento** | Se añaden ramas sin romper las otras |
| Elegir entre muchas necesidades (comer, dormir, jugar: mascotas, granjeros, ciudades) | **Utilidad** (puntuar opciones) | El NPC elige lo que más puntúa ahora |

Empieza por la más simple que sirva. Si la máquina de estados pasa de ~6 estados con muchas flechas, piensa
en un árbol.

## Reglas que evitan los fallos típicos
- **Histéresis**: umbrales distintos para empezar y para dejar algo. Empieza a perseguir a **10 m** y deja
  de hacerlo a **14 m** (en Roblox, 1 stud ≈ 0,28 m: unos **35 y 50 studs**). Con un solo umbral, un
  jugador justo en el borde hace temblar al NPC entre dos estados.
- **Tiempo mínimo en cada estado: 0,3–0,5 s.** Evita cambios de idea a cada fotograma.
- **Pensar a 5–15 veces por segundo**, con un solo bucle para todos los NPC. Nada de un `Heartbeat` por NPC.
- **Rutas**: recalcula cada **0,25–0,5 s** como mucho y solo si el objetivo se movió **1–2 m** (≈ 4–7 studs),
  si la ruta se bloqueó o si no había ruta. Mira siempre `Path.Status`: si no es `Success`, no hay ruta.
- **Atasco**: menos de **0,5 studs** de avance en **2 s** mientras intenta moverse. Primero salta y
  recalcula; si sigue, vuelve a casa o reaparece en su punto.
- **El servidor mueve a los NPC**: `SetNetworkOwner(nil)` en su pieza raíz (si no está anclada). Si no, el
  cliente más cercano los mueve y un tramposo puede llevárselos.
- **Daño y botín en el servidor**, con enfriamiento apuntado antes de esperar (`rc-servidor`).
- **Muchos NPC** (más de ~30 con `Humanoid`): mide (`rc-mundo`). Mueve menos a la vez, duérmelos lejos de
  los jugadores, o usa piezas ancladas movidas con `CFrame` en vez de `Humanoid` (más trabajo).
- Que el jugador **vea** lo que piensa el NPC: un «!» al verte, un sonido al empezar a perseguir, un gesto
  antes de atacar. Así es justo.

## Patrones

### `Brain` (`ServerScriptService/NPC/Brain`, ModuleScript, sin nada de Roblox dentro)
```luau
local Brain = {}
Brain.CHASE_START = 35 -- studs (~10 m)
Brain.CHASE_STOP = 50  -- studs (~14 m): más lejos que al empezar (histéresis)
Brain.ATTACK = 6
Brain.MIN_STATE_TIME = 0.4

function Brain.new(now) return { state = "patrol", since = now } end
function Brain.set(b, state, now) if b.state ~= state then b.state, b.since = state, now end end

-- dist = distancia al jugador vivo más cercano (math.huge si no hay)
function Brain.step(b, dist, now)
	if now - b.since < Brain.MIN_STATE_TIME then return b.state end
	local s = b.state
	if s == "patrol" or s == "return" then
		if dist <= Brain.CHASE_START then s = "chase" end
	elseif s == "chase" then
		if dist <= Brain.ATTACK then s = "attack" elseif dist > Brain.CHASE_STOP then s = "return" end
	elseif s == "attack" then
		if dist > Brain.ATTACK * 1.5 then s = "chase" end
	end
	Brain.set(b, s, now) -- de "return" a "patrol" lo pasa el bucle al llegar a casa
	return b.state
end

function Brain.newStuck() return { pos = nil, t = 0 } end
-- true si avanzó menos de 0,5 studs en 2 s. Llámalo solo mientras intenta moverse.
function Brain.isStuck(st, pos, now)
	if not st.pos or (pos - st.pos).Magnitude >= 0.5 then st.pos, st.t = pos, now; return false end
	return now - st.t >= 2
end

return Brain
```

### Bucle del servidor (`ServerScriptService/NPC/Main`, Script)
Los NPC llevan la etiqueta `Enemigo` (CollectionService), un `Humanoid` y una `HumanoidRootPart`.
```luau
local Players = game:GetService("Players")
local PathfindingService = game:GetService("PathfindingService")
local CollectionService = game:GetService("CollectionService")
local Brain = require(script.Parent.Brain)

local TICK, REPATH_EVERY, REPATH_MOVE = 0.1, 0.4, 5
local npcs = {}

local function flat(v) return Vector3.new(v.X, 0, v.Z).Magnitude end

local function nearestPlayer(pos)
	local best, bestD = nil, math.huge
	for _, plr in Players:GetPlayers() do
		local char = plr.Character
		local root = char and char:FindFirstChild("HumanoidRootPart")
		local hum = char and char:FindFirstChildOfClass("Humanoid")
		if root and hum and hum.Health > 0 then
			local d = (root.Position - pos).Magnitude
			if d < bestD then best, bestD = root, d end
		end
	end
	return best, bestD
end

local function add(model)
	local hum, root = model:FindFirstChildOfClass("Humanoid"), model:FindFirstChild("HumanoidRootPart")
	if not hum or not root or npcs[model] or not model:IsDescendantOf(workspace) then return end -- plantillas fuera
	pcall(root.SetNetworkOwner, root, nil) -- falla si algo del modelo está anclado: entonces no hace falta
	local npc = {
		model = model, hum = hum, root = root, home = root.Position,
		brain = Brain.new(os.clock()), stuck = Brain.newStuck(),
		path = PathfindingService:CreatePath({ AgentRadius = 2, AgentHeight = 5, AgentCanJump = true }),
		waypoints = nil, wp = 1, goal = nil, lastPath = -math.huge, computing = false, blocked = false,
	}
	npc.path.Blocked:Connect(function(i) if i >= npc.wp then npc.blocked = true end end)
	npcs[model] = npc
end

local function repath(npc, goal, now)
	if npc.computing then return end
	npc.computing, npc.lastPath, npc.goal, npc.blocked = true, now, goal, false
	task.spawn(function() -- ComputeAsync espera: fuera del bucle
		local ok = pcall(npc.path.ComputeAsync, npc.path, npc.root.Position, goal)
		if ok and npc.path.Status == Enum.PathStatus.Success then
			npc.waypoints, npc.wp = npc.path:GetWaypoints(), 2 -- el 1 es donde ya está
		else
			npc.waypoints = nil
		end
		npc.computing = false
	end)
end

local function goTo(npc, goal, now)
	local due = now - npc.lastPath >= REPATH_EVERY
	if due and (npc.waypoints == nil or npc.blocked or flat(goal - npc.goal) > REPATH_MOVE) then
		repath(npc, goal, now)
	end
	local w = npc.waypoints and npc.waypoints[npc.wp]
	if w and flat(w.Position - npc.root.Position) < 2 then -- en plano: la raíz va ~3 studs sobre el suelo
		npc.wp += 1
		w = npc.waypoints[npc.wp]
	end
	if not w then return end
	if w.Action == Enum.PathWaypointAction.Jump and npc.jumpedAt ~= w then npc.hum.Jump = true; npc.jumpedAt = w end
	npc.hum:MoveTo(w.Position)
	if Brain.isStuck(npc.stuck, npc.root.Position, now) then
		npc.hum.Jump = true
		npc.blocked = true -- recalcula en el siguiente turno
		npc.stuck.pos = nil
	end
end

local function think(npc, now)
	local target, dist = nearestPlayer(npc.root.Position)
	local state = Brain.step(npc.brain, dist, now)
	if state ~= "chase" and state ~= "return" then npc.stuck.pos = nil end -- quieto a propósito no es atasco
	if state == "chase" and target then
		goTo(npc, target.Position, now)
	elseif state == "attack" then
		npc.hum:MoveTo(npc.root.Position) -- se para; el daño, en el servidor con enfriamiento (rc-servidor)
	elseif state == "return" then
		goTo(npc, npc.home, now)
		if flat(npc.home - npc.root.Position) < 4 then Brain.set(npc.brain, "patrol", now) end
	end -- "patrol": quieto o entre puntos fijos, con el mismo goTo
end

for _, m in CollectionService:GetTagged("Enemigo") do add(m) end
CollectionService:GetInstanceAddedSignal("Enemigo"):Connect(add)
workspace.DescendantAdded:Connect(function(d) -- una plantilla clonada a Workspace
	if CollectionService:HasTag(d, "Enemigo") then add(d) end
end)

while true do
	local now = os.clock()
	for model, npc in npcs do
		if model.Parent and npc.hum.Health > 0 then
			think(npc, now)
		else
			npc.path:Destroy()
			npcs[model] = nil
		end
	end
	task.wait(TICK)
end
```
- Muy cerca y a la vista (un `workspace:Raycast` sin choque), se puede ir directo con `MoveTo(objetivo)`
  sin ruta: más barato.
- `AgentRadius` y `AgentHeight` deben ser los del NPC: si es grande y le das los de uno pequeño, intenta
  pasar por huecos donde no cabe.
- Si `Status` no es `Success` (no hay ruta), no lo fuerces: vuelve a casa o espera.

### Utilidad: puntuar opciones
```luau
local function choose(npc, options, current) -- options = { { name = "comer", score = function(npc) return 0..1 end } }
	local best, bestScore = nil, -math.huge
	for _, o in options do
		local s = o.score(npc) + (o == current and 0.1 or 0) -- inercia: no cambia por poco
		if s > bestScore then best, bestScore = o, s end
	end
	return best
end
```
La inercia (+0,1 a la opción actual) es la histéresis de la utilidad. Junto con el tiempo mínimo, evita que
la mascota cambie de idea cada segundo.

## Diálogos como datos
Los diálogos son **tablas con IDs**, no código. Nada de `loadstring` ni de textos que se ejecutan.
```luau
-- ReplicatedStorage/Shared/Dialogues/Herrero (ModuleScript): lo leen el cliente (texto) y el servidor (lógica)
return {
	id = "Herrero", start = "hola",
	nodes = {
		hola = { text = "¡Hola! ¿Buscas algo?", options = {
			{ text = "Quiero una misión", go = "mision" },
			{ text = "Adiós" }, -- sin `go`: termina
		} },
		mision = { text = "Tráeme 3 setas del bosque.", options = {
			{ text = "¡Vale!", action = "startQuest", arg = "setas" },
			{ text = "Ahora no", go = "hola" },
		} },
	},
}
```
- El cliente manda **el número de la opción**; el servidor sabe en qué nodo está ese jugador, comprueba que
  la opción existe, que sigue cerca del NPC y ejecuta la acción **de una lista permitida**
  (`Actions[opt.action]`). El cliente nunca manda el nombre de la acción ni el premio.
- **Un coste o un premio en un nodo al que se puede volver se cobra o se da cada vez.** Si debe ser una
  sola vez, la acción mira una bandera guardada en el perfil (`rc-datos`).
- Textos según la edad del público (`rc-interfaz`). Los nombres de jugador que se meten en un texto ya
  están filtrados por Roblox; el texto que escribe un jugador, siempre por el filtro.
- Historias largas con ramas: el mismo formato, y la comprobación de abajo recorre todas.

### Manejador del servidor
```luau
local talking = {} -- [player] = { dialogue = D, node = "hola", npc = model }
Remotes.DialogueChoose.OnServerEvent:Connect(function(player, index)
	if not Guard.allow("Dialogue", player, 3, 5) then return end
	if not Guard.int(index, 1, 10) then return end
	local s = talking[player]
	if not s or s.busy then return end -- una opción cada vez
	local node = s.dialogue.nodes[s.node]
	local opt = node and node.options and node.options[index]
	if not opt then return end
	if not Guard.near(player, s.npc:GetPivot().Position, 15) then talking[player] = nil; return end
	local done = true
	if opt.action then
		s.busy = true -- ANTES de la acción: si espera, otra petición no la repite
		local act = Actions[opt.action] -- Actions: tu tabla de acciones permitidas
		local ok, res = pcall(function() return act ~= nil and act(player, opt.arg) end)
		s.busy = false
		done = ok and res == true
	end
	if not done then return end -- no se pudo (sin dinero, error): sigue en el mismo nodo
	s.node = opt.go
	if not opt.go then talking[player] = nil end
	Remotes.DialogueShow:FireClient(player, s.dialogue.id, opt.go) -- IDs, no textos
end)
Players.PlayerRemoving:Connect(function(p) talking[p] = nil end)
```
La conversación la abre el servidor, p. ej. con un `ProximityPrompt` en el NPC:
`prompt.Triggered:Connect(function(player) talking[player] = { dialogue = D, node = D.start, npc = model } … end)`.
Nunca con un remoto que diga «hablo con tal NPC».

## Comprobación ejecutable (Edit, por el MCP `execute_luau` o en la barra de comandos)
**1. Batería del `Brain`:**
```luau
local Brain = require(game.ServerScriptService.NPC.Brain:Clone())
local fails = {}
local function check(id, cond) if not cond then table.insert(fails, id) end end
local b = Brain.new(0)
check("N1 lejos: sigue patrullando", Brain.step(b, 40, 1) == "patrol")
check("N2 cerca: persigue", Brain.step(b, 30, 1) == "chase")
check("N3 histéresis: a 40 sigue persiguiendo", Brain.step(b, 40, 2) == "chase")
check("N4 muy lejos: vuelve", Brain.step(b, 55, 3) == "return")
local m = Brain.new(0)
check("N5 tiempo mínimo", Brain.step(m, 30, 0.1) == "patrol" and Brain.step(m, 30, 0.5) == "chase")
check("N6 ataca y no tiembla", Brain.step(m, 5, 1) == "attack" and Brain.step(m, 7, 2) == "attack")
local st = Brain.newStuck()
Brain.isStuck(st, Vector3.zero, 0)
check("N7 atasco", not Brain.isStuck(st, Vector3.zero, 1) and Brain.isStuck(st, Vector3.zero, 2.1))
local mv, stuckSeen = Brain.newStuck(), false
for i = 0, 10 do if Brain.isStuck(mv, Vector3.new(i, 0, 0), i * 0.5) then stuckSeen = true end end
local o, changes, last = Brain.new(0), 0, "patrol"
for i = 1, 30 do -- jugador justo en el borde: 34 / 36 cada 0,1 s
	local s = Brain.step(o, i % 2 == 0 and 34 or 36, i * 0.1)
	if s ~= last then changes += 1; last = s end
end
check("N8 avanzar no es atasco y el borde no hace temblar", not stuckSeen and changes == 1)
return #fails == 0 and "OK 0 fallos" or ("FALLOS: " .. table.concat(fails, ", "))
```

**2. Diálogos** (pon tus diálogos en la lista y los nombres de tus acciones en `actions`):
```luau
local actions = { startQuest = true }
local dialogues = { require(game.ReplicatedStorage.Shared.Dialogues.Herrero:Clone()) }
local fails = {}
for _, d in dialogues do
	local function bad(msg) table.insert(fails, d.id .. ": " .. msg) end
	if not d.nodes[d.start] then bad("no existe el inicio " .. tostring(d.start)) end
	for id, node in d.nodes do
		if type(node.text) ~= "string" or node.text == "" then bad(id .. " sin texto") end
		if #(node.options or {}) > 10 then bad(id .. " tiene más de 10 opciones (el servidor acepta 1–10)") end
		for i, opt in node.options or {} do
			if type(opt.text) ~= "string" or opt.text == "" then bad(("%s[%d] sin texto"):format(id, i)) end
			if opt.go ~= nil and not d.nodes[opt.go] then bad(("%s[%d] va a «%s», que no existe"):format(id, i, opt.go)) end
			if opt.action ~= nil and not actions[opt.action] then bad(("%s[%d] acción «%s» no permitida"):format(id, i, opt.action)) end
		end
	end
	local seen, queue = { [d.start] = true }, { d.start } -- ¿se llega a cada nodo?
	while #queue > 0 do
		local node = d.nodes[table.remove(queue)]
		for _, opt in node and node.options or {} do
			if opt.go and d.nodes[opt.go] and not seen[opt.go] then seen[opt.go] = true; table.insert(queue, opt.go) end
		end
	end
	local ends, changed = {}, true -- ¿se puede terminar desde cada nodo?
	while changed do
		changed = false
		for id, node in d.nodes do
			if not ends[id] then
				local opts = node.options or {}
				local ok = #opts == 0
				for _, opt in opts do if opt.go == nil or ends[opt.go] then ok = true end end
				if ok then ends[id] = true; changed = true end
			end
		end
	end
	for id in d.nodes do
		if not seen[id] then bad(id .. " no se alcanza desde el inicio") end
		if not ends[id] then bad(id .. " es un bucle sin salida") end
	end
end
return #fails == 0 and "OK diálogos" or ("FALLOS:\n" .. table.concat(fails, "\n"))
```

**3. Rutas entre puntos importantes** (en Edit o en Play desde el servidor; si en Edit da error, en
Play). Pon partes en `workspace.RutasNPC` (aparición de enemigos, casa, metas):
```luau
local PathfindingService = game:GetService("PathfindingService")
local list = workspace.RutasNPC:GetChildren()
local path = PathfindingService:CreatePath({ AgentRadius = 2, AgentHeight = 5, AgentCanJump = true })
local out = {}
for i = 1, #list do
	for j = i + 1, #list do
		local ok = pcall(path.ComputeAsync, path, list[i].Position, list[j].Position)
		table.insert(out, ("%s → %s: %s"):format(list[i].Name, list[j].Name, ok and path.Status.Name or "error"))
	end
end
return table.concat(out, "\n")
```
Toda línea que no diga `Success` se arregla (abrir paso, mover el punto) o se explica.

**4. En Play** (Prueba → Clientes y servidores / Test → Clients and Servers, 2 jugadores, 5 minutos):
ningún NPC atascado más de unos segundos, ninguno temblando en el borde, los enemigos no se van con un
jugador (los mueve el servidor) y la Salida sin errores rojos.

## Gotchas (síntoma → causa → arreglo)
- **El NPC tiembla entre perseguir y parar** → un solo umbral → histéresis (35 / 50 studs) y tiempo mínimo
  (N3, N8).
- **El NPC se queda pegado a una pared** → sin detector de atasco o ruta vieja → `isStuck`, saltar y
  recalcular; si sigue, a casa.
- **El NPC camina hacia la nada** → no se miró `Path.Status` y se siguió una ruta vacía → solo con `Success`.
- **El NPC nunca pasa al siguiente punto** → se medía la distancia en 3D y la raíz va ~3 studs sobre el
  suelo → distancia en plano.
- **El servidor va a tirones con muchos NPC** → un `Heartbeat` y una ruta nueva por NPC en cada fotograma →
  un bucle a 10 por segundo y recálculo con tope.
- **Un tramposo arrastra a los enemigos** → los movía el cliente cercano → `SetNetworkOwner(nil)`.
- **El NPC sigue a un jugador muerto o que se fue** → se guardaba el objetivo → busca el más cercano vivo
  en cada turno.
- **El NPC no cabe por donde la ruta le manda** → `AgentRadius` y `AgentHeight` de otro tamaño → los
  suyos.
- **Repetir un diálogo da el premio otra vez** → premio en un nodo al que se vuelve → bandera «una vez» en
  el perfil.
- **Un tramposo elige una opción que no está** → el cliente mandaba la acción → solo el número; el
  servidor sabe el nodo y la acción sale de la lista permitida.
- **Un diálogo se queda sin salida** → una rama que vuelve sobre sí misma → comprobación 2.
- **Studio se cuelga esperando a que el NPC llegue** → `repeat … until` o `MoveToFinished:Wait()` sin tope →
  el bucle mira la distancia cada turno; nada de esperas sin plazo (lección real).

## Etiquetas de resultado
**ejecutado** (N1–N8 `OK 0 fallos`, diálogos `OK`, rutas en `Success`, los 5 minutos en Play vistos) ·
**verificado leyendo** · **preparado sin ejecutar** · **no verificado** (muchos jugadores reales a la vez,
rendimiento en servidores llenos). Nunca digas «la IA funciona» sin la prueba en Play **ejecutada**.
