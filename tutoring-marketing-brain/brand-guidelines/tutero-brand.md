---
name: tutero-brand
description: >
  Tutero brand identity skill. Use this skill whenever creating ANY output for Tutero —
  documents, presentations, briefs, reports, social content, emails, ads, or any other
  asset. This includes Word docs (.docx), PowerPoint decks (.pptx), PDFs, HTML pages,
  React components, or any written content. Must be consulted before writing a single
  line of code or content for any Tutero deliverable. Contains the sub-brand decision
  rule (purple = core/home, blue = tutoring), exact brand colours for both palettes,
  typography, four logo variants, tone of voice, product naming conventions, imagery
  guidance, the Tutoring Ad Aesthetic recipe (gradient hero title, white stroke, light
  blue card, UGC photo, green check pills) for parent-facing tutoring marketing only,
  and ready-to-use code constants for docx-js and pptxgenjs.
---

# Tutero Brand Identity Skill

Always read this skill in full before producing any Tutero asset.

---

## STEP 0 — Decide which sub-brand you're working for

Before touching colour, type, or layout, answer this question: **who is the audience and which product is this for?**

Tutero has two sub-brands that share the same logo, typography, tone, and mascot — but use **different primary colour palettes**. Picking the wrong palette is the single most common branding mistake. Decide first.

| Audience / context | Sub-brand | Primary palette | Notes |
|---|---|---|---|
| Schools, teachers, classroom product, tutero.ai marketing, the Tutero corporate/home brand, investor materials, internal docs, ESOP, anything not explicitly tutoring | **Core / Home (tutero.ai)** | **Purple** | This is the default. If you're unsure, use purple. |
| 1-on-1 tutoring, families, Tutero.com (tutoring site), Florida / SUFS, parent-facing ads, tutor-facing materials, anything where the buyer is a parent | **Tutoring** | **Blue (lean lighter)** | Only use blue when the asset is unambiguously for the tutoring audience. |

**Rules of thumb:**
- Purple is the **core brand**. When in doubt, default to purple.
- Blue is **tutoring-only**. Never use blue for Schools, tutero.ai, corporate, or investor materials.
- Never mix the two palettes in a single asset. One sub-brand per deliverable.
- Secondary colours (white, dark text, gray text, gray rows, gray borders) are **shared** across both sub-brands.

---

## Brand Colours

### Core / Home palette — PURPLE (tutero.ai, Schools, corporate, default)

| Token         | Hex       | Usage                                      |
|---------------|-----------|--------------------------------------------|
| `purple-900`  | `38085E`  | Darkest purple — deep backgrounds, headings on light |
| `purple-500`  | `832EC5`  | **Main brand purple** — primary CTA, headings, accents |
| `purple-400`  | `AB5DDC`  | Mid purple — hover states, secondary elements |
| `purple-100`  | `F3D5FC`  | Light purple — tinted backgrounds, callout boxes |
| `purple-50`   | `FCF6FE`  | Near-white purple — page backgrounds, subtle tints |

**Core / Home gradient:** `FFC700` → `B900FF` → `832EC5`

### Tutoring palette — BLUE (1-on-1 tutoring only)

| Token         | Hex       | Usage                                      |
|---------------|-----------|--------------------------------------------|
| `blue-50`     | `F0FAFF`  | Near-white blue — page backgrounds, soft tints (preferred light surface) |
| `blue-200`    | `C2E9FF`  | **Light blue — lean on this** — tinted backgrounds, callout cards, friendly highlights |
| `blue-500`    | `00A3FF`  | **Main tutoring blue** — primary CTA, headings, accents |
| `blue-600`    | `0082CC`  | Hover states, secondary buttons, deeper accents |
| `blue-800`    | `004166`  | Darkest blue — deep backgrounds, headings on light |

**Tutoring gradient:** `1D49E3` → `00A3FF` → `66A693` → `E8A909` → `FF7A00` (left → right)

This left-to-right blue → teal → gold → orange sweep is the **signature look of tutoring marketing**. It's the gradient applied across hero titles in the highest-performing tutoring ads (see the Tutoring Ad Aesthetic section below). Use it for hero word fills in tutoring marketing — not for backgrounds, not for body text.

