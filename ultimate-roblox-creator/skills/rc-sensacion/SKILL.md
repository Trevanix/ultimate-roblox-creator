---
name: rc-sensacion
description: >
  Que un juego de Roblox se sienta bien (game feel) sin marear a nadie: sacudida de cámara con trauma²,
  pausa de golpe simulada (en Roblox no hay escala de tiempo), TweenService con estilos y duraciones,
  suavizado 1 - exp(-rate·dt) que no depende de los FPS, cámara propia solo si hace falta, destellos ≤ 3
  por segundo, opción para quitar efectos y ReducedMotionEnabled. Úsala con golpes, impactos, recoger cosas
  o la cámara (juice, screen shake, hitstop, camera shake, smooth camera, tween, feedback). No para
  animar menús (rc-interfaz), sonido (rc-sonido) ni animaciones del personaje (rc-personajes-fisica).
---

# rc-sensacion · Cada acción contesta, sin marear

Un golpe «se siente» cuando varias señales pequeñas llegan a la vez: un sonido, un destello, un número,
un poco de sacudida y una pausa cortísima. Cada señal sola es casi invisible; juntas hacen que el juego
conteste. Pero todo eso se puede quitar: hay jugadores a los que el movimiento les marea.

Última comprobación: 2026-11-18 (API de RunService.BindToRenderStep, TweenService,
GuiService.ReducedMotionEnabled, AnimationTrack.AdjustSpeed y ParticleEmitter.TimeScale; método y números
de awesome-gamedev-agent-skills, ver `NOTICE` del plugin).

## Cuándo usarla
- Golpear, recibir daño, recoger, subir de nivel, ganar o morir «no se siente».
- La persona pide sacudidas, destellos, una cámara que siga suave o una cámara propia.
- Algo da tirones o mareo (cámara a saltos, sacudidas fuertes, destellos).

**Antes de cambiar cómo se siente el juego (cámara, controles), pregunta.** Lección real: cambios de
cámara «para mejorar» que a la persona no le gustaron. Deja siempre una forma de volver a lo de antes.

## Pasos (en orden)
1. **Lista de momentos** con la persona y su tamaño: pequeño (recoger, golpe flojo), mediano (golpe
   fuerte, recibir daño), grande (jefe, explosión, ganar).
2. **Ajustes del jugador**: «Efectos» y «Sacudida» se pueden apagar; si `ReducedMotionEnabled` está
   activo, sin sacudidas ni zum. Se guardan con `rc-datos` si la persona quiere que se recuerden.
3. **Módulo `FeelMath`** (números puros) y un **LocalScript `Feel`** que los aplica.
4. Engancha cada momento a sus señales (tabla de abajo). Los efectos van **solo en el cliente**; el
   servidor decide qué pasó (`rc-servidor`) y avisa.
5. Cámara propia **solo si la de Roblox no sirve** (abajo).
6. **Comprobación ejecutable:** la batería F1–F9 dice `OK 0 fallos`; en Play, con «Sacudida» apagada y con
   `ReducedMotionEnabled`, no se mueve la cámara.

## Señales por tamaño (punto de partida; la persona decide)
| Momento | Sacudida (trauma) | Pausa de golpe | Destello | Escala (tween) |
|---|---|---|---|---|
| Pequeño | 0 – 0,15 | 0,04 s | no | ×1,1, 0,1 s |
| Mediano | 0,3 | 0,08 s | suave | ×1,2, 0,15 s |
| Grande | 0,6 – 0,8 | 0,12 – 0,15 s | sí (≤ 3 por segundo) | ×1,3, 0,25 s |

- Corto: casi todo dura menos de 0,3 s. Lo largo cansa y tapa el juego.
- El jugador que **hace** algo nota más que el que mira: la sacudida es para quien golpea o recibe, no
  para todo el servidor.
- Lo que contesta al botón se enseña **ya** en el cliente (un sonido, un destello del arma); el resultado
  (daño, premio) llega del servidor. Si el servidor dice que no, no se da el premio, pero el botón ya
  contestó.

