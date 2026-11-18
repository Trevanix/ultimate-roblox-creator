---
name: rc-datos
description: >
  Guardado de partidas en Roblox con DataStore hecho para no perder nunca datos: bloqueo de sesión,
  reintentos con espera, esquema con versión y migraciones, carga fallida que NO se trata como jugador
  nuevo, autoguardado y BindToClose, recibos de compra (ProcessReceipt) y almacén de prueba en Studio.
  Úsala al guardar progreso, monedas o inventario, y cuando los jugadores pierden lo suyo: «perdí mis
  monedas», progreso que vuelve a 0 al cambiar de servidor (save data, DataStoreService, UpdateAsync,
  session lock, data loss, lost coins, progress reset, data wiped after rejoin, schema migration). No para precios ni curvas (rc-economia), validar
  remotos (rc-servidor) o pantallas (rc-interfaz), ni para dudas sueltas de la API (roblox-game, plugin
  roblox-dev).
---

# rc-datos · Guardado que no pierde partidas

Perder la partida de un jugador es el peor fallo que puede tener un juego: no tiene arreglo y el jugador
no vuelve. Esta skill da un guardado sencillo, con bloqueo de sesión, que se prueba entero en Studio sin
tocar datos reales.

Última comprobación: 2026-11-18 (API de DataStoreService; método de awesome-gamedev-agent-skills, ver
`NOTICE` del plugin).

## Cuándo usarla
- El juego va a guardar algo (monedas, nivel, inventario, ajustes, compras).
- Hay que cambiar lo que se guarda (un campo nuevo, renombrar algo): migración.
- Un jugador dice «he perdido mis cosas» o «no se me guarda».
- Se van a vender productos con Robux (los recibos se guardan en el perfil).

## Reglas que no se saltan
1. **Respaldo antes de tocar datos.** Antes de cambiar el esquema o el código de guardado, la persona
   guarda una copia del lugar (Archivo → Guardar en archivo / File → Save to File As) y lo confirma.
2. **Nunca guardes un perfil que no cargó bien.** Error al cargar ≠ jugador nuevo. Si la carga falla, el
   jugador juega con «Hoy no se guarda» y nada se escribe.
3. **Un perfil, un servidor** (bloqueo de sesión). Otro servidor no escribe encima.
4. **Cada llamada a DataStore va en `pcall`** y con reintentos con espera creciente.
5. **Versión de esquema desde el primer día**, migraciones paso a paso que **no se borran nunca**.
6. **En Studio, almacén de prueba** (en memoria). La prueba con datos reales es aparte, con respaldo y
   permiso expreso de la persona.
7. **No escribas a mano en el DataStore real** (ni desde la barra de comandos ni por API) salvo que la
   persona lo pida para un caso concreto.

## Pasos (en orden)
1. **Decide con la persona qué se guarda** y apúntalo en `CLAUDE.md` del proyecto: lista de campos con
   su valor inicial. Lo que se puede recalcular (p. ej. el bonus de un Game Pass) no se guarda.
2. **Respaldo** (regla 1). Si ya hay jugadores, mira el apartado «Cambiar el esquema con jugadores».
3. **Crea los módulos** en `ServerScriptService/Data/`: `Schema` (versión y migraciones), `ProfileService`
   (cargar, guardar, soltar), `FakeStore` (almacén en memoria) y el script `Main` que los conecta.
4. **Almacén de prueba**: en la configuración, `UseTestStorage = true` solo afecta a Studio.
5. **Recibos** si hay ventas con Robux (patrón de abajo).
6. **Interfaz**: el atributo `DataState` del jugador dice si se guarda; si no es `"active"`, la pantalla
   enseña «Hoy no se guarda» (texto según la edad, ver `rc-interfaz`).
7. **Comprobación ejecutable** (al final): la batería D1–D7 en Edit debe devolver `OK 0 fallos`. Luego
   Play con 2 clientes (Prueba → Clientes y servidores): cambia algo en uno, sácalo sin parar el
   servidor, vuelve a entrar y mira que sigue (al parar la prueba, el almacén de prueba se borra).
8. **Revisión independiente:** agente `revisor-seguridad-datos` (solo lectura) sobre guardado y recibos.

## Patrones

