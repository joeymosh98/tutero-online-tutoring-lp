#!/usr/bin/env python3
"""Generate images for Ad Batch 29 — Six Weeks (Confidence Timeline hypothesis)."""

import requests
import os
import base64
import time
import concurrent.futures

ANTI_GLOW = """
NEGATIVE / AVOID: AI glow, soft rim lighting, halo lighting, golden hour orange,
teal and orange grading, dreamy bokeh, smooth airbrushed skin, perfect symmetry,
cinematic colour science, HDR, over-saturated warm peachy skin tones, studio
lighting, fashion editorial, Pinterest mood board, stock photo, headset on child,
text or watermark, brand logos, perfect tidy environment, chalkboard, apple on desk,
graduation cap, corporate tutoring centre, 3D render, illustration.
POSITIVE EMPHASIS: Flat household lighting. Neutral white balance. Natural skin
texture with visible pores. Real Australian suburban home. iPhone photo quality,
not a stylised AI render."""


def generate_image(prompt, save_path, aspect_ratio="4:5"):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not found")

    print(f"  Generating: {os.path.basename(save_path)}...")
    start = time.time()

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "google/gemini-3.1-flash-image-preview",
            "messages": [{"role": "user", "content": prompt}],
            "image_config": {"aspect_ratio": aspect_ratio},
        },
        timeout=180,
    )

    if response.status_code != 200:
        raise ValueError(f"API error {response.status_code}: {response.text[:500]}")

    data = response.json()
    message = data["choices"][0]["message"]
    content = message.get("content")

    if isinstance(content, list):
        for part in content:
            if part.get("type") == "image_url":
                image_data = part["image_url"]["url"]
                if image_data.startswith("data:"):
                    image_data = image_data.split(",", 1)[1]
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(image_data))
                print(f"  ✓ {os.path.basename(save_path)} ({time.time()-start:.0f}s)")
                return save_path
            if "inline_data" in part:
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(part["inline_data"]["data"]))
                print(f"  ✓ {os.path.basename(save_path)} ({time.time()-start:.0f}s)")
                return save_path

    if "images" in message:
        for img in message["images"]:
            url = img.get("image_url", {}).get("url", "")
            if url.startswith("data:"):
                image_data = url.split(",", 1)[1]
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(image_data))
                print(f"  ✓ {os.path.basename(save_path)} ({time.time()-start:.0f}s)")
                return save_path

    if content is None:
        raise ValueError(f"Content filter triggered for {os.path.basename(save_path)}")

    raise ValueError(f"No image found for {os.path.basename(save_path)}")


IMG_DIR = os.path.join(os.path.dirname(__file__), "images")

tasks = [
    # 29A — Six weeks: kid smiling at laptop during a lesson, confident posture
    (
        "29a-six-weeks",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian primary-school-aged child (around 10–11) sitting at a kitchen or dining table, looking at a laptop screen with an engaged, smiling expression. Body is leaning slightly forward, pencil in hand, a workbook open beside the laptop with handwriting on it. The child looks confident and absorbed — not performing a smile, just genuinely into what they're doing. A partial blurred video-call window is visible on the laptop screen. Setting is a typical Australian suburban home — neutral kitchen or dining nook, flat overhead household lighting. Neutral white balance. Natural skin texture. Portrait 4:5 aspect, head-and-shoulders framing including the laptop and workbook.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "29a-six-weeks.png"),
        "4:5",
    ),
    # 29B — Week six: confident kid at desk (single image, not before/after split)
    (
        "29b-week-six",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian child (around 10–12) sitting upright at a kitchen or dining table, confident posture, writing in a workbook with visible calm concentration. A laptop sits open to the side with a blurred video call. The child has a relaxed, capable expression — eyebrows slightly raised, small private smile, as if the problem just made sense. Pencil tip touching the page mid-stroke. Setting is a real Australian suburban home — flat overhead household lighting, white-ish kitchen cabinets in the background. Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect, angled three-quarter view from slightly above.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "29b-week-six.png"),
        "4:5",
    ),
    # 29C — End of term: kid walking into school with lighter body language
    (
        "29c-end-of-term",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13 from behind, default camera app, no editing, no filter. An Australian primary-school-aged child (around 10–12) walking towards the gate of a typical Australian public primary or high school — brick buildings, a basic metal fence, a painted entry sign vaguely visible. The child is wearing a generic Australian school uniform (navy or dark shorts/skirt with a white or light polo, no identifiable logo) and carrying a backpack. Their body language is light — one hand swinging naturally, the other adjusting the backpack strap, head up and looking forward, not hunched. Early morning flat daylight, a bit overcast — not golden hour. Neutral white balance. The shot is taken from a slight distance behind and low angle, so we see the back of the child and the school gate ahead. Other kids blurred in the background. Portrait 4:5 aspect.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "29c-end-of-term.png"),
        "4:5",
    ),
    # 29D — First thing that changes: mum and daughter at kitchen island, daughter talking animatedly
    (
        "29d-first-thing",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian mum (late 30s–mid 40s) and her primary-school-aged daughter (around 10–11) at a kitchen island or bench. The mum is leaning on her elbows, listening, with a small warm smile. The daughter is in the middle of talking — mouth mid-sentence, one hand gesturing to explain something, looking animated and engaged. A plate with a half-eaten afternoon snack (fruit, a sandwich) is between them. The kitchen is a real suburban Australian kitchen with white or light cabinets and flat overhead lighting. Late afternoon daylight through a side window. Neutral white balance, natural skin texture. Portrait 4:5 aspect, three-quarter angle showing both faces, focus on the daughter.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "29d-first-thing.png"),
        "4:5",
    ),
]

print(f"\nGenerating {len(tasks)} images for Batch 29...")
print("=" * 50)

results = {}
failures = {}

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    futures = {
        executor.submit(generate_image, prompt, path, ar): name
        for name, prompt, path, ar in tasks
    }
    for future in concurrent.futures.as_completed(futures):
        name = futures[future]
        try:
            result = future.result()
            results[name] = result
        except Exception as e:
            failures[name] = str(e)
            print(f"  ✗ {name}: {e}")

print("\n" + "=" * 50)
print(f"✓ Generated: {len(results)}/{len(tasks)}")
if failures:
    print(f"✗ Failed: {len(failures)}")
    for name, err in failures.items():
        print(f"  - {name}: {err}")
print("Done!")
