---
name: rc-sonido
description: >
  Música y efectos de sonido para un juego de Roblox sin problemas de derechos: de dónde sacar audio de más
  seguro a menos (Creator Store, sonidos propios, CC0, Openverse con licencia comercial; nunca canciones
  famosas), registro de procedencia de cada sonido, normas de subida de audio, grupos Música, Efectos,
  Ambiente, Interfaz y Voz con AudioPlayer, AudioFader y Wire, bajar la música en avisos, variación ±1
  semitono ±2 dB, música por zona con fundido. Úsala con audio (sound effects, SFX, music, soundtrack,
  ambience, audio license, CC0, Openverse, Freesound, earshot, trailer sound). No para que un golpe se
  sienta (rc-sensacion) ni para la página del juego o publicar (rc-publicar).
---

# rc-sonido · Que suene bien y que sea tuyo

El sonido dice al jugador «lo hiciste bien», «cuidado» o «aquí pasa algo», muchas veces antes que la vista.
Pero un solo audio sin derechos puede hacer que Roblox lo quite o modere la cuenta. Por eso aquí van
juntas dos cosas: **de dónde sale cada sonido** (y apuntarlo) y **cómo suena en el juego**.

Última comprobación: 2026-11-18 (documentación de Roblox, API de Openverse y los README de earshot y
Clipwing/skills; URLs en `referencias/fuentes.md`; idea de grupos y variación de awesome-gamedev-agent-skills,
ver `NOTICE` del plugin).

## Cuándo usarla
- La persona quiere música, efectos, ambiente o voces en su juego.
- Hay que elegir de dónde sacar un sonido o comprobar si se puede usar.
- Los sonidos cansan, se tapan entre sí, la música está muy alta o no cambia entre zonas.
- Hay que hacer un tráiler o un vídeo de anuncio con sonido (ver «Vídeos»).

## Paso 1 · De dónde sacar cada sonido (de más seguro a menos)
Pregunta primero qué sonidos son importantes y si quiere música por zona (bloque P del banco de
preguntas del director). Luego busca en este orden y **para en el primer escalón que sirva**:

1. **Biblioteca de audio de Roblox (Creator Store)**: en Studio, Caja de herramientas → Audio (Toolbox →
   Audio). Más de 100 000 efectos y temas de Roblox y de sus socios, gratis para usar en juegos de Roblox,
   **sin subir nada**. Lo más seguro, **pero solo si el creador del audio es Roblox o un socio
   verificado**: ahí también hay audios subidos por otros usuarios, y de esos no se sabe si tenían
   derechos (cuentan como escalón 4). Licencia en el registro: `Roblox`.
2. **Sonidos propios o hechos por código**: lo que la persona graba (palmas, su voz, un objeto) o crea
   con un programa de música, y paquetes **CC0** (dominio público: sin condiciones). Ejemplo: los 78
   sonidos de interfaz CC0 del repositorio Clipwing/skills. Herramienta opcional: earshot (abajo).
   Bajar un archivo o un repositorio se hace **solo con su permiso** (di nombre, origen y tamaño).
3. **Openverse** (buscador de audio con licencia abierta: Freesound, Jamendo, Wikimedia…). Solo vale:
   - **CC0**: sin condiciones. **PDM** (marca de dominio público): dominio público según quien lo marcó,
     y puede depender del país; compruébalo en el origen.
   - **CC BY**: vale, con **atribución** en la descripción del juego: título, autor, licencia **con su
     versión** (CC BY 3.0 y 4.0 no son iguales), enlace, y «modificado» si le cambias tono o volumen.
   - **NC** (no comercial) **no vale**: el juego puede ganar Robux. Tampoco **ND** ni **SA** ni
     `sampling+`: en las licencias CC, poner un sonido junto a imágenes en movimiento (un juego, un
     vídeo) cuenta como obra derivada; ND lo prohíbe y SA obligaría a dar el juego entero con esa licencia.
   - Mira siempre la licencia **en la página de origen** (el enlace de Openverse): el índice puede estar
     viejo. Si no coincide, no se usa.
