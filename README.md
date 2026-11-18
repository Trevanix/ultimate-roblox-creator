<div align="center">

<img src="docs/assets/hero.svg" alt="Ultimate-Roblox-Creator: you tell Claude your game idea, it asks a few simple questions, plans small tested phases, builds for computer, phone and console, and you publish your Roblox game yourself." width="880">

<p>
  <a href="https://github.com/trevanix/ultimate-roblox-creator/actions/workflows/tests.yml"><img src="https://github.com/trevanix/ultimate-roblox-creator/actions/workflows/tests.yml/badge.svg" alt="tests"></a>
  <img src="https://img.shields.io/badge/Claude%20Code-plugin-ff7a5c?labelColor=141418" alt="Claude Code plugin">
  <img src="https://img.shields.io/badge/13%20skills%20%C2%B7%204%20agents-ff7a5c?labelColor=141418" alt="13 skills and 4 agents">
  <img src="https://img.shields.io/badge/any%20genre-obby%20%C2%B7%20tycoon%20%C2%B7%20horror%20%C2%B7%20RPG-5fd38d?labelColor=141418" alt="Any genre: obby, tycoon, horror, RPG and more">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-9a9993?labelColor=141418" alt="Apache-2.0 license"></a>
</p>

<p>
  <b><a href="#start-here">Start here</a></b> ·
  <a href="#what-it-does">What it does</a> ·
  <a href="#skills-and-agents">Skills and agents</a> ·
  <a href="#faq">FAQ</a> ·
  <a href="https://trevanix.github.io/ultimate-roblox-creator/">Website</a> ·
  <a href="#español">Español</a>
</p>

</div>