## Sacudida de cámara: trauma²
- El «trauma» va de 0 a 1: cada golpe suma un poco y baja solo con el tiempo (≈ 1,2 por segundo).
- La sacudida es **trauma²**: los golpes pequeños casi no se notan y los grandes sí, sin pasarse.
- Movimiento suave con ruido (`math.noise`), no números al azar en cada fotograma (vibra feo).
- Ángulos máximos pequeños: 2–3° de giro. Nada de mover la cámara de sitio grandes distancias.

## Pausa de golpe simulada (hitstop)
Roblox **no tiene escala de tiempo** para todo el juego: no se puede «parar el mundo». Se simula en el
cliente de quien golpea:
- Para un instante las animaciones del golpe con `AnimationTrack:AdjustSpeed(0)` y devuélvelas a su
  velocidad.
- Las partículas del impacto: `ParticleEmitter.TimeScale` (de 0 a 1) un instante más bajo.
- **Nunca** anclar piezas ni parar nada en el servidor para una pausa de golpe: lo notan todos los jugadores
  y rompe la física. En juegos de jugador contra jugador, pausas aún más cortas.

## TweenService
- Para menús: usa el `play()` de `rc-interfaz` (cancela el anterior y respeta ReducedMotion).
- Estilos: `Back` + `Out` para «saltar» (recoger, aparecer); `Quad` + `Out` para moverse; `Linear` casi
  nunca (se ve mecánico).
- **Un dueño por propiedad**: si dos tweens o un tween y un script mueven la misma propiedad, gana el
  último y tiembla. Guarda el tween en curso y cancélalo antes del siguiente.
- Escalar un modelo 3D: no se puede «tweenear» `Model:ScaleTo` directamente; anima un `NumberValue` y
  aplica su valor en `Changed`, o mejor anima un `UIScale` de un `BillboardGui`.

## Suavizado que no depende de los FPS
`pos = pos:Lerp(target, 0.1)` cada fotograma va **más rápido** con 240 FPS que con 30. Usa:
`alpha = 1 - math.exp(-rate * dt)`, con `rate` 8–15 para una cámara que sigue (más alto = más pegada).
```luau
local alpha = FeelMath.smoothAlpha(12, dt) -- dt: segundos desde el fotograma anterior
current = current:Lerp(target, alpha)
```

## Destellos y accesibilidad
- **No más de 3 destellos por segundo** (pueden provocar crisis en personas sensibles). El limitador del
  módulo los corta solos.
- Destellos de pantalla completa: poco opacos (transparencia 0,6 o más) y nada de rojo y blanco
  alternando.
- Opción **«Efectos: sí / no»** y **«Sacudida: sí / no»** en ajustes, fácil de encontrar.
- `GuiService.ReducedMotionEnabled` (ajuste del propio jugador en Roblox): sin sacudida, sin zum, tweens
  instantáneos.

## Patrones

### `FeelMath` (`ReplicatedStorage/Shared/FeelMath`, ModuleScript, números puros)
```luau
local FeelMath = {}
FeelMath.DECAY = 1.2 -- trauma que se pierde por segundo
FeelMath.HITSTOP = { small = 0.04, medium = 0.08, big = 0.13 }

function FeelMath.addTrauma(t, amount) return math.clamp(t + amount, 0, 1) end
function FeelMath.decay(t, dt) return math.max(0, t - FeelMath.DECAY * dt) end
function FeelMath.shake(t) return t * t end
function FeelMath.smoothAlpha(rate, dt) return 1 - math.exp(-rate * dt) end
function FeelMath.clampPitch(deg) return math.clamp(deg, -80, 45) end

-- Devuelve una función que dice si se permite otro destello (como mucho `maxPerSecond` en 1 s).
function FeelMath.newFlashLimiter(maxPerSecond, now)
	local times = {}
	return function()
		local t = now()
		while times[1] and t - times[1] >= 1 do table.remove(times, 1) end
		if #times >= maxPerSecond then return false end
		table.insert(times, t)
		return true
	end
end

return FeelMath
```

