---
name: rc-interfaz
description: >
  Pantallas de un juego de Roblox que se ven y se usan bien en ordenador, teléfono, tableta y consola:
  escala común, ScreenInsets (CoreUISafeInsets, DeviceSafeInsets), letra mínima, botones táctiles, mando (foco solo con
  mando, SelectionGroup, glifos PS5/Xbox), ReducedMotion, cancelar tweens, AutomaticCanvasSize, contraste,
  color que no es la única señal y textos según la edad. Úsala con ScreenGui, HUD, menús, tienda o
  inventario (UI, mobile, gamepad, console, accessibility, text size, kid-friendly text). No para guardar
  datos (rc-datos), remotos (rc-servidor), sacudidas y cámara (rc-sensacion), ni dudas sueltas de la API
  (roblox-game, plugin roblox-dev).
---

# rc-interfaz · Que se lea y se pulse en cualquier aparato

La interfaz es lo primero que ve el jugador. Si en el teléfono no se lee, o con el mando no se puede
elegir nada, el jugador se va. Diseña la base para todos los aparatos desde la primera pantalla: rehacerla
al final cuesta mucho.

Última comprobación: 2026-11-18 (API de GuiService, UserInputService, ScreenGui, TweenService; método de
awesome-gamedev-agent-skills, ver `NOTICE` del plugin).

## Cuándo usarla
- Se crea o cambia una pantalla, ventana, HUD, tienda, inventario o menú.
- El juego se va a abrir en teléfono, tableta o consola (Etapa 5 del director).
- Hay que escribir o revisar textos para jugadores (ayuda, avisos, botones, tienda).
- Algo «no se ve», «no se puede pulsar» o «con el mando no va».

## Pasos (en orden)
1. **Mira la ficha del juego**: qué aparatos y qué edad. Si no está, pregúntalo (2 preguntas cortas).
2. **Estructura**: una `ScreenGui` por ventana o zona (HUD, tienda, ayuda), cada una con su módulo pequeño
   en el cliente y una sola fuente de estado por pantalla. Cada ventana: título, botón de cerrar, cabe en
   el teléfono, se cierra con B / Esc; un pequeño efecto al abrir y al pulsar da sensación de calidad.
   Propiedades base en cada `ScreenGui` (abajo).
3. **Escala común** (`Shared/UiScale`) aplicada a cada `ScreenGui`.
4. **Teléfono**: zona segura, letra mínima, botones táctiles.
5. **Mando**: foco, `SelectionGroup`, listas, glifos, botón de cerrar.
6. **Movimiento y accesibilidad**: `ReducedMotionEnabled`, tweens cancelables, contraste, color + icono.
7. **Textos según la edad** con su lista «antes → después» para que la persona la apruebe.
8. **Comprobación ejecutable**: la auditoría de abajo devuelve `OK 0 avisos` (o cada aviso explicado) y se
   mira cada pantalla en el simulador de dispositivos con un teléfono pequeño y con el emulador de mando.

## Propiedades base de cada ScreenGui
```luau
gui.ResetOnSpawn = false                              -- no se reinicia al morir
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling      -- lección real: iconos que no se veían
gui.ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets -- (por defecto) evita la muesca y los botones de Roblox
```
- `DeviceSafeInsets` solo evita la muesca del aparato, **no** los botones de Roblox de arriba: úsalo a
  propósito, p. ej. para una barra que ocupa todo el ancho y no lleva botones arriba a la izquierda.
- Tamaños en **escala** (`UDim2.fromScale`) y `UIAspectRatioConstraint` para que no se deformen.
- Lo que está en `StarterGui` se copia a `PlayerGui` de cada jugador: el código del cliente cambia
  `player.PlayerGui`, no `StarterGui`.
- Si un fondo debe cubrir toda la pantalla, esa `ScreenGui` usa `ScreenInsets = None` (y el contenido con
  botones en otra que sí respeta la zona segura).

## Patrones

### Escala común (`ReplicatedStorage/Shared/UiScale`, ModuleScript)
```luau
local UIS = game:GetService("UserInputService")
local GuiService = game:GetService("GuiService")
local M = {}

function M.Device()
	if GuiService:IsTenFootInterface() then return "console" end
	if UIS.TouchEnabled and not UIS.KeyboardEnabled then
		local cam = workspace.CurrentCamera
		local short = cam and math.min(cam.ViewportSize.X, cam.ViewportSize.Y) or 0
		return short < 500 and "phone" or "tablet"
	end
	return "desktop" -- un portátil táctil con teclado cuenta como ordenador
end

function M.Factor()
	return M.Device() == "console" and 1.25 or 1 -- en la tele se lee de lejos
end

function M.Apply(gui)
	local s = gui:FindFirstChildOfClass("UIScale") or Instance.new("UIScale")
	s.Scale = M.Factor()
	s.Parent = gui
end

return M
```
- Al principio la cámara puede medir 1×1: mide cuando `ViewportSize` sea real
  (`workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize")`).