4. **Nunca**: canciones famosas, sonidos de otros juegos, películas o series, «sin copyright» de vídeos
   de internet, ni nada cuyo dueño no se sepa. Al subir audio a Roblox, quien sube **declara que tiene
   los derechos**.

Para buscar varios sonidos de una vez, el agente `buscador-audio` sigue estos escalones y devuelve la
tabla para el registro (no baja ni sube nada).

**Comprobación del paso:** cada sonido elegido tiene escalón (1–4) y su fila en el registro (Paso 2).

### Openverse sin instalar nada
La búsqueda se puede leer directamente (sin cuenta, con límites más bajos):
`https://api.openverse.org/v1/audio/?q=lluvia&license=cc0,pdm,by&category=sound_effect&page_size=20`
- `license` acepta `cc0`, `pdm`, `by`, `by-sa`, `by-nd`, `by-nc`… separados por comas; `license_type`
  acepta `commercial`, `modification`, `all`, `all-cc`. Usa `license=cc0,pdm,by`: así ya quedan fuera
  NC, ND y SA.
- Otros filtros útiles: `category` (`sound_effect`, `music`…), `length` (`shortest`, `short`,
  `medium`, `long`), `source` (los nombres salen en `https://api.openverse.org/v1/audio/stats/`).
- Solo da los 10 000 primeros resultados; no pidas páginas después de `page_count`.
- **Cuenta (OAuth): casi nunca hace falta**; para unas pocas búsquedas basta sin cuenta. Si la persona
  la quiere, **se registra ella** (pide un nombre y **su correo**: `POST /v1/auth_tokens/register/`,
  luego `client_credentials` en `/v1/auth_tokens/token/`, token de ~10 h; sin verificar el correo, los
  límites son los de sin cuenta). Tú no la registras: la clave (`client_secret`) saldría en el chat. La
  clave **nunca** va en el juego ni en archivos del proyecto; si hace falta, en una variable de entorno
  fuera del proyecto.
- Las cifras de límites no salen en la documentación pública; si falla con 429 (demasiadas peticiones),
  espera y busca menos. `GET /v1/rate_limit/` dice cuánto llevas.
- Busca por la persona con palabras en inglés (`rain`, `coin`, `footsteps grass`): hay muchos más resultados.

### earshot (opcional, solo con permiso)
earshot (github.com/Leonxlnx/earshot, código MIT) crea sonidos por código (`forge`), trae un banco de
252 efectos que se generan **sin red**, y **escucha** un archivo para criticar volumen, ruido o si encaja
(`critique`, `measure`). Tiene servidor MCP.
- Necesita **uv + ffmpeg** y descarga **~1,1 GB de modelos**. Antes de proponerlo: di eso y pide permiso.
- **Revisa su código antes** (código de terceros): lee el repositorio; no se ejecuta nada hasta su «sí».
- Añadir su MCP cambia la configuración de Claude de la persona (`~/.claude`): permiso aparte.
- Su opción `llm` / `llm_critique` **sube el audio a Gemini** con una clave propia: **nunca** sin
  permiso expreso. Su modo sin red (`EARSHOT_OFFLINE=1`) frena descargas de modelos; el README no dice
  que frene Gemini.
- Licencia de lo que genera: el README dice MIT **para el código**. Antes de subir un sonido generado,
  comprueba en el repositorio qué licencia tiene lo generado y apúntala; si no lo dice, pregúntalo.

**Si no hay permiso, no pasa nada**: los escalones 1 y 3 bastan para casi todos los juegos.

