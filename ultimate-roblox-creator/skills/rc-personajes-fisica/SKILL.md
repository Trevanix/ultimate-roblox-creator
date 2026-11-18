---
name: rc-personajes-fisica
description: >
  Personajes y físicas de un juego de Roblox que aguantan reapariciones: ciclo de vida del personaje
  (CharacterAdded, contador de generación tras cada espera, Animator en vez de Humanoid:LoadAnimation,
  prueba de 5 reapariciones), grupos de colisión, CanCollide/CanTouch/CanQuery, Touched con freno,
  raycast para cosas rápidas, propiedad de red (SetNetworkOwner) y restricciones en vez de BodyMovers.
  Úsala con respawn, animaciones, colisiones, empujones o proyectiles (character, respawn, animation,
  collision group, raycast, network ownership). No para remotos (rc-servidor), mapas y rendimiento
  (rc-mundo), NPC (rc-npc), ni dudas sueltas (roblox-game, plugin roblox-dev).
---

# rc-personajes-fisica · Que nada se rompa al reaparecer

El personaje se destruye y se crea de nuevo cada vez que el jugador muere o reaparece. Casi todos los
fallos de «a la segunda vida ya no funciona» vienen de ahí. Y en físicas, casi todo depende de quién
mueve cada pieza (servidor o cliente) y de qué choca con qué.

Última comprobación: 2026-11-18 (API de Player, Humanoid, Animator, PhysicsService, WorldRoot:Raycast;
método de awesome-gamedev-agent-skills, ver `NOTICE` del plugin).

## Cuándo usarla
- Algo se pone en el personaje (herramienta, efecto, estela, vida extra, animación).
- Hay reapariciones, muertes, puntos de control o teletransportes dentro del lugar.
- Hay que decidir qué choca con qué (jugadores que se atraviesan, zonas, puertas).
- Proyectiles, objetos rápidos, empujones, objetos que se mueven solos o que el jugador empuja.

## Pasos (en orden)
1. **Lista lo que va en el personaje** y si es del servidor (vida, herramientas, daño) o del cliente
   (animaciones propias, efectos que solo ve él).
2. **Ciclo de vida**: todo lo del personaje se crea en `CharacterAdded` con contador de generación
   (patrón de abajo). Nada se guarda «para siempre» en una variable del personaje.
3. **Animaciones** con `Animator`, cargadas una vez por personaje.
4. **Colisiones**: grupos registrados desde **un solo** script del servidor; piezas de decorado sin
   tocar ni consultar.
5. **Físicas**: propiedad de red de lo importante en el servidor; restricciones modernas; raycast para lo
   rápido.
6. **Comprobación ejecutable**: la prueba de 5 reapariciones en Play devuelve `OK`, y la de colisiones
   en Edit devuelve `OK 0 fallos`.

## Patrones

### Ciclo de vida con contador de generación (servidor o cliente)
Tras **cada** espera, comprueba que el personaje sigue siendo el mismo: si el jugador reapareció mientras
tanto, lo que estabas haciendo es para un personaje que ya no existe.
```luau
local Players = game:GetService("Players")
local generation = {} -- [player] = número de personaje

local function onCharacter(player, char)
	generation[player] = (generation[player] or 0) + 1
	local myGen = generation[player]
	local function stillSame() return generation[player] == myGen and char.Parent ~= nil end

	local hum = char:WaitForChild("Humanoid", 10)
	if not hum or not stillSame() then return end

	-- … preparar lo de este personaje (herramientas, efectos, vida) …

	hum.Died:Connect(function()
		task.wait(2)
		if not stillSame() then return end -- ya reapareció: no tocar el nuevo
		-- … efecto de muerte …
	end)
end

local function onPlayer(player)
	player.CharacterAdded:Connect(function(char) onCharacter(player, char) end)
	if player.Character then task.spawn(onCharacter, player, player.Character) end -- ya tenía uno
end
Players.PlayerAdded:Connect(onPlayer)
for _, p in Players:GetPlayers() do task.spawn(onPlayer, p) end
Players.PlayerRemoving:Connect(function(p) generation[p] = nil end)
```
- Que el personaje viejo se **destruya** al reaparecer depende de `Workspace.PlayerCharacterDestroyBehavior`
  (si solo se quita del mapa, nada se limpia solo). No lo des por hecho: limpia tú en `hum.Died` y usa
  tablas con claves débiles para lo que cuelga del personaje.
