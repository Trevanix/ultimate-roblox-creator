---
name: rc-economia
description: >
  Economía de un juego de Roblox que no se rompe y ventas honestas con niños: mapa de monedas (de dónde
  sale y en qué se va cada una), curvas de coste base × g^n, renacer, ganancias sin conexión con tope,
  formato de números (1.5K, 2M), probabilidades que suman 100 %, gastar validando todo antes de restar,
  ProcessReceipt idempotente, precio real y pago al azar con PolicyService, más una calculadora de balance
  en Luau. Úsala con monedas, precios, mejoras, tienda o Robux (economy, currency, upgrade cost, prestige,
  rebirth, offline earnings, loot odds, developer product). No para guardar datos (rc-datos), remotos
  (rc-servidor) o pantallas de tienda (rc-interfaz).
---

# rc-economia · Cada moneda entra por un sitio y sale por otro

Una economía sana se puede contar: cuánto gana el jugador por minuto, cuánto cuesta lo siguiente y cuánto
tarda en pagarlo. Si eso se calcula, el balance deja de ser «a ojo». Y vender está bien; engañar, meter
prisa o cobrar sin entregar, no. Con niños, todavía menos.

Última comprobación: 2026-11-18 (API de MarketplaceService, PolicyService y Random; método y números de
awesome-gamedev-agent-skills, ver `NOTICE` del plugin). **Las reglas de venta de Roblox cambian: antes
de vender nada, compruébalas en la documentación oficial** (normas de monetización y de anuncios; edad
mínima para cobrar Robux: por comprobar).

## Cuándo usarla
- Hay monedas, puntos, gemas, experiencia o cualquier número que se gana y se gasta.
- Hay que poner precios, mejoras, renacer (rebirth/prestige) o ganancias sin conexión.
- Hay cajas, ruletas o premios al azar (aunque sean gratis: las probabilidades se enseñan).
- Se va a vender algo con Robux (Game Pass, productos de desarrollador).

El código de guardado y de recibos vive en `rc-datos`; el de remotos, en `rc-servidor`. Aquí, qué números
y qué reglas.

## Pasos (en orden)
1. **Mapa de monedas** (abajo) con la persona: cada moneda, de dónde sale, en qué se gasta. Apúntalo en
   `CLAUDE.md` del proyecto.
2. **Objetivos en tiempo**, no en números: «la primera mejora a los 10 s», «una mejora cada 1–5 min a la
   media hora», «el primer renacer a los 30–60 min». Que la persona los apruebe.
3. **Curvas** con base × g^n y la **calculadora** hasta que no dé avisos.
4. **Módulo `Economy`** (precio, gastar, sin conexión, azar, formato) con su batería E1–E12.
5. **Gastar siempre en el servidor**, validando todo antes de restar.
6. Si hay ventas: **ventas honestas** (abajo) y recibos de `rc-datos`; repaso con los agentes
   `revisor-textos-ventas` (tienda) y `revisor-seguridad-datos` (recibos y gastar).
7. **Comprobación ejecutable:** la calculadora dice `OK` y la batería dice `OK 0 fallos`; después, una
   compra de prueba en Play por cada producto.

## Mapa de monedas
| Moneda | Sale de (fuentes) | Se va en (sumideros) | ¿Se guarda? | ¿Se compra con Robux? |
|---|---|---|---|---|
| Monedas | recoger, misiones, sin conexión | mejoras, zonas, cosas de aspecto | sí | no |
| (otra) | … | … | … | … |

- Toda moneda tiene **al menos un sumidero que el jugador quiera**. Sin sumideros, se acumula y deja de
  importar (inflación).
- Pocas monedas: una principal y, como mucho, una rara. Cada moneda nueva es un sistema más que probar.
- Si una moneda **se compra con Robux** y luego se usa en algo al azar, eso es **pago al azar** (lección
  real: una mejora con suerte pagada así; hubo que enseñar la probabilidad y declararlo).

## Curvas de coste
- Precio de la mejora número n (la primera es n = 0): **base × g^n**, redondeado.
- **g entre 1,07 y 1,15** en mejoras que se compran muchas veces. Más bajo: todo sale barato; más alto:
  pared enseguida.
- Lo que importa es la **espera**: precio ÷ ganancia por segundo. Si la ganancia también crece con las
  mejoras, la espera crece despacio (bien); si la ganancia no crece, la espera se dispara (pared).