## Paso 2 · El registro de procedencia
Un ModuleScript `ReplicatedStorage/Sonido/Registro` con **una fila por sonido**. El juego reproduce
sonidos por su clave, así no hay ningún ID suelto por los scripts.
```luau
-- ReplicatedStorage/Sonido/Registro (ModuleScript). Una fila por sonido; nada se usa sin fila.
return {
	boton = { asset = "rbxassetid://ID_AQUI", grupo = "Interfaz", volumen = 0.5, variar = true,
		fuente = "Creator Store", autor = "Roblox", licencia = "Roblox", enlace = "https://create.roblox.com/store/audio" },
	moneda = { asset = "rbxassetid://ID_AQUI", grupo = "Efectos", volumen = 0.6, variar = true,
		fuente = "Openverse → Freesound", autor = "nombre del autor", licencia = "CC BY 4.0",
		enlace = "https://freesound.org/…", atribucion = "«Coin» de <autor> (CC BY 4.0, modificado), freesound.org/…" },
	musicaBosque = { asset = "rbxassetid://ID_AQUI", grupo = "Musica", volumen = 0.4,
		fuente = "propio", autor = "la persona", licencia = "propio", enlace = "—" },
}
```
- Licencias permitidas en `licencia`: `Roblox`, `propio`, `CC0`, `PDM`, `CC BY 3.0` / `CC BY 4.0`… (con
  `atribucion`, que lleva la versión y «modificado» si `variar = true`).
- Las atribuciones `CC BY` se copian a la **descripción del juego** (la comprobación las imprime).
- Al subir un archivo propio, la persona pega su ID en `asset` (el ID de un recurso no es un dato personal).

**Comprobación del paso:** la comprobación ejecutable (abajo) dice `OK registro`.

## Paso 3 · Subir audio (lo hace la persona)
Normas de Roblox **comprobadas el 2026-11-18** (cambian: mira la página si pasa tiempo):
- Formato `.mp3`, `.ogg`, `.wav` o `.flac`; una sola pista; **menos de 20 MB y de 7 minutos**;
  hasta 48 kHz; mono, estéreo, 3.0 o 5.1.
- Cupo: **2 000 audios gratis cada 30 días con la cuenta verificada con documento**, **100** sin
  verificar.
- Se sube desde el Gestor de recursos de Studio (Asset Manager), el Creator Dashboard o Open Cloud. Pasa
  **moderación**; hasta entonces no suena.
- Es **privado**: solo lo usa quien lo sube; se puede dar permiso a otros juegos o amigos. Si el juego es
  de un grupo, el audio debe tener permiso para ese juego (si no, no suena publicado).
- Para que una canción salga en la página del juego, Roblox pide además cuenta verificada con documento y
  aceptar sus condiciones de audio.
- Tú preparas el archivo y la fila del registro; **la persona sube**. Subir por Open Cloud solo con su
  permiso para esa subida (ver `rc-publicar`).

**Comprobación del paso:** cada ID subido está pegado en su fila del registro y suena en Play (si no
suena, mira moderación y permisos en Gotchas).

## Paso 4 · Cómo suena en el juego
Roblox recomienda ahora los **objetos de audio** (`AudioPlayer` → `Wire` → … → `AudioDeviceOutput`) en
vez de `Sound`, `SoundGroup` y `SoundEffect` («desaconsejados», no quitados: un juego viejo con `Sound`
sigue sonando). Para juegos nuevos, usa los objetos de audio.

