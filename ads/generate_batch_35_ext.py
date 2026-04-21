#!/usr/bin/env python3
"""Generate images for Ad Batch 35 extension — 7 more tutor portraits.

35G-35H: standard portraits
35I-35K: portraits for name-badge variant
35L: portrait for oversized stat layout (smaller in creative but still 4:5)
35M: close-up portrait for magazine cover layout
35N: no image needed (metric wall, text-only)
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


IMAGES = [
    {
        "name": "35g-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a friendly young woman in her mid-20s with dark curly
hair, sitting at a clean white desk in a bright room. She is looking directly at
the camera with a confident, warm smile. She wears a mustard yellow knit jumper.
Behind her is a simple white wall with a small shelf of books. Flat overhead
fluorescent lighting, neutral colour temperature. Natural skin texture with
visible pores. Looks like an iPhone photo taken by a colleague. Australian
suburban home office.{ANTI_GLOW}""",
    },
    {
        "name": "35h-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a friendly man in his late 20s with short dark hair and
a neat beard, sitting at a wooden desk in a spare bedroom turned study. He is
looking directly at the camera with a relaxed, genuine smile. He wears a plain
black t-shirt. Behind him are some textbooks, a desk lamp, and a window with
blinds letting in flat daylight. Neutral white balance, no warm tones. Natural
skin texture. Looks like an iPhone photo. He looks like a smart, approachable
young tutor.{ANTI_GLOW}""",
    },
    {
        "name": "35i-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a friendly woman named Sarah in her early 30s with
light brown hair in a loose ponytail, sitting in a bright kitchen nook. She is
looking directly at the camera with a genuine, warm smile. She wears a white
linen shirt. Behind her are white kitchen cabinets and a window. Flat kitchen
overhead lighting, cool white balance. Natural skin texture. Looks like an iPhone
photo. She looks like a trusted, qualified professional tutor.{ANTI_GLOW}""",
    },
    {
        "name": "35j-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a friendly young man in his mid-20s with light brown
wavy hair, sitting at a dining table in a modern Australian apartment. He is
looking directly at the camera with an easy, confident smile. He wears a navy
blue polo shirt. Behind him is a living area with a couch and some shelves. Flat
overhead lighting, neutral colour temperature. Natural skin texture, slight tan.
Looks like an iPhone photo. He looks like an approachable, smart tutor — the kind
parents would trust immediately.{ANTI_GLOW}""",
    },
    {
        "name": "35k-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a friendly young woman in her mid-20s with straight
dark hair, sitting at a desk with notebooks and a laptop. She is looking directly
at the camera with a bright, genuine smile. She wears a soft pink cardigan over
a white top. Behind her is a pinboard with notes and a bookshelf. Flat room
lighting, neutral white balance. Natural skin texture. Looks like an iPhone
photo taken in a real home study space. She looks like a dedicated, kind tutor
who genuinely cares about her students.{ANTI_GLOW}""",
    },
    {
        "name": "35l-tutor-portrait.png",
        "prompt": f"""Portrait photograph of a confident woman in her early 30s with auburn hair
tied back, standing in a doorway of a bright Australian home. She is looking
directly at the camera with a warm, assured smile. She wears a dark green blouse.
The hallway behind her is simple with neutral walls and a coat hook. Flat natural
daylight from a nearby window, no golden hour. Natural skin texture. Looks like
an iPhone photo. She looks like a highly qualified tutor — professional but
approachable.{ANTI_GLOW}""",
    },
    {
        "name": "35m-tutor-portrait.png",
        "prompt": f"""Close-up portrait photograph of a friendly man in his early 30s with short
brown hair and a clean-shaven face. He fills most of the frame, looking directly
at the camera with a warm, steady smile. He wears a charcoal grey crew-neck
jumper. The background is softly out of focus — a plain home interior, neutral
tones. Flat indoor lighting, cool white balance. Natural skin texture with
visible pores and light stubble shadow. Shot on iPhone, close range, like a
selfie taken at arm's length. He looks intelligent, trustworthy, and calm —
like the best tutor you could hope for.{ANTI_GLOW}""",
    },
]


def main():
    os.makedirs("ads/images", exist_ok=True)

    print(f"\n{'='*60}")
    print("BATCH 35 EXT — 7 more tutor portraits (35G–35M)")
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
