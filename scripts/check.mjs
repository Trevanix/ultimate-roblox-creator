// Checks the marketplace, the plugin manifest, every skill and agent, and relative links.
// No dependencies. Exit code 0 = all good, 1 = problems found.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(root, "ultimate-roblox-creator");
const problems = [];
const bad = (msg) => problems.push(msg);

function json(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { bad(`${path}: invalid JSON (${e.message})`); return {}; }
}

// Minimal frontmatter reader: plain `key: value` and folded `key: >` blocks.
export function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      out[key] = kv[2] === ">" || kv[2] === "|" ? "" : kv[2].replace(/^["']|["']$/g, "");
    } else if (key && /^\s+\S/.test(line)) {
      out[key] = (out[key] ? out[key] + " " : "") + line.trim();
    }
  }
  return out;
}

// Self-check of the parser, so a broken parser cannot pass silently.
{
  const fm = frontmatter("---\nname: a-b\ndescription: >\n  uno\n  dos\n---\nbody");
  if (!fm || fm.name !== "a-b" || fm.description !== "uno dos") bad("frontmatter parser self-check failed");
}

const market = json(join(root, ".claude-plugin", "marketplace.json"));
if (!market.name || !Array.isArray(market.plugins) || market.plugins.length === 0) bad("marketplace.json: needs name and plugins");
for (const p of market.plugins ?? []) {
  if (!existsSync(join(root, p.source ?? ""))) bad(`marketplace.json: source not found: ${p.source}`);
}

const manifest = json(join(plugin, ".claude-plugin", "plugin.json"));
if (manifest.name !== "ultimate-roblox-creator") bad("plugin.json: name must be ultimate-roblox-creator");
if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? "")) bad("plugin.json: version must look like 1.2.3");

function checkEntry(file, expectedName, kind) {
  const fm = frontmatter(readFileSync(file, "utf8"));
  if (!fm) return bad(`${file}: missing frontmatter`);
  if (fm.name !== expectedName) bad(`${file}: name "${fm.name}" should be "${expectedName}"`);
  const d = fm.description ?? "";
  if (d.length < 50) bad(`${file}: description too short`);
  if (d.length > 1024) bad(`${file}: description is ${d.length} characters (max 1024)`);
  if (kind === "skill" && !/No para/.test(d)) bad(`${file}: description should end with «No para…»`);
}

const skillsDir = join(plugin, "skills");
for (const name of readdirSync(skillsDir)) {
  const f = join(skillsDir, name, "SKILL.md");
  if (!existsSync(f)) { bad(`skills/${name}: missing SKILL.md`); continue; }
  checkEntry(f, name, "skill");
  const lines = readFileSync(f, "utf8").split("\n").length;
  if (lines > 500) bad(`skills/${name}/SKILL.md: ${lines} lines (max 500)`);
}
const agentsDir = join(plugin, "agents");
for (const file of readdirSync(agentsDir).filter((f) => f.endsWith(".md"))) {
  checkEntry(join(agentsDir, file), basename(file, ".md"), "agent");
}

// Relative markdown links must point to files that exist.
function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (n === ".git" || n === "node_modules") return [];
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".md") ? [p] : [];
  });
}
for (const f of walk(root)) {
  const text = readFileSync(f, "utf8");
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const path = target.split("#")[0];
    if (path && !existsSync(resolve(dirname(f), path))) bad(`${f.slice(root.length + 1)}: broken link ${target}`);
  }
}

if (problems.length) {
  console.error(problems.map((p) => "✗ " + p).join("\n"));
  process.exit(1);
}
console.log("✓ marketplace, plugin, skills, agents and links look good");
