#!/usr/bin/env python3
"""Generate images for Ad Batch 30 — The Walk In (Confidence is visible behavior)."""

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
POSITIVE EMPHASIS: Flat natural daylight. Neutral white balance. Natural skin
texture with visible pores. Real Australian public-school morning. iPhone photo
quality, not a stylised AI render."""


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
    # 30A — Mondays: bright sunny morning, kid mid-step walking to the gate, pep in step
    (
        "30a-mondays",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian primary-school-aged child (around 9–11) walking on a footpath toward a typical Australian public primary school gate on a bright sunny morning. The child is mid-stride with a small genuine smile, wearing a generic Australian school uniform (navy or dark shorts/skirt with a white or light polo, no identifiable logo) and a backpack. One hand holds a backpack strap, the other swings naturally. Clear blue sky with soft morning sun — not golden hour. The school gate, brick building and a painted entry sign vaguely visible in the background. A few other kids blurred further down the path. Framing: three-quarter body, angled slightly from the front, the child looking ahead (not at camera). Neutral white balance, natural skin texture with visible pores. Portrait 4:5 aspect.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "30a-mondays.png"),
        "4:5",
    ),
    # 30B — Walks in different: used as card background, so the child is the clear hero
    (
        "30b-walks-in-different",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. An Australian primary-school-aged girl (around 10) walking through the open gate of a typical Australian public primary school on a bright sunny morning. She is walking forward with confident, upright posture — shoulders back, head up, a relaxed small smile. She wears a generic navy and white Australian school uniform (no logos) and a backpack. Clear blue sky, direct but soft morning sun, green grass and a brick school building visible behind her. Framing: full body, slightly low angle, composed so the subject sits roughly centred and space remains at top and bottom of the frame (for a white card overlay in post). Neutral white balance. Natural skin texture with visible pores. Other children blurred in the background. Portrait 4:5 aspect.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "30b-walks-in-different.png"),
        "4:5",
    ),
    # 30C — Shoulders up: from behind, striding confidently, shoulders and bag visible
    (
        "30c-shoulders-up",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13 from behind, default camera app, no editing, no filter. An Australian primary-school-aged child (around 9–11) walking away from camera toward the gate of a typical Australian public primary school on a bright sunny morning. We see the child's back — shoulders visibly squared and lifted, backpack straps straight, walking with purpose. Generic Australian school uniform (navy or dark shorts/skirt, white or light polo, no logos). Clear blue sky, soft morning sun on the path. A brick school building and basic metal fence visible ahead. The shot is taken from a slight low angle behind, so the child is framed upper-centre with path leading forward. Natural white balance. Other kids blurred ahead. Portrait 4:5 aspect.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "30c-shoulders-up.png"),
        "4:5",
    ),
    # 30D — Not a pep talk: group of kids walking into school together, happy, sunny
    (
        "30d-not-a-pep-talk",
        f"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. A small group of three Australian primary-school-aged kids (around 9–11) walking together toward the gate of a typical Australian public primary school on a bright sunny morning. They're mid-conversation — one kid laughing, another talking, the third listening with a small smile. All wear generic Australian school uniforms (navy or dark shorts/skirts with white or light polos, no identifiable logos) and carry backpacks. Clear blue sky, soft direct morning sun, green grass and a brick school building in the background. Framing: three-quarter body, angled from the side so all three kids are visible walking forward. Not posed. Neutral white balance, natural skin texture. Portrait 4:5 aspect.{ANTI_GLOW}",
        os.path.join(IMG_DIR, "30d-not-a-pep-talk.png"),
        "4:5",
    ),
]

print(f"\nGenerating {len(tasks)} images for Batch 30...")
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
