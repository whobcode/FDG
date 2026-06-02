import { Hono } from "hono";

type Bindings = { AI: Ai; ASSETS: Fetcher };
const app = new Hono<{ Bindings: Bindings }>();

// Deterministic fallback grouping by extension, used to seed/validate the AI plan.
function byExtension(files: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  const map: Record<string, string> = {
    jpg: "Images", jpeg: "Images", png: "Images", gif: "Images", webp: "Images", svg: "Images", heic: "Images",
    mp4: "Videos", mov: "Videos", mkv: "Videos", avi: "Videos",
    mp3: "Audio", wav: "Audio", flac: "Audio", m4a: "Audio",
    pdf: "Documents", doc: "Documents", docx: "Documents", txt: "Documents", md: "Documents", rtf: "Documents",
    xls: "Spreadsheets", xlsx: "Spreadsheets", csv: "Spreadsheets",
    ppt: "Presentations", pptx: "Presentations",
    zip: "Archives", rar: "Archives", "7z": "Archives", tar: "Archives", gz: "Archives",
    js: "Code", ts: "Code", py: "Code", go: "Code", rs: "Code", java: "Code", c: "Code", cpp: "Code", html: "Code", css: "Code", json: "Code",
  };
  for (const f of files) {
    const ext = (f.split(".").pop() || "").toLowerCase();
    const folder = map[ext] || "Other";
    (groups[folder] = groups[folder] || []).push(f);
  }
  return groups;
}

// POST /api/organize { files: string[], strategy?: "extension"|"smart" }
app.post("/api/organize", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { files?: string[]; strategy?: string } | null;
  const files = (body?.files || []).map((f) => f.trim()).filter(Boolean);
  if (files.length === 0) return c.json({ error: "files: string[] required" }, 400);
  if (files.length > 500) return c.json({ error: "max 500 files" }, 413);

  const fallback = byExtension(files);
  if (body?.strategy === "extension") return c.json({ strategy: "extension", plan: fallback });

  // AI "smart" grouping: cluster by topic/project/date as well as type.
  const prompt = `Organize these files into a sensible folder structure. Group by content/topic/project and type. ` +
    `Reply ONLY with JSON: an object mapping folder paths to arrays of the original filenames. Every file must appear exactly once.\n\nFiles:\n${files.join("\n")}`;
  try {
    const out = (await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a meticulous file organizer. Output strictly valid JSON, no prose, no markdown fences." },
        { role: "user", content: prompt },
      ],
      max_tokens: 2048,
    })) as { response?: string };
    const raw = (out.response ?? "").replace(/```json|```/g, "").trim();
    const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
    let plan: Record<string, string[]> | null = null;
    if (start !== -1 && end !== -1) { try { plan = JSON.parse(raw.slice(start, end + 1)); } catch { /* fall through */ } }

    // Validate every file is placed; otherwise fall back to extension grouping.
    if (plan) {
      const placed = new Set(Object.values(plan).flat());
      const allPlaced = files.every((f) => placed.has(f));
      if (allPlaced) return c.json({ strategy: "smart", plan });
    }
    return c.json({ strategy: "extension-fallback", plan: fallback, note: "AI plan was incomplete or invalid; used deterministic grouping." });
  } catch (e: any) {
    return c.json({ strategy: "extension-fallback", plan: fallback, note: "AI error: " + e.message });
  }
});

export default app;
