---
name: rc-servidor
description: >
  El servidor manda en un juego de Roblox: RemoteEvent y RemoteFunction validados en orden (límite por
  remoto, tipo con typeof, NaN e infinito, rango, lista permitida, dueño, estado, distancia), enfriamiento
  apuntado antes de esperar, IDs y no precios, antitrampas con márgenes, modos de prueba cerrados al
  fallo, matriz de abusos con 2+ clientes, y dónde corre cada script (RunContext, WaitForChild con tope,
  task.*). Úsala con remotos, daño, dinero o trampas (exploit, anti-cheat, remote validation, rate limit,
  server authority). No para guardar datos (rc-datos), pantallas (rc-interfaz) o físicas
  (rc-personajes-fisica), ni dudas sueltas de Luau (roblox-game, plugin roblox-dev).
---

# rc-servidor · El cliente pide, el servidor decide

En Roblox cualquiera puede cambiar lo que hace su propio cliente: todo lo que llega por un remoto lo puede
haber escrito un tramposo. El servidor comprueba cada petición y calcula él mismo daño, dinero y premios.

Última comprobación: 2026-11-18 (API de RemoteEvent, RemoteFunction, UnreliableRemoteEvent y RunContext;
método de awesome-gamedev-agent-skills, ver `NOTICE` del plugin).

## Cuándo usarla
- Se crea o se cambia un `RemoteEvent`, `UnreliableRemoteEvent` o `RemoteFunction`.
- Hay daño, monedas, inventario, tienda, premios o cualquier cosa que un tramposo querría.
- Hay que vigilar velocidad o teletransportes (antitrampas).
- Se añade un modo de prueba con trucos.
- Un script «no hace nada» o corre dos veces (dónde corre cada script).

## Dónde corre cada script
- `Script` (servidor) en `ServerScriptService`; módulos del servidor en `ServerScriptService` o
  `ServerStorage` (el cliente no los ve).
- `LocalScript` solo corre en sitios del cliente: `StarterPlayerScripts`, `StarterCharacterScripts`,
  `StarterGui`, `ReplicatedFirst`, la mochila o el personaje. **En `Workspace` (fuera del personaje) o en
  `ServerScriptService` nunca corre**, sin error.
- Un `Script` con `RunContext = Client` corre en el cliente desde casi cualquier sitio; dentro de una
  carpeta `Starter*` corre **dos veces** (en el original y en la copia). Usa uno u otro, no los mezcles.
- Lo que hay en `ReplicatedStorage` y `Workspace` lo lee cualquier cliente: nada secreto ahí.
- Siempre `task.wait`, `task.spawn`, `task.delay` (no los viejos `wait`, `spawn`, `delay`).
- `typeof(x)` para tipos de Roblox (`"Vector3"`, `"Instance"`); `type(x)` solo dice `"userdata"`.
- `WaitForChild` **con tope**: `folder:WaitForChild("Remotes", 10)` devuelve `nil` si no llega; compruébalo.
- Un `BindableEvent` no valida nada: si reenvías por él lo que llegó de un remoto, valida antes.

## Pasos (en orden)
1. **Lista los remotos** del juego con, para cada uno: quién lo envía, qué datos lleva, qué hace en el
   servidor y qué límite tiene. Apúntalo en `CLAUDE.md` del proyecto.
2. **Crea los remotos en el servidor** (una carpeta `ReplicatedStorage/Remotes`, desde un solo script) y
   en el cliente búscalos con `WaitForChild` con tope.
3. **Módulo `Guard`** (abajo) con las comprobaciones de siempre y un solo reloj.
4. **Cada manejador sigue el orden de validación** (abajo) y termina haciendo el cálculo en el servidor.
5. **Antitrampas** solo si hace falta, y con márgenes.
6. **Modos de prueba** cerrados al fallo.
7. **Comprobación ejecutable:** en Edit, la batería S1–S10 devuelve `OK 0 fallos` y la auditoría de
   remotos no dice «SIN LÍMITE»; después, la matriz de abusos en Play con 2 clientes.
8. **Revisión independiente:** agente `revisor-seguridad-datos` (solo lectura) sobre los remotos nuevos.