> **Lean lighter on the tutoring palette.** The brief is explicit: tutoring should feel hopeful, friendly, and parent-approachable. Reach for `blue-50`, `blue-200`, and `blue-500` first. Use `blue-600` and `blue-800` sparingly — only for contrast, deep backgrounds, or accents.

### Shared supporting colours (both sub-brands)

| Token         | Hex       | Usage                                      |
|---------------|-----------|--------------------------------------------|
| `white`       | `FFFFFF`  | Text on dark, backgrounds                  |
| `dark-text`   | `1A1A2E`  | Body text on light backgrounds             |
| `gray-text`   | `5A5A70`  | Subtext, captions, secondary body          |
| `gray-row`    | `F4F3FB`  | Table alternating rows, card backgrounds   |
| `gray-border` | `E0DEEE`  | Table borders, dividers                    |
| `yellow`      | `FFC700`  | Accent highlight (used in both gradients) — sparingly |

### What NOT to use
- Do not use the **purple palette on tutoring assets**, or the **blue palette on Schools / tutero.ai / corporate assets**.
- Do not use the **core gradient** (`FFC700` → `B900FF` → `832EC5`) on tutoring assets — tutoring has its own gradient.
- Do not use the **tutoring gradient** on Schools / tutero.ai / corporate assets.
- Do not use orange/teal as primary brand colours — they appear in the logo icon and tutoring gradient only.
- Do not use the previous purple `3D1D8A` — the correct main purple is `832EC5`.
- Do not invent colours not listed above.

---

## Typography

Tutero uses **two typefaces**:

| Role | Typeface | Where |
|---|---|---|
| **Headings, display, hero, eyebrows** | **Satoshi** (Indian Type Foundry) | All headlines, section headings, CTAs, large display type |
| **Body copy, paragraphs, captions, labels** | **Hanken Grotesk** (also called "Hank Grotesque" internally) | All running text, body, subtext, table cells, form labels |

