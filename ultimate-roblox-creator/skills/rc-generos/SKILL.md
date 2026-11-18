---
name: rc-generos
description: >
  Paquetes de preguntas, números de partida y pruebas por género para un juego de Roblox, sin plantillas
  cerradas y buscando siempre «algo distinto»: obby y plataformas, simulador, tycoon, RPG, terror,
  carreras, supervivencia, tower defense, roguelike, puzle, cartas, shooter e historia o novela visual.
  La persona elige; nunca se impone un género. Úsala después de oír su idea o si pide ideas (game genre,
  obby, simulator, tycoon, RPG, horror, racing, survival, tower defense, roguelike, puzzle, card game,
  shooter, visual novel). No para recoger la idea inicial (director ultimate-roblox-creator) ni para probar una
  mecánica (rc-prototipo).
---

# rc-generos · Preguntas y números, no plantillas

Un género es una caja de herramientas, no un molde. Aquí hay, para cada uno, las preguntas que aclaran
la idea de la persona, unos números para empezar (que ella aprueba o cambia) y las pruebas que suelen
fallar. **Nada de aquí es obligatorio**: su juego puede mezclar géneros o no parecerse a ninguno.

Última comprobación: 2026-11-18 (números de partida de awesome-gamedev-agent-skills, ver `NOTICE` del
plugin; reglas de Roblox en las skills que se citan).

## Cuándo usarla
- **Después** de oír la idea de la persona con sus palabras (Etapa 1 del director), para afinarla.
- Si la persona pide ideas o dice «no sé qué hacer». Entonces ofrece 2 o 3 ideas cortas y di claro que
  puede no elegir ninguna.
- Al diseñar los números de un género concreto (vida de oleadas, golpes para vencer, ritmo de decisiones).

**Nunca** al empezar, antes de que la persona cuente su idea: ofrecer géneros primero hace que todos los
juegos acaben pareciendo el mismo.

## Pasos (en orden)
1. Escucha la idea. Si encaja con uno o varios géneros, **díselo como pregunta**: «Me suena a tycoon con
   algo de terror, ¿es así?». Si dice que no, se queda su descripción.
2. De cada paquete que toque, haz **2 o 3 preguntas cada vez** (las primeras de la lista primero).
3. Busca con ella **«algo distinto»**: la razón por la que alguien jugaría a esto y no a otro igual.
   Ofrécelo como 2 o 3 ideas para hablar; si no le gusta ninguna, vale. Apúntalo en la ficha.
4. Propón los **números de partida** como decisiones numeradas, con tu recomendación. Ella decide.
5. Pasa los números a la configuración del juego (un solo módulo) y las **pruebas** del paquete a la
   batería del proyecto.
6. **Comprobación:** la ficha tiene el género (o «ninguno» o «mezcla de…») **elegido por la persona**,
   el «algo distinto» escrito, los números aprobados en la configuración y la prueba del paquete en la
   batería saliendo `OK` (**ejecutado**).

Para todos los géneros, primero: ¿qué hace el jugador cada 30 segundos? ¿Qué le hace volver mañana?
¿Juega solo o con otros? ¿Qué se guarda? Y siempre: **el bucle principal jugable y feo primero**, luego
el contenido.

## Paquetes por género

### Obby y plataformas
- **Preguntas:** ¿etapas sueltas o un camino? ¿Se guarda la etapa? ¿Hay tiempo o récord? ¿Saltar etapas
  pagando? (¿qué queda de reto entonces?) ¿Para el teléfono también?
- **Números:** huecos ≈ 70 % del salto medido, 95 % los opcionales (`rc-mundo`). Si quiere saltos muy
  precisos: margen al salir del borde 0,1 s, salto «guardado» si se pulsa justo antes de tocar el suelo
  0,1–0,15 s, caída ~1,8× más rápida que la subida. Esto último pide un control de personaje propio:
  solo si la persona lo quiere; con el `Humanoid` normal basta para casi todos los obbies.