### Grupos: Música, Efectos, Ambiente, Interfaz, Voz
Cada grupo es un `AudioFader` (un control de volumen). Cada sonido pasa por el de su grupo, y la música
pasa además por un segundo fader que se baja cuando hay un aviso o una voz («agacharse»). Así la persona
y el jugador pueden subir o bajar cada grupo sin tocar cada sonido.
```luau
-- ReplicatedStorage/Sonido (ModuleScript). Se usa desde LocalScripts: el sonido se oye en cada cliente.
local SoundService = game:GetService("SoundService")
local TweenService = game:GetService("TweenService")
local Registro = require(script.Registro)

local Sonido = {}
Sonido.GRUPOS = { "Musica", "Efectos", "Ambiente", "Interfaz", "Voz" }
local faders: { [string]: AudioFader } = {}
local agacho: AudioFader? = nil
local musica: AudioPlayer? = nil
local agachados = 0
local zonaActual: string?, momentoActual: string?, sonando: string? = nil, nil, nil

-- Puro (se prueba solo): ±1 semitono y ±2 dB al azar.
function Sonido.variacion(rnd: () -> number): (number, number)
	local semis, db = (rnd() * 2 - 1) * 1, (rnd() * 2 - 1) * 2
	return 2 ^ (semis / 12), 10 ^ (db / 20) -- velocidad (y tono), factor de volumen
end

local function wire(from: Instance, to: Instance)
	local w = Instance.new("Wire")
	w.SourceInstance, w.TargetInstance = from, to
	w.Parent = to
end

local function arrancar(p: AudioPlayer) -- espera a que cargue, con tope
	task.spawn(function()
		local tope = os.clock() + 3
		while not p.IsReady and os.clock() < tope do task.wait() end
		if p.Parent then p:Play() end
	end)
end

function Sonido.iniciar()
	if next(faders) then return end
	local salida = Instance.new("AudioDeviceOutput")
	salida.Parent = SoundService
	agacho = Instance.new("AudioFader")
	agacho.Name = "MusicaAgacho"
	agacho.Parent = SoundService
	wire(agacho, salida)
	for _, nombre in Sonido.GRUPOS do
		local f = Instance.new("AudioFader")
		f.Name = nombre
		f.Parent = SoundService
		wire(f, if nombre == "Musica" then agacho else salida)
		faders[nombre] = f
	end
end

function Sonido.volumenGrupo(nombre: string, v: number) -- 0..1, desde el menú de ajustes
	Sonido.iniciar()
	faders[nombre].Volume = math.clamp(v, 0, 1)
end

function Sonido.play(clave: string) -- efecto sin posición (interfaz, recoger, avisos)
	local info = Registro[clave]
	if not info then warn("Sonido sin registro: " .. clave) return end
	Sonido.iniciar()
	local p = Instance.new("AudioPlayer")
	p.Asset = info.asset
	local velocidad, factor = 1, 1
	if info.variar then velocidad, factor = Sonido.variacion(math.random) end
	p.PlaybackSpeed = velocidad
	p.Volume = (info.volumen or 0.5) * factor
	p.Parent = faders[info.grupo]
	wire(p, faders[info.grupo])
	p.Ended:Once(function() p:Destroy() end)
	task.delay(5, function() if p.Parent and not p.IsReady then p:Destroy() end end) -- por si nunca carga
	arrancar(p)
end

function Sonido.musica(clave: string?, segundos: number?) -- fundido; la llaman zona() y momento()
	Sonido.iniciar()
	local t = segundos or 2
	local vieja = musica
	if vieja then
		TweenService:Create(vieja, TweenInfo.new(t), { Volume = 0 }):Play()
		task.delay(t, function() vieja:Destroy() end)
	end
	musica = nil
	local info = clave and Registro[clave]
	if not info then return end
	local p = Instance.new("AudioPlayer")
	p.Asset, p.Looping, p.Volume = info.asset, true, 0
	p.Parent = faders.Musica
	wire(p, faders.Musica)
	arrancar(p)
	TweenService:Create(p, TweenInfo.new(t), { Volume = info.volumen or 0.4 }):Play()
	musica = p
end

-- Una sola fuente de verdad: el momento (jefe, victoria) gana a la zona; al quitarlo vuelve la de la zona.
local function decidir(t: number)
	local quiere = momentoActual or zonaActual
	if quiere ~= sonando then sonando = quiere; Sonido.musica(quiere, t) end
end
function Sonido.zona(clave: string?) zonaActual = clave; decidir(2) end
function Sonido.momento(clave: string?) momentoActual = clave; decidir(1) end

function Sonido.bajarMusica(bajar: boolean) -- true al empezar un aviso o voz, false al acabar
	Sonido.iniciar()
	agachados = math.max(0, agachados + (if bajar then 1 else -1))
	TweenService:Create(agacho :: AudioFader, TweenInfo.new(0.3), { Volume = if agachados > 0 then 0.35 else 1 }):Play()
end

return Sonido
```
- **Variación**: los sonidos que se repiten mucho (pasos, monedas, golpes) llevan `variar = true`. La
  música y las voces, no (cambiaría el tono de la canción).
