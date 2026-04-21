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

// Actor reference — same boy from previous generations
const ACTOR_REF_URL = "https://litter.catbox.moe/rlo1dv.png";

const PROMPT = `A 15-second vertical video in four shots of the same Australian primary-school boy, around 10 years old, light-brown hair, plain navy school jumper over a white polo. He is alone in a natural Australian family kitchen — white cabinetry, stainless kettle, fruit bowl with bananas, sheer white curtain at a window, daylight coming through. No other people anywhere in the video. No tutor face on the laptop. No UI visible on the laptop screen.

SHOT 1 — 0.0s to 4.0s
Medium close-up from the front-right. The boy sits at the kitchen bench, laptop open in front of him, writing in a lined notebook with a blue pen. He glances between the notebook and the screen. Calm, focused. Camera holds steady. Flat neutral daylight from camera left.

SHOT 2 — 4.0s to 8.0s
Quick cut. Over-the-shoulder from his left. He taps the pen against the page, eyebrows knit slightly, mouth tight, a small exhale. A kid's "hmm, that's not right" face — concerned, not upset. He looks back at his working. Camera holds steady.

SHOT 3 — 8.0s to 11.0s
Quick cut. Medium shot from the front. He leans in closer to the laptop, re-reads something, mouths a word silently to himself. Something is starting to click — the shift is small but visible in his eyes.

SHOT 4 — 11.0s to 15.0s
Quick cut. Close-up on his face, front, slightly low angle. His eyes widen, he nods to himself, then breaks into a genuine proud grin — the private smile of a kid who just worked something out. A tiny fist pump. Hold on the smile all the way to 15s.

VOICEOVER (warm Australian woman, adult, sounds like a mum on the phone to a friend, unhurried, natural — not an advertiser, not reading a script, slightly amused and genuinely happy as she describes her son):
"Seeing your child finally understand — it's one of the best feelings. He meets James every Tuesday after school. They work through his homework together, and school feels less intimidating now. And it's one-on-one the whole time."

TIMING:
VO starts at 0.5s.
"one of the best feelings" finishes around 4.0s, right on the cut into Shot 2.
"every Tuesday after school" finishes around 7.0s, still in Shot 2.
"together" lands in Shot 3 around 10.0s, on the beat where he leans in and something starts to click.
"less intimidating now" finishes around 12.0s, on or just after the cut into Shot 4.
"whole" in "one-on-one the whole time" lands around 14.0s, on the fullest moment of the held smile.
"time" lands at 15.0s as the video ends.

Aesthetic: shot on an iPhone by a parent, not a film crew. Flat daylight. Natural skin texture, no airbrushing. No AI glow, no rim light, no golden-hour warmth, no teal-and-orange grading, no cinematic colour science, no dreamy bokeh, no shallow depth of field. Real Australian home kitchen, not styled. No logos on clothing. Only sound beyond the VO is faint kitchen ambience. No music. No on-screen text, no subtitles, no captions, no watermarks.`;

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
  console.log("  Resolution: 1080p | Aspect: 9:16 | Duration: 10s");
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
      duration: 10,
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
  const MAX_WAIT = 20 * 60 * 1000; // 20 minutes (longer video = more time)
  const INTERVAL = 10_000;
  const start = Date.now();

  console.log("Polling for results (timeout: 20 min)...\n");

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
      console.error(`  Reason: ${failMsg || "unknown"}`);
      console.error(JSON.stringify(resp.data, null, 2));
      process.exit(1);
    }

    await sleep(INTERVAL);
  }

  console.error("Timed out after 20 minutes.");
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
  console.log("Tutero Mum Ad — Seedance 2.0 Generate");
  console.log("=".repeat(60));
  console.log();
  console.log("Ad: 'Seeing your child finally understand'");
  console.log("Duration: 15s | 4 shots | Mum VO");
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

  console.log("\n✓ Video saved to public/input.mp4");
  console.log("  Run 'npm run render' to add TikTok text overlays and render final.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