- «Comprar x10»: suma los 10 precios uno a uno (`priceOfMany`), no multipliques el precio por 10.
- Números enormes: Luau usa números de 64 bits; pasados ~9 mil billones (2^53) los enteros dejan de ser
  exactos (sumar 1 puede no cambiar nada). Pon tope a
  la curva o guarda los números grandes como mantisa y exponente (solo si el juego llega ahí).

## Renacer (rebirth / prestige)
- El jugador vuelve a empezar a cambio de un multiplicador permanente: **1 + k·p** (p = renaceres hechos;
  k, p. ej., 0,25–0,5).
- Lo que pide cada renacer crece más deprisa que el multiplicador (p. ej. ×3 cada vez), para que cada uno
  siga siendo una meta.
- Escribe con la persona **qué se borra** (monedas, mejoras) y **qué se queda** (renaceres, aspecto,
  colección). Lo que se queda va en el esquema (`rc-datos`).
- Primer renacer a los 30–60 min de juego, como orientación; la calculadora enseña cuánto tarda cada uno.

## Ganancias sin conexión (offline)
- Tope de **8–12 h** y eficiencia del **25–50 %** de lo que ganaría jugando. Jugar debe valer más.
- Se calcula en el servidor con `os.time()` (segundos UTC, igual en todos los servidores), guardado en el
  perfil al salir. **Nunca `os.clock()`** (cuenta desde que arrancó ese servidor).
- Si el tiempo sale negativo (relojes distintos) cuenta 0; si el perfil no tiene la hora, 0.
- Enséñalo al entrar: «Mientras no estabas: +1.2K». Nada de «compra para cobrarlo todo».

## Probabilidades (cajas, botín, ruletas)
- Las probabilidades **suman 100 %** y salen de **una sola tabla**: la misma que usa el servidor para
  sortear es la que se enseña en pantalla. Si se escriben dos veces, acaban siendo distintas.
- Sortea en el servidor con `Random.new()` (o con semilla para pruebas). El cliente solo enseña.
- Enseña la probabilidad **antes** de cada intento, en números («Épico 5 %»), no solo con colores.

## Formato de números
`999.950` no debe salir «1000.0K»: redondea primero y, si llega a 1000, pasa al sufijo siguiente.
Mismo formato en todo el juego (un solo módulo, también en el cliente).

## Módulo `Economy` (`ReplicatedStorage/Shared/Economy`, ModuleScript)
Funciones puras: no tocan el juego, se prueban solas. El cliente lo usa para enseñar; el servidor, para
decidir.
```luau
local Economy = {}

function Economy.price(base, g, n) -- precio de la mejora número n (la primera es n = 0)
	return math.floor(base * g ^ n + 0.5)
end

function Economy.priceOfMany(base, g, n, k) -- comprar k seguidas empezando en n («x10»)
	local total = 0
	for i = 0, k - 1 do total += Economy.price(base, g, n + i) end
	return total
end

-- cost = { Coins = 100, Gems = 2 }. Comprueba TODAS las monedas y luego resta; sin esperas en medio.
function Economy.trySpend(data, cost)
	for currency, amount in cost do
		local have = data[currency]
		if type(amount) ~= "number" or amount ~= amount or amount < 0 then return false end
		if type(have) ~= "number" or have < amount then return false end
	end
	for currency, amount in cost do data[currency] -= amount end
	return true
end

function Economy.offlineGain(lastSeen, now, perSecond, capSeconds, efficiency)
	if type(lastSeen) ~= "number" then return 0 end
	local elapsed = math.clamp(now - lastSeen, 0, capSeconds) -- negativo (relojes) cuenta 0
	return math.floor(elapsed * perSecond * efficiency)
end

-- entries = { { id = "comun", pct = 70 }, { id = "raro", pct = 25 }, { id = "epico", pct = 5 } }
function Economy.pick(rng, entries)
	local r, acc = rng:NextNumber() * 100, 0
	for _, e in entries do
		acc += e.pct
		if r < acc then return e.id end
	end
	return entries[#entries].id -- por redondeo de decimales
end

local SUFFIXES = { "", "K", "M", "B", "T", "Qa", "Qi" }
function Economy.format(n)
	if n ~= n then return "0" end
	if n == math.huge or n == -math.huge then return "∞" end
	local sign = n < 0 and "-" or ""
	n = math.abs(n)
	if n < 1000 then return sign .. tostring(math.floor(n)) end
	local i = 1
	while n >= 1000 and i < #SUFFIXES do n /= 1000; i += 1 end
	n = math.floor(n * 10 + 0.5) / 10 -- un decimal
	if n >= 1000 and i < #SUFFIXES then n /= 1000; i += 1 end -- 999.95K → 1M, no «1000.0K»
	return sign .. string.format(n % 1 == 0 and "%d" or "%.1f", n) .. SUFFIXES[i]
end

return Economy
```