### Esquema y migraciones (`Data/Schema`, ModuleScript)
```luau
local Schema = {}
Schema.VERSION = 3

function Schema.Default()
	return { Version = Schema.VERSION, Coins = 0, Inventory = {}, Settings = { Music = true }, Receipts = {} }
end

-- migrations[v] lleva un perfil de la versión v a la v+1. Nunca se borran.
local migrations = {
	[1] = function(d) d.Inventory = d.Inventory or {} end,
	[2] = function(d) d.Settings = d.Settings or { Music = true } end,
}

-- Devuelve datos, sePuedeGuardar.
function Schema.Migrate(d)
	if d == nil then return Schema.Default(), true end -- clave vacía: jugador nuevo de verdad
	if type(d) ~= "table" then
		warn("Perfil con forma rara: se juega sin guardar")
		return Schema.Default(), false
	end
	local v = tonumber(d.Version) or 1
	if v > Schema.VERSION then return d, false end -- lo guardó un código más nuevo: no tocar
	for step = v, Schema.VERSION - 1 do
		local m = migrations[step]
		if not m then warn("Falta la migración " .. step); return d, false end
		m(d)
		d.Version = step + 1
	end
	for k, default in Schema.Default() do
		if d[k] == nil then d[k] = default end -- campos nuevos con su valor inicial
	end
	return d, true
end

return Schema
```

### Servicio con bloqueo de sesión (`Data/ProfileService`, ModuleScript)
Lo guardado en cada clave es `{ Data = perfil, Lock = { Server, Time } }`. Todo pasa por `UpdateAsync`,
que lee lo que hay **y decide con eso**: así nunca se pisa lo de otro servidor.
```luau
local HttpService = game:GetService("HttpService")
local Schema = require(script.Parent.Schema)

local LOCK_TTL = 600 -- s: si un servidor murió sin soltar, caduca (el autoguardado lo renueva cada 90 s)
local BUSY_TRIES = 5  -- si otro servidor aún tiene el perfil (saltó de servidor rápido)…
local BUSY_WAIT = 6   -- …espera entre intentos (unos 30 s en total)

local Service = {}
Service.__index = Service

function Service.new(deps)
	local self = setmetatable({}, Service)
	self.store = deps.store
	self.wait = deps.wait or task.wait
	-- En Studio game.JobId está vacío: se usa un id inventado para este servidor.
	self.serverId = deps.serverId or (game.JobId ~= "" and game.JobId or HttpService:GenerateGUID(false))
	self.profiles = {} -- [userId] = { key, state = "loading"|"active"|"nosave", data, locked }
	self.activeSaves = 0
	return self
end

function Service:_retry(fn)
	local lastErr
	for i = 1, 4 do
		local ok, err = pcall(fn)
		if ok then return true end
		lastErr = err
		if i < 4 then self.wait(2 ^ (i - 1)) end -- 1, 2, 4 s
	end
	warn("DataStore falló:", lastErr)
	return false
end

function Service:Load(userId)
	local p = { key = "u_" .. userId, state = "loading" }
	self.profiles[userId] = p
	for _ = 1, BUSY_TRIES do
		local outcome, raw
		local ok = self:_retry(function()
			self.store:UpdateAsync(p.key, function(old) -- puede ejecutarse varias veces: decide cada vez
				outcome, raw = "busy", nil
				local rec = old or {}
				if old ~= nil and (type(old) ~= "table" or (old.Data == nil and old.Lock == nil)) then
					rec = { Data = old } -- formato viejo sin envoltorio: son datos, NO un jugador nuevo
				end
				local lock = rec.Lock
				if lock and lock.Server ~= self.serverId and os.time() - lock.Time < LOCK_TTL then
					return nil -- otro servidor lo tiene: no escribir nada
				end
				rec.Lock = { Server = self.serverId, Time = os.time() }
				outcome, raw = "ok", rec.Data
				return rec
			end)
		end)
		if not ok then break end -- error de verdad: NO es un jugador nuevo
		if outcome == "ok" then
			local data, canSave = Schema.Migrate(raw)
			p.data, p.locked = data, true
			p.state = canSave and "active" or "nosave"
			return p
		end
		self.wait(BUSY_WAIT)
	end
	p.data, p.state = Schema.Default(), "nosave" -- se juega, pero «Hoy no se guarda»
	return p
end

-- release = true al salir: guarda (si toca) y suelta el bloqueo.
function Service:Save(userId, release)
	local p = self.profiles[userId]
	if not p then return false end
	-- Al soltar se quita de la lista (una segunda llamada ya no lo encuentra). Si aún carga, se queda:
	-- `Main` lo suelta al terminar la carga.
	if release and p.state ~= "loading" then self.profiles[userId] = nil end
	if not p.locked then return false end
	local writeData = p.state == "active"
	local stillOurs = false
	self.activeSaves += 1
	local ok = self:_retry(function()
		self.store:UpdateAsync(p.key, function(old)
			stillOurs = old ~= nil and old.Lock ~= nil and old.Lock.Server == self.serverId
			if not stillOurs then return nil end -- ya no es nuestro: no pisar
			if writeData then old.Data = p.data end
			if release then old.Lock = nil else old.Lock.Time = os.time() end
			return old
		end)
	end)
	self.activeSaves -= 1
	if not stillOurs or release then p.locked = false end
	if not stillOurs then p.state = "nosave" end
	return ok and stillOurs and writeData
end

return Service
```