- Al leer `AbsoluteSize` de algo escalado, divide por `Factor()`.

### Letra legible
- Tamaños mínimos de referencia: **≥ 14 px** de verdad en un teléfono pequeño, **≥ 18 px** en ordenador,
  **≥ 26 px** en consola (a 1080p). Si no cabe, **reordena**; no bajes la escala (lección real: a 0,9 la
  letra no se leía).
- Con `TextScaled = true`, añade `UITextSizeConstraint` con `MinTextSize = 14` (si no, el texto encoge sin
  límite).
- Botones táctiles de al menos ~44 px de lado y separados entre sí.

### Teléfono y tableta
- Lo que en ordenador es una tecla (correr, interactuar, abrir el inventario) necesita botón en pantalla:
  `ContextActionService:BindAction("Run", onRun, true, Enum.KeyCode.LeftShift, Enum.KeyCode.ButtonL3)` crea
  uno (el `true`); ajusta su sitio con `SetPosition` y su texto con `SetTitle`.
- En táctil no enseñes la barra de teclas del ordenador («Pulsa E»).

### Mando: foco solo si se juega con mando
Saber si hay pantalla táctil (`TouchEnabled`) no dice con qué juega la persona. Usa la entrada preferida
y, si tu versión aún no la tiene, una aproximación:
```luau
local UIS = game:GetService("UserInputService")
local GuiService = game:GetService("GuiService")

local function usingGamepad()
	local ok, pref = pcall(function() return UIS.PreferredInput end)
	if ok and pref ~= nil then return pref == Enum.PreferredInput.Gamepad end
	local last = UIS:GetLastInputType()
	return last.Name:sub(1, 7) == "Gamepad"
end

local function openWindow(frame, firstButton)
	frame.Visible = true
	frame.SelectionGroup = true -- la marca no se escapa de la ventana
	if usingGamepad() then GuiService.SelectedObject = firstButton end -- con ratón o dedo, nada marcado
end
```
- Abrir una ventana con mando **sin nada marcado es un fallo**: el jugador no puede hacer nada.
- Al cerrar, devuelve la marca a donde estaba (o `nil` si no hay mando).
- **Listas con desplazamiento**: `ScrollingFrame.Selectable = false` y los elementos `Selectable = true`.
  Si la lista se queda la marca, no se puede elegir nada (lección real en PS5).
- Cada ventana se cierra con B / Círculo (`Enum.KeyCode.ButtonB`) y con Esc.
- **Glifos**: enseña el botón que el jugador tiene en la mano con
  `UIS:GetImageForKeyCode(Enum.KeyCode.ButtonY)` (da el dibujo según su mando). No adivines la consola.
  Si escribes el nombre, pon el dibujo al lado; en PS5 los símbolos ✕ ○ △ □ pueden no existir en la letra
  del juego (lección real): usa palabras (Equis, Círculo, Triángulo, Cuadrado, L1, R1); en Xbox A, B, X, Y,
  LB, RB.
- Un aviso grande la primera vez: «Pulsa [dibujo] para abrir el menú».

### Animar sin romper: cancelar y respetar ReducedMotion
Una ventana que se cierra con animación queda **invisible pero pulsable** si otra animación la pisa.
Un dueño por propiedad: guarda el tween de cada objeto y cancélalo antes del siguiente.
```luau
local TweenService = game:GetService("TweenService")
local GuiService = game:GetService("GuiService")
local current = setmetatable({}, { __mode = "k" }) -- [objeto] = tween en curso

local function play(obj, seconds, goal)
	if current[obj] then current[obj]:Cancel() end
	if GuiService.ReducedMotionEnabled then seconds = 0 end -- ajuste del jugador: sin movimiento
	local tw = TweenService:Create(obj, TweenInfo.new(seconds, Enum.EasingStyle.Quad), goal)
	current[obj] = tw
	tw:Play()
	return tw
end

local function closeWindow(frame) -- el frame lleva dentro un UIScale
	frame.Interactable = false -- deja de recibir clics ya, no al terminar
	local tw = play(frame.UIScale, 0.15, { Scale = 0.9 })
	tw.Completed:Connect(function(state)
		if state == Enum.PlaybackState.Completed and current[frame.UIScale] == tw then
			frame.Visible = false
			frame.UIScale.Scale = 1
		end
	end)
end
-- Al abrir: frame.Interactable = true, frame.Visible = true, play(frame.UIScale, 0.15, { Scale = 1 }).
```
- Destellos: no más de 3 por segundo (accesibilidad).
- Sacudidas de pantalla y cámara: `rc-sensacion`.

