import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

const skipGenerate = process.argv.includes("--skip-generate");
const inputPath = resolve(__dirname, "../public/input.mp4");
const cwd = resolve(__dirname, "..");

if (skipGenerate) {
  if (!existsSync(inputPath)) {
    console.error(
      "ERROR: --skip-generate passed but public/input.mp4 does not exist."
    );
    console.error("Run without --skip-generate first.");
    process.exit(1);
  }
  console.log("Skipping generation (--skip-generate). Using existing input.mp4.\n");
} else {
  console.log("Step 1/2: Generate video\n");
  execSync("npx tsx scripts/generate.ts", { cwd, stdio: "inherit" });
  console.log();
}

console.log("Step 2/2: Render composition\n");
execSync("npx tsx scripts/render.ts", { cwd, stdio: "inherit" });

console.log("\n" + "=".repeat(60));
console.log("Done! Final video: out/tutero-tuesday-night.mp4");
console.log("=".repeat(60));