### Almacén en memoria (`Data/FakeStore`, ModuleScript)
Copia los datos al entrar y al salir (como el de verdad) y puede fallar a propósito para las pruebas.
```luau
local HttpService = game:GetService("HttpService")
local FakeStore = {}
FakeStore.__index = FakeStore

local function copy(v)
	if v == nil then return nil end
	return HttpService:JSONDecode(HttpService:JSONEncode(v))
end

function FakeStore.new()
	return setmetatable({ data = {}, failNext = 0 }, FakeStore)
end

function FakeStore:UpdateAsync(key, transform)
	if self.failNext > 0 then self.failNext -= 1; error("fallo simulado") end
	local new = transform(copy(self.data[key]))
	if new ~= nil then self.data[key] = copy(new) end
	return new
end

return FakeStore
```

### Conexión con el juego (`Data/Main`, Script de servidor)
```luau
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local DataStoreService = game:GetService("DataStoreService")
local Config = require(game.ReplicatedStorage.Shared.Config) -- donde tengáis la configuración
local Service = require(script.Parent.ProfileService)

local store
if RunService:IsStudio() and Config.UseTestStorage then
	store = require(script.Parent.FakeStore).new()
else
	-- Studio con acceso a la API escribe en los datos REALES del juego: por eso otro nombre.
	store = DataStoreService:GetDataStore(RunService:IsStudio() and "PlayerData_Studio" or "PlayerData")
end
local Data = Service.new({ store = store })

local function onJoin(player)
	player:SetAttribute("DataState", "loading")
	local p = Data:Load(player.UserId)
	if player.Parent == nil then Data:Save(player.UserId, true) return end -- se fue mientras cargaba
	player:SetAttribute("DataState", p.state)
end
Players.PlayerAdded:Connect(onJoin)
for _, player in Players:GetPlayers() do task.spawn(onJoin, player) end
Players.PlayerRemoving:Connect(function(player) Data:Save(player.UserId, true) end)

task.spawn(function() -- autoguardado
	while true do
		task.wait(90)
		for userId in Data.profiles do task.spawn(Data.Save, Data, userId, false) end
	end
end)

game:BindToClose(function() -- Roblox da unos 30 s en total
	for userId in Data.profiles do task.spawn(Data.Save, Data, userId, true) end
	local deadline = os.clock() + 25
	while Data.activeSaves > 0 and os.clock() < deadline do task.wait(0.1) end
end)
```
Si otros scripts necesitan el perfil, mueve las líneas que crean `store` y `Data` a un ModuleScript
(`Data/Profiles`, que devuelve `Data`) y haz que `Main` y los demás lo requieran. Leen
`Data.profiles[player.UserId]` solo si `state == "active"` y lo cambian en el servidor, nunca desde el
cliente.

