import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

const INPUT = resolve(__dirname, "../public/input.mp4");
const OUTPUT = resolve(__dirname, "../out/tutero-tuesday-night.mp4");

if (!existsSync(INPUT)) {
  console.error(`ERROR: ${INPUT} not found. Run generate first.`);
  process.exit(1);
}

console.log("=".repeat(60));
console.log("Tutero Seedance Ad — Render");
console.log("=".repeat(60));
console.log();
console.log("Rendering with Remotion...");

try {
  execSync(
    `npx remotion render TuteroTuesdayNight ${OUTPUT} --codec=h264 --crf=18 --audio-bitrate=192k --concurrency=50%`,
    {
      cwd: resolve(__dirname, ".."),
      stdio: "inherit",
    }
  );
  console.log(`\nRendered: ${OUTPUT}`);
} catch {
  console.error("Render failed.");
  process.exit(1);
}