- Las conexiones **a piezas del personaje** se limpian solas cuando se destruye. Las conexiones a cosas
  que siguen vivas (`RunService.Heartbeat`, otro jugador, una pieza del mapa) **no**: desconéctalas en
  `hum.Died` o cuando `stillSame()` sea falso.
- Un `LocalScript` en `StarterCharacterScripts` corre de nuevo en cada personaje; uno en
  `StarterPlayerScripts` corre una vez y tiene que escuchar `CharacterAdded` él mismo.
- Para mover al personaje: `char:PivotTo(cframe)` (y avisa al antitrampas, `rc-servidor`).
- Daño en el servidor con `hum:TakeDamage(n)` (respeta el `ForceField` de la aparición).

### Animaciones con Animator
```luau
-- [animator] = { [nombre] = AnimationTrack }; una vez por personaje. Claves débiles: si el personaje viejo
-- no se destruye, la entrada se va sola cuando nadie lo usa.
local tracks = setmetatable({}, { __mode = "k" })

local function getTrack(char, name, animId)
	local hum = char:FindFirstChildOfClass("Humanoid")
	local animator = hum and (hum:FindFirstChildOfClass("Animator") or hum:WaitForChild("Animator", 5))
	if not animator then return nil end
	tracks[animator] = tracks[animator] or {}
	local t = tracks[animator][name]
	if not t then
		local anim = Instance.new("Animation")
		anim.AnimationId = animId -- "rbxassetid://…"
		t = animator:LoadAnimation(anim)
		tracks[animator][name] = t
		animator.Destroying:Connect(function() tracks[animator] = nil end)
	end
	return t
end
-- getTrack(char, "Wave", WAVE_ID):Play()
```
- `Humanoid:LoadAnimation` está obsoleto: siempre `Animator:LoadAnimation`.
- No cargues la misma animación en cada uso: se acumulan pistas y llega un límite.
- Las animaciones del jugador se reproducen mejor desde **su cliente** (se ven en todos); las de NPC,
  desde el servidor.
- Una animación solo se reproduce en un juego si es del **mismo dueño** que el juego (la persona o su
  grupo). Si se subió desde otra cuenta, en Studio puede ir y publicado no.

### Grupos de colisión (un solo Script de servidor)
```luau
local PhysicsService = game:GetService("PhysicsService")
local Players = game:GetService("Players")

for _, name in { "Players", "Ghosts" } do
	if not PhysicsService:IsCollisionGroupRegistered(name) then PhysicsService:RegisterCollisionGroup(name) end
end
PhysicsService:CollisionGroupSetCollidable("Players", "Players", false) -- los jugadores se atraviesan
PhysicsService:CollisionGroupSetCollidable("Ghosts", "Default", false)

local function setGroup(char, group)
	for _, d in char:GetDescendants() do
		if d:IsA("BasePart") then d.CollisionGroup = group end
	end
	char.DescendantAdded:Connect(function(d) -- accesorios y herramientas llegan después
		if d:IsA("BasePart") then d.CollisionGroup = group end
	end)
end

local function onPlayer(player) -- también los que ya estaban (Studio arranca con el jugador dentro)
	player.CharacterAdded:Connect(function(char) setGroup(char, "Players") end)
	if player.Character then setGroup(player.Character, "Players") end
end
Players.PlayerAdded:Connect(onPlayer)
for _, p in Players:GetPlayers() do onPlayer(p) end
```
- Registra todos los grupos **al empezar** y desde un solo sitio (hay un máximo de 32 y registrar en
  pleno juego es lento). También se pueden crear en el editor de grupos de colisión de Studio.
- El nombre del grupo es texto exacto: una errata deja la pieza en `Default` sin avisar.

### CanCollide, CanTouch y CanQuery van por separado
| Propiedad | Si es `false` |
|---|---|
| `CanCollide` | se atraviesa |
| `CanTouch` | no dispara `Touched` (ni zonas por toque) |
| `CanQuery` | los raycast y búsquedas no la ven (solo se puede apagar si `CanCollide` es `false`) |
- Decorado que no se pisa ni se toca: `Anchored = true`, `CanCollide = false`, `CanTouch = false`,
  `CanQuery = false`. Ahorra trabajo al motor.