### Gastar en el servidor (con `Guard` de `rc-servidor` y el perfil de `rc-datos`)
El cliente manda **qué** quiere; el servidor sabe el nivel, calcula el precio y resta.
```luau
Remotes.BuyUpgrade.OnServerEvent:Connect(function(player, upgradeId)
	if not Guard.allow("BuyUpgrade", player, 4, 6) then return end
	if not Guard.oneOf(upgradeId, Upgrades.Ids) then return end -- Ids = { speed = true, ... }
	local p = Data.profiles[player.UserId]
	if not p or p.state ~= "active" then return end
	local up = Upgrades.Items[upgradeId]
	local level = p.data.Upgrades[upgradeId] or 0
	if level >= up.max then return end
	if not Economy.trySpend(p.data, { Coins = Economy.price(up.base, up.g, level) }) then return end
	p.data.Upgrades[upgradeId] = level + 1
end)
```
- Comprobar y restar van **seguidos**: una espera en medio deja que dos peticiones paguen con el mismo
  dinero.
- Fabricar, comprar con varias monedas o pagar con materiales: siempre «todo o nada» con `trySpend`.
- Dar monedas: también solo el servidor, con tope por segundo si viene de una acción del jugador.

### Sin conexión, al cargar el perfil (servidor)
```luau
local gain = Economy.offlineGain(p.data.LastSeen, os.time(), incomePerSecond(p.data), 10 * 3600, 0.35)
p.data.Coins += gain
p.data.LastSeen = os.time() -- y otra vez en cada guardado
-- Enseña `gain` con Economy.format en un aviso al entrar.
```
`LastSeen` va en el esquema con su migración (`rc-datos`).

