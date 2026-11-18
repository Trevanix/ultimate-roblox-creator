# Pruebas automáticas

Sin pruebas, cada fase rompe algo de la anterior sin que nadie lo vea. Con pruebas, la persona puede
pedir cambios sin miedo.

## Módulos puros con dependencias inyectables
La lógica (reglas, cálculos, validaciones) va en ModuleScripts que **no tocan el mundo directamente**:
reciben lo que necesitan.
```luau
-- ReplicatedStorage/Shared/RewardRules.luau
local Rules = {}
function Rules.CoinsFor(distance, multiplier)
	if type(distance) ~= "number" or distance ~= distance or distance < 0 then return 0 end
	return math.floor(distance / 10) * (multiplier or 1)
end
return Rules

-- Un servicio recibe sus dependencias (en pruebas se pasan dobles)
function Service.new(deps)
	local self = setmetatable({}, Service)
	self.rules = deps.rules or require(Shared.RewardRules)
	self.data = deps.data or require(script.Parent.DataService)
	self.now = deps.now or os.clock
	return self
end
```

## Batería de pruebas en Edit
Una carpeta `ServerStorage/Tests` con módulos de prueba y un `Run` que los ejecuta y devuelve una lista
`{ id, name, expected, observed, pass }`. Cada prueba tiene un id corto (p. ej. `RW03`).
```luau
local function check(results, id, name, expected, observed)
	table.insert(results, { id = id, name = name, expected = expected, observed = observed,
		pass = expected == observed })
end
```

### Caché de módulos en Edit (importante)
En Edit, `require` de un módulo ya cargado devuelve **la versión vieja** aunque hayas cambiado el código.
Para probar lo nuevo, requiere una copia: `require(module:Clone())`, y pasa esas copias a los servicios
por `deps`. Ojo: los `require` por ruta dentro de esos módulos (p. ej. `require(ReplicatedStorage.Shared.X)`)
siguen dando la versión vieja; por eso todo lo que cambia entra por `deps`. El arranque de la batería:
```luau
local copy = game.ServerStorage.Tests:Clone()
local results = require(copy.Run).Execute()
copy:Destroy()
```

### Baterías largas
Si la batería tarda más de lo que aguanta una llamada (`execute_luau` corta), lánzala en segundo plano y
recoge el resultado en otra llamada (en Edit, `_G` se mantuvo entre llamadas en la práctica; si en tu
versión no, guarda el resumen en un atributo de `ServerStorage`):
```luau
_G.__bat = nil
task.spawn(function() _G.__bat = require(game.ServerStorage.Tests:Clone().Run).Execute() end)
-- más tarde, en otra llamada:
return _G.__bat and #_G.__bat or "aún corriendo"
```

### Nunca un bucle sin tope
`repeat ... until cond` o `while not cond do task.wait() end` sin límite **puede colgar Studio** si la
condición nunca llega (pasó de verdad). Siempre con tope:
```luau
local deadline = os.clock() + 5
while not ready() and os.clock() < deadline do task.wait(0.1) end
if not ready() then return false, "timeout" end
```

## Qué probar
- Cada regla nueva: casos normales, bordes (0, máximo, vacío) y basura (NaN, tipo equivocado, negativo).
- Cada remoto: rechaza tipos malos, fuera de rango, demasiado rápido, demasiado lejos.
- Guardado: migraciones de cada versión, perfil roto, versión futura.
- Compras: recibo repetido, perfil sin cargar, lo que se enseña = lo que llega.
- Interfaz: que existan las piezas y que se apliquen escala y mando (se puede leer el árbol de la GUI).
- Una prueba que lea el código fuente (`script.Source`) para comprobar que algo **no** está (p. ej. que se
  quitó un regalo temporal) es válida y barata. `Source` solo se lee en Edit (barra de comandos, MCP o
  plugin), no en Play.

## Pruebas en Play
- Con el MCP: `start_stop_play`, mirar la consola (`get_console_output`), capturas (`screen_capture`).
- Lo que no se puede probar en Studio, dilo: teléfono real, mando real, varios servidores, compras reales,
  viajes entre lugares (TeleportService solo funciona publicado).
- Para probar con varios jugadores: en Studio, Prueba → Clientes y servidores (2 o más jugadores).
- Prueba con datos reales: solo con respaldo y permiso, y apunta qué cambió para siempre en ese almacén.