## Orden de validación en cada remoto
1. **Límite** por remoto y jugador (lo más barato, primero).
2. **Tipo** de cada argumento (`type` / `typeof`).
3. **NaN e infinito** (`n ~= n` es NaN; `math.huge` es infinito).
4. **Rango**: enteros donde toca, mínimo y máximo, largo de textos, tamaño de tablas.
5. **Lista permitida**: el ID existe en tu tabla de configuración.
6. **Objeto y dueño**: la casilla, la mascota o el objeto existen y son de **ese** jugador.
7. **Estado**: vivo, no en el menú, no ya en partida, perfil cargado (`rc-datos`).
8. **Distancia** con margen generoso.
9. **Actuar**: el servidor calcula y aplica. El cliente nunca dice «gané 50» ni «cuesta 10».

## Patrones

### Módulo `Guard` (`ServerScriptService/Net/Guard`, ModuleScript)
```luau
local Players = game:GetService("Players")
local Guard = {}
Guard.now = os.clock -- UN reloj para todos los límites (las pruebas lo cambian)

function Guard.num(v, lo, hi) -- rechaza NaN; con lo/hi finitos también rechaza infinito
	return type(v) == "number" and v == v and v >= lo and v <= hi
end
function Guard.int(v, lo, hi)
	return Guard.num(v, lo, hi) and v % 1 == 0
end
function Guard.str(v, maxLen)
	return type(v) == "string" and #v <= maxLen and utf8.len(v) ~= nil
end
function Guard.vec(v, maxAbs)
	return typeof(v) == "Vector3"
		and Guard.num(v.X, -maxAbs, maxAbs) and Guard.num(v.Y, -maxAbs, maxAbs) and Guard.num(v.Z, -maxAbs, maxAbs)
end
function Guard.oneOf(v, allowed) -- allowed = { sword = true, shield = true }
	return type(v) == "string" and allowed[v] == true
end
function Guard.partIn(v, container)
	return typeof(v) == "Instance" and v:IsA("BasePart") and v:IsDescendantOf(container)
end

-- Límite por remoto y jugador: `burst` seguidas como mucho; se recuperan `rate` por segundo.
local buckets = {}
function Guard.allow(name, player, rate, burst)
	local byPlayer = buckets[name]
	if not byPlayer then byPlayer = {}; buckets[name] = byPlayer end
	local now = Guard.now()
	local b = byPlayer[player]
	if not b then b = { tokens = burst, t = now }; byPlayer[player] = b end
	b.tokens = math.min(burst, b.tokens + (now - b.t) * rate)
	b.t = now
	if b.tokens < 1 then return false end
	b.tokens -= 1
	return true
end
Players.PlayerRemoving:Connect(function(p)
	for _, byPlayer in buckets do byPlayer[p] = nil end
end)

function Guard.near(player, pos, maxDist) -- vivo y cerca
	local char = player.Character
	local root = char and char:FindFirstChild("HumanoidRootPart")
	local hum = char and char:FindFirstChildOfClass("Humanoid")
	return root ~= nil and hum ~= nil and hum.Health > 0 and (root.Position - pos).Magnitude <= maxDist
end

return Guard
```

### Un manejador completo: comprar con moneda del juego
El cliente manda **el ID**; el precio lo pone el servidor. Comprobar saldo y restar va **seguido, sin
esperas entre medio**.
```luau
Remotes.Buy.OnServerEvent:Connect(function(player, itemId)
	if not Guard.allow("Buy", player, 2, 3) then return end   -- 1
	if not Guard.oneOf(itemId, Shop.Ids) then return end        -- 2–5: texto y existe
	local item = Shop.Items[itemId]
	local p = Data.profiles[player.UserId]
	if not p or p.state ~= "active" then return end           -- 7: perfil cargado
	if p.data.Inventory[itemId] then return end                -- ya lo tiene
	if p.data.Coins < item.Price then return end
	p.data.Coins -= item.Price                                  -- 9: el servidor decide
	p.data.Inventory[itemId] = 1
	Remotes.BuyResult:FireClient(player, itemId)               -- respuesta: evento al cliente
end)
```