### LocalScript `Feel` (`StarterPlayerScripts`)
La sacudida se **quita** antes de que la cámara de Roblox se actualice y se **pone** justo después. Así la
cámara de Roblox nunca la ve y no se acumula ni se tuerce.
```luau
local RunService = game:GetService("RunService")
local GuiService = game:GetService("GuiService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local FeelMath = require(ReplicatedStorage.Shared.FeelMath)

local Feel = { effects = true, shakeOn = true } -- los cambia la pantalla de ajustes
local camera = workspace.CurrentCamera
local trauma, applied, t = 0, CFrame.identity, 0
local MAX_ANGLE = math.rad(5) -- math.noise da ~±0,5: el giro real llega a ~2,5°

local function shakeAllowed() return Feel.effects and Feel.shakeOn and not GuiService.ReducedMotionEnabled end

function Feel.hit(size) -- "small" | "medium" | "big"
	if shakeAllowed() then
		trauma = FeelMath.addTrauma(trauma, size == "big" and 0.7 or size == "medium" and 0.3 or 0.1)
	end
end

RunService:BindToRenderStep("FeelUndo", Enum.RenderPriority.Camera.Value - 1, function()
	camera.CFrame = camera.CFrame * applied:Inverse()
	applied = CFrame.identity
end)
RunService:BindToRenderStep("FeelApply", Enum.RenderPriority.Camera.Value + 1, function(dt)
	trauma = FeelMath.decay(trauma, dt)
	if trauma <= 0 or not shakeAllowed() then trauma = 0; return end
	t += dt
	local s = FeelMath.shake(trauma) * MAX_ANGLE
	applied = CFrame.Angles(s * math.noise(1, t * 15), s * math.noise(2, t * 15), s * math.noise(3, t * 15))
	camera.CFrame = camera.CFrame * applied
end)

local canFlash = FeelMath.newFlashLimiter(3, os.clock)
local frozen = setmetatable({}, { __mode = "k" }) -- [pista] = velocidad de antes de la pausa
function Feel.hitstop(tracks, size) -- tracks: las AnimationTrack del golpe que se ven
	if not Feel.effects then return end
	local mine = {}
	for _, tr in tracks do
		if frozen[tr] == nil then -- ya pausada: no guardes su 0 como velocidad buena
			frozen[tr] = tr.Speed
			tr:AdjustSpeed(0)
			table.insert(mine, tr)
		end
	end
	task.delay(FeelMath.HITSTOP[size] or 0.04, function()
		for _, tr in mine do
			if tr.IsPlaying then tr:AdjustSpeed(frozen[tr]) end
			frozen[tr] = nil
		end
	end)
end
function Feel.flash(frame) -- un Frame de pantalla completa, BackgroundTransparency = 1
	if not Feel.effects or not canFlash() then return end
	frame.BackgroundTransparency = 0.6
	task.delay(0.08, function() frame.BackgroundTransparency = 1 end)
end
```
Para usarlo desde otros scripts del cliente, pon `Feel` en un ModuleScript (`StarterPlayerScripts/Feel`)
que lo devuelva y que un LocalScript lo requiera una vez. El servidor avisa con un remoto («te dieron»,
«diste») y el cliente llama `Feel.hit("medium")`.

### Cámara propia, solo si hace falta
Prueba primero lo que trae Roblox: `StarterPlayer.CameraMaxZoomDistance` / `CameraMinZoomDistance`,
`CameraMode = LockFirstPerson`, `Humanoid.CameraOffset`. Si aun así hace falta (vista desde arriba, de
lado, isométrica):
- `camera.CameraType = Enum.CameraType.Scriptable` y mueve la cámara en `BindToRenderStep` con prioridad
  `Camera`.
- Suaviza con `smoothAlpha`; inclinación entre **−80° y +45°** (`clampPitch`).
- Que no atraviese paredes: rayo (`workspace:Raycast`) desde el personaje hasta donde quieres la cámara y,
  si choca, ponla un poco antes del choque (ignora al propio personaje con `RaycastParams`).
- En el teléfono, el dedo debe poder girarla o no hacer falta; pruébalo en el emulador.
- Guarda el modo anterior para volver (`CameraType = Custom`) en menús, al morir y si la persona no la
  quiere.

