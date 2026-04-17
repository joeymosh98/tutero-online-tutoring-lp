#!/usr/bin/env python3
"""Generate images for Ad Batch 31 — Social Proof (3,200 Families hypothesis).

Only 2 images needed — 31A uses pure typography, 31B uses an inline SVG map.
"""

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
    # 31C — Mum and daughter at kitchen table, warm trust moment
    (
        "31c-never-met",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian mum (late 30s–mid 40s) and her primary-school-aged daughter (around 9–11) at a kitchen table or island in a real Australian suburban home. The mum is leaning in close with a warm, proud smile, one hand lightly on the daughter's shoulder. The daughter is writing in a workbook and looking up at her mum with a small, pleased expression — not posed, like the mum has just noticed her get a question right. A laptop sits open to the side with a blurred video-call window visible. Flat overhead household lighting. Neutral white balance. Natural skin texture with visible pores. Portrait 4:5 aspect, three-quarter view showing both faces with focus on the daughter.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "31c-never-met.png"),
        "4:5",
    ),
    # 31D — Mum on couch at night, laptop open, the moment of deciding
    (
        "31d-not-the-first",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian mum (late 30s–mid 40s) sitting on a couch in the living room of a real Australian suburban home, late evening. A laptop is open on her lap, and she is looking at it with a thoughtful, considering expression — head tilted slightly, one hand near her chin. A warm side-lamp gives the room a low-key, late-night feel; not golden, just a real warm lamp in a real lounge. A cup of tea or a glass of water sits on the coffee table. She is wearing casual clothes (a jumper or cardigan). No phone visible. The rest of the house is dim; a quiet moment after the kids are in bed. Framing: three-quarter from the side, eye level, the mum sits centred with the laptop catching some of her face light. Neutral white balance, natural skin texture. Portrait 4:5 aspect.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "31d-not-the-first.png"),
        "4:5",
    ),
]

print(f"\nGenerating {len(tasks)} images for Batch 31...")
print("=" * 50)

results = {}
failures = {}

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
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