### Enfriamiento: apúntalo ANTES de cualquier espera
```luau
-- MAL: mientras espera, 10 clics más pasan la comprobación
if Guard.now() - (lastUse[player] or -math.huge) < 5 then return end
giveRewardAsync(player) -- espera (servicio, animación, DataStore)
lastUse[player] = Guard.now()

-- BIEN
if Guard.now() - (lastUse[player] or -math.huge) < 5 then return end
lastUse[player] = Guard.now()
giveRewardAsync(player)
```
Un solo reloj por remoto: `os.clock()` (o `Guard.now`) para duraciones. No mezcles `os.time()` (segundos
enteros, hora de pared) con `os.clock()` en el mismo enfriamiento. Para una cuenta atrás que se ve en
pantalla, el servidor manda la hora de fin con `workspace:GetServerTimeNow()` y el cliente la compara
con su propio `workspace:GetServerTimeNow()`.

### Remotos: cuál usar
- `RemoteEvent`: lo normal, en los dos sentidos.
- `RemoteFunction` (`InvokeServer`): solo cliente → servidor, y que el servidor responda rápido.
  **Nunca `InvokeClient`**: un cliente que no responde deja colgado el hilo del servidor.
- `UnreliableRemoteEvent`: solo cosas que da igual perder (efectos, posiciones que se repiten). Descarta
  paquetes de más de ~1000 bytes y puede perder o desordenar mensajes: nunca dinero ni estado importante.
- Del cliente llegan también tablas raras (claves mezcladas, muy grandes, anidadas) e Instances que el
  servidor no tiene (llegan como `nil`): valida tablas con tope de elementos y de profundidad, o mejor,
  manda solo números y textos.

### Antitrampas de movimiento, con márgenes
La red llega con retraso: el servidor ve al jugador «más lejos» de lo que está. Una regla justa expulsa a
jugadores honrados (lección real: «tienes que estar en la puerta» fallaba en el juego publicado).
```luau
local good, strikes = {}, {} -- good[plr] = { pos = última posición buena, t = cuándo }

task.spawn(function()
	while true do
		task.wait(0.5)
		local now = os.clock()
		for _, plr in Players:GetPlayers() do
			local char = plr.Character
			local root = char and char:FindFirstChild("HumanoidRootPart")
			local hum = char and char:FindFirstChildOfClass("Humanoid")
			if root and hum and not hum.SeatPart then
				local pos, g = root.Position, good[plr]
				if not g then
					good[plr] = { pos = pos, t = now }
				else
					local flat = Vector3.new(pos.X - g.pos.X, 0, pos.Z - g.pos.Z).Magnitude
					-- velocidad más alta que puede tener ahora (correr, poderes) × margen + colchón,
					-- por el tiempo desde la última posición buena
					local allowed = (SpeedLimit(plr) * 1.5 + 4) * (now - g.t)
					if flat <= allowed then
						good[plr] = { pos = pos, t = now }
						strikes[plr] = 0
					else
						strikes[plr] = (strikes[plr] or 0) + 1 -- no se mueve `good`: se compara con la buena
						if strikes[plr] >= 3 then -- 3 seguidos: vuelve a la última buena, sin expulsar
							char:PivotTo(CFrame.new(g.pos))
							good[plr] = { pos = g.pos, t = now }
							strikes[plr] = 0
						end
					end
				end
			end
		end
	end
end)
Players.PlayerRemoving:Connect(function(p) good[p], strikes[p] = nil, nil end)
```
- `SpeedLimit(plr)` devuelve la velocidad base por el **mayor** multiplicador activo; al quitar un
  poder, mantén el alto ~1 s más.
- Cuando tu código teletransporta o reaparece al jugador, borra `good[plr]` (si no, lo toma por trampa).
- Solo horizontal: caer es rápido y es legal.
- En pruebas automáticas que mueven al personaje, muévelo en pasos pequeños (~1,3 studs cada 0,1 s).

