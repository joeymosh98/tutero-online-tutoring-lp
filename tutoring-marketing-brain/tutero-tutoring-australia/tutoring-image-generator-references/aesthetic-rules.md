# Aesthetic Rules — Anti-AI-Glow

This is the most important file in the skill. AI image generators have strong defaults that pull every output toward a "premium stylised" look — golden hour, soft rim light, dreamy bokeh, smooth skin, warm cinematic grading. Every one of those defaults is *wrong* for Tutero tutoring marketing.

The winning Tutero AU ads look like iPhone photos taken under household kitchen lights. They look slightly amateurish, slightly compressed, slightly bright-and-flat. They look real.

This file enumerates exactly what to ban and what to enforce, and explains why.

---

## What "AI glow" actually is

When you look at a Nano Banana / Midjourney / DALL-E default output of "a parent and child at a laptop", you'll typically see:

1. **A soft halo of light around each person** — rim lighting that shouldn't physically exist in a kitchen
2. **A warm orange-and-teal colour grade** — borrowed from cinema, not real life
3. **Skin that looks airbrushed** — pores gone, wrinkles smoothed, "instagram filter" smoothness
4. **Background bokeh that's far too dreamy** — extreme depth of field that no phone camera produces
5. **Symmetrical, perfectly balanced composition** — too composed to be real
6. **A subtle "premium" glow on every surface** — as if everything is lit by a softbox
7. **Over-saturated peachy skin tones** — making white people look tan and brown people look orange

If your output has any of these, it has failed. It looks like AI. Real Australian parents see right through it and scroll past.

---

## The hard ban list

Every prompt MUST include negatives against these. Copy this block verbatim and append to every prompt:

```
NEGATIVE / AVOID: AI glow, soft rim lighting around subjects, halo lighting,
golden hour orange tint, teal and orange colour grading, dreamy bokeh, extreme
shallow depth of field, smooth airbrushed skin, perfect skin, retouched skin,
flawless complexion, perfect symmetrical composition, cinematic colour science,
HDR look, over-saturated colours, warm peachy skin tones, oversaturated warmth,
studio lighting, softbox lighting, ring light, fashion editorial aesthetic,
magazine photoshoot, Pinterest mood board feel, generic stock photo, diverse
stock group arrangement, perfectly tidy environment, sterile modern interior,
chalkboard background, apple on desk, graduation cap, headset on child,
corporate tutoring centre, learning centre interior, text in image, watermark,
brand logos visible, perfect lighting, dramatic lighting, moody lighting,
film grain effect (added in post), Instagram filter, VSCO filter, beauty
filter, AI rendering, 3D render, illustration, painting.
```

---

## The required positive language

Every prompt MUST include positive language for these qualities. Bake them into the descriptive paragraph — don't just list them. Examples:

- ❌ Weak: "Natural lighting"
- ✅ Strong: "Flat overhead kitchen lighting from a single ceiling fitting, neutral white balance, the kind of lighting you get on a Tuesday afternoon at home"

- ❌ Weak: "Real skin"
- ✅ Strong: "Natural skin texture with visible pores, fine lines around the eyes, slight redness on cheeks — not retouched"

- ❌ Weak: "Phone photo"
- ✅ Strong: "Looks like an iPhone photo taken in default camera mode, no editing, slight phone-camera compression and noise, the kind of photo a parent texts to a friend"

- ❌ Weak: "Australian home"
- ✅ Strong: "Typical Australian suburban kitchen — white melamine cabinets, tiled splashback, fridge with kid drawings stuck on with magnets, fruit bowl on the bench, slightly cluttered but lived-in"

The pattern: **describe specifics, not adjectives**. AI image generators respond to concrete nouns much better than to abstract qualifiers.

---

## The eight anti-AI moves

### Move 1 — Name a real lighting source

Don't say "natural light". Say "the overhead kitchen ceiling light, plus daylight from the window above the sink". Naming the actual fixture forces the model away from cinematic lighting setups.

**Phrases that work:**
- "Flat overhead kitchen ceiling light"
- "Fluorescent classroom lighting"
- "Bedroom ceiling pendant light"
- "Harsh midday Australian sun through venetian blinds"
- "Cool daylight through a sliding glass door"

**Phrases to ban:**
- "Golden hour"
- "Magic hour"
- "Cinematic lighting"
- "Soft natural light" (too vague — model will default to a softbox)
- "Window light" alone (too vague)

### Move 2 — Name a real device

Naming an actual phone or camera brand pulls the model toward documentary realism.

**Phrases that work:**
- "Shot on iPhone 13, default camera app, no editing"
- "iPhone photo, standard portrait mode off"
- "Android phone snapshot, no filter"
- "Looks like a photo a Tutero staff member took on their phone"

**Why this works:** The model has trained on billions of real phone photos labelled with device names, and on a much smaller number of "professional photography" images. Anchoring to a phone brand pulls it toward the larger, more realistic distribution.

### Move 3 — Name the temperature explicitly

Always specify "neutral white balance" or "cool white" — never let the model default to warmth.

**Phrases that work:**
- "Neutral white balance"
- "Cool fluorescent white"
- "Slightly cool daytime white balance"
- "No warm tones"

**The bias to fight:** Every AI image generator defaults to warm/orange because warm photos test as "more pleasant" in user studies. Tutoring ads must fight this — warmth reads as "stock photo" to AU parents.

### Move 4 — Name skin imperfections

The model will smooth skin unless you forbid it explicitly AND describe the imperfections you want.

