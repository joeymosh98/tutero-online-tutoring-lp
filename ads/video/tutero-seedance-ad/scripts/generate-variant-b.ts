import "dotenv/config";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const API_KEY = process.env.KIE_API_KEY;
if (!API_KEY) {
  console.error("ERROR: KIE_API_KEY not found in .env");
  process.exit(1);
}

const BASE_URL = "https://api.kie.ai/api/v1";
const PUBLIC_DIR = resolve(__dirname, "../public");

// Same actor reference as Variant A — ensures consistent boy across all ads
const ACTOR_REF_URL = "https://litter.catbox.moe/rlo1dv.png";

// ── CLIP 1: Focused lesson → confusion (0–8s) ──────────────────────────────
//
// Setting: Bedroom study desk, late afternoon. Distinctly different from
// Variant A's kitchen bench. More intimate, personal, "after school" vibe.
// Emotional arc: engaged focus → visible confusion/struggle.
//
const PROMPT_CLIP1 = `Vertical 9:16 video. A 10-year-old Australian boy with light-brown hair sits at a wooden study desk in his bedroom. He wears a grey t-shirt and has white earbuds in. A laptop is open on the desk for an online tutoring lesson. Warm desk lamp on, textbooks stacked, blue pencil case, late afternoon light through sheer curtains. School bag on the chair. He starts calm and focused, writing in his exercise book and glancing at the screen. Then he pauses, tilts his head, furrows his brow — confused and stuck. He taps his pen, rests chin on hand, squints at the screen. Shot on phone, natural lighting, realistic skin, no airbrushing, no other people visible.`;

// ── CLIP 2: Understanding → breakthrough joy (8–16s, use first 5s) ─────────
//
// Same setting, same desk. The "aha moment" and celebration.
// We only use ~5 seconds of this clip (frames 240–390).
//
const PROMPT_CLIP2 = `Vertical 9:16 video. Same 10-year-old Australian boy with light-brown hair, grey t-shirt, white earbuds, at the same wooden study desk in his bedroom. Laptop open, desk lamp on, textbooks, late afternoon light. He is listening to his tutor intently, nodding slowly. Then his eyes widen — the aha moment. He breaks into a wide genuine delighted grin, sits up straighter, writes confidently in his notebook, nods excitedly at the screen. He leans back with a proud satisfied smile and does a subtle fist pump. The breakthrough moment — pure joy. Shot on phone, natural lighting, realistic skin, no airbrushing, no other people visible.`;

// ── API helpers ──────────────────────────────────────────────────────────────

async function apiRequest(
  method: string,
  path: string,
  body?: unknown
): Promise<any> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json();
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function createTask(prompt: string, label: string): Promise<string> {
  console.log(`Submitting ${label}...`);

  const payload = {
    model: "bytedance/seedance-2",
    input: {
      prompt,
      first_frame_url: ACTOR_REF_URL,
      generate_audio: false, // we add our own VO + music
      resolution: "1080p" as const,
      aspect_ratio: "9:16" as const,
      duration: 8,
      web_search: false,
    },
  };

  const resp = await apiRequest("POST", "/jobs/createTask", payload);

  if (resp.code !== 200) {
    throw new Error(`Failed to create task: ${JSON.stringify(resp)}`);
  }

  const taskId = resp.data.taskId;
  console.log(`  ${label} task: ${taskId}`);
  return taskId;
}

async function pollTask(taskId: string, label: string): Promise<string[]> {
  const MAX_WAIT = 15 * 60 * 1000;
  const INTERVAL = 10_000;
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT) {
    const resp = await apiRequest(
      "GET",
      `/jobs/recordInfo?taskId=${taskId}`
    );

    if (resp.code !== 200) {
      console.error(`  ${label} poll error: ${JSON.stringify(resp)}`);
      await sleep(INTERVAL);
      continue;
    }

    const { state, progress, failMsg, resultJson } = resp.data;
    const elapsed = Math.round((Date.now() - start) / 1000);

    console.log(
      `  [${elapsed}s] ${label}: state=${state} progress=${progress ?? 0}%`
    );

    if (state === "success") {
      const result = JSON.parse(resultJson || "{}");
      return result.resultUrls || [];
    }

    if (state === "fail") {
      console.error(`\n${label} FAILED: ${failMsg}`);
      console.error(JSON.stringify(resp.data, null, 2));
      throw new Error(`${label} generation failed`);
    }

    await sleep(INTERVAL);
  }

  throw new Error(`${label} timed out after 15 minutes`);
}

async function getDownloadUrl(tempUrl: string): Promise<string> {
  const resp = await apiRequest("POST", "/common/download-url", {
    url: tempUrl,
  });
  if (resp.code === 200 && typeof resp.data === "string") {
    return resp.data;
  }
  return tempUrl;
}

async function downloadVideo(
  url: string,
  outputPath: string
): Promise<void> {
  if (!existsSync(PUBLIC_DIR)) mkdirSync(PUBLIC_DIR, { recursive: true });

  const downloadUrl = await getDownloadUrl(url);
  console.log(`Downloading to ${outputPath}...`);

  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length === 0) throw new Error("Downloaded file is empty");

  writeFileSync(outputPath, buffer);
  const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1);
  console.log(`  Downloaded: ${sizeMb} MB`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("Tutero Variant B — Generate 2 clips (bedroom desk)");
  console.log("=".repeat(60));
  console.log();

  // Submit and complete clips sequentially (parallel requires 2x upfront credits)

  // ── Clip 1 ──
  const taskId1 = await createTask(PROMPT_CLIP1, "Clip 1 (focus→confusion)");
  console.log("\nPolling Clip 1...\n");
  const urls1 = await pollTask(taskId1, "Clip 1");
  if (!urls1.length) {
    console.error("Clip 1: no video URLs returned.");
    process.exit(1);
  }
  await downloadVideo(urls1[0], resolve(PUBLIC_DIR, "variant-b-clip1.mp4"));

  // ── Clip 2 ──
  console.log("\n" + "─".repeat(60) + "\n");
  const taskId2 = await createTask(PROMPT_CLIP2, "Clip 2 (understanding→joy)");
  console.log("\nPolling Clip 2...\n");
  const urls2 = await pollTask(taskId2, "Clip 2");
  if (!urls2.length) {
    console.error("Clip 2: no video URLs returned.");
    process.exit(1);
  }
  await downloadVideo(urls2[0], resolve(PUBLIC_DIR, "variant-b-clip2.mp4"));

  console.log("\nDone. Videos saved:");
  console.log("  public/variant-b-clip1.mp4");
  console.log("  public/variant-b-clip2.mp4");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