### Modos de prueba cerrados al fallo
Un modo con trucos solo existe si se cumplen **las tres** cosas; si falta una, no existe:
```luau
local RunService = game:GetService("RunService")
local ServerStorage = game:GetService("ServerStorage")
local function testModeOn()
	return RunService:IsStudio()
		and Config.UseTestStorage == true
		and ServerStorage:FindFirstChild("TestModeFlag") ~= nil
end
```
Si no sabes en qué lugar o modo estás, asume el más restrictivo. Antes de publicar: quita `TestModeFlag`
y comprueba que `UseTestStorage` solo actúa con `RunService:IsStudio()` (ver `rc-datos`).

### Compras y Game Pass
- El aviso del cliente (`PromptGamePassPurchaseFinished` o un remoto «ya pagué») **no da nada**. Comprueba
  en el servidor con `MarketplaceService:UserOwnsGamePassAsync(userId, passId)` dentro de `pcall`, con
  reintento, y guarda el resultado por jugador. Lección real: un tramposo podía disparar el aviso.
- Productos con Robux: un solo `ProcessReceipt`, ver `rc-datos`.

### Datos que ve el cliente
- Lo que el cliente necesita lo pone el servidor en atributos o valores. Un atributo en el `Player` lo
  reciben **todos** los clientes: nada grande ni privado (lección real: ~40 KB por jugador enviados a
  todos). Lo de un solo jugador, por un remoto a ese jugador o dentro de su `PlayerGui`.
- Texto que escriben los jugadores: siempre filtrado en el servidor (`rc-interfaz`).

## Comprobación ejecutable (Edit, por el MCP `execute_luau` o en la barra de comandos)
**1. Batería del `Guard`:**
```luau
local Guard = require(game.ServerScriptService.Net.Guard:Clone())
local fails = {}
local function check(id, cond) if not cond then table.insert(fails, id) end end
check("S1 NaN", not Guard.num(0/0, 0, 10))
check("S2 infinito", not Guard.num(math.huge, 0, 1e9))
check("S3 texto no es número", not Guard.num("5", 0, 10))
check("S4 decimal no es entero", not Guard.int(2.5, 0, 10))
check("S5 entero bien", Guard.int(3, 0, 10))
check("S6 texto largo", not Guard.str(string.rep("a", 201), 200))
check("S7 Vector3 con NaN", not Guard.vec(Vector3.new(0/0, 0, 0), 1e4))
check("S8 lista permitida", Guard.oneOf("sword", { sword = true }) and not Guard.oneOf("__index", { sword = true }))
local t = 0
Guard.now = function() return t end
local fake = {} -- vale como «jugador»: solo se usa de clave
local passed = 0
for _ = 1, 50 do if Guard.allow("T", fake, 2, 3) then passed += 1 end end
check("S9 ráfaga limitada", passed == 3)
t = 1
check("S10 se recupera", Guard.allow("T", fake, 2, 3) and Guard.allow("T", fake, 2, 3) and not Guard.allow("T", fake, 2, 3))
return #fails == 0 and "OK 0 fallos" or ("FALLOS: " .. table.concat(fails, ", "))
```
**2. Auditoría de remotos** (lee el código; `Source` solo se lee en Edit):
```luau
local out = {}
for _, root in { game.ServerScriptService, game.ServerStorage, game.ReplicatedStorage, workspace } do
	for _, s in root:GetDescendants() do
		if s:IsA("LuaSourceContainer") then
			local ok, src = pcall(function() return s.Source end)
			if ok and (src:find("OnServerEvent") or src:find("OnServerInvoke")) then
				table.insert(out, (src:find("Guard%.allow") and "ok          " or "SIN LÍMITE  ") .. s:GetFullName())
			end
			if ok and src:find("InvokeClient") then table.insert(out, "InvokeClient " .. s:GetFullName()) end
		end
	end
end
return #out > 0 and table.concat(out, "\n") or "No hay remotos escuchados en el servidor"
```
Toda línea «SIN LÍMITE» o «InvokeClient» se arregla o se explica. La auditoría es aproximada: mira el
archivo entero, así que un solo `Guard.allow` marca «ok» a todos sus manejadores; repasa cada uno leyendo.
(Cada ejecución en Edit deja conectado un `PlayerRemoving` del módulo copiado: no hace daño.)