- **Agacharse**: llama `bajarMusica(true)` al empezar un aviso y `bajarMusica(false)` al acabar; con dos
  avisos a la vez, la música no vuelve hasta que acaban los dos.
- **Ajustes del jugador**: deslizadores Música y Efectos en el menú (`rc-interfaz`); si se guardan,
  con `rc-datos`.

### Sonidos con posición (3D)
Para que una cascada o un enemigo suene **desde su sitio**: `AudioPlayer` → `Wire` → `AudioEmitter`
dentro de la pieza. Hace falta un oyente: en Studio, `SoundService` → `ListenerLocation` = `Camera` (o
`Character`); Roblox crea el oyente y su salida al jugar. El fader de grupo no sirve aquí (mezclaría todos
en un punto): multiplica el volumen por el del grupo al crear el sonido
(`p.Volume = (info.volumen or 0.5) * faders.Efectos.Volume`). Ese volumen se fija al crear el sonido:
si un 3D suena en bucle (una cascada), al mover el deslizador actualiza también los que ya suenan.

### Música por zona o momento, con fundido
Un Model `workspace.Zonas` con piezas invisibles (Anchored, CanCollide y CanQuery apagados,
Transparency 1) con el atributo `Musica` = clave del registro; el atributo `Musica` del Model es la
música por defecto. Con StreamingEnabled, ese Model con `ModelStreamingMode = Persistent` (`rc-mundo`).
```luau
-- StarterPlayerScripts/MusicaPorZona (LocalScript)
local Players = game:GetService("Players")
local Sonido = require(game.ReplicatedStorage:WaitForChild("Sonido"))
Sonido.iniciar()

local function dentro(parte: BasePart, pos: Vector3): boolean
	local p, h = parte.CFrame:PointToObjectSpace(pos), parte.Size / 2
	return math.abs(p.X) <= h.X and math.abs(p.Y) <= h.Y and math.abs(p.Z) <= h.Z
end

while true do
	task.wait(0.5) -- 2 veces por segundo basta
	local zonas = workspace:FindFirstChild("Zonas") -- se busca cada vez: puede llegar tarde
	local char = Players.LocalPlayer.Character
	local root = char and char:FindFirstChild("HumanoidRootPart")
	local nueva = zonas and zonas:GetAttribute("Musica")
	if root and zonas then
		for _, z in zonas:GetDescendants() do
			if z:IsA("BasePart") and z:GetAttribute("Musica") and dentro(z, root.Position) then
				nueva = z:GetAttribute("Musica")
				break
			end
		end
	end
	Sonido.zona(nueva) -- no hace nada si no cambia
end
```
Por **momento** (jefe, victoria, últimos 30 s): el script del momento llama `Sonido.momento("jefe")` y
al acabar `Sonido.momento(nil)`: vuelve sola la música de la zona. Nadie llama `Sonido.musica` a mano:
así no se pelean dos scripts por la música.

### Sonidos importantes y volumen razonable
| Sonido | Para qué | Consejo |
|---|---|---|
| Botones | «te he oído» | corto (< 0,2 s), suave, el mismo en todo el juego |
| Recoger | premio | sube un poco de tono si recoges varios seguidos |
| Pasos | estar en el mundo | distinto por suelo si se puede; con variación |
| Peligro | aviso **antes** del daño | distinto de todo lo demás y **también visible** |
| Victoria, error | resultado | la victoria más larga; el error corto, no molesto |

- Volúmenes de partida: música 0,3–0,5, ambiente 0,3–0,5, interfaz 0,4–0,6, efectos 0,5–0,8. Nada en el
  registro por encima de 1. Ningún susto de volumen salvo que sea un juego de miedo y la persona lo quiera.
- El juego se debe **entender sin sonido** (muchos juegan en el móvil con el sonido quitado): todo lo
  importante tiene también una señal visual (`rc-sensacion`).