### Listas que crecen solas
```luau
list.AutomaticCanvasSize = Enum.AutomaticSize.Y
list.CanvasSize = UDim2.new() -- el lienzo lo calcula Roblox
list.ScrollingDirection = Enum.ScrollingDirection.Y
-- dentro: un UIListLayout o UIGridLayout. NUNCA un UISizeConstraint (recorta la lista; lección real).
```

### Contraste y color
- Texto sobre fondo con contraste **≥ 4,5 : 1** (la auditoría lo calcula). Sobre fondos que cambian (el
  mundo 3D), `UIStroke` en el texto o un fondo semitransparente.
- **El color no es la única señal**: «bloqueado» lleva candado además de gris; «raro» lleva estrella o
  texto además de morado. Así lo entiende quien no distingue colores.

### Texto que escriben los jugadores (nombres, carteles)
Siempre en el **servidor**, dentro de `pcall`; si falla, no enseñes el texto.
```luau
local TextService = game:GetService("TextService")
local function filterForAll(text, fromUserId)
	local ok, result = pcall(function()
		return TextService:FilterStringAsync(text, fromUserId):GetNonChatStringForBroadcastAsync()
	end)
	return ok and result or nil -- nil = no se enseña
end
```
(Para un solo lector: `:GetNonChatStringForUserAsync(toUserId)`. Valida largo y tipo antes: `rc-servidor`.)

## Textos según la edad
La ficha del juego dice la edad. Todo texto para jugadores (ayuda, avisos, botones, tienda) se escribe
para esa edad, en los idiomas del juego.
- **4–10 años**: una idea por frase; palabras que un niño conoce («Aventura» mejor que «Expedición»,
  «Vale gratis» mejor que «Bono», «Hoy no se guarda» mejor que «Modo temporal»); un emoji al principio
  como mucho (🎒 ⚡ 🛡️ 🏠); sin números si no ayudan («tu energía baja poco a poco»); avisos con causa clara
  («¡Te atrapó la trampa! Vuelves a la base»); letra grande y ayuda en páginas cortas con dibujos.
- **10–13**: frases algo más largas; números si ayudan a decidir («+10 % de suerte»); términos del juego
  explicados una vez en la ayuda.
- **13+**: más libertad de tono, igual de claro; miedo o tensión según lo declarado en el cuestionario de
  madurez.
- **Para todos**: un **léxico del juego** (archivo del proyecto, «palabra → significado»): una palabra para
  cada cosa y que dos cosas no se llamen parecido. Toda revisión de textos va como lista **«antes →
  después»** (el agente `revisor-textos-ventas` la prepara) para que la persona apruebe cada cambio.
- **Filtro de Roblox**: un nombre de producto o un texto inocente puede salir como «####» por tener doble
  sentido en otro idioma (lección real). Si pasa, cambia la palabra.
- Traducción: la persona activa idiomas y traducción automática en el Creator Hub; los textos cortos se
  traducen mejor.
- Ventas: página «Antes de comprar» y textos de la tienda, ver `rc-economia`.

## Comprobación ejecutable (Edit, por el MCP `execute_luau` o en la barra de comandos)
Revisa todo `StarterGui`: propiedades base, letra, contraste y listas.
```luau
local MIN_TEXT = 14
local warns = {}
local function add(o, msg) table.insert(warns, o:GetFullName() .. ": " .. msg) end

local function lum(c)
	local function ch(x) return x <= 0.03928 and x / 12.92 or ((x + 0.055) / 1.055) ^ 2.4 end
	return 0.2126 * ch(c.R) + 0.7152 * ch(c.G) + 0.0722 * ch(c.B)
end
local function contrast(a, b)
	local la, lb = lum(a), lum(b)
	return (math.max(la, lb) + 0.05) / (math.min(la, lb) + 0.05)
end
local function backgroundOf(o) -- primer fondo casi opaco: el propio o el de un padre
	local x = o
	while x and x:IsA("GuiObject") do
		if x.BackgroundTransparency < 0.5 then return x.BackgroundColor3 end
		x = x.Parent
	end
	return nil -- sobre el mundo 3D: pide UIStroke
end

for _, o in game.StarterGui:GetDescendants() do
	if o:IsA("ScreenGui") then
		if o.ResetOnSpawn then add(o, "ResetOnSpawn = true") end
		if o.ZIndexBehavior ~= Enum.ZIndexBehavior.Sibling then add(o, "ZIndexBehavior no es Sibling") end
		if o.ScreenInsets == Enum.ScreenInsets.None then add(o, "ScreenInsets = None (¿solo fondo?)") end
	elseif o:IsA("TextLabel") or o:IsA("TextButton") or o:IsA("TextBox") then
		if o.TextScaled then
			local c = o:FindFirstChildOfClass("UITextSizeConstraint")
			if not c or c.MinTextSize < MIN_TEXT then add(o, "TextScaled sin MinTextSize >= " .. MIN_TEXT) end
		elseif o.TextSize < MIN_TEXT then
			add(o, "TextSize " .. o.TextSize .. " < " .. MIN_TEXT)
		end
		local bg = backgroundOf(o)
		if bg and contrast(o.TextColor3, bg) < 4.5 then
			add(o, string.format("contraste %.1f < 4.5", contrast(o.TextColor3, bg)))
		elseif not bg and not o:FindFirstChildOfClass("UIStroke") then
			add(o, "texto sobre el mundo sin UIStroke")
		end
	elseif o:IsA("ScrollingFrame") then
		if o.Selectable then add(o, "ScrollingFrame Selectable (el mando se queda atascado)") end
		if o.AutomaticCanvasSize == Enum.AutomaticSize.None then add(o, "sin AutomaticCanvasSize") end
		if o:FindFirstChildWhichIsA("UISizeConstraint", true) then add(o, "UISizeConstraint dentro (recorta)") end
	end
end
return #warns == 0 and "OK 0 avisos" or (#warns .. " avisos:\n" .. table.concat(warns, "\n"))
```
Si la interfaz se crea por código en vez de estar en `StarterGui`, ejecuta la misma revisión en Play
sobre `PlayerGui` del jugador (cambia `game.StarterGui` por
`game.Players:GetPlayers()[1].PlayerGui`).

