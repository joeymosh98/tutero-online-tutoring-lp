---
name: tutoring-image-generator-australia
description: Generate and optionally render tutoring marketing images for Tutero — landing pages, ads, email, organic social — with a strong default toward the proven Australian paid social aesthetic. Use whenever the user asks to "make an image", "generate a photo", "create an ad image", "write an image prompt", "render this", mentions "tutoring image", "ad creative", "carousel image", "tutor grid", "school gate photo", "Nano Banana", "Nano Banana 2", or wants visuals that look like real Australian families and not like AI. For Australian paid social specifically, this skill defers to `paid-social-winner-insights-australia` for which pattern to choose, then generates the prompt and (when asked) renders the image via Nano Banana 2 through OpenRouter. Trigger ahead of `tutero-brand` and `tutero-tutoring-parent-copy-australia` whenever the deliverable is the image itself.
---

# Tutoring Image Generator — AU Edition

This skill generates image prompts and renders images for Tutero tutoring marketing. It is built around one hard-won lesson from analysing 12 winning Australian Meta ads:

> **The winning aesthetic is flat, bright, sober, and unmistakably Australian. It is the opposite of what AI image generators want to make.**

Every default in this skill exists to fight AI's natural tendency toward golden-hour glow, dreamy bokeh, smooth skin, warm cinematic grading, and stock-photo perfection. If your output looks like a Pinterest mood board, you have failed.

---

## When to use this skill

Use this skill whenever the deliverable is **the image itself** — a hero shot, a Meta ad photo, a carousel card, an email header, a social post background.

**Workflow for Australian paid social** (the most common case):

1. Read `paid-social-winner-insights-australia` first. Pick which winning pattern you're executing (tutor grid? school-gate hug? whole-transaction frame? testimonial portrait?).
2. Come back here. Look up that pattern in `references/au-winning-compositions.md` to get the exact prompt skeleton.
3. Fill in the persona variables from `references/persona-templates.md` if you're targeting a named archetype.
4. Apply the universal anti-AI-glow rules from `references/aesthetic-rules.md`.
5. Render via Nano Banana 2 (instructions below) OR hand off the prompt for someone else to render.

**Workflow for everything else** (US-FL, US-general, UK, organic social, hero images, retargeting testimonials):

1. Pick a mode (see below).
2. Use the relevant template in `references/au-winning-compositions.md` or `references/persona-templates.md` and adapt for region using `references/regions-and-platforms.md`.
3. Render or hand off.

---

## The Two Modes

There is no single "right" tutoring image. There are two modes, and picking the wrong one is the most common failure.

### Mode A — Warm Staged (DEFAULT for AU paid social)

This is the winning AU pattern. People look at the camera. People smile. People give thumbs up. The lighting is the household kitchen overhead or harsh midday sun through venetian blinds. The photo looks like a Tutero staffer took it on an iPhone during a real session.

**Use Warm Staged for:**
- Meta feed ads (1:1, 4:5)
- Meta Story / Reel stills (9:16)
- Tutor grids
- Whole-transaction frames (parent + child + tutor on screen)
- Thumbs-up / waving / hugging compositions
- Anything that needs to stop the scroll on a cold AU audience

**Warm Staged rules:**
- Subject CAN look at camera
- Subject CAN smile broadly
- Posed-but-natural (the way real families pose for a phone snap)
- Flat, bright, neutral overhead light — kitchen lights ON, blinds OPEN
- Colour temperature: neutral to slightly cool. Never warm orange.
- One clear focal point, legible at 300px thumbnail

### Mode B — Candid Real

This is the documentary/observational mode. Subject is unaware of the camera. Concentrating, working, mid-moment. Use sparingly — it looks beautiful but doesn't convert as well on cold paid social.

**Use Candid Real for:**
- Hero images on landing pages
- Email headers (warm retention tone)
- Organic social storytelling
- Retargeting creative where the parent already knows the brand
- Blog post headers
- Testimonial supporting imagery

**Candid Real rules:**
- Subject does NOT look at camera
- No big smiles — quiet concentration, mild relief, small private smiles
- Off-angle composition
- Window light from one side acceptable, but still avoid golden-hour cliché
- Slight imperfection (water bottle, scattered papers) welcome

