# Regions & Platforms Reference

This file covers regional localisation (when generating outside AU) and platform-specific notes for the image generators we use.

The default and only fully supported generator is **Nano Banana 2** via OpenRouter (see main `SKILL.md` for the API integration). The legacy Midjourney / DALL-E / Ideogram notes at the bottom are kept for reference only — Tutero's current pipeline is Nano Banana.

---

## Region Localisation

### AU (Australia) — DEFAULT

This is the dominant region for this skill. Most templates assume AU.

- **Clothing:** School uniforms (white polo shirt with school crest, navy or green checked summer dress for primary; white shirt + tie + navy trousers for secondary) OR casual home clothes (t-shirt, shorts, hoodie)
- **Environment:** Tile or timber floors, neutral-tone walls (off-white, pale grey, soft cream), Australian suburban kitchen aesthetic (white melamine cabinets, tiled splashback, fridge with kid drawings on it)
- **Light:** Flat, bright, slightly cool — overhead kitchen lights, harsh midday sun through venetian blinds, cool daylight through sliding glass doors. NEVER golden hour.
- **Subject cues:** Wide skin-tone range — Anglo, Lebanese, Greek, Italian, Chinese, Vietnamese, Indian, Pacific Islander, Aboriginal/Torres Strait Islander. Describe individuals naturally, never "diverse group".
- **School year:** Jan–Dec. Prep through Year 12. NAPLAN, ATAR (NSW/ACT/VIC/QLD), HSC (NSW), VCE (VIC), QCE (QLD), WACE (WA).
- **Language on visible worksheets/notes:** "maths" not "math", "Year 5" not "5th grade", "exercise book" not "notebook"
- **Specific AU props:** Akubra hat on a hook, footy ball in the corner, gum tree visible through a window, AU flag, school crest, school zone signage, milk bottle in the fridge with the AU brand layout

### US-FL (Florida)

Used for Tutero Florida tutoring (Step Up for Students families). For Florida-specific creative, this skill defers to `tutero-florida-sufs-creative-designer`. Use these notes only if working in this skill for FL.

- **Environment:** Tile floors throughout, sliding glass doors, palm trees or pool visible through window, ceiling fans, screened porches
- **Demographics:** Strong Hispanic/Latino representation alongside white, Black, Caribbean. Describe individuals naturally.
- **Clothing:** Casual — shorts and t-shirts even for homework. School uniforms in some districts but less universal than AU.
- **Light:** Bright, warm, slightly humid-feeling — but still avoid golden hour cliché. The specific FL light is "high overhead sun softened by humidity and tile reflection"
- **Specific FL props:** Hurricane shutters, Spanish-language books, citrus on the kitchen counter, Step Up for Students paperwork

### US-General

- **Environment:** Suburban home — wood floors or carpet, bookshelves, IKEA-style furniture, more enclosed kitchens than AU
- **Demographics:** Broad American mix. Describe individuals naturally.
- **Light:** Soft window light, but still avoid golden hour and warm cinematic grades
- **School year:** Aug–June. K–12. Grade 1 through Grade 12.
- **Language:** "math", "5th grade", "notebook", "homework folder"

### UK

- **Clothing:** School uniforms (blazer, tie, grey trousers, navy or black for primary and secondary), or casual
- **Environment:** Smaller rooms, older architecture (sash windows, radiators visible, picture rails, narrower kitchens), different furniture proportions
- **Light:** Overcast, cool, grey British daylight. This actually helps the anti-glow rules — UK light is naturally flat.
- **Language:** "maths", "revision", "Year groups", "GCSE", "A-levels", "Sixth Form"

---

## Platform Notes

### Nano Banana 2 via OpenRouter — PRIMARY

This is the only generator the skill is calibrated for. Full API integration is in the main `SKILL.md`.

**Strengths:**
- Natural language prompts (no flag syntax, no `--ar`)
- Aspect ratio controlled via the `image_config` API parameter, not the prompt text
- Handles long descriptive prompts well — be specific
- Good at multi-person compositions
- Cheap and fast — iterate aggressively
- Decent at text-in-image (school crests, worksheet titles) but don't rely on it for ad headlines (always overlay headlines via code)

**Weaknesses to compensate for:**
- Strong default toward "premium stylised" aesthetic — fight this with the full anti-AI-glow block on every prompt
- Sometimes ignores subtle negatives — escalate to the explicit "Shot on iPhone 13, no editing" pattern
- Inconsistent face generation across multiple separate calls — for tutor grids, you must accept some variation and select best 8 from 12+ generations
- Will occasionally render text artefacts in the background — if a worksheet or laptop screen has gibberish text, regenerate or crop

**Prompt structure for Nano Banana 2:**

```
[1-2 sentence subject + composition description]

[1-2 sentences of environment and AU context]

[1 sentence on lighting — name the actual light source]

[1 sentence on the moment / emotional beat]

[1 sentence on camera feel — name a real device]

[Full negative block from aesthetic-rules.md]
```

Aim for 120-200 words total. Shorter prompts under-specify and give the model room to default to glow. Longer prompts dilute the signal.

**Aspect ratio is set via `image_config`, not the prompt:**

```python
generate_image(
    prompt=prompt_text,
    aspect_ratio="4:5",  # set here, not in the prompt text
)
```

Supported aspect ratios: `1:1`, `4:5`, `9:16`, `16:9`, `3:2`, `2:3`. Don't include `--ar` or "aspect ratio" in the prompt text.

### Legacy generators (reference only)

These are not the current Tutero pipeline. Use only if Nano Banana is unavailable.

**Midjourney v6:**
- `--style raw` — reduces AI-polish
- `--v 6` — best human rendering
- `--ar` flag for aspect ratio (`--ar 4:5`)
- Camera language works well: "35mm", "50mm", "shallow depth of field"
- Worse at multi-person scenes than Nano Banana

**DALL-E 3:**
- More literal — describe composition explicitly ("subject in centre-right third of frame")
- "photograph" not "photo" triggers different behaviour
- Shorter prompts outperform — under 150 words
- Worst at fighting AI glow of the three

**Ideogram:**
- Best at text-in-image (use for any image where rendered text matters)
- `--style realistic` flag
- Decent at ad mockups where the headline is part of the rendered image

For the current pipeline: assume Nano Banana 2 unless explicitly told otherwise.

---

## Quick reference: aspect ratios by placement

| Placement | Aspect | Notes |
|---|---|---|
| Meta Feed (square) | `1:1` | Workhorse format for AU paid social |
| Meta Feed (vertical) | `4:5` | Higher CTR; preferred default |
| Meta Story / Reel | `9:16` | Subject in middle 66% — top 14% and bottom 20% are UI |
| Landing page hero | `16:9` | Subject centre-right, left third for headline |
| Email header | `16:9` then crop to ~3:1 | Subject off-centre, large negative space for text |
| Carousel card | `1:1` | Same colour temp and lighting across all cards |
| Tutor headshot for grid | `1:1` | Generate one at a time, composite via code |
| Google Display (300×250) | `1:1` then crop | Scene must crop flexibly — no hard edges on subject |
| Google Display (728×90) | `16:9` then crop hard | Wide subject, lots of horizontal negative space |
| Google Display (160×600) | `2:3` | Tall, single subject upper-third |
