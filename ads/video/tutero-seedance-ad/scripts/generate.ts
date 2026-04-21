import "dotenv/config";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const API_KEY = process.env.KIE_API_KEY;
if (!API_KEY) {
  console.error("ERROR: KIE_API_KEY not found in .env");
  process.exit(1);
}

const BASE_URL = "https://api.kie.ai/api/v1";
const OUTPUT_PATH = resolve(__dirname, "../public/input.mp4");

// Same actor reference — extracted from previous Seedance generation
const ACTOR_REF_URL = "https://litter.catbox.moe/rlo1dv.png";

const PROMPT = `A single continuous 8-second vertical video in three shots showing the same Australian primary-school boy (around 10 years old, light-brown hair, navy school jumper) at a laptop on the bench of a natural Australian family kitchen. The kitchen has white cabinetry, a stainless kettle, a fruit bowl with bananas, a window with sheer white curtains, and daylight coming through — plain, lived-in, uncluttered. He is alone in every shot. No other people on camera. No tutor or other face on the laptop screen. No visible chatbot UI.

SHOT 1 (0.0s–2.6s) — MEDIUM CLOSE-UP from the front-right. The boy is writing in a lined notebook with a blue pen, glancing between his notebook and the laptop. Calm, focused. Slight head tilt. The camera holds steady. Soft, neutral daylight from camera left.

SHOT 2 (2.6s–5.2s) — OVER-THE-SHOULDER from the boy's left shoulder. Quick cut. We see his hand tapping the pen against the notebook page, eyebrows slightly knitted, mouth tight, a small exhale. He's a little concerned, not upset — the kind of "hmm" face a kid makes when something doesn't quite click. He looks back at the laptop, then at his working. The camera holds steady.

SHOT 3 (5.2s–8.0s) — CLOSE-UP on his face from the front, slightly lower angle. Quick cut. His eyes widen a touch, he nods to himself, then breaks into a genuine delighted grin — the cute, proud, private smile of a kid who just worked something out. He makes a tiny self-high-five gesture or a subtle fist pump. The smile is the point of the whole video. Hold on the smile.

VOICEOVER (warm adult female Australian accent, natural, unhurried, conversational — not an advertiser voice):
"This is what a maths lesson looks like when somebody actually knows your kid."

The VO begins around 1.0s and finishes by 7.2s, paced so the word "somebody" lands on the cut into Shot 2 and the word "knows" lands on the cut into Shot 3. Slight breath before the final phrase.

Aesthetic: shot on an iPhone by a parent, not a film crew. Flat, neutral daylight. Natural unedited skin tone, visible slight skin texture, no airbrushing, no glow, no rim light, no golden-hour warmth, no teal-and-orange grading, no cinematic colour science, no shallow-depth-of-field dreamy bokeh. Realistic Australian family kitchen — not a styled set, not a showroom, not a café. Clothing is a plain navy school jumper over a white polo, no logos. The only sounds beyond the voiceover are very faint ambient kitchen room tone (no music). Subtitle-free. No on-screen text — all typography will be added in post. No watermarks. No Seedance or ByteDance logos.`;

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

async function createTask(): Promise<string> {
  console.log("Submitting Seedance 2.0 generation task...");
  console.log("  Model: bytedance/seedance-2");
  console.log("  Resolution: 1080p | Aspect: 9:16 | Duration: 8s");
  console.log("  Audio: native VO enabled");
  console.log("  Actor reference: first_frame_url");
  console.log();

  const payload = {
    model: "bytedance/seedance-2",
    input: {
      prompt: PROMPT,
      first_frame_url: ACTOR_REF_URL,
      generate_audio: true,
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
  console.log(`Task created: ${taskId}`);
  return taskId;
}

async function pollTask(taskId: string): Promise<string[]> {
  const MAX_WAIT = 15 * 60 * 1000; // 15 minutes
  const INTERVAL = 10_000; // 10 seconds
  const start = Date.now();

  console.log("Polling for results (timeout: 15 min)...\n");

  while (Date.now() - start < MAX_WAIT) {
    const resp = await apiRequest(
      "GET",
      `/jobs/recordInfo?taskId=${taskId}`
    );

    if (resp.code !== 200) {
      console.error(`  Poll error: ${JSON.stringify(resp)}`);
      await sleep(INTERVAL);
      continue;
    }

    const { state, progress, failMsg, resultJson } = resp.data;
    const elapsed = Math.round((Date.now() - start) / 1000);

    console.log(`  [${elapsed}s] state=${state} progress=${progress ?? 0}%`);

    if (state === "success") {
      const result = JSON.parse(resultJson || "{}");
      return result.resultUrls || [];
    }

    if (state === "fail") {
      console.error(`\nGeneration FAILED:`);
      console.error(JSON.stringify(resp.data, null, 2));
      process.exit(1);
    }

    await sleep(INTERVAL);
  }

  console.error("Timed out after 15 minutes.");
  process.exit(1);
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

async function downloadVideo(url: string): Promise<void> {
  const dir = resolve(__dirname, "../public");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const downloadUrl = await getDownloadUrl(url);
  console.log(`Downloading to ${OUTPUT_PATH}...`);

  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length === 0) throw new Error("Downloaded file is empty");

  writeFileSync(OUTPUT_PATH, buffer);
  const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1);
  console.log(`Downloaded: ${sizeMb} MB`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("=".repeat(60));
  console.log("Tutero Seedance Ad — Generate");
  console.log("=".repeat(60));
  console.log();

  const taskId = await createTask();
  console.log();

  const urls = await pollTask(taskId);
  if (!urls.length) {
    console.error("No video URLs returned.");
    process.exit(1);
  }

  console.log(`\nGeneration complete. Downloading...`);
  await downloadVideo(urls[0]);

  console.log("\nDone. Video saved to public/input.mp4");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