## Calculadora de balance (Studio: barra de comandos o MCP `execute_luau`)
No cambia nada del juego: imprime la tabla y avisa si algo sale del objetivo. Cambia los números de `C`
con la persona y vuelve a ejecutarla hasta que diga `OK`.
```luau
local C = {
	base = 10, g = 1.12,      -- precio de la mejora n = base × g^n
	levels = 100, every = 10, -- niveles que mira y cada cuántos imprime una fila
	incomeAt = function(n) return 1 * 1.085 ^ n end, -- monedas por segundo con n mejoras
	waitMin = 5, waitMax = 600, -- segundos para pagar la siguiente: menos = regalado, más = pared
	jumpMax = 1.5,              -- la espera no debe crecer más de ×1,5 de un nivel al siguiente
	totalMaxHours = 20,         -- tiempo para llegar al último nivel
	at30min = { min = 60, max = 300 }, -- a la media hora: una mejora cada 1–5 min (paso 2)
	odds = { comun = 70, raro = 25, epico = 5 },     -- deben sumar 100
	offline = { capHours = 10, efficiency = 0.35 },  -- 8–12 h, 25–50 %
	rebirth = { k = 0.5, needBase = 1e6, needGrowth = 3, show = 5 },
}
local warns, count = {}, 0
local function flag(key, msg)
	if not warns[key] then warns[key] = { msg = msg, n = 0 }; count += 1 end
	warns[key].n += 1
end
local function secs(s)
	if s < 120 then return string.format("%.0f s", s) end
	if s < 7200 then return string.format("%.1f min", s / 60) end
	return string.format("%.1f h", s / 3600)
end
if C.g < 1.07 or C.g > 1.15 then flag("g", string.format("g = %.3f fuera de 1,07–1,15", C.g)) end

print(string.format("%6s %14s %12s %10s", "nivel", "precio", "gana/s", "espera"))
local total, prevWait, checked30 = 0, nil, false
for n = 0, C.levels - 1 do
	local price = math.floor(C.base * C.g ^ n + 0.5)
	local income = C.incomeAt(n)
	local wait = price / income
	total += wait
	if not checked30 and total >= 1800 then
		checked30 = true
		print(("A la media hora: nivel %d, espera %s"):format(n, secs(wait)))
		if wait < C.at30min.min or wait > C.at30min.max then flag("30", "a la media hora la espera sale de su objetivo") end
	end
	if wait < C.waitMin then flag("min", ("espera < %d s (desde el nivel %d)"):format(C.waitMin, n)) end
	if wait > C.waitMax then flag("max", ("espera > %d s: pared (desde el nivel %d)"):format(C.waitMax, n)) end
	if prevWait and wait > prevWait * C.jumpMax then flag("jump", ("la espera salta más de ×%.1f (nivel %d)"):format(C.jumpMax, n)) end
	prevWait = wait
	if n % C.every == 0 or n == C.levels - 1 then
		print(string.format("%6d %14.0f %12.1f %10s", n, price, income, secs(wait)))
	end
end
print(("Tiempo total hasta el nivel %d: %s"):format(C.levels, secs(total)))
if total > C.totalMaxHours * 3600 then flag("total", ("más de %d h hasta el final"):format(C.totalMaxHours)) end

local sum = 0
for name, pct in C.odds do
	if type(pct) ~= "number" or pct <= 0 then flag("odd" .. name, name .. ": probabilidad no válida") else sum += pct end
end
if math.abs(sum - 100) > 1e-6 then flag("odds", ("las probabilidades suman %.4f, no 100"):format(sum)) end
if C.offline.capHours < 8 or C.offline.capHours > 12 then flag("cap", "tope sin conexión fuera de 8–12 h") end
if C.offline.efficiency < 0.25 or C.offline.efficiency > 0.5 then flag("eff", "eficiencia sin conexión fuera de 25–50 %") end

local r, prevT = C.rebirth, nil
local rate = C.incomeAt(C.levels - 1) -- ritmo al final de una vuelta (aproximado)
for p = 0, r.show - 1 do
	local mult, need = 1 + r.k * p, r.needBase * r.needGrowth ^ p
	local t = need / (rate * mult)
	print(("renacer %d: con ×%.2f pide %.0f ≈ %s"):format(p + 1, mult, need, secs(t)))
	if prevT and t < prevT then flag("rebirth", "un renacer tarda menos que el anterior: ya no es meta") end
	prevT = t
end
for _, w in warns do warn(("AVISO: %s (%d veces)"):format(w.msg, w.n)) end
local result = count == 0 and "OK: todo dentro del objetivo" or ("AVISOS: " .. count)
print(result)
return result
```
Con los números de ejemplo sale `OK`: ~10 s de espera al principio, ~1 min a la media hora (nivel 60),
~4 min en el nivel 99 y ~2 h en total. Enseña la tabla a la persona en palabras: «la mejora 50 cuesta
2,9K y se paga en ~49 s».

## Ventas honestas (sobre todo con niños)
**Qué se puede vender:** Game Pass (algo para siempre: una capa, x2, una zona VIP) y productos de
desarrollador (algo que se compra muchas veces: monedas, vales, revivir). Decide con la persona qué es
«pagar para ganar» y qué no.

**Recibos (`ProcessReceipt`):** el código está en `rc-datos` (un solo `ProcessReceipt` en todo el juego,
«entregado» solo después de guardar, recibos apuntados para no entregar dos veces, recibos «en curso»).
Aquí, lo que hay que comprobar:
- Recibo repetido → no entrega dos veces. Perfil sin cargar → `NotProcessedYet`, no entrega.
- **Lo que se enseña es lo que llega**: prueba pasando por el `ProcessReceipt` real (lección real: la
  tienda enseñaba x5 y el servidor daba x1, porque usaba una parte de la configuración sin ese dato).
- Dentro del recibo, nada largo (teletransportes, esperas): entrega un vale y que el jugador lo use.
- Si lo pagado ya no se puede entregar (oferta caducada, tope lleno), guárdalo como vale o da algo
  equivalente, y díselo al jugador.