### Recibos de compra (un solo `ProcessReceipt` en todo el juego)
«Entregado» solo se dice a Roblox **después de guardar**. Si algo falla, `NotProcessedYet` y Roblox lo
repetirá; el recibo apuntado en el perfil impide entregar dos veces.
```luau
local MarketplaceService = game:GetService("MarketplaceService")
local MAX_RECEIPTS = 50
local inFlight = {}

local function remember(data, purchaseId)
	data.Receipts[purchaseId] = os.time()
	local count, oldestId, oldestT = 0, nil, math.huge
	for id, t in data.Receipts do
		count += 1
		if t < oldestT then oldestId, oldestT = id, t end
	end
	if count > MAX_RECEIPTS then data.Receipts[oldestId] = nil end
end

MarketplaceService.ProcessReceipt = function(info)
	if inFlight[info.PurchaseId] then return Enum.ProductPurchaseDecision.NotProcessedYet end
	inFlight[info.PurchaseId] = true
	local ok, granted = pcall(function()
		local p = Data.profiles[info.PlayerId]
		if not p or p.state ~= "active" then return false end -- sin perfil cargado no se entrega
		if not p.data.Receipts[info.PurchaseId] then
			local product = Products[info.ProductId] -- tu tabla: ProductId -> { give = function(data) }
			if not product then return false end
			product.give(p.data)
			remember(p.data, info.PurchaseId)
		end
		return Data:Save(info.PlayerId, false)
	end)
	inFlight[info.PurchaseId] = nil
	if ok and granted then return Enum.ProductPurchaseDecision.PurchaseGranted end
	return Enum.ProductPurchaseDecision.NotProcessedYet
end
```
Ponlo en el mismo script que crea `Data` (o pásale `Data` y `Products`). Qué vender y cómo enseñarlo:
`rc-economia`.

## Comprobación ejecutable (Edit, por el MCP `execute_luau` o en la barra de comandos)
No toca ningún DataStore: usa copias de los módulos y el almacén en memoria.
```luau
local root = game.ServerScriptService.Data:Clone() -- copia: evita la caché de require en Edit
local Service = require(root.ProfileService)
local FakeStore = require(root.FakeStore)
local fails = {}
local function check(id, cond) if not cond then table.insert(fails, id) end end
local noWait = function() end
local store = FakeStore.new()
local A = Service.new({ store = store, wait = noWait, serverId = "A" })
local B = Service.new({ store = store, wait = noWait, serverId = "B" })

local p = A:Load(1)
check("D1 nuevo", p.state == "active" and p.data.Coins == 0)
p.data.Coins = 50
check("D2 guarda", A:Save(1, true))
local q = B:Load(1)
check("D2 vuelve igual", q.data.Coins == 50)

local r = A:Load(1) -- B aún lo tiene
r.data.Coins = 999
check("D3 bloqueado", r.state == "nosave" and not A:Save(1, true) and store.data.u_1.Data.Coins == 50)
B:Save(1, true)

store.failNext = 99
local f = A:Load(2)
store.failNext = 0
check("D4 fallo no es nuevo", f.state == "nosave" and not A:Save(2, true) and store.data.u_2 == nil)

store.data.u_3 = { Data = { Version = 99, Coins = 7 } }
check("D5 versión futura", A:Load(3).state == "nosave")
A:Save(3, true)
check("D5 intacta", store.data.u_3.Data.Version == 99 and store.data.u_3.Lock == nil)

store.data.u_4 = { Data = { Version = 1, Coins = 5 } }
local m = A:Load(4)
check("D6 migra", m.state == "active" and m.data.Version == 3 and m.data.Coins == 5 and m.data.Settings ~= nil)
A:Save(4, true)

store.data.u_5 = { Version = 3, Coins = 9, Inventory = {} } -- guardado antiguo, sin { Data, Lock }
local old = A:Load(5)
check("D7 formato viejo no es nuevo", old.state == "active" and old.data.Coins == 9)
A:Save(5, true)
check("D7 no se pierde", store.data.u_5.Data.Coins == 9)

root:Destroy()
return #fails == 0 and "OK 0 fallos" or ("FALLOS: " .. table.concat(fails, ", "))
```
Si cambias el esquema, añade una prueba por migración nueva (un perfil de cada versión vieja llega a la
última con todo). Después, en Play:
- Con `UseTestStorage = true` el almacén en memoria **se borra al parar Play**: prueba dentro de una misma
  sesión (gana algo, reaparece o sal y entra con otro cliente sin parar el servidor).
- Para «para, vuelve a entrar y sigue ahí» hace falta `UseTestStorage = false` (almacén
  `PlayerData_Studio`) y el acceso a la API en Studio activado: solo con permiso de la persona.
**ejecutado** solo si lo viste.