### Picking a mode

| If... | Use |
|---|---|
| AU + paid social + cold audience | Warm Staged |
| AU + paid social + retargeting | Candid Real OR Warm Staged testimonial |
| AU + landing page hero | Candid Real |
| AU + email header | Candid Real |
| AU + organic social | Either, lean Candid Real |
| US-FL + paid social | Warm Staged (adapt to FL aesthetic) |
| Any region + tutor headshot grid | Warm Staged always |

When in doubt for AU paid social: **Warm Staged**.

---

## The non-negotiable anti-AI-glow rules

These apply to BOTH modes. Every prompt must enforce them. Full list and reasoning in `references/aesthetic-rules.md`.

**Banned visual qualities (always include in negative prompt):**

- AI glow / soft halo / rim light around subjects
- Golden hour orange grade
- Teal and orange colour grading
- Dreamy bokeh / extreme background blur
- Smooth airbrushed skin
- Perfect symmetrical composition
- Cinematic colour science
- HDR look
- Over-saturated warm peachy skin tones
- Studio lighting setup
- Fashion editorial aesthetic
- Pinterest mood board feel
- Generic "diverse stock group" arrangement
- Apple-on-desk / chalkboard / graduation cap clichés
- Headsets on children
- Corporate tutoring centre interiors

**Required visual qualities (always include in positive prompt):**

- "Flat fluorescent or daylight household lighting"
- "Neutral colour temperature"
- "Natural skin texture, not retouched"
- "Looks like an iPhone photo taken indoors"
- "Real Australian home interior" (or relevant region)
- "Slight compression and sensor noise of a phone camera"

---

## Calling Nano Banana 2 via OpenRouter

When the user asks you to **render** (not just write a prompt), you generate the image yourself by calling Nano Banana 2 through OpenRouter.