**Precio real:** léelo de Roblox, no lo escribas a mano; así sigue los cambios del Creator Hub.
```luau
local MarketplaceService = game:GetService("MarketplaceService")
local function robuxPrice(productId) -- nil si falla: enseña «—», no un precio inventado
	local ok, info = pcall(MarketplaceService.GetProductInfoAsync, MarketplaceService, productId, Enum.InfoType.Product)
	return ok and info and info.PriceInRobux or nil
end
```
(Para un Game Pass, `Enum.InfoType.GamePass`.) Tiene límite de llamadas: guarda el precio por producto
al arrancar y no lo pidas cada vez que se abre la tienda. La documentación de Roblox (comprobado
2026-11-18) marca `GetProductInfo` como **obsoleta**; por eso el ejemplo usa `GetProductInfoAsync` (mira sus
argumentos en la página de `MarketplaceService` por si cambiaron: **no verificado** en Studio). Si hay precios
regionales, comprueba qué precio devuelve.

**Pago al azar** (cajas, ruletas o mejoras que pueden fallar, pagadas con Robux o con una moneda que se
compra con Robux): enseña la probabilidad **antes** de cada intento y pregunta a Roblox si ese jugador
puede verlo. Si la consulta falla, trátalo como restringido. Decláralo en el cuestionario de madurez.
Mejor aún: no vendas azar.
```luau
local PolicyService = game:GetService("PolicyService")
local function paidRandomAllowed(player)
	local ok, info = pcall(PolicyService.GetPolicyInfoForPlayerAsync, PolicyService, player)
	return ok and info.ArePaidRandomItemsRestricted == false
end
```
Guárdalo por jugador al entrar y compruébalo en el servidor también al comprar, no solo al enseñar.

**Sin trucos de prisa:**
- Nada de cuentas atrás para comprar ni ofertas que saltan justo cuando el jugador pierde algo (lección
  real: se quitó una así). Si hay ventana de oferta, que no corra sola.
- Nombre, icono y descripción claros: lo que dice la ventana de Roblox es lo que llega.
- **Anuncios con premio:** según las reglas vigentes, solo a quien Roblox permita (normalmente mayores de
  13) y con premio **fijo** elegido antes de verlo, nunca al azar.
- Una página «Antes de comprar» en la ayuda del juego: los Robux son dinero de verdad, pregunta a un adulto,
  se puede jugar a todo sin pagar.
- Lo gratis tiene que ser divertido de verdad. Si solo es divertido pagando, es un problema de diseño.

**Lo que suele funcionar sin engañar:** un pack de inicio barato y de una sola vez; cosas de aspecto sin
ventaja (estelas, títulos, ropa); packs de vales (menos ventanas de compra y menos permisos de los
padres); escalera de precios suave, sin descuentos enormes en el pack más caro (empujan a gastar).

**Quién hace qué:** la persona crea los productos y Game Pass en el Creator Hub, pone los precios y los
pone a la venta. Tú pones los IDs en la configuración, escribes el código y las pruebas, y preparas
nombres, descripciones y respuestas del cuestionario de madurez para que ella los revise. Un Game Pass
recién creado está «fuera de venta» hasta que ella lo pone a la venta.

## Comprobación ejecutable (Edit, por el MCP `execute_luau` o en la barra de comandos)
**1. Calculadora** (arriba): termina en `OK: todo dentro del objetivo`, o cada aviso se arregla o la
persona lo acepta por escrito.