**3. Matriz de abusos en Play** (Prueba → Clientes y servidores / Test → Clients and Servers, **2 o más
jugadores**). Desde la barra de comandos de **un cliente**, dispara cada remoto con datos malos, p. ej.
`game.ReplicatedStorage.Remotes.Buy:FireServer(0/0)`. Para cada remoto:

| Prueba | Se espera |
|---|---|
| 50 veces seguidas | pasan como mucho `burst`; el servidor no se frena |
| Tipo malo (`{}`, `"x"`, `nil`), NaN, `math.huge`, negativo | rechazado, sin error rojo en la Salida |
| ID que no existe, `"__index"` | rechazado |
| Objeto del **otro** jugador | rechazado |
| Muerto, en el menú, lejos | rechazado |
| Los 2 clientes a la vez sobre el mismo objeto | solo uno lo consigue |
| Comprar sin saldo / con saldo justo | no / sí, y el saldo nunca baja de 0 |

Apunta cada fila como **ejecutado** (lo viste) o **no verificado**. Con el MCP, si solo puedes ejecutar
en el servidor, pide a la persona que pegue la línea en el cliente y te cuente qué ve.

## Gotchas (síntoma → causa → arreglo)
- **Un tramposo se da monedas o se pone precio** → el cliente manda la cantidad o el precio → el cliente
  manda solo el ID; el servidor busca precio y premio en su tabla.
- **Spam de clics da el premio varias veces** → el enfriamiento se apuntaba después de una espera →
  apúntalo antes (patrón de arriba).
- **El enfriamiento a veces no funciona** → dos relojes en el mismo remoto (`os.time` aquí, `os.clock`
  allá) → un solo reloj (`Guard.now`).
- **El servidor se rompe con una petición rara** → `NaN` pasa `v >= 0` y `v <= 10` como falso pero rompe
  cuentas; o `math.huge` → `Guard.num` con límites finitos.
- **Dos jugadores cogen el mismo objeto** → se comprobaba «existe» y se daba tras una espera → marca el
  objeto como cogido antes de cualquier espera; prueba con 2 clientes.
- **Jugadores honrados devueltos atrás o expulsados** → antitrampas sin margen o sin contar poderes y
  teletransportes propios → margen ×1,5 + colchón, mayor multiplicador, borrar `good[plr]` al teletransportar
  (lección real).
- **El tramposo avanza igual aunque salten avisos** → se apuntaba como buena la posición sospechosa →
  compara siempre con la última posición buena y devuélvelo a ella.
- **El servidor se queda colgado** → `InvokeClient`, o un `OnServerInvoke` que espera mucho → eventos en vez
  de funciones hacia el cliente; responde rápido.
- **El LocalScript no hace nada** → está en `Workspace` o `ServerScriptService` → muévelo a
  `StarterPlayerScripts` (o `StarterCharacterScripts` si es por personaje).
- **Algo pasa dos veces** → `Script` con `RunContext = Client` dentro de `StarterPlayerScripts` → ponlo en
  `ReplicatedStorage` o cámbialo a `LocalScript`.
- **El cliente se queda esperando para siempre** → `WaitForChild` sin tope → con tope y aviso si es `nil`.
- **El modo de prueba apareció en el juego publicado** → dependía de una sola condición → las tres
  condiciones a la vez; antes de publicar, quitar la bandera.
- **Un Game Pass se dio sin pagar** → se confió en el aviso del cliente → `UserOwnsGamePassAsync` en el
  servidor (lección real).
- **Todo el servidor va lento al entrar gente** → atributos grandes en `Player` replicados a todos →
  datos de un jugador solo a ese jugador (lección real).

## Etiquetas de resultado
**ejecutado** (S1–S10 `OK 0 fallos`, auditoría limpia, filas de la matriz vistas en Play) · **verificado
leyendo** (repasaste cada manejador con el orden de validación) · **preparado sin ejecutar** · **no
verificado** (retraso real de red, tramposos reales: solo se ve publicado). Nunca digas «es seguro» sin la
matriz con 2 clientes **ejecutada**.
