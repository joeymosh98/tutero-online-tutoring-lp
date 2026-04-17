#!/usr/bin/env python3
"""Generate images for Ad Batch 28 — Start Where She's Stuck (Switcher hypothesis)."""

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
    # 28A — Homework supervision: kid slumped over scattered worksheets
    (
        "28a-homework-supervision",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian primary-school-aged child (around 10–11, could be boy or girl) sitting at a kitchen table surrounded by scattered maths worksheets and a partially-open textbook. A laptop is open beside them. The child is slumped forward, chin on one hand, pencil drooping, staring blankly at the page with a quietly defeated expression — not crying, just checked out. Scene is a real Australian suburban kitchen in afternoon — flat overhead lighting, neutral white balance. Some worksheets are crumpled at the edges. The framing is a three-quarter angle from slightly above, capturing the child, the mess of worksheets, and the open laptop. Portrait orientation, 4:5 aspect.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "28a-homework-supervision.png"),
        "4:5",
    ),
    # 28B — Chapter eleven: close-up of textbook mid-way through with a bookmark
    (
        "28b-chapter-eleven",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. Close-up top-down flat-lay of an Australian school maths textbook open to a page mid-way through the book (clearly well past chapter one — you can see the thickness of pages on the left side vs the right side). A thin paper bookmark or folded corner marks a specific line on the page. A pencil with a slight eraser mark sits beside the book. The page shows handwritten working-out in blue pen, not neat — with a crossed-out attempt. The surface is a real suburban kitchen bench or dining table with a natural wood or laminate finish. Flat overhead household lighting. Neutral white balance. Some natural imperfection — a water ring, a crumb. Portrait 4:5 aspect, cropped so the textbook fills most of the frame.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "28b-chapter-eleven.png"),
        "4:5",
    ),
    # 28C — Last tutor didn't work: mum on phone looking tired, kid at table
    (
        "28c-last-tutor",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian mum (late 30s–mid 40s) stands in her kitchen holding her phone to her ear, leaning against the counter with a tired expression — eyes tired, slight frown, head tilted slightly. Her child (around 10–12) is visible behind her in soft focus, sitting at the dining table with schoolwork out. The kitchen is a real suburban Australian home — white cabinets, some clutter (keys on the bench, a lunchbox, a dish in the sink). Late afternoon flat lighting from a window. Neutral white balance. Natural skin texture, no makeup heavy. The mum is the focus in the foreground; the kid is in the background. Portrait 4:5 aspect.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "28c-last-tutor.png"),
        "4:5",
    ),
    # 28D — Starting point: mum on couch late evening with laptop
    (
        "28d-starting-point",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian mum (late 30s–mid 40s) sitting on a couch late in the evening, wearing comfortable at-home clothes (a cardigan or hoodie). She is holding her phone in one hand and has a laptop open on the couch beside her. Her expression is thoughtful, a little tired, concentrating — she is in the middle of researching something. The room lighting is low and warm from a single lamp, but NOT golden-hour cinematic — just a real suburban living room at night. A cup of tea or water bottle sits on the coffee table. Slight natural grain from low light. Neutral-to-cool white balance. Portrait 4:5 aspect, shot from an angle that shows her, the phone, the laptop, and the couch.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "28d-starting-point.png"),
        "4:5",
    ),
]

print(f"\nGenerating {len(tasks)} images for Batch 28...")
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
