import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

const INPUT = resolve(__dirname, "../public/input.mp4");
const OUTPUT = resolve(__dirname, "../out/tutero-mum-ad.mp4");

if (!existsSync(INPUT)) {
  console.error(`ERROR: ${INPUT} not found.`);
  console.error("Run 'npm run generate' first to create the Seedance video.");
  process.exit(1);
}

console.log("=".repeat(60));
console.log("Tutero Mum Ad — Render");
console.log("=".repeat(60));
console.log();
console.log("Input:  public/input.mp4");
console.log("Output: out/tutero-mum-ad.mp4");
console.log("Comp:   TuteroMumAd (1080×1920, 15s @ 30fps)");
console.log();
console.log("Rendering with Remotion...");

try {
  execSync(
    `npx remotion render TuteroMumAd ${OUTPUT} --codec=h264 --crf=18 --audio-bitrate=192k --concurrency=50%`,
    {
      cwd: resolve(__dirname, ".."),
      stdio: "inherit",
    }
  );
  console.log(`\n✓ Rendered: ${OUTPUT}`);
} catch {
  console.error("Render failed.");
  process.exit(1);
}