**Phrases that work:**
- "Visible pores"
- "Fine lines around the eyes"
- "Slight redness on the cheeks"
- "A few freckles on the nose"
- "Hair slightly out of place"
- "Natural skin texture, not retouched"

### Move 5 — Name the everyday clutter

Tutoring ads should look lived-in. The model defaults to staged tidiness.

**Phrases that work:**
- "A water bottle and a half-eaten apple on the counter"
- "Kid drawings on the fridge"
- "School bag dropped on the floor"
- "A few crumbs on the table"
- "Slightly messy desk with scattered papers"

But: **don't overdo it**. Two pieces of clutter is realism. Five is staged "messy".

### Move 6 — Compose off-centre

The model defaults to perfectly centred subjects. Real phone photos are off-centre.

**Phrases that work:**
- "Subject in the right third of the frame"
- "Slightly off-centre composition"
- "Cropped at the top so the head almost touches the edge"
- "Foreground tilted, like the parent grabbed the phone quickly"

### Move 7 — Describe the moment, not the pose

Say what's *happening*, not what the pose looks like.

- ❌ Weak: "Smiling parent and child"
- ✅ Strong: "The mum has just looked up from the laptop because the tutor said something funny — half-smile, eyebrows raised slightly"

### Move 8 — Add "amateur" framing cues

A few words about framing imperfection go a long way.

**Phrases that work:**
- "Slightly tilted horizon"
- "Foreground slightly out of focus because the parent grabbed the phone quickly"
- "Framing isn't perfect — there's a bit of dead space in the corner"
- "The kind of photo you'd take and not bother editing"

---

## Mode-specific overrides

The general rules above apply to BOTH modes. But each mode has a few specific overrides.

### Warm Staged mode overrides

In Warm Staged, the subjects DO look at the camera and DO smile. So you must explicitly allow:

- "Looking directly at the camera"
- "Genuine warm smile"
- "Natural pose for a phone photo"
- "Both subjects facing camera"

You must NOT allow:
- "Big toothy grin" (too forced)
- "Laughing wildly" (looks staged)
- "Identical smile from everyone in frame" (looks like a school photo day)

The smile should be "the kind of smile you give when a friend says 'smile for the photo'".

### Candid Real mode overrides

In Candid Real, the subjects do NOT look at the camera. So you must explicitly forbid:

- "Looking at camera"
- "Eye contact with viewer"
- "Smiling at camera"
- "Posed for photo"

And explicitly allow:
- "Looking down at the worksheet"
- "Eyes on the laptop screen"
- "Mid-action, unaware of the camera"
- "Quiet concentration"

---

## Specific colour guidance from the winning ads

The winning AU ads share a tight colour vocabulary. The image itself should sit comfortably alongside the Tutero brand without clashing.

**Acceptable colour palettes in the photographed environment:**
- White, off-white, soft grey kitchen cabinets
- Pale wood tones (oak, pine, light walnut)
- Sage green, soft olive, cream, oat
- Soft denim blue, navy (school uniforms)
- Maroon, bottle green (regional school uniforms)
- Natural skin tones in a wide range — Anglo, Mediterranean, South Asian, East Asian, Pacific Islander

**Avoid in the environment:**
- Saturated reds, oranges, yellows (compete with the Tutero brand colours)
- Neon anything
- Black backgrounds (too moody, too premium)
- Pure white seamless studio backgrounds
- Stark modern minimalist interiors (looks like an architecture magazine, not a real home)
- Hospital-blue or teal walls (cold and clinical)

**Skin tones:** Always specify "natural skin tone, neither warmed nor cooled in post". The default AI bias is to warm-shift skin into a peachy glow. Fight it explicitly.

---

## How to fix an image that came back wrong

If you generate an image and it has AI glow, follow this escalation ladder:

**Level 1 — Strengthen the negative.** Add 3-5 more banned terms targeting the specific problem. If the issue is golden hour, add "no golden tones, no warm grade, no sunset light, no orange tint anywhere in the image, neutral colour temperature only".

**Level 2 — Name a real device explicitly.** Prepend "Shot on iPhone 13, default camera app, no editing, no filter applied. This is a documentary phone snapshot, not a stylised image."

**Level 3 — Strip and rewrite.** Remove all adjectives from the prompt. Keep only concrete nouns and the negative block. Sometimes adjectives are what trigger the AI's "make it premium" instinct.

**Level 4 — Switch the lighting source.** If you've been asking for "kitchen lighting" and getting glow, try "harsh fluorescent classroom lighting" or "cool overhead office lighting". Sometimes the model has a strong association between "kitchen" and "warm" that you need to break.

**Level 5 — Change the composition.** If the model keeps producing a glamour-shot of a mum, switch to a wider frame that includes more of the room — the model has fewer "premium" associations with wide environmental shots than with portrait crops.

If five regenerations still don't work: you've hit a hard model limit on that particular composition. Move on to a different composition.

---

## The five-second test

Before approving any generated image, hold it next to the winning ads collage in your head and ask:

1. **Could this be one of the existing winners?** If no, why not? What's different?
2. **Does it have any glow, halo, or rim light?** If yes, regenerate.
3. **Does the skin look real?** Pores, lines, slight imperfections? If no, regenerate.
4. **Is the lighting flat and household, or cinematic?** If cinematic, regenerate.
5. **Would an Australian parent look at this and think "real Tutero photo" or "another AI ad"?** If they'd think "AI ad", regenerate.

Three or more "regenerate" answers: don't even iterate on this prompt. Switch to a different composition entirely.