## Cambiar el esquema con jugadores
1. Respaldo del lugar. 2. Sube `VERSION` y añade la migración (no cambies las viejas). 3. Prueba D6 con un
perfil de cada versión vieja. 4. La persona publica y luego, en el Creator Hub, reinicia los servidores (nombre del
botón: ver `rc-publicar`): un servidor viejo ve la versión nueva y entra en
«Hoy no se guarda» (D5), que no pierde nada pero molesta.

Si un perfil real se estropeó, los DataStore normales guardan versiones anteriores de cada clave durante
un tiempo (`ListVersionsAsync`, `GetVersionAsync`): se puede recuperar, **solo con permiso de la persona**
y explicándole qué se va a cambiar.

## Gotchas (síntoma → causa → arreglo)
- **Un jugador vuelve con todo a cero** → la carga falló y se trató como jugador nuevo, y luego se guardó
  encima → distinguir «clave vacía» (nuevo) de «error» (`nosave`); D4 lo prueba.
- **Lo guardado vuelve atrás o se mezcla entre servidores** → `SetAsync` o un `UpdateAsync` que ignora el
  valor anterior → guarda solo con `UpdateAsync` comprobando que el bloqueo sigue siendo tuyo (D3).
- **Al saltar de servidor rápido sale «Hoy no se guarda»** → el servidor viejo aún no soltó el bloqueo →
  normal y sin pérdida; el servicio reintenta ~30 s; explícalo a la persona y pruébalo (lección real).
  Si un servidor murió sin soltar, el perfil queda ocupado hasta que caduca `LOCK_TTL` (10 min).
- **Un juego que ya guardaba sin bloqueo pierde todo al pasar a este servicio** → el guardado antiguo no
  tiene `{ Data, Lock }` y se tomaba por clave vacía → el servicio lo trata como datos viejos (D7).
- **El guardado falla siempre con un error raro** → datos que DataStore no admite: Instances, Vector3,
  Color3, `NaN`, listas con huecos o tablas que mezclan números y textos como claves → guarda solo
  números, textos, booleanos y tablas limpias; claves de inventario como texto (`["sword"] = 2`).
- **Valores raros tras usar `UpdateAsync`** → se esperó (yield) dentro de la función de transformación →
  dentro, nada de `task.wait` ni llamadas a servicios; solo calcular y devolver.
- **Una moneda sale doble a veces** → un reintento de `IncrementAsync` que en realidad sí se había
  aplicado → no uses `IncrementAsync` para datos de jugador; todo va dentro del perfil.
- **Lo leído no es lo último** → `GetAsync` guarda en caché unos 4 s → para decidir, `UpdateAsync`.
- **Al cerrar el servidor se pierde lo último** → no hay `BindToClose` o espera más de ~30 s → guardar todos
  a la vez (`task.spawn`) con un plazo de 25 s, como en `Main`.
- **Avisos de cola o límite en la Salida (Output)** → demasiadas escrituras (una por cada moneda, o la
  misma clave más de una vez cada ~6 s) → autoguardado cada 60–120 s, no en cada cambio; el ranking
  (OrderedDataStore) se actualiza cada pocos minutos.
- **En Studio da error «no tiene acceso»** → falta permitir la API en Studio → la persona activa
  Configuración del juego → Seguridad → «Enable Studio Access to API Services»; mejor aún, almacén de
  prueba.
- **Las pruebas pasaron en Studio pero en el juego se perdió algo** → en Studio se usó el almacén real
  con otro código, o el de prueba quedó encendido → `UseTestStorage` solo vale con `IsStudio()`; antes de
  publicar, revisa que el nombre del almacén publicado es el de siempre (cambiarlo = todos empiezan de
  cero).
- **Perfil enorme que tarda o falla** → cada clave admite unos 4 MB → guarda lo mínimo; historiales y
  registros, recortados (como los recibos: los últimos 50).
- **Se entregó una compra sin guardarla** → `PurchaseGranted` antes de guardar → solo tras
  `Data:Save(...) == true` (lección real: un recibo procesado dos veces a la vez; por eso `inFlight`).

## Etiquetas de resultado
Cada cosa que entregues lleva una: **ejecutado** (D1–D7 devolvió `OK 0 fallos`, o lo viste en Play) ·
**verificado leyendo** · **preparado sin ejecutar** · **no verificado** (servidores reales, saltos entre
servidores, compras reales: solo se ven publicado). Nunca digas «el guardado funciona» sin D1–D7
**ejecutado**.
