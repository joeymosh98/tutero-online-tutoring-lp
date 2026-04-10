#!/usr/bin/env python3
"""Generate images for Ad Batch 18 — 1:1 Tutoring with Qualified Tutors"""

import requests
import os
import base64
import json
import concurrent.futures
import time

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

    # Format 1: content is list with image_url
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

    # Format 3: images array on message
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

# Define all image generation tasks
tasks = [
    # 18A — Workhorse: mum + son at kitchen, tutor on laptop screen
    (
        "18a-mum-son-tutor",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A woman and her primary-school-aged son sitting together at a kitchen counter. An open laptop in front of them shows a friendly young woman on screen mid-lesson via webcam. The kitchen is a typical Australian suburban kitchen with white cabinets. Both subjects smiling warmly at the camera. The son is wearing a school polo shirt. Flat overhead kitchen lighting, neutral colour temperature. Natural skin texture, slight phone camera compression.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "18a-mum-son-tutor.png"),
        "4:5",
    ),
    # 18B — Text-on-Photo: female tutor portrait
    (
        "18b-tutor-sophie",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A young woman in her mid-20s sitting at a desk in a home study with bookshelves behind her. She is smiling warmly and confidently at the camera. She has a laptop open in front of her. Natural casual clothing. The room has flat daylight from a window. Neutral colour temperature. Natural skin texture with visible pores. Slight phone camera compression. With clear space in the upper quarter and lower third for text overlay.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "18b-tutor-sophie.png"),
        "4:5",
    ),
    # 18D — Testimonial avatar: mum portrait
    (
        "18d-mum-testimonial",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A woman in her late 30s photographed from the chest up, in a bright suburban kitchen. She is smiling warmly and naturally, looking slightly off-camera. Wearing a casual top. Flat overhead kitchen lighting, neutral colour temperature. Natural skin texture. iPhone selfie quality with slight compression.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "18d-mum-testimonial.png"),
        "1:1",
    ),
    # 18E — Polaroid 1: mum + daughter at kitchen table
    (
        "18e-polaroid-1",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A woman and her primary-school-aged daughter sitting at a dining table with a laptop open in front of them. The daughter is looking at the screen concentrating. The mother has her hand on her daughter's shoulder. Typical Australian home dining area. Flat overhead lighting. Neutral colour temperature. Natural skin texture.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "18e-polaroid-1.png"),
        "4:5",
    ),
    # 18E — Polaroid 2: dad + teen son
    (
        "18e-polaroid-2",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A man and his teenage son sitting at a kitchen bench with a laptop between them. The son is pointing at something on the screen. Both look engaged and happy. Typical suburban Australian kitchen. Flat fluorescent lighting. Neutral colour temperature. Natural skin texture.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "18e-polaroid-2.png"),
        "4:5",
    ),
    # 18E — Polaroid 3: mum + teen daughter on couch
    (
        "18e-polaroid-3",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A woman and her teenage daughter sitting on a living room couch, both looking at a laptop on the daughter's lap. The daughter is smiling at something on screen. Warm but flat indoor lighting from a nearby window. Typical Australian suburban living room. Neutral colour temperature. Natural skin texture.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "18e-polaroid-3.png"),
        "4:5",
    ),
]

# 18C — Tutor Grid: 6 headshots
tutor_headshots = [
    ("18c-anna", "A young woman in her mid-20s with light brown hair, smiling warmly at camera. Indoor setting with bookshelves. Wearing a casual smart top."),
    ("18c-liam", "A man in his late 20s with short dark hair, smiling confidently at camera. Indoor setting with a whiteboard partially visible. Wearing a collared shirt."),
    ("18c-priya", "A woman in her early 30s with dark hair, smiling warmly at camera. Indoor setting with books on a shelf. Wearing a casual blouse."),
    ("18c-tom", "A young man in his mid-20s with light brown hair, smiling at camera. Indoor home office setting. Wearing a casual t-shirt."),
    ("18c-hannah", "A young woman in her early 20s with blonde hair, smiling brightly at camera. Indoor setting with colourful posters partially visible. Wearing a casual top."),
    ("18c-marcus", "A man in his late 20s with dark curly hair, smiling at camera. Indoor study setting with shelves. Wearing a casual button-up shirt."),
]

for name, desc in tutor_headshots:
    tasks.append((
        name,
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. Headshot portrait of {desc} Flat indoor lighting, neutral colour temperature. Natural skin texture with visible pores. iPhone photo quality.{ANTI_GLOW}",
        os.path.join(IMG_DIR, f"{name}.png"),
        "1:1",
    ))

# Run all tasks with max 4 concurrent workers
print(f"\nGenerating {len(tasks)} images for Batch 18...")
print("=" * 50)

results = {}
failures = {}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
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
