# Ultimate-Roblox-Creator-Skill

Un plugin de Claude Code para crear juegos de Roblox de **cualquier género**, de la idea a la
publicación, aunque no sepas programar. Habla contigo en tu idioma y con palabras sencillas.

No trae un juego hecho: te pregunta tu idea y te acompaña paso a paso con un método probado en un juego
real publicado. **Publicas tú**: Claude nunca publica tu lugar, y solo lo guarda si se lo pides para esa vez.

## Qué hay dentro (versión 1.0)
```
ultimate-roblox-creator/
  .claude-plugin/plugin.json      el manifiesto del plugin
  skills/                         13 skills (abajo)
  agents/                         4 agentes (abajo)
  pruebas/                        frases de activación y sus resultados
  LICENSE, NOTICE                 licencia Apache-2.0 y de dónde salen algunas ideas
```

## Skills
| Skill | Para qué |
|---|---|
| `ultimate-roblox-creator` | La directora: tu idea, la ficha del juego, decisiones, fases con pruebas, hasta publicar. Carga las demás |
| `rc-datos` | Que el progreso se guarde sin perder nada |
| `rc-servidor` | Que nadie haga trampas con los remotos |
| `rc-interfaz` | Pantallas para ordenador, teléfono, tableta y consola |
| `rc-personajes-fisica` | Personajes, reapariciones, colisiones y proyectiles |
| `rc-economia` | Monedas, precios, mejoras y ventas honestas |
| `rc-mundo` | Mapa, niveles y que vaya fluido en un teléfono barato |
| `rc-sensacion` | Que los golpes y la cámara se sientan bien, sin marear |
| `rc-npc` | Enemigos, mascotas y personajes que hablan |
| `rc-generos` | Preguntas e ideas por género (tú eliges) |
| `rc-prototipo` | Probar una idea en una hora y el documento del juego |
| `rc-sonido` | Música y efectos sin problemas de derechos |
| `rc-publicar` | Publicar paso a paso (lo haces tú) |

## Agentes
La directora los llama sola cuando toca; tú no tienes que hacer nada. Cada uno devuelve un informe con
formato fijo y en tu idioma.

| Agente | Para qué | Qué puede hacer |
|---|---|---|
| `revisor-seguridad-datos` | Revisar remotos, guardado y compras (trampas, pérdida de datos, recibos) | Solo leer |
| `revisor-textos-ventas` | Textos según la edad, ventas honestas, Content ratings | Solo leer |
| `probador-studio` | Pasar la batería de pruebas y probar en Play | Ejecutar pruebas en Studio; no edita, no guarda, no publica |
| `buscador-audio` | Buscar sonidos con licencia válida (Roblox, Openverse) | Buscar en la web; no baja ni sube nada |

Los agentes usan el MCP de Roblox Studio con el nombre de servidor `Roblox_Studio` (herramientas
`mcp__Roblox_Studio__…`). Si tu MCP de Studio tiene otro nombre, los agentes funcionan igual pero sin
Studio: los revisores leen solo archivos y el probador te da el código para pegar.

## Cómo instalarlo

Desde GitHub, en una terminal:
```powershell
claude plugin marketplace add trevanix/ultimate-roblox-creator
```
```powershell
claude plugin install ultimate-roblox-creator@trevanix
```
Dentro de una sesión también vale `/plugin marketplace add trevanix/ultimate-roblox-creator` y
`/plugin install ultimate-roblox-creator@trevanix`. Abre una sesión nueva después.

**Solo para una carpeta** (no afecta a tus otras conversaciones): añade `--scope local` a los dos comandos,
ejecutados dentro de esa carpeta.

**Probarlo sin instalar** (solo para esa sesión), desde una copia descargada del repositorio:
```powershell
claude --plugin-dir .\ultimate-roblox-creator
```

**Para quitarlo**:
```powershell
claude plugin uninstall ultimate-roblox-creator@trevanix
```

## Cómo usarlo
- Di «quiero hacer un juego de Roblox» y cuéntale tu idea, o escribe `/ultimate-roblox-creator:ultimate-roblox-creator`.
- «Sigamos con mi juego»: lee el `CLAUDE.md` de tu proyecto y te dice en qué punto estáis.
- «Revisa mi juego antes de publicar»: repasa contigo la lista antes de publicar.

Funciona con el MCP de Roblox Studio (la conexión que deja a Claude leer, escribir y probar en tu Studio) o sin él (te da el código
para pegar y te dice dónde va).

## Junto a otras skills de Roblox
Puede convivir con `roblox-game` o el plugin `roblox-dev`: este lleva el camino completo con la persona;
aquellos sirven para detalles de código. Las descripciones dicen «No para…» para que no se confundan.
