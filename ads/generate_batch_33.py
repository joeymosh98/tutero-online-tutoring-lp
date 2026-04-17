#!/usr/bin/env python3
"""Generate images for Ad Batch 33 — Senior Student Urgency.

4 variants targeting parents of Year 10–12 students.
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
    # 33A — Year 12 student at desk, focused and determined
    (
        "33a-year-twelve",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A 16-year-old Australian girl sitting at a desk in her bedroom in a real Australian suburban home. She has textbooks and a lined workbook open in front of her, pen in hand, writing. Her expression is focused and quietly determined — not stressed, not smiling, just locked in. She wears a plain t-shirt. The desk has a few revision notes stuck to the wall behind her. A water bottle sits beside the books. Flat household lighting from a desk lamp and overhead light. Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect, shot from slightly to the side at desk level.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "33a-year-twelve.png"),
        "4:5",
    ),
    # 33B — Teenage student working confidently at laptop in quiet study space
    (
        "33b-stopped-guessing",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A 16-year-old Australian boy sitting at a desk in a quiet study nook or bedroom in a real Australian suburban home. He is working at an open laptop, leaning forward slightly with a look of quiet confidence — he understands what he's doing. One hand is on the keyboard, the other resting on an open textbook. The room is slightly messy — a school bag on the floor, some papers scattered. Flat household lighting. Neutral white balance, natural skin texture. Portrait 4:5 aspect, shot from a three-quarter angle slightly above desk level, focus on his face and the laptop.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "33b-stopped-guessing.png"),
        "4:5",
    ),
    # 33C — Senior student in online tutoring session, writing notes
    (
        "33c-senior-split",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A 16-year-old Australian student (girl) sitting at a kitchen table or desk in a real Australian suburban home, in an online tutoring session. She is writing notes in a workbook while glancing at a laptop screen that shows a blurred video call with a tutor. She looks engaged and focused — not bored, not overly happy, just working. She wears a school polo or casual top. A glass of water and pencil case sit on the table. Flat household lighting from above. Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect, shot from the side capturing her writing and the laptop screen.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "33c-senior-split.png"),
        "4:5",
    ),
    # 33D — Focused teenager studying with notes and laptop, calm and prepared
    (
        "33d-before-exams",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A 17-year-old Australian student (boy) sitting at a dining table in a real Australian suburban home, calmly studying. He has a laptop open, a textbook, and colour-coded handwritten notes spread out neatly in front of him. His expression is calm, prepared, not stressed — the look of someone who has been building toward this for weeks. He wears a hoodie. A mug of tea sits to his side. Late afternoon flat household lighting. Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect, shot from across the table at a slight angle, capturing the study setup and his calm face.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "33d-before-exams.png"),
        "4:5",
    ),
]

print(f"\nGenerating {len(tasks)} images for Batch 33...")
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
