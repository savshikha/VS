/**
 * Fetches Figma MCP export URLs and writes them to public/wf-figma-key-screens/.
 * Regenerate: run `node scripts/download-wf-figma-assets.mjs` from workflow-app/ after
 * a fresh Figma MCP pass if you update UUIDs in ASSETS below.
 * Requires network.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/wf-figma-key-screens");

/** Key → figma mcp asset URL (from get_design_context for file Key-screens, node 1:15048 area). */
const ASSETS = {
  "header-logo": "https://www.figma.com/api/mcp/asset/75877193-1a51-4993-af5a-f2fc6578242e",
  "header-search": "https://www.figma.com/api/mcp/asset/828eca30-d6b8-4afe-8530-2ef657bfc36c",
  "header-gear": "https://www.figma.com/api/mcp/asset/41b79be4-916b-45b0-b16b-a5cb67d2ee1c",
  "header-avatar": "https://www.figma.com/api/mcp/asset/8bb0979a-4089-4cb5-920b-51793675250f",
  "title-job": "https://www.figma.com/api/mcp/asset/10299be9-64e0-4ba0-8fa2-99790652398c",
  "title-arrow": "https://www.figma.com/api/mcp/asset/397ffa9b-6b6e-4e83-be13-09a050d09063",
  "title-status-dot": "https://www.figma.com/api/mcp/asset/98a1bec3-4871-4efb-8c48-52c86719ce44",
  "title-users": "https://www.figma.com/api/mcp/asset/9447a0fc-fafb-4652-ae2b-9426c786fd76",
  "title-tasks": "https://www.figma.com/api/mcp/asset/80895ce1-1f91-436c-bf74-8977386c6164",
  "nav-spark": "https://www.figma.com/api/mcp/asset/292ac3c4-37aa-4c22-b6f9-a3f8e58b6cc3",
  "nav-pathways": "https://www.figma.com/api/mcp/asset/7bb3e656-f98f-4423-8f2f-30629eb3415f",
  "nav-compass": "https://www.figma.com/api/mcp/asset/b85bbe5c-e8c9-47a2-b038-e457e4168dcc",
  "nav-tasks": "https://www.figma.com/api/mcp/asset/0a5ceb01-4978-44eb-b576-d3c07d1c990f",
  "nav-stars": "https://www.figma.com/api/mcp/asset/a25ca8a2-3d10-40fd-a3c5-f9f7064a5d41",
  "stat-pie": "https://www.figma.com/api/mcp/asset/7a051399-860f-498e-b513-360a7f747b52",
  "stat-hourglass": "https://www.figma.com/api/mcp/asset/5c9d037a-6699-4ff9-bc84-a9da0cdd4980",
  "canvas-drag": "https://www.figma.com/api/mcp/asset/0c3e5e4f-1253-43a9-87b9-e14efb0093bc",
  "canvas-connector": "https://www.figma.com/api/mcp/asset/e7cabe11-4c57-4577-9acb-8ad9f439ebfc",
  "agent-salesforce": "https://www.figma.com/api/mcp/asset/a95df27c-1cf5-4822-9286-3f7c33df3ecc",
  "agent-gemini": "https://www.figma.com/api/mcp/asset/6a06fd62-9e86-40de-96d9-992be3c38230",
  "agent-microsoft": "https://www.figma.com/api/mcp/asset/81729c57-1948-4bd3-a68e-b687027bfcc2",
};

function extForType(ct) {
  if (!ct) return "bin";
  if (ct.includes("svg")) return "svg";
  if (ct.includes("png")) return "png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("webp")) return "webp";
  return "bin";
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const manifest = {};
  for (const [key, url] of Object.entries(ASSETS)) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed ${key}: ${res.status} ${url}`);
    }
    const ct = res.headers.get("content-type") || "";
    const ext = extForType(ct);
    const name = `${key}.${ext}`;
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(join(OUT, name), buf);
    manifest[key] = { file: name, contentType: ct, sourceUrl: url };
    process.stdout.write(`Wrote ${name} (${buf.length} bytes)\n`);
  }
  await writeFile(
    join(OUT, "manifest.json"),
    JSON.stringify({ generated: new Date().toISOString(), assets: manifest }, null, 2)
  );
  process.stdout.write(`Done. Output: ${OUT}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