## Comprobación ejecutable (Edit, por el MCP `execute_luau` o en la barra de comandos)
**1. Batería de `FeelMath`:**
```luau
local F = require(game.ReplicatedStorage.Shared.FeelMath:Clone())
local fails = {}
local function check(id, cond) if not cond then table.insert(fails, id) end end
check("F1 trauma con tope", F.addTrauma(0.9, 0.5) == 1 and F.addTrauma(0, -1) == 0)
check("F2 baja con el tiempo", math.abs(F.decay(1, 0.5) - 0.4) < 1e-9 and F.decay(0.1, 1) == 0)
check("F3 sacudida = trauma²", F.shake(0.5) == 0.25 and F.shake(1) == 1)
local function follow(fps, rate) -- 1 segundo siguiendo a un objetivo fijo en 10
	local x, dt = 0, 1 / fps
	for _ = 1, fps do x += (10 - x) * F.smoothAlpha(rate, dt) end
	return x
end
check("F4 igual a 30 y a 240 FPS", math.abs(follow(30, 10) - follow(240, 10)) < 1e-6)
local function badFollow(fps) local x = 0; for _ = 1, fps do x += (10 - x) * 0.05 end; return x end
check("F5 el lerp fijo SÍ depende de los FPS", math.abs(badFollow(30) - badFollow(240)) > 1)
check("F6 inclinación", F.clampPitch(-120) == -80 and F.clampPitch(90) == 45 and F.clampPitch(10) == 10)
local clock = 0
local can = F.newFlashLimiter(3, function() return clock end)
local n = 0
for _ = 1, 10 do if can() then n += 1 end; clock += 0.05 end
check("F7 como mucho 3 destellos por segundo", n == 3)
clock = 2
check("F8 se recupera", can())
check("F9 pausas cortas", F.HITSTOP.small >= 0.04 and F.HITSTOP.big <= 0.15)
return #fails == 0 and "OK 0 fallos" or ("FALLOS: " .. table.concat(fails, ", "))
```

**2. En Play** (lo mira la persona o tú con `screen_capture`):
- Golpe grande: la cámara tiembla ~medio segundo (trauma 0,7 ÷ 1,2 por segundo) y vuelve a su sitio
  exacto.
- «Sacudida: no» → ni un temblor. Con el ajuste de Roblox «Reducir movimiento» (Reduced Motion) activado →
  ni temblor ni zum.
- Diez golpes seguidos: como mucho 3 destellos por segundo.
- En el emulador de teléfono: la cámara propia (si hay) se puede usar con el dedo.

## Gotchas (síntoma → causa → arreglo)
- **La cámara se va torciendo o se queda inclinada** → la sacudida se sumaba a la cámara sin quitarla →
  quitar antes (`Camera - 1`) y poner después (`Camera + 1`).
- **La sacudida marea** → ángulos grandes o trauma lineal → trauma², máximo 2–3°, que baje deprisa.
- **La cámara sigue rápido en un PC potente y lenta en el móvil** → `Lerp` con número fijo → `smoothAlpha`
  con `dt` (F4, F5).
- **«Pausa de golpe» que congela a todos o rompe la física** → se anclaron piezas o se paró algo en el
  servidor → solo animaciones y partículas del cliente.
- **Una animación se queda parada para siempre** → el personaje murió durante la pausa → al devolver la
  velocidad, comprueba `IsPlaying`; si hay reaparición, usa el contador de generación (`rc-personajes-fisica`).
- **Un objeto tiembla o salta entre dos tamaños** → dos tweens sobre la misma propiedad → un dueño por
  propiedad: cancela el anterior.
- **Un jugador dice que se marea o se queja de destellos** → sin opción para quitarlos → «Efectos» y
  «Sacudida» en ajustes, `ReducedMotionEnabled` y el limitador de 3 por segundo.
- **A la persona no le gusta la cámara nueva** → se cambió sin preguntar → pregunta antes y deja forma de
  volver (lección real).
- **La cámara atraviesa paredes** → cámara propia sin rayo → raycast desde el personaje y ponla antes del
  choque.
- **Los efectos se ven con retraso** → el cliente esperaba la respuesta del servidor para todo → lo que
  contesta al botón, ya; el resultado, cuando llegue.

## Etiquetas de resultado
**ejecutado** (F1–F9 `OK 0 fallos`, lo de Play visto con captura o contado por la persona) · **verificado
leyendo** · **preparado sin ejecutar** · **no verificado** (mareo real en un teléfono, cómo se siente con
mando). «Se siente bien» lo dice la persona jugando, no tú: pregúntaselo.