- Ambiente en bucle sin cortes: elige archivos hechos para repetirse (`Looping = true`).

**Comprobación del paso:** en Play, botón, recoger y peligro suenan; la música cambia al cruzar una zona
con fundido; un aviso baja la música y vuelve; poner Música a 0 en ajustes la calla.

## Vídeos: tráiler y anuncios
**Real SFX** (Clipwing/skills, scripts MIT) pone sonido a **vídeos** colocando sonidos reales de tu
propia biblioteca en los fotogramas justos. No es para el juego: sirve para el **tráiler** o vídeos de
anuncio. Necesita Python 3.9+ y FFmpeg (Node.js solo para su paquete de 78 sonidos de interfaz CC0).
Mismas reglas: **instalar o bajar solo con permiso** y revisar antes.
- La música de un vídeo también necesita derechos **para vídeos**: que la biblioteca de Roblox valga en
  el juego no quiere decir que valga en un vídeo subido a otra web (**no verificado**: no se leyeron las
  condiciones de audio de Roblox). Usa CC0, propia, o comprueba la licencia.
- Roblox permite pocos vídeos en la página del juego (ver `rc-publicar`).

## Comprobación ejecutable (Edit, por el MCP `execute_luau` o en la barra de comandos)
```luau
local Sonido = require(game.ReplicatedStorage.Sonido:Clone()) -- Clone: en Edit, require cachea
local reg = game.ReplicatedStorage.Sonido.Registro
local Registro = require(reg:Clone())
local out, attrib, assets = {}, {}, {}
local OK_LIC = { Roblox = true, propio = true, CC0 = true, PDM = true, ["CC BY"] = true }
local GRUPO = {}
for _, g in Sonido.GRUPOS do GRUPO[g] = true end
local function num(id) -- el mismo ID escrito de cualquier forma
	return if type(id) == "string" then id:match("%d+") else nil
end

for clave, s in Registro do
	if type(s) ~= "table" then table.insert(out, tostring(clave) .. ": la fila no es una tabla"); continue end
	for _, campo in { "asset", "grupo", "fuente", "autor", "licencia", "enlace" } do
		if type(s[campo]) ~= "string" or s[campo] == "" then table.insert(out, clave .. ": falta " .. campo) end
	end
	if type(s.asset) == "string" then
		if s.asset:find("ID_AQUI") then table.insert(out, clave .. ": falta el ID subido")
		elseif num(s.asset) then assets[num(s.asset)] = true end
	end
	if not GRUPO[s.grupo] then table.insert(out, clave .. ": grupo desconocido " .. tostring(s.grupo)) end
	local lic = if type(s.licencia) == "string" then (s.licencia:gsub("%s+%d[%d%.]*$", "")) else "" -- «CC BY 4.0» → «CC BY»
	if not OK_LIC[lic] then table.insert(out, clave .. ": licencia NO permitida " .. tostring(s.licencia)) end
	if lic == "CC BY" then
		if s.licencia == "CC BY" then table.insert(out, clave .. ": CC BY sin versión (3.0, 4.0…)") end
		if type(s.atribucion) ~= "string" or s.atribucion == "" then table.insert(out, clave .. ": CC BY sin atribucion")
		else table.insert(attrib, s.atribucion) end
	end
	if s.volumen ~= nil and (type(s.volumen) ~= "number" or s.volumen < 0 or s.volumen > 1) then
		table.insert(out, clave .. ": volumen debe ser un número de 0 a 1")
	end
end

-- Audio puesto a mano (objetos, o IDs escritos en scripts) que no está en el registro
for _, root in { workspace, game.ReplicatedStorage, game.ReplicatedFirst, game.StarterGui, game.StarterPack, game.StarterPlayer, game.SoundService, game.ServerStorage, game.ServerScriptService, game.Lighting } do
	for _, o in root:GetDescendants() do
		local id = (o:IsA("Sound") and o.SoundId) or (o:IsA("AudioPlayer") and o.Asset) or nil
		if num(id) and not assets[num(id)] then table.insert(out, "SIN REGISTRO: " .. o:GetFullName() .. " " .. id) end
		if o:IsA("LuaSourceContainer") and o ~= reg then
			local ok, src = pcall(function() return o.Source end)
			if ok and src:find("rbxassetid://%d") then table.insert(out, "REVISAR ID escrito en el código: " .. o:GetFullName()) end
		end
	end
end

-- Variación dentro de ±1 semitono y ±2 dB
for _, r in { 0, 0.5, 1 } do
	local v, f = Sonido.variacion(function() return r end)
	if v < 2 ^ (-1 / 12) - 1e-9 or v > 2 ^ (1 / 12) + 1e-9 or f < 10 ^ (-0.1) - 1e-9 or f > 10 ^ 0.1 + 1e-9 then
		table.insert(out, "variacion fuera de rango con " .. r)
	end
end

local res = if #out == 0 then "OK registro" else table.concat(out, "\n")
if #attrib > 0 then res ..= "\n\nPara la descripción del juego:\n" .. table.concat(attrib, "\n") end
return res
```
`REVISAR ID escrito en el código` también sale con IDs de imágenes: míralo a mano y, si es audio, pásalo
al registro.
Mientras falten IDs saldrá «falta el ID subido»: es lo esperado hasta que la persona suba o elija cada
sonido. Después, prueba en Play lo de «Comprobación del paso» del Paso 4.

