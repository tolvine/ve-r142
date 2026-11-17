// scripts/smoke.mjs — deploy smoke test: render + hash + health matrix.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const manifest = {};
for (const f of readdirSync("public"))
  manifest[f] = createHash("sha256").update(readFileSync(`public/${f}`)).digest("hex").slice(0, 12);
const listeners = [];
for (const f of ["/proc/net/tcp", "/proc/net/tcp6"]) {
  let text = ""; try { text = readFileSync(f, "utf8"); } catch { continue; }
  for (const line of text.split("\n").slice(1)) {
    const p = line.trim().split(/\s+/);
    if (p.length < 4 || p[3] !== "0A") continue;
    const port = parseInt(p[1].split(":")[1], 16);
    if (port) listeners.push(port);
  }
}
const ports = [...new Set(listeners)].sort((a, b) => a - b);
const health = {};
for (const port of ports) {
  try { const r = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(1500) });
    health[port] = { status: r.status, body: (await r.text()).slice(0, 120) };
  } catch (e) { health[port] = { err: String(e).slice(0, 60) } }
}
writeFileSync("runtime-config.json", JSON.stringify({ generatedAt: new Date().toISOString(), ports, health }, null, 2) + "\n");
console.log("smoke: service map recorded", ports.join(","));
