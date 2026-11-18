# Instructions for AI coding agents

This repo is a Claude Code plugin (`ultimate-roblox-creator/`) plus its marketplace
(`.claude-plugin/marketplace.json`) and website (`docs/`). Reply in the person's language and explain
in plain words; the person may not be technical.

## If the person wants to make a Roblox game
Do not edit this repo. Install the plugin and let the director skill guide them:

```
claude plugin marketplace add trevanix/ultimate-roblox-creator
claude plugin install ultimate-roblox-creator@trevanix
```

Then open a new session in their game folder and start with their idea.

## If the person is changing the plugin
- Skills are in `ultimate-roblox-creator/skills/<name>/SKILL.md`; agents in `ultimate-roblox-creator/agents/`.
- Frontmatter: `name` equals the folder name; `description` ≤ 1024 characters, ends with «No para…» naming
  neighbour skills. Body under 500 lines. Skill text is in Spanish; keep it plain.
- Each workflow ends with a check; gotchas are symptom → cause → fix; keep «Última comprobación AAAA-MM-DD».
- Only short Luau examples. Do not add scripts that need installing.
- Never add personal data, real game or product IDs, secrets or tokens.
- After changes run `node scripts/check.mjs` and `claude plugin validate ./ultimate-roblox-creator`.
- If you change a description, re-run the activation phrases in `ultimate-roblox-creator/pruebas/`.

## Rules the plugin keeps (do not weaken them)
- The person publishes; Claude never saves or publishes the place without being asked for that action.
- Backups before touching player data; server authority; honest monetization (no rush, odds shown,
  `PolicyService`); no free Toolbox models; no unbounded loops.