Después, a ojo (con el MCP: `start_stop_play` + `screen_capture`; sin él, lo mira la persona y te lo cuenta):
1. Simulador de dispositivos (Prueba → Dispositivo / Test → Device) con un teléfono pequeño en vertical y
   en horizontal: nada tapado por la muesca, todo se lee, todo se puede pulsar.
2. Emulador de mando: abrir cada ventana, moverse, elegir en las listas, cerrar con B.
3. Tamaño de ventana grande y pequeño en ordenador.
Teléfono real, mando real y consola real quedan **no verificado** hasta que la persona lo pruebe.
Teléfono, Tableta y Consola se activan en el Creator Hub: lo hace la persona cuando lo hayáis probado.

## Gotchas (síntoma → causa → arreglo)
- **Iconos o textos que no se ven** → `ZIndexBehavior` en `Global` → `Sibling` en cada `ScreenGui`
  (lección real).
- **La lista sale recortada** → `UISizeConstraint` dentro del `ScrollingFrame` → quítalo; usa
  `AutomaticCanvasSize` (lección real).
- **Con el mando no se puede elegir nada de la lista** → el `ScrollingFrame` se queda la marca → no
  seleccionable; los elementos sí (lección real en PS5).
- **Con el mando, al abrir una ventana no pasa nada** → nada marcado → `SelectedObject` al botón principal
  si se juega con mando.
- **En el teléfono aparece un botón marcado sin motivo** → se ponía el foco siempre → solo con mando
  (`usingGamepad`).
- **La marca del mando se escapa detrás de la ventana** → falta `SelectionGroup = true` en la ventana.
- **Salen cuadrados en vez de ✕ ○ △ □** → la letra del juego no tiene esos símbolos → palabras o el dibujo
  de `GetImageForKeyCode` (lección real).
- **La muesca o los botones de Roblox tapan un botón** → `ScreenInsets` en `None` o `IgnoreGuiInset` →
  `CoreUISafeInsets` (lección real).
- **Un panel cerrado sigue recibiendo clics** → animación pisada por otra, o `Visible = false` solo al
  final → cancela el tween anterior y `Interactable = false` al empezar a cerrar.
- **La interfaz desaparece o se duplica al morir** → `ResetOnSpawn = true` → `false`, y el código del
  cliente en `StarterPlayerScripts`, no en la `ScreenGui`.
- **Los cambios de la interfaz no se ven en el juego** → el código cambia `StarterGui` → cambia
  `player.PlayerGui`.
- **Medidas raras al empezar** → la cámara aún mide 1×1 → espera a `ViewportSize` real.
- **Un nombre de producto sale «####»** → filtro de Roblox → cambia la palabra (lección real).
- **Un niño no entiende un aviso** → palabras difíciles o dos ideas en una frase → reglas por edad y lista
  «antes → después».

## Etiquetas de resultado
**ejecutado** (auditoría `OK 0 avisos`, capturas del simulador vistas) · **verificado leyendo** ·
**preparado sin ejecutar** · **no verificado** (teléfono, mando y consola reales; traducciones). Nunca
digas «se ve bien en el móvil» sin haberlo mirado en el simulador.