**Make your own Roblox game with AI, even if you can't code.** Ultimate-Roblox-Creator is a free
[Claude Code](https://claude.com/claude-code) plugin that walks you from idea to published game: it asks
what you want to build, writes the Luau code, tests every step, and makes it work on **computer, phone,
tablet and console**. Any genre: obby, tycoon, simulator, horror, RPG, racing, survival or something new.
It talks to you in your language with plain words. **You always publish**; Claude never publishes your place.

The instructions are written in Spanish and the plugin replies in your language (English, Spanish,
Portuguese…). It works with the Roblox Studio MCP server, or without it by giving you code to paste.

## Start here

You need [Claude Code](https://claude.com/claude-code) and [Roblox Studio](https://create.roblox.com).
In a terminal:

```
claude plugin marketplace add trevanix/ultimate-roblox-creator
claude plugin install ultimate-roblox-creator@trevanix
```

Open a new Claude Code session and say what you want, for example:

> I want to make a Roblox game where you're a penguin delivering pizzas in an ice city. I can't code.

Or call it directly: `/ultimate-roblox-creator:ultimate-roblox-creator`.

**Only for one folder** (keeps your other sessions untouched): run both commands inside that folder with
`--scope local`. **Try without installing**: download the repo and run
`claude --plugin-dir ./ultimate-roblox-creator`. **Remove**: `claude plugin uninstall ultimate-roblox-creator@trevanix`.

## What it does

The plugin follows six stages and tells you where you are:

1. **Idea**: questions about your game, two or three at a time, until a one-page game sheet is clear
   (core loop, saving, multiplayer, age, devices, monetization). It never forces a genre and always looks
   for *something different*.
2. **Design**: numbered decisions, each with a recommendation and its cost. You choose.
3. **Plan**: small phases you can test one by one. The core loop comes first, playable even if ugly.
4. **Build**: for each phase, automated tests, an independent review by another agent, and a backup
   before anything touches player data.
5. **Devices and text**: one UI scale for computer, phone and console; gamepad glyphs (PS5 / Xbox);
   readable text on phones; wording that fits your players' age.
6. **Publish**: a checklist, the game page and the maturity questionnaire. **You** press Publish.

It carries lessons from a real published Roblox game: server authority, session-locked DataStores with
migrations, idempotent `ProcessReceipt`, honest monetization for kids, StreamingEnabled and building only
nearby, no free Toolbox models (they can hide backdoors), and never an unbounded `repeat … until`.

## When to use · when to skip

- **Use it** to start a new Roblox game, continue one, add a system (saving, shop, NPCs, phone UI), or check
  a game before publishing.
- **Skip it** for one-off Luau API questions, or for Unity, Godot and other engines.

## Skills and agents

| Skill | What for |
|---|---|
| `ultimate-roblox-creator` | The director: your idea, the game sheet, decisions, tested phases, up to publishing. Loads the others |
| `rc-datos` | Saving progress without ever losing it |
| `rc-servidor` | Secure remotes, anti-cheat with sensible margins |
| `rc-interfaz` | Screens for computer, phone, tablet and console |
| `rc-personajes-fisica` | Characters, respawns, collisions, fast projectiles |
| `rc-economia` | Currencies, price curves, upgrades and honest sales |
| `rc-mundo` | Level design, pacing and performance on cheap phones |
| `rc-sensacion` | Game feel and camera, without making anyone dizzy |
| `rc-npc` | Enemies, pets, pathfinding and dialogue |
| `rc-generos` | Questions and numbers per genre (you choose) |
| `rc-prototipo` | Test one idea in about an hour, and a one-page game doc |
| `rc-sonido` | Music and sound effects with valid licenses |
| `rc-publicar` | Publishing step by step (you do it) |

| Agent | What for | Can |
|---|---|---|
| `revisor-seguridad-datos` | Review remotes, saving and purchases | Read only |
| `revisor-textos-ventas` | Age-appropriate text, honest sales, content ratings | Read only |
| `probador-studio` | Run the test battery and Play tests | Runs tests in Studio; never edits, saves or publishes |
| `buscador-audio` | Find sounds with valid licenses (Roblox, Openverse) | Searches the web; downloads nothing |

## FAQ

### Can I make a Roblox game with AI if I don't know how to code?
Yes. You describe the game and make the decisions; Claude writes and tests the code and tells you exactly
what to click in Roblox Studio, one action at a time.

### Does it only make simulators or "+1" games?
No. There are no closed templates. It asks about your idea first; the genre notes are only questions and
ideas.

### Will it publish my game or spend my Robux?
No. Publishing, prices and putting items on sale are always done by you. Claude never saves or publishes
your place unless you ask for that specific action.

### Does it work without the Roblox Studio MCP?
Yes. Without it, Claude gives you each script, tells you where it goes and what you should see when you
test.

### Is it safe for kids' games?
It is designed for that: text by age, no pressure to buy, odds shown before any paid random item, and
`PolicyService` checks. You still answer Roblox's maturity questionnaire yourself.

### How was it tested?
82 activation phrases in Spanish, English and Portuguese, judged by two independent models (100% on
"should" and "near-miss" cases), `claude plugin validate`, and real runs of the director, three skills and
three agents. Results are in [`ultimate-roblox-creator/pruebas/`](ultimate-roblox-creator/pruebas/).

## Development

- Plugin files live in [`ultimate-roblox-creator/`](ultimate-roblox-creator/); the marketplace is
  [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).
- `node scripts/check.mjs` checks the manifests, names, descriptions and links (it runs on every push).
- `claude plugin validate ./ultimate-roblox-creator` checks the plugin with Claude Code.
- AI agents working on this repo: read [`AGENTS.md`](AGENTS.md).

## Credits

- [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills)
  (Apache-2.0): the director-and-small-skills method, skill format and activation tests. Rewritten in our own
  words; see [NOTICE](NOTICE).
- Sound sources described in `rc-sonido`: [earshot](https://github.com/Leonxlnx/earshot),
  [Clipwing/skills](https://github.com/Clipwing/skills) and [Openverse](https://openverse.org). Nothing of
  theirs is bundled.

Made by [Trevanix](https://github.com/trevanix). Questions: [contact@trevanix.com](mailto:contact@trevanix.com) ·
security reports: [security policy](https://github.com/trevanix/.github/blob/main/SECURITY.md).

Not affiliated with Roblox Corporation or Anthropic. Roblox is a trademark of Roblox Corporation.

---

## Español

**Crea tu propio juego de Roblox con IA, aunque no sepas programar.** Ultimate-Roblox-Creator es un plugin
gratuito de [Claude Code](https://claude.com/claude-code) que te acompaña de la idea al juego publicado: te
pregunta qué quieres hacer, escribe el código en Luau, prueba cada paso y lo deja listo para **ordenador,
teléfono, tableta y consola**. De cualquier género: obby, tycoon, simulador, terror, RPG, carreras,
supervivencia o algo nuevo. Habla contigo en tu idioma y con palabras sencillas. **Publicas tú siempre.**

### Cómo empezar
Necesitas Claude Code y Roblox Studio. En una terminal:

```
claude plugin marketplace add trevanix/ultimate-roblox-creator
claude plugin install ultimate-roblox-creator@trevanix
```

Abre una sesión nueva de Claude Code y cuéntale tu idea: «Quiero hacer un juego de Roblox de un pingüino
que reparte pizzas. No sé programar». También puedes llamarlo con `/ultimate-roblox-creator:ultimate-roblox-creator`.

Solo para una carpeta (no toca tus otras conversaciones): los dos comandos dentro de esa carpeta, con
`--scope local`. Para quitarlo: `claude plugin uninstall ultimate-roblox-creator@trevanix`.

### Qué hace
1. **La idea:** preguntas de 2 en 2 o de 3 en 3 hasta tener la ficha del juego. Nunca impone un género.
2. **El diseño:** decisiones numeradas con una recomendación. Tú eliges.
3. **El plan:** fases pequeñas que se prueban solas.
4. **Construir:** pruebas automáticas, revisión de otro agente y respaldo antes de tocar datos.
5. **Dispositivos y textos:** ordenador, teléfono y consola; textos según la edad de tus jugadores.
6. **Publicar:** lista, página del juego y cuestionario de madurez. **Publicas tú.**

Lleva las lecciones de un juego de Roblox real ya publicado: el servidor manda, guardado con bloqueo de
sesión y migraciones, compras que nunca se entregan dos veces, ventas honestas con niños, mapas grandes
que no se traban y nada de modelos gratis de la Caja de herramientas (pueden traer puertas traseras).

### Preguntas frecuentes
- **¿Publica mi juego o gasta mis Robux?** No. Publicar, poner precios y poner cosas a la venta lo haces tú.
- **¿Funciona sin el MCP de Roblox Studio?** Sí: te da el código, te dice dónde va y qué deberías ver.
- **¿Solo hace simuladores?** No. Primero pregunta tu idea; los géneros son solo ideas y preguntas.

Hecho por [Trevanix](https://github.com/trevanix). Contacto: [contact@trevanix.com](mailto:contact@trevanix.com).
No está afiliado a Roblox Corporation ni a Anthropic.