Both fonts are available from [fontshare.com](https://www.fontshare.com/fonts/satoshi) and [Google Fonts](https://fonts.google.com/specimen/Hanken+Grotesk).

**Fallback stacks for documents/code:**
- Headings: `"Satoshi", "Arial", sans-serif`
- Body: `"Hanken Grotesk", "Arial", sans-serif`

In docx-js and pptxgenjs, use `"Arial"` for both since neither web font can be embedded — this is acceptable for documents. For web/HTML outputs, import both via CSS or fontshare/Google Fonts.

### Type scale (documents)

| Element              | Size (pt) | Weight   | Typeface | Colour |
|----------------------|-----------|----------|----------|--------|
| Display / Hero       | 36–48pt   | Bold     | Satoshi  | Sub-brand 900 (`38085E` or `004166`) or white |
| Section heading      | 22–28pt   | Bold     | Satoshi  | `1A1A2E` |
| Subheading / label   | 11–13pt   | Bold     | Satoshi  | Sub-brand 500 (`832EC5` or `00A3FF`) |
| Body                 | 10–11pt   | Regular  | Hanken Grotesk | `5A5A70` |
| Caption / eyebrow    | 9pt       | Bold     | Satoshi  | Sub-brand 500 or 400 |

---

## Logo

There are **four logo variants**. Always use the correct one for the background and reproduction context. The logo itself is **shared across both sub-brands** — the same wordmark and lightbulb work for tutero.ai and tutoring.

| Variant | File | Use on / Use for |
|---|---|---|
| **Primary** (default) | `assets/logo.svg` | Light backgrounds (white, cream, purple-50, blue-50, any light surface). **First choice in almost all cases.** |
| **White** | `assets/logo-primary-white.svg` | Dark backgrounds, mid-tone backgrounds, gradients, photos, anywhere the primary logo lacks contrast |
| **Black** | `assets/logo-primary-black.svg` | Single-colour reproduction only — print where colour cannot be reproduced (fax, B&W docs, embossing, single-ink merch) |
| **Badge** | `assets/logo-badge.svg` | Small spaces, app icons, favicons, social avatars, watermarks, anywhere the full wordmark is too wide to read |

### Choosing the right variant

| Background | Variant | Why |
|------------|---------|-----|
| White / cream / purple-50 / blue-50 / light gray | **Primary** | Black wordmark + colourful icon reads clearly |
| Purple-900 / blue-800 / dark gray / black | **White** | Entire logo in white for contrast |
| Purple-500 / blue-500 / mid-tone colours | **White** | Primary logo has low contrast on mid-tones |
| Photo or gradient background | **White** | Colourful icon fights with imagery; white reads cleanly |
| B&W print, single-ink, fax | **Black** | Only when colour cannot be reproduced |
| Square / small space, app icon, avatar | **Badge** | Wordmark is illegible at small sizes |

### Logo do's and don'ts

**Don't:**
- Skew, rotate, stretch, or distort the logo
- Add drop shadows, outlines, or extra effects
- Recolour the wordmark or icon to non-brand colours
- Place the primary (colourful) logo on busy photo or gradient backgrounds — use white instead
- Mix parts from different variants (e.g. colourful icon + white wordmark)
- Recreate or retype the wordmark in code or text — always use the SVG file

**Do:**
- Default to the primary variant on light surfaces
- Switch to white the moment contrast is in question
- Preserve clear space (minimum: height of the "t" in tutero on all sides)
- Use the badge in tight square spaces
- Use the icon (lightbulb mark) standalone when appropriate; the wordmark alone cannot stand alone

### Primary logo (`logo.svg`)
- Wordmark text paths: `fill="#222222"` (near-black)
- Lightbulb icon: colourful gradient fills (orange → gold → teal → blue)
- Transparent background (`fill="none"` on root `<svg>`)

### White logo (`logo-primary-white.svg`)
- **Entire logo is white** — wordmark AND lightbulb icon are all `fill="white"`
- Transparent background

### Converting SVG → PNG for documents (docx, pptx, pdf)

The SVGs cannot be embedded directly in Word/PowerPoint. You MUST convert to PNG first. **Always render at high resolution to avoid blurriness.**

**⚠️ CRITICAL: Strip `display-p3` styles before rendering.** The logo SVGs contain inline `style` attributes with `color(display-p3 ...)` values that override the hex `fill` and `stop-color` attributes. CairoSVG cannot parse `display-p3` and will silently render affected elements as black. You MUST strip these styles first.

```bash
# STEP 1: Install cairosvg if needed
pip install cairosvg --break-system-packages 2>/dev/null

# STEP 2: Clean the SVG (strip display-p3 styles) and convert to PNG
python3 -c "
import re, cairosvg

SKILL_DIR = '/mnt/skills/user/tutero-brand'

def render(src_name, out_name, w=1560, h=480):
    with open(f'{SKILL_DIR}/assets/{src_name}', 'r') as f:
        svg = f.read()
    svg = re.sub(r' style=\"[^\"]*\"', '', svg)  # Strip display-p3 overrides
    tmp = f'/tmp/{out_name}_clean.svg'
    with open(tmp, 'w') as f:
        f.write(svg)
    cairosvg.svg2png(
        url=tmp,
        write_to=f'/tmp/{out_name}.png',
        output_width=w,
        output_height=h,
        background_color=None,
    )

# Render whichever variants you need
render('logo.svg',                'tutero_logo')        # primary, light bg
render('logo-primary-white.svg',  'tutero_logo_white')  # white, dark bg
# render('logo-primary-black.svg',  'tutero_logo_black')  # black, single-ink
# render('logo-badge.svg',          'tutero_badge', w=600, h=600)  # square badge

print('Logo PNGs created (transparent background)')
"
```

Replace `SKILL_DIR` with the actual path to this skill folder if different.

**If cairosvg is unavailable**, try rsvg-convert:
```bash
apt-get install -y librsvg2-bin 2>/dev/null
rsvg-convert -w 1560 -h 480 --background-color=transparent \
    SKILL_DIR/assets/logo.svg -o /tmp/tutero_logo.png
rsvg-convert -w 1560 -h 480 --background-color=transparent \
    SKILL_DIR/assets/logo-primary-white.svg -o /tmp/tutero_logo_white.png
```

**If NEITHER library is available**, fall back to styled text:
- Word: `tutero` in bold + `.ai` in sub-brand 500 (purple-500 or blue-500 depending on context)
- PowerPoint: Same approach
- This is a last resort — always try to install cairosvg first.

### ⚠️ COMMON PITFALLS

**BLACK LIGHTBULB / MISSING GRADIENT BUG:** If the lightbulb icon renders as a solid black shape instead of showing the colourful gradient (or solid white), the `display-p3` styles were not stripped. Re-run the cleaning step above. The `re.sub(r' style=\"[^\"]*\"', '', svg)` line is mandatory — never skip it.

**BLACK BACKGROUND BUG:** Some PNG renderers default to a black background when transparency is not explicitly preserved. If the logo appears on a black rectangle:
1. Ensure `background_color=None` (cairosvg) or `--background-color=transparent` (rsvg-convert)
2. Do NOT use Pillow/PIL `.convert('RGB')` on the output — this destroys the alpha channel and fills it black. If you need Pillow, use `.convert('RGBA')` only.
3. Do NOT use `ImageMagick convert` without `-background none -flatten` flags

**BLURRY LOGO BUG:** If the logo looks fuzzy or pixelated in the final document:
1. Always render at minimum 4× the display size (1560×480 for a logo displayed at ~390×120)
2. For large displays (e.g., cover slides, hero sections), render at 6× (2340×720) or even 8× (3120×960)
3. When placing in docx/pptx, set the image dimensions to the DISPLAY size (e.g., 3.5 inches wide), NOT the pixel dimensions — the library will scale from the high-res source
4. Never upscale a small PNG. Always re-render from SVG at the target resolution.

### Embedding in docx (docx-js)

```javascript
// After converting SVGs to high-res PNGs
const fs = require('fs');
const logoPrimary = fs.readFileSync('/tmp/tutero_logo.png');       // for light backgrounds
const logoWhite   = fs.readFileSync('/tmp/tutero_logo_white.png'); // for dark backgrounds

new ImageRun({
    data: logoPrimary,  // or logoWhite on dark backgrounds
    transformation: {
        width: 350,   // Display width in points — NOT pixel width
        height: 108,  // Display height in points — maintains aspect ratio
    },
    type: 'png',
})
```

### Embedding in pptx (pptxgenjs)

```javascript
slide.addImage({
    path: '/tmp/tutero_logo_white.png',  // white variant for dark slides
    x: 0.5, y: 0.3,
    w: 3.5, h: 1.08,  // Display size in inches — NOT pixels
    sizing: { type: 'contain' },
});
```

---

## Tone of Voice

Tutero speaks like a brilliant teacher, not a tech company. The brand mission is to be **the most impactful education company in the world**, and the working principle internally is **work fast, learn fast**. That spirit should come through in everything we publish: **swift, easy on the eye, and hopeful**.

- **Human, not corporate** — write like you're talking to a colleague, not a press release
- **Confident, not arrogant** — direct and clear, never boastful
- **Warm, not fluffy** — genuine enthusiasm without empty cheerleading
- **Hopeful** — the reader should leave feeling like things are getting better
- **Specific, not vague** — concrete benefits ("saves 3 hours a week") over abstractions ("enhances efficiency")
- **Swift** — short sentences, no preamble, get to the point

### Key phrases to use
- "The favourite AI tool for classroom teachers" (Schools / tutero.ai)
- "AI that makes the best teachers even better"
- "AI shouldn't replace teachers — it should amplify them"
- "Free for every classroom teacher" (Schools / tutero.ai)
- "1-on-1 teaching, personalised to your child" (Tutoring)

### Key phrases to avoid
- "AI-powered" anything — Tutero IS an AI company, not a traditional company with AI bolted on
- "Cutting-edge", "revolutionary", "game-changing"
- "Platform" alone — always "teaching platform" or "AI teaching platform"
- "Tutoring company" — Tutero is an AI education company that runs a tutoring product, not a tutoring company

---

## Product Naming

| Context              | Use                        |
|----------------------|----------------------------|
| Company / parent brand | **Tutero** (capital T, no suffix) |
| Schools product, AI teaching platform | **tutero.ai** (always lowercase) |
| Tutoring product, 1-on-1 | **Tutero Tutoring** or **Tutero.com** |
| Florida tutoring | **Tutero Florida** (a context within Tutoring) |
| Internal corporate | **Tutero** or **Tutero Group** |
| Never write          | TUTERO, Tutor0, tutero (without URL context), "Tutero Schools" (legacy — has rebranded to tutero.ai) |

> **Rebrand note:** "Tutero Schools" is the legacy name for what is now **tutero.ai**. Use tutero.ai going forward in all new materials. If you encounter "Tutero Schools" in older assets, treat it as a rename target.

Always distinguish: teachers and schools use **tutero.ai**; families use **Tutero** for **Tutero Tutoring** at **Tutero.com**.

---

## Imagery & Photography

Photography is critical, especially for ads. Real-feel imagery outperforms generic stock.

**Style preferences:**
- **UGC-style** photos and images perform best — authentic, slightly imperfect, real-environment, real-people
- Avoid stock-photo gloss, fake-looking smiles, sterile classroom shots
- Parents, teachers, and students should look like the real audience, not models
- Tutoring: warm, hopeful, family-context, lighter blue tones in the background where possible
- tutero.ai / Schools: classroom-context, teacher-led, purple tones in the background where possible

**AI image generation tools (in order of current preference):**
1. **Google Flow** — strongest results for realistic people and scenes
2. **Grok** — strong for realistic UGC-style imagery
3. **wipes.tutero.com** — internal tool (Sonny's), can be selected with the **Tutero AI bot** option for mascot-integrated images. Currently has bugs but is the right tool when you need the Tutero robot in a scene without re-uploading him.

**Mascot — the Tutero robot:**
- Vector storyboards exist in the Tutero animation Figma file (different emotes, situations, poses) — prefer these over AI-generated mascot images when you need brand consistency, because they're editable vectors
- For one-off illustrations of the mascot in a scene, use wipes.tutero.com with the Tutero AI bot option

**Working principle:** Before generating from scratch, check the existing asset libraries (see below). Copy an existing on-brand asset as a base and modify it — this is faster than starting blank and keeps outputs consistent.

---

## Tutoring Ad Aesthetic (Tutero Tutoring / Tutero.com ONLY)

**Scope:** This section applies **only** to parent-facing tutoring marketing — Meta/Facebook/Instagram ads, TikTok thumbnails, Reels covers, paid social statics, and ad-style organic posts for Tutero Tutoring (AU and Florida/US). It does **not** apply to tutero.ai, Schools, corporate, or investor materials. Do not bring this aesthetic into any tutero.ai asset.

This is the look that has consistently won in our tutoring ad library. Treat it as a recipe — when you're producing a tutoring ad creative or thumbnail, default to these ingredients unless there's a specific reason to deviate.

### The signature title treatment

The single most recognisable element of tutoring marketing is the **chunky gradient hero title with a thick white stroke**. It's the thing that makes a Tutero tutoring ad recognisable at a glance in the feed.

**Recipe:**
- **Font:** Satoshi (or Arial fallback in docs), **Black / Heaviest weight**, large display size
- **Fill:** the **tutoring gradient** applied left-to-right across the word(s): `1D49E3` → `00A3FF` → `66A693` → `E8A909` → `FF7A00`. The gradient should sweep across the headline horizontally so the leftmost letters are blue and the rightmost letters are orange.
- **Stroke:** thick **white outline** around every glyph (roughly 6–10% of the cap height). This is what makes the title pop off light blue backgrounds and busy photo backgrounds.
- **Optional:** very subtle drop shadow underneath the white stroke for extra lift on photo backgrounds. Keep it subtle — this is not a Y2K effect.
- **Apply to:** the hero noun phrase only — e.g. "Online Tutoring", "Tutoring", "Personalised Tutoring". Not the whole headline.

### The supporting subhead

Underneath the gradient hero word, there's almost always a **solid-fill subhead** like "For Prep – Year 12" or "for Prep - Year 12".

**Recipe:**
- **Font:** Satoshi Bold/Black, noticeably smaller than the hero word
- **Fill:** solid `blue-800` (`004166`) or `blue-500` (`00A3FF`)
- **Stroke:** thinner **white outline** (matching the hero treatment but proportionally smaller)
- This pairs the chunky gradient hero with a calm, scannable qualifier.

### Backgrounds and card shape

- **Light blue card background** — `blue-50` (`F0FAFF`) or `blue-200` (`C2E9FF`) as the dominant surface
- **Rounded corners** on the outer card (roughly 24–40px radius depending on canvas size)
- The hero title sits in a clear top zone; UGC photo sits below or behind it
- Avoid white backgrounds for tutoring ads — light blue is the signature

### Photography style (tutoring ads specifically)

Building on the general imagery rules, tutoring ads lean even harder into UGC realism:

- **Real homes** — kitchens, dining tables, bedrooms, family lounges. Not classrooms, not studios.
- **Parent + child together** — the parent is often the protagonist (mum at the laptop with her kid, dad in the background). Sometimes child alone at a laptop. Sometimes a tutor's screen visible.
- **Phone-camera feel** — slightly imperfect lighting, natural framing, looks like it was shot on an iPhone, not by a brand team
- **Real Australian / American families** — diverse, not model-perfect, dressed casually
- **Smiling, waving, thumbs up** — warm and hopeful, not posed or corporate
- **Talking-head selfies** — for testimonial-style ads, a parent or student speaking direct-to-camera works very well
- **Tutor headshot grids** — 4×2 or 5×2 grids of qualified-looking tutors with names and one-line bios is a recurring high-performer for the "meet our tutors" angle

### Trust signal pills (the green check pattern)

Most winning tutoring ads include 2–4 **green checkmark pills** stacked over the photo or below the title.

**Recipe:**
- Pill shape: rounded rectangle, white or light-blue fill, soft shadow or thin border
- Inside each pill: a **green ✅ emoji or check icon** + short benefit phrase, e.g. "Qualified Teachers & Tutors", "Personalised 1:1 Lessons", "Pay Per Lesson", "No lock-in contract", "Transparent pricing"
- Keep them short (3–6 words), scannable, parent-relevant
- Stack 2–4 of them, never more

### Small blue label tags

A recurring secondary element: a small **rounded label/tag in light blue** sitting at the top of the creative — e.g. "Personalised tutoring for EVERY budget", "where would you rate Tutero?", "Online Tutoring for Prep – Year 12". This functions like an eyebrow / context-setter.

- Pill or rounded-rect shape, `blue-200` fill, dark text inside
- Sits above or alongside the hero title
- Used to ask a question, set context, or qualify the offer

### Other recurring tutoring-ad elements

- **AU flag emojis 🇦🇺** flanking the hero title for AU-targeted ads (the Florida equivalent uses US-relevant cues, not AU flags)
- **Friendly footer line** like "Choose your dream tutor at tutero.com.au" in dark text on light blue background
- **Tutero lightbulb icon** as a small footer mark (use the badge or primary logo SVG, never recreate)
- **Quote-card variants** — large pull quote in dark text on white/cream card with a small testimonial photo and "Private Tutoring | For Prep – Year 12" footer. This is the testimonial format and skips the gradient hero treatment.

### Pre-flight checklist for any tutoring ad creative

Before delivering a tutoring ad static, thumbnail, or Reel cover, check:
- [ ] Background is **light blue** (`blue-50` or `blue-200`), not white, not purple
- [ ] Hero noun has the **left-to-right tutoring gradient fill** + **thick white stroke**
- [ ] Subhead ("For Prep – Year 12" or similar) is solid blue with a thinner white stroke
- [ ] Photography is **UGC-style real homes**, not stock, not classrooms
- [ ] At least **2 green checkmark trust pills** are present (unless it's a quote-card variant)
- [ ] No purple anywhere — this is tutoring, not tutero.ai
- [ ] Tutero lightbulb logo is present somewhere (footer, corner, or top)
- [ ] Tone is **warm, hopeful, parent-friendly** — not slick, not corporate

### Code reference: tutoring gradient as CSS / SVG

```css
/* CSS — left-to-right tutoring gradient for hero word fills */
background: linear-gradient(
  90deg,
  #1D49E3 0%,
  #00A3FF 25%,
  #66A693 50%,
  #E8A909 75%,
  #FF7A00 100%
);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
-webkit-text-stroke: 6px #FFFFFF; /* the signature thick white outline */
paint-order: stroke fill;          /* ensures stroke sits behind the fill */
font-family: "Satoshi", "Arial", sans-serif;
font-weight: 900;
```

```svg
<!-- SVG — gradient definition for hero title fills -->
<defs>
  <linearGradient id="tutoringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#1D49E3"/>
    <stop offset="25%"  stop-color="#00A3FF"/>
    <stop offset="50%"  stop-color="#66A693"/>
    <stop offset="75%"  stop-color="#E8A909"/>
    <stop offset="100%" stop-color="#FF7A00"/>
  </linearGradient>
</defs>
<text fill="url(#tutoringGradient)" stroke="#FFFFFF" stroke-width="6"
      paint-order="stroke" font-family="Satoshi" font-weight="900">
  Online Tutoring
</text>
```

---

## Asset libraries (Figma)

Before creating a new asset, check whether something close already exists. Working files live in Figma:

- **Social media designs** — Instagram, LinkedIn posts (latest covers and templates)
- **Ad creatives** — Facebook/Instagram ads, carousels, static creatives (multiple pages of past work)
- **Asset library** — reusable components, illustrations, icons for both Tutoring and Schools/tutero.ai
- **Website (tries-and-master)** — latest live website page designs; the best place to absorb how brand is integrated end-to-end
- **LinkedIn** — cover pages and profile assets
- **SUFS / Florida assets** — dedicated library for Florida tutoring creative
- **Mascot animations / storyboards** — vector emotes and situations for the Tutero robot

**The website is the strongest single reference for brand integration.** When in doubt about how a component should feel, look at the live tutero.ai or Tutero.com pages first.

---

## Code Constants

### For docx-js (Word documents)

```javascript
// Core / Home palette — PURPLE (default, Schools, tutero.ai, corporate)
const PURPLE = {
  900:  "38085E",   // darkest — deep backgrounds
  500:  "832EC5",   // MAIN brand purple
  400:  "AB5DDC",   // mid purple
  100:  "F3D5FC",   // light purple tint
  50:   "FCF6FE",   // near-white purple (page bg)
};

// Tutoring palette — BLUE (1-on-1 tutoring only, lean lighter)
const BLUE = {
  800:  "004166",   // darkest — deep backgrounds (use sparingly)
  600:  "0082CC",   // hover, secondary
  500:  "00A3FF",   // MAIN tutoring blue
  200:  "C2E9FF",   // LIGHT BLUE — lean on this
  50:   "F0FAFF",   // near-white blue (page bg)
};

// Shared (both sub-brands)
const SHARED = {
  white:        "FFFFFF",
  darkText:     "1A1A2E",
  grayText:     "5A5A70",
  grayRow:      "F4F3FB",   // table rows, card backgrounds
  grayBorder:   "E0DEEE",   // borders, dividers
  yellow:       "FFC700",   // accent (used in both gradients)
};

// Pick ONE palette per document based on sub-brand
const C = { ...SHARED, ...PURPLE };  // Schools / tutero.ai / corporate
// const C = { ...SHARED, ...BLUE };  // Tutoring only

const HEADING_FONT = "Arial"; // Satoshi fallback
const BODY_FONT    = "Arial"; // Hanken Grotesk fallback
```

### For pptxgenjs (PowerPoint decks)

```javascript
const PURPLE = {
  900: "38085E", 500: "832EC5", 400: "AB5DDC", 100: "F3D5FC", 50: "FCF6FE",
};

const BLUE = {
  800: "004166", 600: "0082CC", 500: "00A3FF", 200: "C2E9FF", 50: "F0FAFF",
};

const SHARED = {
  white: "FFFFFF", darkText: "1A1A2E", grayText: "5A5A70",
  grayRow: "F4F3FB", grayBorder: "E0DEEE", yellow: "FFC700",
};

// Pick ONE palette per deck
const C = { ...SHARED, ...PURPLE };  // Schools / tutero.ai / corporate
// const C = { ...SHARED, ...BLUE };  // Tutoring only

const HEADING_FONT = "Arial";
const BODY_FONT    = "Arial";
```

---

## Document Templates

The structure below uses sub-brand tokens (`brand-900`, `brand-500`, `brand-50`) — substitute the relevant palette: PURPLE for Schools/tutero.ai/corporate, BLUE for Tutoring.

### Standard document structure (docx)
1. **Header:** logo (primary variant) left, document title right, sub-brand-500 bottom border (6pt)
2. **Cover block:** Full-width sub-brand-900 box with white hero text + sub-brand-50 tagline
3. **Sections:** Eyebrow label (number + title in sub-brand-500 caps) → sub-brand-500 rule → heading (Satoshi) → body (Hanken Grotesk)
4. **Callout boxes:** sub-brand-100 / blue-200 background for key messages; sub-brand-900 for hero quotes
5. **Tables:** sub-brand-500 header labels, gray-row alternating, gray-border dividers
6. **Footer:** Thin gray border, tagline left, page number right

### Standard deck structure (pptx)
1. **Cover slide:** sub-brand-900 background, **white logo variant**, white hero text, sub-brand-500 accent bar left edge
2. **Content slides:** sub-brand-50 background, **primary logo variant**, sub-brand-900 header bar, content below
3. **Section dividers:** Full sub-brand-900 slide, large white text, sub-brand accent element
4. **Cards/feature rows:** sub-brand-500 label left cell, gray-row content right cell
5. **Closing slide:** sub-brand-900 background, **white logo variant**

---

## Assets

- `assets/logo.svg` — **Primary logo** (colourful lightbulb + black wordmark), transparent background. Use on light backgrounds.
- `assets/logo-primary-white.svg` — **White logo** (all-white lightbulb + white wordmark), transparent background. Use on dark / mid-tone / photo backgrounds.
- `assets/logo-primary-black.svg` — **Black logo** for single-ink reproduction only.
- `assets/logo-badge.svg` — **Badge** for square / small spaces, app icons, avatars.
- All wordmark logos share the native viewBox 390 × 120 — render PNG at 4×+ this size (minimum 1560 × 480). The badge is square — render at minimum 600 × 600.
- All SVGs have NO background element — `fill="none"` on root `<svg>` tag
- **The colourful logo SVGs contain `display-p3` inline styles that MUST be stripped before rendering with cairosvg** (see Converting SVG → PNG section)

---

## Quick Checklist

Before delivering any Tutero asset, verify:
- [ ] **Sub-brand decision made first**: purple for Schools / tutero.ai / corporate / default; blue for Tutoring only
- [ ] **One palette per asset** — purple and blue are not mixed
- [ ] If tutoring: leaning on the **lighter blues** (`blue-50`, `blue-200`, `blue-500`)
- [ ] Main purple is `832EC5` (not `3D1D8A`); main tutoring blue is `00A3FF`
- [ ] Headings are Satoshi (or Arial fallback); body is Hanken Grotesk (or Arial fallback)
- [ ] Product naming is correct: **tutero.ai** for Schools, **Tutero Tutoring / Tutero.com** for tutoring, never "Tutero Schools" in new materials
- [ ] No "AI-powered" language used
- [ ] Tone is warm, human, hopeful, swift, teacher-first — not corporate
- [ ] Logo used from an `assets/*.svg` file (not recreated)
- [ ] **Correct logo variant**: primary on light, white on dark/mid/photo, black for single-ink only, badge for small/square
- [ ] **`display-p3` styles stripped** before SVG → PNG conversion
- [ ] Logo PNG rendered at 4×+ resolution — no blurry logos
- [ ] Logo PNG has transparent background — no black rectangles behind it
- [ ] Lightbulb icon renders correctly (colourful gradient on light, solid white on dark) — not black
- [ ] If creating from scratch: confirmed nothing close already exists in the Figma asset libraries
- [ ] **If this is a tutoring ad / Reel cover / paid social creative**: read the **Tutoring Ad Aesthetic** section above and apply the gradient hero title, white stroke, light blue background, UGC photo, and green check pills recipe
