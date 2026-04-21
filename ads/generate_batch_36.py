#!/usr/bin/env python3
"""Generate 6 diverse student photos for batch 36 (confidence testimonial ad set)."""

import os
import json
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
if not API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not set in .env")

OUTPUT_DIR = Path(__file__).parent / "images"
OUTPUT_DIR.mkdir(exist_ok=True)

ANTI_GLOW = """
NEGATIVE / AVOID: AI glow, soft rim lighting, halo lighting, golden hour orange,
teal and orange grading, dreamy bokeh, smooth airbrushed skin, perfect symmetry,
cinematic colour science, HDR, over-saturated warm peachy skin tones, studio
lighting, fashion editorial, Pinterest mood board, stock photo, headset on child,
text or watermark, brand logos, perfect tidy environment.
POSITIVE EMPHASIS: Flat household lighting. Neutral white balance. Natural skin
texture with visible pores. Real Australian suburban home. iPhone photo quality,
not a stylised AI render."""

# Key composition note: These are for a full-bleed 4:5 ad where text covers the
# bottom 40%. Subject's face MUST be in the TOP THIRD of the frame.
# Framing: head-and-shoulders, looking at camera, face near top of image.
# Marketing to: Australian parents of school-age children (ages 8-16).

PROMPTS = {
    "36b-happy-student.png": (
        "Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, no filter. "
        "A boy standing outdoors in an Australian suburban park, looking slightly to the side "
        "with a natural genuine smile. He is wearing a light blue school polo shirt. "
        "Head and upper body visible in the upper half of the frame. "
        "Australian eucalyptus trees and green grass in the soft-focus background. "
        "Overcast Australian daylight, flat and neutral. No golden hour, no warm tones. "
        "Natural skin texture with visible pores. Slight phone camera compression." + ANTI_GLOW
    ),
    "36c-happy-student.png": (
        "Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, no filter. "
        "A girl walking through an Australian school oval, caught mid-laugh looking to the side. "
        "She is wearing a navy blue school polo shirt with her hair in a ponytail. "
        "Head and upper body in the upper half of the frame. "
        "Gum trees and a suburban fence line visible in soft focus behind her. "
        "Bright overcast Australian sky, flat neutral daylight. "
        "Natural skin texture, not retouched. Real candid moment." + ANTI_GLOW
    ),
    "36d-happy-student.png": (
        "Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, no filter. "
        "A boy standing in a green Australian backyard, smiling naturally and looking off to the side. "
        "He is wearing a maroon school polo shirt. School bag slung over one shoulder. "
        "Head and upper body in the upper half of the frame. "
        "Eucalyptus trees and a corrugated iron fence in the background. "
        "Overcast flat daylight, neutral colour temperature. "
        "Natural skin texture with pores visible. Candid relaxed pose." + ANTI_GLOW
    ),
    "36e-happy-student.png": (
        "Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, no filter. "
        "A girl standing outside on an Australian suburban street, "
        "looking to the side with a warm natural smile. She is wearing a teal school polo shirt. "
        "Head and upper body in the upper half of the frame. "
        "Australian native plants and a brick letterbox visible in soft-focus background. "
        "Overcast sky, flat neutral daylight. No golden hour. "
        "Natural skin texture, slight phone camera noise. Real candid feel." + ANTI_GLOW
    ),
    "36f-happy-student.png": (
        "Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, no filter. "
        "A boy leaning against a timber fence post in an Australian backyard, "
        "laughing naturally and looking to the side. He is wearing a grey school polo shirt. "
        "Head and upper body in the upper half of the frame. "
        "Australian suburban garden with native shrubs and a Hills hoist in background. "
        "Bright overcast daylight, flat and neutral. "
        "Natural skin texture, not airbrushed. Candid moment." + ANTI_GLOW
    ),
    "36g-happy-student.png": (
        "Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, no filter. "
        "A girl standing on a path in an Australian park, looking off to the side "
        "with a big genuine smile. She is wearing a white school polo shirt. "
        "Head and upper body in the upper half of the frame. "
        "Eucalyptus trees and green parkland behind her in soft focus. "
        "Overcast Australian daylight, flat neutral colour temperature. "
        "Natural skin texture with visible pores. iPhone photo quality." + ANTI_GLOW
    ),
}


def generate_image(filename: str, prompt: str) -> str:
    """Generate one image via OpenRouter / Gemini 3.1 Flash."""
    print(f"⏳ Generating {filename}...")
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://tutero.com.au",
        },
        json={
            "model": "google/gemini-3.1-flash-image-preview",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "image_config": {"aspect_ratio": "4:5"},
        },
        timeout=180,
    )
    resp.raise_for_status()
    data = resp.json()

    # Extract image from response - check message.images[] field
    msg = data["choices"][0]["message"]
    images = msg.get("images", [])
    if images:
        img_data = images[0]["image_url"]["url"]
    elif isinstance(msg.get("content"), list):
        for part in msg["content"]:
            if part.get("type") == "image_url":
                img_data = part["image_url"]["url"]
                break
        else:
            raise ValueError(f"No image in response for {filename}")
    else:
        raise ValueError(f"No image in response for {filename}")

    # Decode and save
    import base64
    if img_data.startswith("data:"):
        img_data = img_data.split(",", 1)[1]
    img_bytes = base64.b64decode(img_data)

    out_path = OUTPUT_DIR / filename
    out_path.write_bytes(img_bytes)
    print(f"✅ Saved {filename} ({len(img_bytes) // 1024} KB)")
    return str(out_path)


def main():
    print(f"Generating {len(PROMPTS)} student photos for batch 36...\n")
    results = {}

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(generate_image, fname, prompt): fname
            for fname, prompt in PROMPTS.items()
        }
        for future in as_completed(futures):
            fname = futures[future]
            try:
                path = future.result()
                results[fname] = path
            except Exception as e:
                print(f"❌ Failed {fname}: {e}")
                results[fname] = None

    success = sum(1 for v in results.values() if v)
    print(f"\n{'='*50}")
    print(f"Done: {success}/{len(PROMPTS)} images generated successfully.")


if __name__ == "__main__":
    main()