## Gotchas (síntoma → causa → arreglo)
- **Un sonido no suena en el juego publicado y en Studio sí** → el audio es privado y no tiene permiso
  para ese juego (o el juego es de un grupo) → da permiso al juego en la configuración del recurso.
- **No suena nada, ni en Studio** → falta el `Wire` hasta `AudioDeviceOutput`, o el audio aún está en
  moderación → mira la cadena player → fader → salida; espera a la moderación.
- **Un sonido 3D no se oye** → no hay oyente → `SoundService.ListenerLocation` = `Camera` o `Character`.
- **Roblox quitó un audio o avisó a la cuenta** → música famosa o sin derechos → solo escalones 1–3 y
  registro con enlace; quita el audio y cámbialo.
- **Un audio de la Creator Store resultó ser una canción famosa** → lo subió otro usuario, no Roblox ni
  un socio → solo audios cuyo creador es Roblox o un socio verificado; los demás, escalón 4.
- **Un sonido de Openverse resultó ser NC** → el índice estaba viejo o se miró mal → la licencia se mira
  en la página de origen; filtra con `license=cc0,pdm,by`.
- **Las monedas cansan a los 5 minutos** → el mismo sonido idéntico cada vez → `variar = true`.
- **No se entiende el aviso del jefe** → la música lo tapa → `bajarMusica(true)` durante el aviso.
- **La música salta de golpe al cambiar de zona** → se cambió sin fundido o dos scripts la cambian →
  `Sonido.zona` y `Sonido.momento`; nadie llama `Sonido.musica` a mano.
- **La música no cambia en una zona lejana** → con StreamingEnabled la pieza de la zona no ha llegado →
  carpeta de zonas en un Model `Persistent`.
- **Studio se cuelga al esperar un sonido** → bucle que espera `IsReady` sin tope → con tope (`os.clock`),
  como en `arrancar` (lección real: todo bucle que espera lleva plazo).
- **Una herramienta de sonido subió audio a la nube** → se usó una opción en línea (earshot `llm`) →
  nunca sin permiso expreso; se queda en lo local.
- **La clave de Openverse apareció en el chat o en un archivo** → Claude hizo el registro o se guardó en
  el proyecto → se registra la persona y la guarda fuera del proyecto; si se filtró, la da de baja y crea
  otra.

## Etiquetas de resultado
**ejecutado** (comprobación `OK registro`, prueba en Play) · **verificado leyendo** (licencias en la
página de origen, registro completo) · **preparado sin ejecutar** (módulo `Sonido` y música por zona sin
Play) · **no verificado** (si un audio pasa moderación, si suena en teléfono o consola reales, licencias
que la página de origen no deja claras: dilo así).
