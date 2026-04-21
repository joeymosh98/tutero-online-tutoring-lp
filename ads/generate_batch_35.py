#!/usr/bin/env python3
"""Generate images for Ad Batch 35 — Faculty Tutor Portraits.

6 variants of the winning 25A format: single tutor portrait, different people.
Same structure, different faces. Testing which tutor archetype performs best.
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
        raise ValueError(f"API error {response.status_code}: {response.text}")

    data = response.json()
    message = data["choices"][0]["message"]
    content = message.get("content")

    # Format 1: content is a list with image_url parts
    if isinstance(content, list):
        for part in content:
            if part.get("type") == "image_url":
                image_data = part["image_url"]["url"]
                if image_data.startswith("data:"):
                    image_data = image_data.split(",", 1)[1]
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(image_data))
                elapsed = time.time() - start
                print(f"    ✓ Saved ({elapsed:.1f}s)")
                return save_path
            if "inline_data" in part:
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(part["inline_data"]["data"]))
                elapsed = time.time() - start
                print(f"    ✓ Saved ({elapsed:.1f}s)")
                return save_path

    # Format 3 (most common): images array on message
    if "images" in message:
        for img in message["images"]:
            url = img.get("image_url", {}).get("url", "")
            if url.startswith("data:"):
                image_data = url.split(",", 1)[1]
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(image_data))
                elapsed = time.time() - start
                print(f"    ✓ Saved ({elapsed:.1f}s)")
                return save_path

    if content is None:
        raise ValueError("Content filter triggered — simplify prompt")

    raise ValueError(f"No image in response: {str(data)[:500]}")


# --- Prompts for 6 tutor portraits ---
# All: warm staged, looking at camera, friendly smile, home/office background
# Aspect ratio: 4:5 (Meta feed)

IMAGES = [
    {
        "name": "35a-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a friendly young woman in her mid-20s sitting at a desk
in a home study with a bookshelf behind her. She is looking directly at the camera
with a warm, genuine smile. She wears a casual navy jumper. The desk has a laptop
open beside her and a few notebooks. Flat overhead room lighting, neutral colour
temperature. Natural skin texture, slight freckles. Looks like an iPhone portrait
taken by a friend. Australian suburban home interior. She looks like a smart,
approachable university graduate who tutors on the side.{ANTI_GLOW}""",
    },
    {
        "name": "35b-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a friendly man in his early 30s sitting at a kitchen
table in a bright Australian home. He is looking directly at the camera with a
warm, confident smile. He wears a plain grey t-shirt. There's a laptop and a
coffee mug on the table. The kitchen has white cabinets and natural light from a
window (not golden hour — midday flat light). Natural skin texture, slight stubble.
Looks like an iPhone photo. He looks like a qualified, approachable tutor — smart
but relaxed.{ANTI_GLOW}""",
    },
    {
        "name": "35c-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a friendly woman in her early 30s sitting in a home
office nook. She is looking directly at the camera with a bright, natural smile.
She wears a light blue button-up shirt with sleeves rolled up. Behind her is a
white wall with a small pinboard and some books on a shelf. Flat room lighting,
neutral white balance. Natural skin texture, light makeup. Looks like an iPhone
photo taken during a video call break. She looks professional, warm, and like
someone you'd trust to teach your child.{ANTI_GLOW}""",
    },
    {
        "name": "35d-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a friendly young man in his mid-20s sitting at a desk
in a small study room. He is looking directly at the camera with an easy, genuine
smile. He wears a white t-shirt and has his hair slightly messy. Behind him are
textbooks on a shelf and a whiteboard with some notes. Flat fluorescent room
lighting, neutral colour temperature. Natural skin texture. Looks like an iPhone
photo taken in a real home study space. He looks like a recent graduate, smart and
approachable.{ANTI_GLOW}""",
    },
    {
        "name": "35e-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a warm, friendly woman in her late 30s sitting in a
living room on a couch. She is looking directly at the camera with a kind,
confident smile. She wears a simple olive green knit top. Behind her is a
typical Australian living room — cushions, a lamp, some framed photos on the
wall. Flat indoor lighting from an overhead fixture. Natural skin texture,
laugh lines visible. Looks like an iPhone photo. She looks experienced, warm,
like a trusted mentor.{ANTI_GLOW}""",
    },
    {
        "name": "35f-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a friendly man in his early 40s sitting at a wooden
dining table. He is looking directly at the camera with a warm, reassuring smile.
He wears a dark green henley shirt. Behind him is a bookshelf with books and a
plant. The room has flat overhead lighting, slightly cool white balance. Natural
skin texture, some grey at the temples. Looks like an iPhone photo taken by a
family member. He looks experienced, intelligent, trustworthy — like a senior
tutor who genuinely loves teaching.{ANTI_GLOW}""",
    },
]


def main():
    os.makedirs("ads/images", exist_ok=True)

    print(f"\n{'='*60}")
    print("BATCH 35 — Faculty Tutor Portraits (6 images)")
    print(f"{'='*60}\n")

    def gen(img):
        try:
            generate_image(
                prompt=img["prompt"],
                save_path=f"ads/images/{img['name']}",
                aspect_ratio="4:5",
            )
            return img["name"], True
        except Exception as e:
            print(f"    ✗ FAILED: {e}")
            return img["name"], False

    # Generate with 3 concurrent workers
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        results = list(executor.map(gen, IMAGES))

    print(f"\n{'='*60}")
    succeeded = sum(1 for _, ok in results if ok)
    print(f"Done: {succeeded}/{len(IMAGES)} images generated successfully")
    for name, ok in results:
        status = "✓" if ok else "✗"
        print(f"  {status} {name}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