- Una zona invisible que detecta: `Transparency = 1`, `CanCollide = false`, `CanTouch = true`.

### Touched con freno por jugador
`Touched` salta muchas veces (una por cada parte del cuerpo y cada roce). Frena por jugador:
```luau
local cooldown = {}
pad.Touched:Connect(function(hit)
	local model = hit:FindFirstAncestorOfClass("Model") -- un accesorio también es parte del personaje
	local player = model and Players:GetPlayerFromCharacter(model)
	if not player then return end
	local now = os.clock()
	if cooldown[player] and now - cooldown[player] < 1 then return end
	cooldown[player] = now -- antes de cualquier espera
	-- … dar el premio (el servidor decide) …
end)
Players.PlayerRemoving:Connect(function(p) cooldown[p] = nil end)
```

### Cosas rápidas: raycast, no Touched
Un objeto rápido atraviesa paredes finas entre dos fotogramas. Para balas y proyectiles, mira el tramo
recorrido con un rayo:
```luau
local params = RaycastParams.new()
params.FilterType = Enum.RaycastFilterType.Exclude
params.FilterDescendantsInstances = { shooterCharacter }

local result = workspace:Raycast(fromPos, toPos - fromPos, params)
if result then
	local hitModel = result.Instance:FindFirstAncestorOfClass("Model")
	-- result.Position, result.Normal, result.Instance
end
```
- Para algo con grosor, `workspace:Spherecast(pos, radius, direction, params)`.
- El impacto que importa (daño) se comprueba en el **servidor** (`rc-servidor`); el efecto, en el cliente.

### Propiedad de red: quién mueve cada pieza
- Una pieza suelta (`Anchored = false`) cerca de un jugador la mueve **el cliente de ese jugador**: un
  tramposo puede llevarla a donde quiera. Para lo importante (la pelota del partido, la puerta, la
  plataforma de la partida):
```luau
if part:CanSetNetworkOwnership() then part:SetNetworkOwner(nil) end -- nil = la mueve el servidor
```
- Las piezas ancladas no tienen dueño (dan error si se lo intentas poner): por eso `CanSetNetworkOwnership`.
- El personaje siempre lo mueve su jugador: velocidad y posición se vigilan en el servidor con márgenes
  (`rc-servidor`).
- Un empujón al jugador desde el servidor a veces no lo mueve (su cliente manda en su personaje): manda
  un evento a **ese** cliente y que aplique `ApplyImpulse` allí, o usa una restricción temporal.
- Mueve con restricciones modernas: `LinearVelocity`, `AlignPosition`, `AlignOrientation`, `VectorForce`.
  Nada de `BodyVelocity`, `BodyPosition` ni `BodyGyro` (obsoletos).

## Comprobación ejecutable
**1. Cinco reapariciones seguidas** (en Play, en el **servidor**, por el MCP `execute_luau` o la barra de
comandos del servidor; con 1 jugador). Cambia `PER_CHARACTER` por los nombres de lo que tu juego pone en
cada personaje: cada uno debe estar **una sola vez** tras cada vida.
```luau
local Players = game:GetService("Players")
local PER_CHARACTER = { "Effects" } -- tus objetos por personaje
local player = Players:GetPlayers()[1]
if not player then return "No hay jugador: entra en Play primero" end
local fails = {}
for i = 1, 5 do
	player:LoadCharacter()
	local char = player.Character
	local deadline = os.clock() + 10
	while not (char and char:FindFirstChildOfClass("Humanoid")) and os.clock() < deadline do
		task.wait(0.1); char = player.Character
	end
	if not char then table.insert(fails, "R" .. i .. " sin personaje") continue end
	task.wait(1.5) -- deja correr los scripts de aparición
	for _, name in PER_CHARACTER do
		local n = 0
		for _, d in char:GetDescendants() do if d.Name == name then n += 1 end end
		if n ~= 1 then table.insert(fails, ("R%d %s=%d"):format(i, name, n)) end
	end
	local hum = char:FindFirstChildOfClass("Humanoid")
	if not hum or hum.Health <= 0 then table.insert(fails, "R" .. i .. " muerto al aparecer") end
end
return #fails == 0 and "OK 5 reapariciones" or ("FALLOS: " .. table.concat(fails, "; "))
```
Después, a ojo en esa misma sesión: la interfaz sigue, las animaciones suenan una vez, la Salida (Output)
sin errores rojos. Mira también la memoria en la consola de desarrollador (F9 → Memoria): no debe subir
vida tras vida.

