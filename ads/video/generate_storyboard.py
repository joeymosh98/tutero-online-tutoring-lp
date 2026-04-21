#!/usr/bin/env python3
"""
Generate all storyboard clips + voiceover for the Tutero video ad.

Submits 5 Seedance 2 video tasks + 1 TTS task in parallel,
polls all to completion, downloads everything to remotion-ad/public/.

Usage:
    python ads/video/generate_storyboard.py
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(PROJECT_ROOT / ".env")

API_KEY = os.getenv("KIE_API_KEY")
if not API_KEY:
    print("Error: KIE_API_KEY not found in .env")
    sys.exit(1)

BASE_URL = "https://api.kie.ai/api/v1"
OUTPUT_DIR = Path(__file__).resolve().parent / "remotion-ad" / "public"

# ── Storyboard ───────────────────────────────────────────────────────────────
# Strategy: tight close-ups, minimal movement, 2.5s each, fast cuts hide AI.

CLIPS = [
    {
        "id": "clip-01-focus",
        "filename": "clip-01-focus.mp4",
        "duration": 4,
        "prompt": (
            "Tight close-up shot of an 11-year-old boy's face in a suburban "
            "kitchen, soft overhead downlight. He looks at a laptop screen "
            "just below camera with slightly furrowed brows, concentrating. "
            "Subtle micro-expressions, gentle blinks. Plain navy t-shirt. "
            "Kitchen background softly blurred — fruit bowl, window with "
            "daylight. Handheld micro-drift. Realistic skin texture, no "
            "airbrushing, no rim light, no golden hour. Shot on iPhone "
            "aesthetic, shallow depth of field. Vertical 9:16 framing."
        ),
    },
    {
        "id": "clip-02-click",
        "filename": "clip-02-click.mp4",
        "duration": 4,
        "prompt": (
            "Over-the-shoulder shot from behind an 11-year-old boy sitting "
            "at a wooden dining table. We see the back of his head and "
            "shoulder, and a laptop open in front of him with a soft glow "
            "on his face. He nods slowly and begins to smile. His hands "
            "rest on the table. Australian suburban kitchen background with "
            "flat overhead lighting. Slight handheld camera movement. "
            "Realistic, no filters, no airbrushing. Phone camera quality. "
            "Vertical 9:16 framing."
        ),
    },
    {
        "id": "clip-03-smile",
        "filename": "clip-03-smile.mp4",
        "duration": 4,
        "prompt": (
            "Mid-shot of an 11-year-old boy at a kitchen dining table, "
            "leaning back slightly with a wide genuine smile, eyes bright "
            "with understanding. He does a small celebratory fist pump. "
            "Laptop open on table in front of him. Wearing a plain navy "
            "t-shirt. Australian kitchen — overhead downlight, fruit bowl "
            "on bench behind, school backpack on a chair. Natural daylight "
            "from window. Handheld micro-drift, shallow depth of field. "
            "Realistic skin, no glow, no rim light. Vertical 9:16."
        ),
    },
    {
        "id": "clip-04-parent",
        "filename": "clip-04-parent.mp4",
        "duration": 4,
        "prompt": (
            "Medium shot of an Australian mother in her late 30s standing "
            "at a kitchen bench, holding a white coffee mug with both hands. "
            "She is looking off to the side toward her child (out of frame) "
            "with a soft warm smile of quiet pride. She wears a casual grey "
            "sweater. Modern Australian kitchen — overhead light, kettle, "
            "toaster on bench. Natural daylight from a window. Gentle "
            "handheld drift. Realistic, no airbrushing, no Instagram "
            "filter. Phone camera quality, shallow depth of field. "
            "Vertical 9:16 framing."
        ),
    },
    {
        "id": "clip-05-engaged",
        "filename": "clip-05-engaged.mp4",
        "duration": 4,
        "prompt": (
            "Close-up of an 11-year-old boy talking animatedly to a laptop "
            "screen, laughing and gesturing with one hand. He is clearly "
            "enjoying a conversation with someone on a video call. Bright "
            "engaged expression. Sitting at a wooden dining table. Overhead "
            "kitchen downlight, natural daylight. Slightly messy hair. "
            "Realistic skin texture, no airbrushing, no rim lighting. "
            "Handheld micro-movements, shallow depth of field. Phone "
            "camera aesthetic. Vertical 9:16 framing."
        ),
    },
]

# Full voiceover script — timed to match clip sequence
VOICEOVER_SCRIPT = (
    "You know that moment... when something finally clicks? "
    "That's what the right tutor does. "
    "Tutero tutors are the top one point three percent who apply. "
    "No contracts. Just real confidence. "
    "Book a free lesson at tutero dot com dot au."
)

VOICE_ID = "Charlie"  # Charlie — Australian male, casual preset


def api_request(method, path, data=None):
    """Make an authenticated request to the Kie.ai API."""
    url = f"{BASE_URL}{path}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        print(f"  API error {e.code}: {error_body}")
        return {"code": e.code, "error": error_body}


def submit_video_task(clip):
    """Submit a single Seedance 2 video generation task."""
    payload = {
        "model": "bytedance/seedance-2",
        "input": {
            "prompt": clip["prompt"],
            "generate_audio": False,
            "resolution": "1080p",
            "aspect_ratio": "9:16",
            "duration": clip["duration"],
            "web_search": False,
            "nsfw_checker": False,
        },
    }
    resp = api_request("POST", "/jobs/createTask", payload)
    if resp.get("code") == 200:
        task_id = resp["data"]["taskId"]
        print(f"  [{clip['id']}] Task created: {task_id}")
        return task_id
    else:
        print(f"  [{clip['id']}] Failed: {resp}")
        return None


def submit_tts_task():
    """Submit TTS voiceover generation task."""
    payload = {
        "model": "elevenlabs/text-to-speech-multilingual-v2",
        "input": {
            "text": VOICEOVER_SCRIPT,
            "voice": VOICE_ID,
            "stability": 0.55,
            "similarity_boost": 0.75,
            "style": 0.15,
            "speed": 0.95,
            "timestamps": False,
        },
    }
    resp = api_request("POST", "/jobs/createTask", payload)
    if resp.get("code") == 200:
        task_id = resp["data"]["taskId"]
        print(f"  [voiceover] Task created: {task_id}")
        return task_id
    else:
        print(f"  [voiceover] Failed: {resp}")
        return None


def poll_all_tasks(tasks, max_wait=900):
    """Poll all tasks until complete. tasks = {label: task_id}"""
    pending = dict(tasks)
    results = {}
    start = time.time()
    interval = 5

    while pending and (time.time() - start) < max_wait:
        elapsed = int(time.time() - start)

        for label, task_id in list(pending.items()):
            resp = api_request("GET", f"/jobs/recordInfo?taskId={task_id}")
            if resp.get("code") != 200:
                continue

            data = resp.get("data", {})
            state = data.get("state", "unknown")
            progress = data.get("progress", 0)

            if state == "success":
                result_json = json.loads(data.get("resultJson", "{}"))
                urls = result_json.get("resultUrls", [])
                results[label] = urls
                del pending[label]
                print(f"  [{elapsed}s] {label}: DONE ({len(urls)} file(s))")

            elif state == "fail":
                fail_msg = data.get("failMsg", "Unknown")
                print(f"  [{elapsed}s] {label}: FAILED — {fail_msg}")
                del pending[label]

        if pending:
            remaining = ", ".join(pending.keys())
            print(f"  [{elapsed}s] Waiting on: {remaining}")

            if elapsed > 120:
                interval = 15
            elif elapsed > 60:
                interval = 10

            time.sleep(interval)

    if pending:
        print(f"  Timed out waiting for: {', '.join(pending.keys())}")

    return results


def get_download_url(temp_url):
    """Get a signed download URL."""
    resp = api_request("POST", "/common/download-url", {"url": temp_url})
    if resp.get("code") == 200:
        data = resp.get("data", temp_url)
        return data if isinstance(data, str) else temp_url
    return temp_url


def download_file(url, output_path):
    """Download a file from a temp URL via the download endpoint."""
    download_url = get_download_url(url)
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
    print(f"  Downloaded: {output_path.name} ({size_mb:.1f} MB)")


def main():
    print("=" * 60)
    print("Tutero Storyboard Generator")
    print("5 clips (Seedance 2) + 1 voiceover (ElevenLabs)")
    print("=" * 60)
    print()

    # Check credits
    resp = api_request("GET", "/chat/credit")
    if resp.get("code") == 200:
        print(f"Credits: {resp.get('data')}")
    print()

    # ── Submit all tasks ──────────────────────────────────────────────────
    print("Submitting all tasks...")
    tasks = {}

    for clip in CLIPS:
        task_id = submit_video_task(clip)
        if task_id:
            tasks[clip["id"]] = task_id

    tts_task_id = submit_tts_task()
    if tts_task_id:
        tasks["voiceover"] = tts_task_id

    print(f"\n{len(tasks)} tasks submitted. Polling...\n")

    # ── Poll all tasks ────────────────────────────────────────────────────
    results = poll_all_tasks(tasks)

    # ── Download everything ───────────────────────────────────────────────
    print(f"\nDownloading {len(results)} results...\n")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for clip in CLIPS:
        if clip["id"] in results and results[clip["id"]]:
            url = results[clip["id"]][0]
            output_path = OUTPUT_DIR / clip["filename"]
            download_file(url, output_path)

    if "voiceover" in results and results["voiceover"]:
        url = results["voiceover"][0]
        output_path = OUTPUT_DIR / "voiceover.mp3"
        download_file(url, output_path)

    print("\n" + "=" * 60)
    print("All assets downloaded to remotion-ad/public/")
    print("Run: cd ads/video/remotion-ad && npx remotion studio")
    print("=" * 60)


if __name__ == "__main__":
    main()