- **Pruebas:** el servidor acepta el punto de control solo si es el siguiente (o uno ya tocado); ninguna
  etapa con atasco sin salida (`rc-mundo`).
- **Algo distinto:** un obby que cambia cada día, una historia que avanza por etapas, obstáculos que ponen
  otros jugadores, cooperativo para dos.

### Simulador e incremental
- **Preguntas:** ¿qué se hace para crecer (pulsar, recoger, entrenar)? ¿Qué se desbloquea? ¿Renacer? ¿Qué
  se gana sin conexión?
- **Números:** precio base × g^n con g 1,07–1,15; renacer 1 + k·p; sin conexión 8–12 h al 25–50 %
  (`rc-economia`, con su calculadora).
- **Pruebas:** calculadora `OK`; el servidor nunca acepta «+N» del cliente y limita por segundo.
- **Algo distinto:** decisiones (no solo pulsar), riesgo y regreso, zonas que piden algo más que números.

### Tycoon
- **Preguntas:** ¿parcela por jugador? ¿Qué produce dinero? ¿Qué se compra y en qué orden? ¿Se guarda la
  base? ¿Se visitan las bases de otros?
- **Números:** la siguiente compra se paga en 10 s al principio y en 1–5 min a la media hora (calculadora
  de `rc-economia`).
- **Pruebas:** cada botón valida precio, orden y dueño de la parcela; lo comprado se guarda y se
  reconstruye igual al volver (`rc-datos`).
- **Algo distinto:** un tema raro (un acuario, una estación espacial), elecciones que cambian la base,
  visitas entre jugadores.

### RPG y aventura
- **Preguntas:** ¿combate? ¿Misiones? ¿Inventario y equipo? ¿Historia? ¿Cuánto contenido podéis hacer de
  verdad?
- **Números:** daño = d·K / (K + defensa); crítico 5 % ×1,5–2; un enemigo normal cae en **2–4 golpes**, el
  jugador aguanta **5–8**, un jefe **25–60**.
- **Pruebas:** tabla de golpes para vencer (abajo); al quitar una bonificación se quita **por su origen**
  (la espada, la poción), no restando su valor (si no, se descuadra).
- **Algo distinto:** un sistema central propio (cocinar, cartas, el tiempo que pasa).

### Terror
- **Preguntas:** ¿qué edad tiene el público? (cambia el cuestionario de madurez) ¿Solos o en grupo?
  ¿Persecución, puzle o exploración? ¿Partidas cortas con final?
- **Números:** partidas de 10–20 min con final claro, como orientación; un susto fuerte necesita calma
  antes (`rc-mundo`, ritmo).
- **Pruebas:** el monstruo lo mueve el servidor y tiene reglas que se pueden aprender (`rc-npc`); textos y
  sustos según la edad; nada de destellos de más de 3 por segundo (`rc-sensacion`).
- **Algo distinto:** miedo por sonido y luz más que por sustos, un monstruo con reglas que se aprenden.

### Carreras
- **Preguntas:** ¿coches, a pie, animales? ¿Pista fija o creada por jugadores? ¿Por rondas? ¿Atajos?
- **Números:** vuelta de 30–90 s como orientación; los atajos ahorran poco y arriesgan mucho.
- **Pruebas:** tiempos y orden de llegada los da el servidor; puntos de control en orden (como el obby);
  antitrampas de velocidad con margen (`rc-servidor`).
- **Algo distinto:** pistas que cambian, carreras por equipos, obstáculos que ponen los que van detrás.

### Supervivencia y fabricar
- **Preguntas:** ¿hambre o energía? ¿Construir? ¿Día y noche? ¿Morir hace perder cosas?
- **Números:** fabricar es **todo o nada** (se comprueban todos los materiales antes de gastar ninguno:
  `trySpend` de `rc-economia`).
- **Pruebas:** cada receta se puede conseguir desde el principio (cada material sale de algún sitio
  alcanzable); construir valida distancia y coste; muchas piezas construidas: mide (`rc-mundo`).