**Model:** `google/gemini-3.1-flash-image-preview`
**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
**API key:** stored in environment variable `OPENROUTER_API_KEY`
**Pricing:** $0.50/M input tokens, $3/M output tokens (cheap — don't be precious about iterating)

### The reference function

Use this Python function. It handles **all three** response formats Nano Banana can return via OpenRouter. The most common format in practice is Format 3 (`message.images[]`), but you must handle all three.

**Critical gotchas learned from production use:**

1. **Timeout must be 180s** — Nano Banana can take 60–120s for complex scenes. 120s will intermittently fail.
2. **Content filter** — Detailed descriptions of specific people (age, ethnicity, clothing, setting all together) can trigger OpenRouter's content filter, returning `content: null`. Fix: simplify the prompt — remove ethnicity/age specifics, keep the scene and mood.
3. **`content` can be `null`** — Always check for `None`/`null` before treating `content` as a list. If `content` is `null`, skip straight to checking `message.images`.
4. **The `message.images[]` format is the most common** — Don't assume `content` will contain the image. Most successful generations return the image in `message.images[].image_url.url` as a base64 data URI.

```python
import requests
import os
import base64
import json

def generate_image(
    prompt: str,
    save_path: str = "/tmp/generated.png",
    aspect_ratio: str = "1:1",
) -> str:
    """
    Generate an image with Nano Banana 2 via OpenRouter.

    Args:
        prompt: The full image prompt (positive description, no negative).
                Negative qualities should be phrased positively where possible
                (e.g. "natural skin texture" not "no smooth skin").
        save_path: Where to write the resulting PNG.
        aspect_ratio: One of "1:1", "4:5", "9:16", "16:9", "3:2", "2:3".

    Returns:
        The path to the saved image file.

    Raises:
        ValueError: If no image is found in the response (content filter
                     or unsupported response format).
    """
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not found in environment variables")

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "google/gemini-3.1-flash-image-preview",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "image_config": {"aspect_ratio": aspect_ratio},
        },
        timeout=180,  # Nano Banana can take 60-120s; 120s times out intermittently
    )

    if response.status_code != 200:
        raise ValueError(f"OpenRouter API error {response.status_code}: {response.text}")

    data = response.json()
    message = data["choices"][0]["message"]
    content = message.get("content")

    # Format 1: content is a list of multimodal parts with image_url
    if isinstance(content, list):
        for part in content:
            if part.get("type") == "image_url":
                image_data = part["image_url"]["url"]
                if image_data.startswith("data:"):
                    image_data = image_data.split(",", 1)[1]
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(image_data))
                return save_path
            # Format 2: Gemini-native inline_data
            if "inline_data" in part:
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(part["inline_data"]["data"]))
                return save_path

    # Format 3 (MOST COMMON): images array on the message object
    # This is the format Nano Banana 2 uses most often via OpenRouter.
    # content may be null/None when the image is returned here instead.
    if "images" in message:
        for img in message["images"]:
            url = img.get("image_url", {}).get("url", "")
            if url.startswith("data:"):
                image_data = url.split(",", 1)[1]
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(image_data))
                return save_path

    # If content is null/None and no images field, the content filter likely
    # blocked the request. Simplify the prompt and retry.
    if content is None:
        raise ValueError(
            "Content filter triggered — response returned content: null with no "
            "images. Simplify the prompt: remove specific age/ethnicity details, "
            "keep the scene and mood description general."
        )

    raise ValueError(
        f"No image found in response. Raw preview:\n{json.dumps(data, default=str)[:1500]}"
    )
```

### Content filter workaround

If a prompt triggers the content filter (you get `content: null` and no `images` field), do NOT just retry the same prompt. Instead:

1. **Remove specificity about the person** — don't specify exact age, ethnicity, or detailed physical description. Say "a woman" not "a 38-year-old Australian woman with shoulder-length brown hair".
2. **Keep the scene and mood** — the setting, lighting, and emotional tone are what matter for the ad.
3. **Keep the anti-glow suffix** — the filter isn't triggered by the negative prompt.

Example of simplifying:
```
# TOO SPECIFIC (may trigger filter):
"Australian mum in her late 30s with shoulder-length auburn hair wearing a navy
Kathmandu puffer vest, sitting at a weathered timber dining table..."

# SIMPLIFIED (passes filter):
"A woman sitting at a kitchen table with her son, both laughing over dinner.
Suburban kitchen, flat overhead light..."
```

### Aspect ratios for placements

| Placement | aspect_ratio value |
|---|---|
| Meta Feed | `4:5` |
| Meta Square | `1:1` |
| Meta Story / Reel | `9:16` |
| Landing page hero | `16:9` |
| Email header | `16:9` (then crop) |
| Carousel card | `1:1` |
| Tutor headshot for grid | `1:1` |

### The ANTI_GLOW suffix

Append this suffix to **every** image prompt. It's the single most important thing for making Nano Banana output look real instead of AI-generated.

```python
ANTI_GLOW = """
NEGATIVE / AVOID: AI glow, soft rim lighting, halo lighting, golden hour orange,
teal and orange grading, dreamy bokeh, smooth airbrushed skin, perfect symmetry,
cinematic colour science, HDR, over-saturated warm peachy skin tones, studio
lighting, fashion editorial, Pinterest mood board, stock photo, headset on child,
text or watermark, brand logos, perfect tidy environment.
POSITIVE EMPHASIS: Flat household lighting. Neutral white balance. Natural skin
texture with visible pores. Real Australian suburban home. iPhone photo quality,
not a stylised AI render."""
```

### Calling pattern

```python
# 1. Build the prompt using a template from references/au-winning-compositions.md
prompt = f"""Photograph of a woman and her primary-school son sitting together at
a kitchen counter, both looking at the camera and giving a thumbs up. An open
laptop sits in front of them showing a friendly female tutor on screen mid-lesson
(slightly pixelated webcam quality). The kitchen is a typical Australian suburban
kitchen with white cabinets and tiled splashback. Flat overhead kitchen lighting,
neutral colour temperature, looks like an iPhone photo taken on a weekday afternoon.
Natural skin texture, no retouching, slight phone camera compression. Both subjects
smiling naturally, mum has her arm casually around son's shoulder.{ANTI_GLOW}"""

# 2. Render
image_path = generate_image(
    prompt=prompt,
    save_path="ads/images/mum_son_thumbsup.png",
    aspect_ratio="4:5",
)

# 3. Always view the result before delivering — Nano Banana sometimes ignores
#    instructions and produces AI-glow output. If it does, regenerate with
#    stronger anti-glow language.
```

**Important:** Always view the rendered image before delivering. If it has AI glow, golden grade, or smooth airbrushed skin, regenerate with one of these escalations:

1. Add more force: prepend `"Documentary photograph, NOT a stylised AI image. Plain household lighting only."`
2. Name a real device: `"Shot on iPhone 13, default camera app, no editing, no filter."`
3. Strip warmth explicitly: `"Cool white fluorescent kitchen lighting. Neutral white balance. No warm orange tones anywhere in the image."`

If three regenerations still produce AI glow, switch to a different composition — Nano Banana sometimes locks onto a "premium" interpretation of certain scenes (especially tutor portraits) that it won't let go of.

### Iteration workflow

Nano Banana is cheap and fast. Iterate aggressively:

1. Generate 1 image from the chosen template.
2. View it. Score against the anti-AI-glow checklist.
3. If it fails: rewrite the prompt, regenerate.
4. Once you have a winner: generate 2 more variants (different age, different room, different angle) for A/B testing.
5. Present all three to the user via `present_files`.

---

## Output format

When the user asks for an **image prompt only** (no rendering):

```
## Prompt
[full prompt, ready to paste]

## Aspect ratio
[1:1 / 4:5 / 9:16 / 16:9]

## Mode
[Warm Staged / Candid Real]

## Winning move(s) executed
[which moves from paid-social-winner-insights-australia this prompt is hitting]

## Why this prompt
[one sentence on what it does and why it converts]
```

When the user asks you to **render**:

1. Build the prompt as above (silently — no need to print it first).
2. Generate the image with `generate_image()`.
3. View the result.
4. If it passes the checklist, generate 2 more variants.
5. Present all images via `present_files`.
6. Then print a brief note: which mode, which winning move, what to test next.

---

## Pre-flight checklist (run before rendering OR before delivering a prompt)

**Anti-AI-glow** (every image, both modes):
- [ ] Negative prompt includes: AI glow, golden hour, soft rim light, dreamy bokeh, smooth skin, cinematic grading, HDR, studio lighting
- [ ] Positive prompt includes: flat household lighting, neutral colour temperature, natural skin texture, iPhone photo feel
- [ ] Background is a real home/school/kitchen — not a studio or "modern classroom"
- [ ] No headsets, apples on desks, chalkboards, or graduation caps

**AU paid social specific** (skip for non-AU or organic):
- [ ] Mode is Warm Staged unless there's a specific reason for Candid Real
- [ ] At least one Australianness signal (uniform / flag / school gate / AU home interior / AU curriculum on worksheet)
- [ ] Composition matches a named winning pattern from `paid-social-winner-insights-australia`
- [ ] Person on screen if it's a parent+child+laptop frame (Move 6)
- [ ] Persona is named or visually obvious — not "generic family"

**Craft** (every image):
- [ ] Subject readable at 300px thumbnail
- [ ] Text overlay zone left clear if this is going into an ad
- [ ] Aspect ratio matches placement
- [ ] Skin tones look natural, not warm peachy
- [ ] Composition is single-focal-point, not busy

If any box fails: rewrite or regenerate. Don't ship.

---

## Cross-references

- **`paid-social-winner-insights-australia`** — read FIRST for AU paid social. Tells you which pattern to execute.
- **`tutero-tutoring-parent-copy-australia`** — for the headline/body copy that goes alongside the image.
- **`tutero-brand`** — for any branded overlay placed on top of the rendered image (logo, ticks, headline, CTA).
- **`tutero-florida-sufs-creative-designer`** — for Florida-specific creative; this skill defers to it for FL.
- **`tutero-ai-creative-designer`** — for tutero.ai (schools) creative; this skill defers to it for schools.

## Reference files in this skill

- `references/au-winning-compositions.md` — the six core AU winning compositions, each as a fillable prompt template
- `references/persona-templates.md` — five named-persona prompt skeletons (working mum, ATAR teen, ADHD parent, regional family, switcher)
- `references/aesthetic-rules.md` — the full anti-AI-glow rule set with explanations
- `references/regions-and-platforms.md` — region localisation (AU, US-FL, US-General, UK) and platform notes
