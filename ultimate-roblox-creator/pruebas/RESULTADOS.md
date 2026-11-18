# Resultados de las pruebas de activación (2026-11-18)

## Cómo se probó
Como en awesome-gamedev-agent-skills: un juez solo ve **nombre + descripción** de cada skill y agente
y dice cuál(es) cargaría para cada frase (de 0 a 3, sin «por si acaso").

- Catálogo de 28 entradas, mezcladas: nuestras 13 skills y 4 agentes, más las vecinas `roblox-game` y
  las 9 skills y el agente `roblox-reviewer` del plugin `roblox-dev` (descripciones copiadas tal cual, sin
  instalar ni ejecutar nada).
- 82 frases de `activacion.json`: 50 deben activar, 18 casi iguales, 8 combinadas, 6 ninguna; en
  español, inglés y portugués.
- Dos jueces independientes que no ven las respuestas esperadas: **A** (modelo normal) y **B** (modelo
  más barato, Haiku).
- Reglas de acierto: `activacion.json` → `reglas`. Una frase «debe» o «combinada» acierta si salen
  **todas** las esperadas (puede salir alguna más); una «casi igual» acierta si no sale ninguna de las
  prohibidas; una «ninguna» acierta si no sale nada.

## Ronda 1 (descripciones de F1–F5)
| Grupo | Juez A | Juez B |
|---|---|---|
| Deben activar | 50/50 (100 %) | 50/50 (100 %) |
| Casi iguales | 18/18 (100 %) | 18/18 (100 %) |
| Combinadas | 7/8 (88 %) | 4/8 (50 %) |
| Ninguna | 6/6 (100 %) | 6/6 (100 %) |

Fallos: en C03, C04, C07 y C08 los jueces eligieron solo la directora o solo la skill `rc-*`, no las dos.

**Cambio:** a la descripción de la directora se le añadió «Cárgala también junto a la skill rc-* del
tema cuando la persona empieza un juego nuevo, sigue con el suyo o lo va a publicar: ella lleva el
camino y carga las rc-*» (785 caracteres; límite 1024).

## Ronda 2 (descripciones finales)
| Grupo | Juez A | Juez B |
|---|---|---|
| Deben activar | 50/50 (100 %) | 50/50 (100 %) |
| Casi iguales | 18/18 (100 %) | 18/18 (100 %) |
| Combinadas | 8/8 (100 %) | 4/8 (50 %) |
| Ninguna | 6/6 (100 %) | 6/6 (100 %) |

**Metas cumplidas** (≥ 90 % en «deben» y en «casi iguales», con los dos jueces).

En las casi iguales de Roblox, los dos jueces eligieron la vecina correcta: `roblox-game` (N03), y del
plugin `roblox-dev` `luau-strict-typing` (N04), `setup` (N05), `roblox-testing` (N08), el agente
`roblox-reviewer` (N15) y `roblox-performance` (N16). Las frases de Unity, Godot, web o de la vida diaria
no activaron nada.

Combinadas con el juez B: sigue eligiendo una sola cosa (C03, C04: solo la directora; C07, C08: solo la
rc-*). No es grave: la directora carga la rc-* que haga falta y cada rc-* remite a la directora. No se
siguió afinando para no sobrecargar la descripción.

Después de la ronda 2 solo cambió una descripción: en `revisor-seguridad-datos`, «roblox-reviewer» pasó a
«roblox-reviewer, si está instalado». No se repitió la prueba por ese cambio.

## Límites de esta prueba
- Mide que la skill **se elija** leyendo la descripción, no que el plugin se cargue de verdad ni que el
  código funcione en Roblox Studio.
- Los jueces son modelos que simulan la elección; Claude Code real puede elegir distinto.
- Las frases las escribió quien escribió las descripciones: puede que sean más fáciles de lo normal.
  Conviene añadir frases reales de personas cuando se use.