**2. Batería del módulo `Economy`:**
```luau
local Economy = require(game.ReplicatedStorage.Shared.Economy:Clone()) -- copia: evita la caché en Edit
local fails = {}
local function check(id, cond) if not cond then table.insert(fails, id) end end
check("E1 menos de mil", Economy.format(999) == "999")
check("E2 mil y medio", Economy.format(1500) == "1.5K")
check("E3 sin 1000.0K", Economy.format(999950) == "1M")
check("E4 justo debajo", Economy.format(999949) == "999.9K")
check("E5 curva", Economy.price(10, 1.12, 0) == 10 and Economy.price(10, 1.12, 10) == 31)
check("E6 x3 = suma", Economy.priceOfMany(10, 1.12, 0, 3) == 10 + 11 + 13)
local d = { Coins = 100, Gems = 1 }
check("E7 falta una moneda: no resta nada", not Economy.trySpend(d, { Coins = 50, Gems = 2 }) and d.Coins == 100 and d.Gems == 1)
check("E8 con saldo: resta todas", Economy.trySpend(d, { Coins = 50, Gems = 1 }) and d.Coins == 50 and d.Gems == 0)
check("E9 coste negativo rechazado", not Economy.trySpend(d, { Coins = -5 }) and d.Coins == 50)
check("E10 tope sin conexión", Economy.offlineGain(0, 3 * 86400, 2, 10 * 3600, 0.5) == 36000)
check("E11 reloj hacia atrás = 0", Economy.offlineGain(1000, 500, 2, 36000, 0.5) == 0 and Economy.offlineGain(nil, 500, 2, 36000, 0.5) == 0)
local rng, seen = Random.new(1), { comun = 0, raro = 0, epico = 0 }
local entries = { { id = "comun", pct = 70 }, { id = "raro", pct = 25 }, { id = "epico", pct = 5 } }
for _ = 1, 100000 do local id = Economy.pick(rng, entries); seen[id] += 1 end
check("E12 azar ≈ tabla", math.abs(seen.comun / 1000 - 70) < 1 and math.abs(seen.raro / 1000 - 25) < 1 and math.abs(seen.epico / 1000 - 5) < 1)
return #fails == 0 and "OK 0 fallos" or ("FALLOS: " .. table.concat(fails, ", "))
```

**3. En Play** (Studio, con productos de prueba; Studio no cobra): compra cada producto una vez y mira que
llega **exactamente** lo que dice su ventana; compra con el perfil sin cargar y mira que no entrega. Las
compras reales con dinero quedan **no verificado** hasta publicar.

## Gotchas (síntoma → causa → arreglo)
- **Sale «1000.0K»** → se elige el sufijo antes de redondear → redondea y, si llega a 1000, sube de
  sufijo (`Economy.format`, E3).
- **A la media hora nadie compra nada** → g demasiado alto o la ganancia no crece con las mejoras →
  calculadora; baja g o haz crecer la ganancia.
- **Todo se compra en un minuto y luego aburre** → g bajo o ganancia que crece más que el precio →
  calculadora con `waitMin`.
- **Saldo negativo o cosas gratis** → se restaba sin comprobar todas las monedas, o había una espera
  entre comprobar y restar → `trySpend`, todo seguido en el servidor.
- **Un tramposo se pone el precio** → el cliente mandaba el precio o la cantidad → solo el ID; el precio
  lo calcula el servidor (`rc-servidor`).
- **Al volver, el jugador recibe una fortuna** → sin tope, con `os.clock()` o con tiempo negativo mal
  tratado → `offlineGain` con `os.time()`, tope y 0 si es negativo (E10, E11).
- **La caja enseña 5 % y sale mucho menos (o más)** → las probabilidades estaban escritas en dos sitios,
  o no sumaban 100 → una sola tabla para sortear y enseñar; la calculadora lo avisa.
- **La tienda enseña x5 y llega x1** → el servidor leía otra parte de la configuración → prueba por el
  `ProcessReceipt` real (lección real).
- **Un producto se entrega dos veces** → dos recibos procesados a la vez → recibos «en curso» (`rc-datos`,
  lección real).
- **El precio en la tienda del juego no es el de la ventana de Roblox** → precio escrito a mano →
  `GetProductInfoAsync` (si falla, «—»).
- **Una mejora con suerte comprada con gemas de Robux** → es pago al azar → probabilidad a la vista,
  `PolicyService`, declararlo (lección real).
- **Una oferta salta cuando el jugador pierde** → presión de venta → quítala (lección real).
- **En Play el Game Pass dice «tuyo»** → como creador, Roblox te da tus Game Pass → prueba la compra con
  otra cuenta o confía en la comprobación del servidor.
- **Sumar monedas pequeñas ya no cambia el saldo** → pasados ~9 mil billones (2^53) → tope en la curva o
  mantisa y exponente.

## Etiquetas de resultado
**ejecutado** (calculadora `OK`, batería E1–E12 `OK 0 fallos`, compra de prueba vista en Play) ·
**verificado leyendo** (repasaste el mapa de monedas y cada manejador que da o quita) · **preparado sin
ejecutar** · **no verificado** (compras reales, precios regionales, qué ve un jugador con
`ArePaidRandomItemsRestricted`). Nunca digas «está equilibrado» sin la calculadora **ejecutada** y la
persona de acuerdo con los objetivos.