**2. Colisiones** (Edit). Rellena `EXPECT` con lo que decidió la persona:
```luau
local PhysicsService = game:GetService("PhysicsService")
local EXPECT = { { "Players", "Players", false }, { "Ghosts", "Default", false } }
local fails = {}
for _, e in EXPECT do
	local a, b, want = e[1], e[2], e[3]
	if not (PhysicsService:IsCollisionGroupRegistered(a) and PhysicsService:IsCollisionGroupRegistered(b)) then
		table.insert(fails, a .. "/" .. b .. " sin registrar (¿solo se registran en Play?)")
	elseif PhysicsService:CollisionGroupsAreCollidable(a, b) ~= want then
		table.insert(fails, a .. "/" .. b .. " debería ser " .. tostring(want))
	end
end
return #fails == 0 and "OK 0 fallos" or table.concat(fails, "\n")
```
Si los grupos se crean por código, esta prueba se ejecuta en Play (en el servidor).

## Gotchas (síntoma → causa → arreglo)
- **A la segunda vida algo deja de funcionar** → se guardó el personaje o el Humanoid viejo en una
  variable, o solo se preparó el primer personaje → todo en `CharacterAdded` con contador de generación.
- **Efectos o premios dobles tras reaparecer** → una espera terminó cuando ya había otro personaje → tras
  cada espera, `stillSame()`.
- **El juego va más lento cuanto más se muere** → conexiones a `Heartbeat` o a cosas del mapa que no se
  desconectan → desconéctalas en `Died`; prueba de 5 reapariciones + memoria.
- **El script del primer jugador no prepara nada en Studio** → el personaje ya existía antes de conectar
  `CharacterAdded` → atiende también `player.Character` (patrón de arriba).
- **La animación va en Studio pero no publicada** → la animación es de otra cuenta → súbela con la cuenta
  o el grupo dueño del juego.
- **Aviso de que se cargan demasiadas animaciones** → `LoadAnimation` en cada uso → una vez por
  personaje (tabla `tracks`).
- **Los jugadores se empujan o se atascan en una puerta** → todos en el grupo `Default` → grupo
  `Players` sin colisión entre sí; el accesorio que llega tarde también (`DescendantAdded`).
- **Una zona no detecta nada** → `CanTouch = false`, o la zona está anclada y el otro también (dos piezas
  ancladas no se «tocan») → `CanTouch = true` en la zona; lo que entra debe moverse sin anclar (el personaje no está anclado,
  así que sí la toca).
- **Un rayo no ve una pared** → la pared tiene `CanQuery = false`, o está en la lista de excluidos.
- **El premio de una zona se da 10 veces** → `Touched` sin freno por jugador → freno de 1 s, apuntado antes
  de esperar.
- **Las balas atraviesan paredes** → se movían con física y `Touched` → raycast del tramo recorrido.
- **Un tramposo se lleva la pelota u objeto clave** → la pieza era de su cliente → `SetNetworkOwner(nil)`.
- **Error al poner dueño** → la pieza está anclada → `CanSetNetworkOwnership()` antes.
- **El empujón no mueve al jugador** → lo aplicó el servidor sobre un personaje que mueve el cliente →
  impulso en su cliente, o restricción temporal.
- **Una pieza de referencia del mapa se movió y todo apareció en otro sitio** → se arrastró sin querer en
  Studio → bloquéala (`Locked = true`), apunta su posición en `CLAUDE.md` y compruébala en la batería
  (lección real).

## Etiquetas de resultado
**ejecutado** (5 reapariciones `OK`, colisiones `OK 0 fallos`, visto en Play) · **verificado leyendo** ·
**preparado sin ejecutar** · **no verificado** (retraso real de red con varios jugadores, aparatos reales).
Nunca digas «aguanta reapariciones» sin la prueba de 5 **ejecutada**.