- **Algo distinto:** un peligro que obliga a volver a un refugio, cooperación obligada.

### Tower defense
- **Preguntas:** ¿un camino o varios? ¿Torres que se mejoran? ¿Solo o en equipo? ¿Cuántas oleadas?
- **Números:** vida de la oleada ×**1,12–1,18** cada vez; vender devuelve **50–80 %**; las torres apuntan
  **«al primero»** por defecto.
- **Pruebas:** tabla de oleadas (abajo); el servidor coloca las torres (sitio libre, dinero, dueño).
- **Algo distinto:** el camino cambia, torres que se combinan, enemigos que hay que estudiar.

### Roguelike
- **Preguntas:** ¿qué se pierde al morir y qué se queda? ¿Cuánto dura una partida? ¿Mapas creados al
  azar?
- **Números:** primera muerte a los **5–15 min**.
- **Pruebas:** la **partida** (lo que se pierde) va separada del **perfil** (lo que se queda) en el
  esquema (`rc-datos`); el azar con `Random.new(semilla)` y 200 semillas sin errores.
- **Algo distinto:** una regla que cambia cada partida, morir enseña algo que sirve en la siguiente.

### Puzle
- **Preguntas:** ¿niveles hechos a mano o creados? ¿Pistas? ¿Tiempo o sin prisa? ¿Solo o en pareja?
- **Números:** los primeros niveles se resuelven en menos de un minuto; cada nivel enseña una sola idea
  nueva.
- **Pruebas:** **deshacer desde el primer día**; cada nivel tiene solución (en puzles pequeños, una
  búsqueda que lo resuelva sola; en grandes, la solución apuntada y jugada).
- **Algo distinto:** puzles que se resuelven entre dos, física, luz o sonido como pieza.

### Cartas
- **Preguntas:** ¿mazo propio o compartido? ¿Contra otros o contra el juego? ¿Se consiguen cartas?
  (¿al azar? → probabilidades a la vista, `rc-economia`)
- **Números:** barajar con un `Random` propio por partida; tope de efectos en cadena (p. ej. **100**) para
  que dos cartas no se llamen para siempre.
- **Pruebas:** el servidor guarda el mazo y reparte (el cliente nunca sabe las cartas de otros); una
  cadena de efectos se corta en el tope sin colgar el servidor.
- **Algo distinto:** cartas que cambian el tablero, mazos que se construyen durante la partida.

### Shooter
- **Preguntas:** ¿rápido o táctico? ¿Por equipos? ¿Primera o tercera persona? ¿Edad del público?
- **Números:** tiempo para eliminar (TTK) = (disparos necesarios − 1) × segundos entre disparos; se elige
  con la persona según el ritmo (rápido: menos de medio segundo; táctico: más de un segundo, como
  ejemplo).
- **Pruebas:** el impacto lo valida el servidor (distancia, línea de visión aproximada, cadencia máxima);
  matriz de abusos con 2 clientes (`rc-servidor`).
- **Algo distinto:** una regla de movimiento propia, armas que se construyen, modos sin violencia
  (pintura, agua).

### Historia y novela visual
- **Preguntas:** ¿cuánto dura? ¿Cuántos finales? ¿Decisiones que cambian algo de verdad?
- **Números:** una decisión cada **5–15 min**.
- **Pruebas:** el diálogo como datos con IDs y su comprobación: todas las ramas llegan a un final, ningún
  nodo suelto (`rc-npc`).
- **Algo distinto:** decisiones con consecuencias que se ven en el mundo, varios jugadores votan.

### Otros y mezclas
Rol social, deportes, ritmo, minijuegos por rondas, combates por equipos… Para cualquiera: las
preguntas generales de arriba, el bucle principal feo primero y las skills de cada sistema. En una mezcla,
coge 1 paquete como mucho cada vez (el de la fase de ahora).

## Pruebas de ejemplo (Edit, por el MCP `execute_luau` o en la barra de comandos)
Calculadoras que no tocan el juego. Cambia los números por los aprobados.

