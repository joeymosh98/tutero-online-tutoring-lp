#!/usr/bin/env python3
"""Generate images for Ad Batch 34 — Happy Older Teens (Horizontal Split).

4 variants of the horizontal-split layout with happy ~16-year-old students.
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
    # 34A — 16yo girl smiling at laptop during online tutoring, genuine happiness
    (
        "34a-finally-gets-it",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A 16-year-old Australian girl sitting at a desk in her bedroom in a real Australian suburban home, looking at an open laptop with a big, genuine smile — teeth showing, eyes bright. She has just understood something her tutor explained and her face shows real happy relief. The laptop screen shows a blurred video call. She wears a casual hoodie. A workbook, highlighters, and a water bottle sit beside the laptop. The room has posters on the wall, a messy school bag on the floor. Flat household lighting from overhead and a desk lamp. Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect, shot from slightly above at a three-quarter angle, focus on her happy face.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "34a-finally-gets-it.png"),
        "4:5",
    ),
    # 34B — 16yo boy leaning back from desk with a proud grin, just nailed a problem
    (
        "34b-nailed-it",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A 16-year-old Australian boy sitting at a desk in a real Australian suburban home bedroom or study nook. He is leaning back in his chair slightly with a proud, relaxed grin — he just got a difficult question right. One hand rests on an open workbook, pen down, the other hand behind his head. A laptop is open to the side showing a blurred video call. He wears a plain t-shirt. The desk is slightly messy with revision notes and a calculator. Flat household lighting. Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect, shot from slightly to the side at desk level, capturing his proud smile and relaxed posture.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "34b-nailed-it.png"),
        "4:5",
    ),
    # 34C — 16yo walking home from school smiling, earphones in, light and easy
    (
        "34c-walk-home",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A 16-year-old Australian student (girl) walking along a footpath on her way home from school. She is wearing an Australian high school uniform — polo shirt and shorts or skirt, school bag on one shoulder. She has earphones in and is smiling naturally, looking ahead — not at the camera. She looks relaxed and content, not posed. The background is a typical Australian suburban street with eucalyptus trees, low fences, and a few parked cars. Natural afternoon daylight, NOT golden hour, slightly overcast. Neutral white balance, natural skin texture. Portrait 4:5 aspect, shot from slightly ahead capturing her smile and walking stride.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "34c-walk-home.png"),
        "4:5",
    ),
    # 34D — 16yo teen and mum laughing at dinner table, relaxed happy evening
    (
        "34d-dinner-table",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A 16-year-old Australian boy and his mum (early 40s) sitting at a dinner table in a real Australian suburban home kitchen. They are both laughing — a genuine, candid moment mid-conversation over dinner. Plates of food are on the table, half-eaten. The teen is in a casual t-shirt, the mum in a simple top. Their body language is relaxed and connected. This is the kind of easy evening that happens when homework stress is gone. Flat overhead kitchen lighting, slightly warm. Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect, shot from across the table capturing both faces laughing.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "34d-dinner-table.png"),
        "4:5",
    ),
]

print(f"\nGenerating {len(tasks)} images for Batch 34...")
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
