#!/usr/bin/env python3
"""Generate images for Ad Batch 19 — Affordable Tutoring (Experimental Layouts)

Only 19B (Storyboard Strip) needs photos. 19A and 19C are pure typography."""

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


def generate_image(prompt, save_path, aspect_ratio="1:1"):
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

# 19B Storyboard Strip — 3 band photos
tasks = [
    # Band 1: "Before" — child frustrated at homework
    (
        "19b-before",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A primary-school-aged Australian girl (about 10) sitting at a kitchen table with a maths workbook open in front of her. She is resting her chin on one hand, looking down at the page with a frustrated, disengaged expression — not crying, just quietly stuck. A pencil sits idle on the page. The kitchen is a typical Australian suburban kitchen with white cabinets and flat overhead lighting. Neutral white balance, slightly cool. Natural skin texture. Slight phone camera compression. The photo is cropped tight — head and shoulders with the workbook visible. Square framing.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "19b-before.png"),
        "1:1",
    ),
    # Band 2: "Week 3" — child engaged during tutoring
    (
        "19b-week3",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. The same primary-school-aged Australian girl (about 10) sitting at a kitchen table, this time looking at a laptop screen with an engaged, focused expression. She is leaning forward slightly, one hand raised as if about to ask a question. The laptop screen shows a video call (blurred tutor visible). A workbook is open beside the laptop with some writing on it. Same kitchen setting — white cabinets, flat overhead lighting. Neutral white balance. Natural skin texture. Slight phone camera compression. Square framing, head and shoulders with laptop visible.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "19b-week3.png"),
        "1:1",
    ),
    # Band 3: "Week 8" — child smiling, excited
    (
        "19b-week8",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. The same primary-school-aged Australian girl (about 10) at a dinner table, turned towards the camera (or towards where mum would be sitting) with a big, genuine smile. She looks happy and animated, as if she just asked an excited question. The setting is a typical Australian suburban dining area — wooden table, evening overhead light on, plates partially visible suggesting dinner time. Neutral white balance. Natural skin texture. Slight phone camera compression. Square framing, head and shoulders.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "19b-week8.png"),
        "1:1",
    ),
]

print(f"\nGenerating {len(tasks)} images for Batch 19...")
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