**RPG · golpes para vencer:**
```luau
local K, fails = 100, {}
local function dmg(attack, def) return attack * K / (K + def) end
local cases = { -- { nombre, ataque, vida, defensa, mín, máx golpes }
	{ "jugador → enemigo normal", 20, 50, 20, 2, 4 },
	{ "enemigo → jugador", 12, 60, 10, 5, 8 },
	{ "jugador → jefe", 20, 790, 40, 25, 60 },
}
for _, c in cases do
	local hits = math.ceil(c[3] / dmg(c[2], c[4]) - 1e-9) -- sin el margen, 3,0000001 daría 4
	print(("%s: %d golpes (objetivo %d–%d)"):format(c[1], hits, c[5], c[6]))
	if hits < c[5] or hits > c[6] then table.insert(fails, c[1]) end
end
return #fails == 0 and "OK golpes" or ("FUERA: " .. table.concat(fails, ", "))
```
Con los números de ejemplo: 3, 6 y 56 golpes (`OK golpes`).

**Tower defense · oleadas:**
```luau
local hp, growth, fails = 100, 1.15, {}
if growth < 1.12 or growth > 1.18 then table.insert(fails, "crecimiento fuera de 1,12–1,18") end
for wave = 1, 30 do
	if wave % 5 == 0 then print(("oleada %d: vida %.0f"):format(wave, hp)) end
	hp *= growth
end
return #fails == 0 and "OK oleadas" or table.concat(fails, ", ")
```
Enseña a la persona la tabla y compárala con el daño por segundo de las torres que se pueden tener en esa
oleada.

**Obby y carreras · puntos de control en orden** (función pura para el servidor y su prueba):
```luau
local function acceptCheckpoint(current, touched) -- current: último guardado; touched: el que tocó
	if type(touched) ~= "number" or touched % 1 ~= 0 then return current end
	if touched == current + 1 then return touched end -- el siguiente
	return current -- uno ya pasado o uno saltado: no cambia nada
end
local ok = acceptCheckpoint(3, 4) == 4 and acceptCheckpoint(3, 9) == 3 and acceptCheckpoint(3, 2) == 3
return ok and "OK puntos de control" or "FALLO puntos de control"
```
El número del punto lo saca el servidor del objeto tocado (`Touched` en el servidor, atributo `Etapa`),
nunca de un remoto del cliente.

## Gotchas (síntoma → causa → arreglo)
- **Todos los juegos acaban pareciendo el mismo** → se ofrecieron géneros o plantillas antes de oír la
  idea → primero su idea; el género, como pregunta; siempre «algo distinto».
- **La persona elige un género que no quería** → le diste una lista para elegir → 2 o 3 ideas para hablar
  y «puede no ser ninguna».
- **Números del paquete metidos sin preguntar** → se tomaron como reglas → son de partida: decisión
  numerada con recomendación, y ella decide.
- **Respuestas largas mezclando géneros** → se cargaron varios paquetes a la vez → solo el de la fase de
  ahora.
- **Un jugador se salta etapas** → el servidor aceptaba cualquier punto de control → solo el siguiente.
- **Al morir en un roguelike se pierde también lo permanente** → partida y perfil mezclados en el guardado →
  separarlos en el esquema.
- **Un nivel de puzle sin solución publicado** → nadie lo resolvió antes → la solución apuntada y jugada, o
  una búsqueda que lo resuelva.
- **Dos cartas se llaman sin fin y el servidor se cuelga** → sin tope de efectos en cadena → tope (100).
- **Un enemigo de RPG se vuelve imposible al quitar una poción** → la bonificación se quitó restando un
  valor → quitar por su origen.

## Etiquetas de resultado
**ejecutado** (la prueba del paquete en la batería del proyecto sale `OK`) · **verificado leyendo** (la
ficha tiene el género elegido por la persona y «algo distinto») · **preparado sin ejecutar** · **no
verificado** (si engancha: eso solo lo dice jugar, mejor con `rc-prototipo`).
