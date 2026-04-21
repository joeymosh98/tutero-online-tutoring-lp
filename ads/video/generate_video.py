#!/usr/bin/env python3
"""
Generate a video ad using Kie.ai Seedance 2 model.

Usage:
    python ads/video/generate_video.py

Requires KIE_API_KEY in .env file.
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(PROJECT_ROOT / ".env")

API_KEY = os.getenv("KIE_API_KEY")
if not API_KEY:
    print("Error: KIE_API_KEY not found in .env")
    sys.exit(1)

BASE_URL = "https://api.kie.ai/api/v1"
MODEL = "bytedance/seedance-2"

# ── Video Ad Prompt ──────────────────────────────────────────────────────────
# Based on Tutero marketing brain: UGC aesthetic, real homes, faces,
# outcome substitution (confidence not grades), Australianness.

PROMPT = (
    "Vertical 9:16 cinematic handheld shot, Australian suburban kitchen, "
    "flat overhead downlight lighting. An 11-year-old boy sits at a wooden "
    "dining table with a laptop open in front of him, wearing a plain navy "
    "t-shirt. He is on a video call with his tutor. His expression transitions "
    "from focused concentration to a bright genuine smile as he understands "
    "something, nodding enthusiastically at the screen. Behind him slightly "
    "out of focus, his mother stands at the kitchen bench holding a coffee mug, "
    "she notices his smile and her face softens into a warm smile too. Kitchen "
    "has typical Australian details — fruit bowl on the bench, cereal box, "
    "school backpack on a chair. Natural daylight from a window mixes with "
    "overhead kitchen light. Slight camera push-in, handheld micro-movements. "
    "Realistic skin textures, no airbrushing, no rim lighting, no golden hour "
    "glow. Phone-camera quality with gentle depth of field."
)


def api_request(method, path, data=None):
    """Make an authenticated request to the Kie.ai API."""
    url = f"{BASE_URL}{path}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    if data is not None:
        body = json.dumps(data).encode("utf-8")
    else:
        body = None

    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        print(f"API error {e.code}: {error_body}")
        sys.exit(1)


def check_credits():
    """Check remaining Kie.ai credits."""
    resp = api_request("GET", "/chat/credit")
    if resp.get("code") == 200:
        credit = resp.get("data", {})
        print(f"Credits remaining: {credit}")
    else:
        print(f"Could not check credits: {resp}")


def create_task():
    """Submit video generation task to Kie.ai."""
    payload = {
        "model": MODEL,
        "input": {
            "prompt": PROMPT,
            "generate_audio": True,
            "resolution": "1080p",
            "aspect_ratio": "9:16",
            "duration": 8,
            "web_search": False,
            "nsfw_checker": False,
        },
    }

    print(f"Submitting video generation task...")
    print(f"  Model: {MODEL}")
    print(f"  Resolution: 1080p")
    print(f"  Aspect ratio: 9:16")
    print(f"  Duration: 8s")
    print(f"  Audio: enabled")
    print()

    resp = api_request("POST", "/jobs/createTask", payload)

    if resp.get("code") != 200:
        print(f"Failed to create task: {resp}")
        sys.exit(1)

    task_id = resp["data"]["taskId"]
    print(f"Task created: {task_id}")
    return task_id


def poll_task(task_id, max_wait=900, interval=5):
    """Poll for task completion. Returns result URLs on success."""
    print(f"Polling for results (max {max_wait // 60} minutes)...")

    start = time.time()
    while time.time() - start < max_wait:
        resp = api_request("GET", f"/jobs/recordInfo?taskId={task_id}")

        if resp.get("code") != 200:
            print(f"Poll error: {resp}")
            time.sleep(interval)
            continue

        data = resp.get("data", {})
        state = data.get("state", "unknown")
        progress = data.get("progress", 0)
        elapsed = int(time.time() - start)

        print(f"  [{elapsed}s] State: {state} | Progress: {progress}%")

        if state == "success":
            result_json = json.loads(data.get("resultJson", "{}"))
            urls = result_json.get("resultUrls", [])
            return urls

        if state == "fail":
            fail_msg = data.get("failMsg", "Unknown error")
            print(f"Generation failed: {fail_msg}")
            sys.exit(1)

        # Gradually increase polling interval
        if elapsed > 120:
            interval = 15
        elif elapsed > 60:
            interval = 10

        time.sleep(interval)

    print("Timed out waiting for video generation.")
    sys.exit(1)


def get_download_url(temp_url):
    """Get a fresh download URL from the Kie.ai download endpoint."""
    print(f"Requesting download link from Kie.ai...")
    resp = api_request("POST", "/common/download-url", {"url": temp_url})
    if resp.get("code") == 200:
        data = resp.get("data", temp_url)
        # API returns data as a direct URL string
        download_url = data if isinstance(data, str) else data.get("downloadUrl", temp_url)
        print(f"Got download URL.")
        return download_url
    else:
        print(f"Download endpoint failed, trying direct URL...")
        return temp_url


def download_video(url, output_dir):
    """Download the generated video to the output directory."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    filename = "video-ad-01-the-moment-it-clicks.mp4"
    output_path = output_dir / filename

    # Get a fresh download link via the Kie.ai download endpoint
    download_url = get_download_url(url)

    print(f"Downloading video to {output_path}...")

    req = urllib.request.Request(download_url)
    req.add_header("User-Agent", "Mozilla/5.0")
    with urllib.request.urlopen(req) as resp:
        with open(output_path, "wb") as f:
            while True:
                chunk = resp.read(8192)
                if not chunk:
                    break
                f.write(chunk)

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"Downloaded: {output_path} ({size_mb:.1f} MB)")
    return output_path


def main():
    print("=" * 60)
    print("Tutero Video Ad Generator — Seedance 2")
    print("=" * 60)
    print()
    print("Ad: 'The Moment It Clicks'")
    print("Concept: Child smiles during online tutoring lesson,")
    print("         mum watches from kitchen bench.")
    print()

    # Check credits first
    check_credits()
    print()

    # Create the generation task
    task_id = create_task()
    print()

    # Poll until complete
    urls = poll_task(task_id)

    if not urls:
        print("No video URLs returned.")
        sys.exit(1)

    print()
    print(f"Generation complete! {len(urls)} video(s) ready.")
    print()

    # Download the video
    output_dir = PROJECT_ROOT / "ads" / "video" / "output"
    for i, url in enumerate(urls):
        print(f"Video URL {i + 1}: {url}")
        download_video(url, output_dir)

    print()
    print("Done! Add overlay text in post-production:")
    print('  0-2s: (no text)')
    print('  2-5s: "This is what 1-on-1 tutoring looks like."')
    print('  5-8s: "Book a 1-on-1 lesson" + tutero.com.au')


if __name__ == "__main__":
    main()
