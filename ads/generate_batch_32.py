#!/usr/bin/env python3
"""Generate images for Ad Batch 32 — Happy Horizontal Splits.

5 variants of the 21B horizontal-split layout with happier, uplifting photos.
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
    # 32A — Girl smiling at laptop during online tutoring, genuine delight
    (
        "32a-she-smiles-now",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian girl (around 10–12 years old) sitting at a kitchen table or desk in a real Australian suburban home, looking at an open laptop with a genuine, wide smile — teeth showing, eyes crinkling. She has just understood something and her face shows real delight, not a posed grin. The laptop screen shows a blurred video call. A workbook and pencil sit beside her. Flat overhead household lighting, neutral white balance. Natural skin texture. The mood is warm and genuinely happy. Portrait 4:5 aspect, shot from slightly above at a three-quarter angle, focus on her face.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "32a-she-smiles-now.png"),
        "4:5",
    ),
    # 32B — Mum and daughter high-fiving at kitchen table, candid joy
    (
        "32b-high-five",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian mum (late 30s) and her daughter (around 9–11) at a kitchen table in a real Australian suburban home. They are mid high-five, both laughing — a natural, candid moment of celebration. Homework or a workbook is open on the table. A laptop sits to the side, lid half-open. The mum is leaning toward her daughter, both have genuine smiles. Flat household lighting from above. Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect, three-quarter view from slightly above capturing both faces.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "32b-high-five.png"),
        "4:5",
    ),
    # 32C — Child running happily through school gate, sunny morning
    (
        "32c-morning-run",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian primary-school-aged child (around 8–10, could be boy or girl) running happily through a school gate on a bright morning. The child has a backpack on and is mid-stride, looking forward with a big natural grin — eager, not posed. Other kids are blurred in the background. The school looks like a typical Australian public primary school — brick, low fences, gum trees. Natural morning daylight, NOT golden hour. Neutral white balance, natural skin texture. Portrait 4:5 aspect, shot from slightly ahead and to the side, capturing the child's happy expression and movement.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "32c-morning-run.png"),
        "4:5",
    ),
    # 32D — Child at desk, fist-pump moment after getting a question right
    (
        "32d-got-it",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian child (around 10–12, boy) at a desk in a real Australian suburban home, doing a small fist pump with one hand — the moment of getting a maths question right. He is looking at a workbook in front of him with a big, proud smile. A laptop is open to his left showing a blurred video call. The room is a normal bedroom or study nook — not perfectly tidy. Flat household lighting, slightly warm from a desk lamp. Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect, three-quarter view from the side capturing his face and the gesture.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "32d-got-it.png"),
        "4:5",
    ),
    # 32E — Mum and son laughing together at kitchen table, laptop open
    (
        "32e-kitchen-laugh",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian mum (early 40s) and her son (around 11–13) sitting side by side at a kitchen table in a real Australian suburban home, both laughing at something on a laptop screen in front of them. The mum has one arm around the boy's shoulder. Their body language is relaxed and connected — a genuine shared laugh, not a posed smile. A workbook and pen sit on the table. Flat overhead kitchen lighting. Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect, shot from across the table capturing both faces.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "32e-kitchen-laugh.png"),
        "4:5",
    ),
]

print(f"\nGenerating {len(tasks)} images for Batch 32...")
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
