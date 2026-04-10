---
name: creating-paid-social-ads-tutoring-australia
description: >
  End-to-end skill for creating paid social ad creatives (Meta/Facebook/Instagram statics)
  for Tutero Tutoring in the Australian market. Covers the full pipeline: hypothesis → cognition
  → copy → image generation → HTML creative → gallery registry. Produces ads that match the
  proven Tutero Tutoring Ad Aesthetic without iteration. Trigger on "create an ad", "make a
  paid social creative", "build a Meta ad", "design a Facebook ad", "Instagram ad for tutoring",
  "new ad creative", "ad for hypothesis", or any request to produce Australian parent-facing
  tutoring paid social creative. Consult tutero-brand, paid-social-winner-insights-australia,
  tutero-tutoring-parent-copy-australia, and tutoring-image-generator-australia as dependencies.
  NOT for tutero.ai schools ads. NOT for Florida/US ads.
---

# Creating Paid Social Ads — Tutero Tutoring Australia

This skill produces ready-to-screenshot HTML ad creatives for Meta (Facebook/Instagram) paid social. It encodes the exact cognition process, design system, copy rules, and technical patterns that produce winning ads on the first attempt.

**Dependencies (read these skills in full before starting):**
- `tutero-brand` — brand colours, typography, logo, the Tutoring Ad Aesthetic recipe
- `paid-social-winner-insights-australia` — the 12 winners, 7 recurring moves, pre-flight checklist
- `tutero-tutoring-parent-copy-australia` — parent-facing copy rules, forbidden words, pillars, proof stack
- `tutoring-image-generator-australia` — image generation prompts, anti-AI rules, Nano Banana 2 API

---

## Part 1 — The Cognition System (Think Before You Design)

Never open an HTML file before completing these 6 steps. The thinking is the work. The HTML is just rendering.

### Step 1: Start with the hypothesis

Every ad tests a hypothesis. A hypothesis has:
- **Wound:** The parent fear or insecurity being addressed
- **Pillar:** Which Tutero pillar the ad leans on (Faculty 1.3%, Education Manager, Open Door, Knowing, Proof)
- **Reframe:** The 90° rotation — the non-obvious angle that makes this ad un-copyable

If no hypothesis is provided, do not design. Ask for one. Ads without hypotheses are generic and generic ads lose.

### Step 2: Identify the persona

Who exactly is this parent? Name them. From `paid-social-winner-insights-australia` Move 7:
- Working mum (guilt relief, convenience)
- ATAR-stressed parent (performance pressure, Year 11–12)
- ADHD/learning-difference parent (patience, 1:1 attention)
- Regional/remote family (access, no driving 90 minutes)
- Switcher (post-Cluey, post-tutoring centre — "tried others, didn't work")
- Anxious primary-school parent (early intervention, confidence)

An ad for "all parents" is an ad for no one.

### Step 3: Find the load-bearing word

The single word that, if removed, kills the ad. Examples from proven ads:
- "one" — "She made *one* phone call you haven't" (dissolves friction)
- "real" — "When you ring us, a *real* person answers" (does the entire emotional contract)
- "meet" — "*Meet* your teacher. Then book a lesson." (shifts from transactional to relational)
- "Hannah" — "30,000 teachers apply. *Hannah* got in." (a name is trust)

If you can't find the load-bearing word, the copy isn't sharp enough. Rewrite.

### Step 4: Choose the template

Match the hypothesis to the template that best serves it. See Part 3 for the full template catalogue. Quick decision matrix:

| Hypothesis angle | Best template | Why |
|---|---|---|
| Abundance of choice, faculty quality | **Tutor Grid** | Faces = choice = trust (Winners 2, 12) |
| Personal service, human guide, Ed Manager | **Workhorse Static** or **Text-on-Photo** | Scene photo (school gate, kitchen) grounds the human angle |
| Single teacher spotlight, 1.3% selectivity | **Text-on-Photo** with portrait | Face fills the frame, stats overlay — intimate |
| Real parent testimonial, outcome substitution | **Testimonial Quote Card** | Pull-quote is the hero, not the gradient title |
| Persona mirroring (specific archetype) | **Text-on-Photo** with persona image | Persona in the frame, ticks tell the story |
| Social proof, volume of evidence | **Polaroid Collage** | Three photos = pattern, not anecdote (Winner 11) |
| Brand awareness / scale flex | **Brand Flex** | Logo + tutor halo + scale claim (Winner 10) |

### Step 5: Write the copy layers

Every ad has 4 copy layers. Write them in this order:

1. **Primary text** (Meta ad copy — sits above the image in the feed). This is the narrative. 2–4 sentences max. Follows `tutero-tutoring-parent-copy-australia` rules.
2. **Eyebrow** (small pill/tag on the image — optional, used on light-blue card templates ONLY). The sharpest hook from the hypothesis. One sentence max. Examples: "She made one phone call you haven't", "Meet your teacher before you commit", "We accept 1.3% of teachers who apply".
3. **Tick content** (on-image value props). These must be **hypothesis-locked** — unique to this specific ad's angle. NEVER recycle the same 3 ticks across all ads. The middle tick should always be the risk-reducer ("Pay Per Lesson", "No Lock-in Contract", "No Hidden Fees").
4. **CTA label** — "Book a 1-on-1 lesson →" is the default.

### Step 6: Run the pre-flight

Score the ad 0–7 against the winning moves from `paid-social-winner-insights-australia`:

| # | Move | Check |
|---|------|-------|
| 1 | Year-range clarity ("Prep–Year 12" or sharper hook) | |
| 2 | At least one human face (real, not stock) | |
| 3 | Risk-reducer tick present | |
| 4 | Non-obvious outcome (confidence, screen time, guilt relief — not just "better grades") | |
| 5 | Australianness signal (AU flag, school uniform, "Australia" in copy, AU curriculum ref) | |
| 6 | Whole transaction visible (child + parent + tutor + laptop) or substantial chunk | |
| 7 | Specific persona named or visually obvious | |

**0–2:** Don't ship. **3–4:** Ship as experimental variant — creative risk-taking is valued. **5–6:** Strong candidate. **7:** Hero ad, put budget behind it.

---

## Part 2 — Brand Constants (Never Deviate)

These are non-negotiable. Every ad must use these exact values.

### Colours

| Token | Hex | Usage |
|---|---|---|
| `blue-50` | `#F0FAFF` | **Light blue card background** — the signature surface for tutoring ads |
| `blue-200` | `#C2E9FF` | Eyebrow pill background, tinted accents |
| `blue-500` | `#00A3FF` | Main tutoring blue — CTAs, accents |
| `blue-800` | `#004166` | Dark text on light backgrounds, subheads |
| `dark-text` | `#1A1A2E` | Body text |
| `gray-text` | `#5A5A70` | Subtext, captions |
| `white` | `#FFFFFF` | Tick pills, text on dark |
| `green` | `#22c55e` | Tick checkmark circles |

### The Tutoring Gradient (hero text fill)

The gradient has **two colour variants** — one for each background type. The hues are the same (blue → cyan → teal → gold → orange) but the photo-overlay version is lifted ~30% brighter so it reads against dark backgrounds.

**On light-blue (#F0FAFF) backgrounds:**
```css
background: linear-gradient(90deg, #1D49E3 0%, #00A3FF 15%, #66A693 35%, #E8A909 60%, #FF7A00 85%);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```

**On photo-overlay (dark) backgrounds:**
```css
background: linear-gradient(90deg, #5B8CFF 0%, #33C8FF 15%, #7EC9A8 35%, #F5C542 60%, #FF8C33 85%);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```

**Critical: Gradient stop compression.** The stops end at **85%, not 100%**. Because `background-clip: text` renders the gradient across the full element width but the text only occupies a portion, stops at 100% cause the rightmost colours (gold, orange) to fall outside the visible text. Compressing to 85% ensures the full blue→orange spectrum completes within the text. This is mandatory on both variants.

**Critical: NO white stroke.** The gradient hero text must **never** have `-webkit-text-stroke` or `paint-order: stroke fill`. The winning ads do not feature a white outline on the gradient text. The gradient itself is visually distinctive enough. Any stroke makes the text look bloated and is off-brand. This applies to ALL templates, both light-blue and photo-overlay backgrounds.

### Typography

| Role | Font | Weight | Size range | Line-height |
|---|---|---|---|---|
| Hero gradient word | Satoshi | 900 (Black) | 100–108px | **1.25** |
| Subhead | Satoshi | 900 (Black) | 42–48px | 1.1 |
| Eyebrow pill | Hanken Grotesk | 600 | 22px | — |
| Tick text (pill format) | Hanken Grotesk | 600 | 22–24px | — |
| Tick text (emoji format) | Hanken Grotesk | 600 | 28px | — |
| Footer URL | Hanken Grotesk | 600 | 18–20px | — |

**Critical: Hero line-height must be 1.25.** Satoshi 900 at 100–108px has deep descenders on letters like 'g', 'y', 'p'. At `line-height: 1` or `1.15`, the bottom of the 'g' in "Tutoring" is clipped. `1.25` provides safe clearance for all descenders. Never use `line-height: 1` on hero text.

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@700,900&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Canvas

All Meta feed statics are **1080 × 1350px** (4:5 aspect ratio). Outer border-radius: **32px**.

### Spacing Rules — Harmonious Positioning

Content must feel balanced and breathable across the entire canvas. Cramped ads look amateur.

| Rule | Light-blue card templates | Photo-overlay templates |
|---|---|---|
| **Top padding** | 48px | 64px |
| **Side padding** | 56px | 60px |
| **Bottom padding** | 56px | 80px |
| **Ticks → footer gap** | 24px | 28px |

**The 56px edge rule:** No content element (eyebrow, hero text, ticks, logo) should be closer than 56px to any edge. When content touches the edge zone, the ad feels unprofessional and cramped. This is the single most common "looks amateur" signal.

### Subhead Format (Standardised)

Always use this exact format: `for Prep – Year 12 🇦🇺`

- Lowercase "for" (it flows from the hero: "Online Tutoring" / "for Prep – Year 12")
- One 🇦🇺 flag on the right side only
- En dash (–) between Prep and Year
- On light-blue bg: `color: #004166;` (no stroke)
- On photo bg: `color: #FFFFFF;` (no stroke)

**Never:** `🇦🇺 For Prep – Year 12 🇦🇺` (capital F, double flags) — inconsistent and busy.

### Footer Format (Standardised)

Always use: `tutero.com.au`

**Never:** "Choose your dream tutor at tutero.com.au" or "Meet your dream tutor at tutero.com.au" — footer is not copy space.

### Logo

Use the primary logo SVG (`tutero-logo.svg`) on light backgrounds. Invert to white on dark/photo backgrounds:

```css
/* On dark backgrounds */
.logo { filter: brightness(0) invert(1); }
```

Logo height: **34–36px** in the footer.

---

## Part 3 — Design Templates

There are **5 active templates** (Template E is deprecated). Each serves a different hypothesis angle. Never produce a batch of ads that all use the same template — variety in the feed is a competitive advantage.

### Template A: Workhorse Static (Light-Blue Card)

**When to use:** Default for any hypothesis. The proven baseline. Works for school gate scenes, family photos, UGC-style images. Use when the PHOTO is supporting the copy, not dominating it.

**Layout:**
```
┌─────────────────────────────────────────┐  ← #F0FAFF bg, 32px radius
│  48px padding top                       │
│  ┌─────────────────────────┐            │
│  │ Eyebrow pill (C2E9FF)   │            │  ← hypothesis hook
│  └─────────────────────────┘  20px gap  │
│                                         │
│     Online Tutoring                     │  ← gradient (no stroke)
│     for Prep – Year 12 🇦🇺              │  ← #004166 (no stroke)
│                          24px gap       │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │         PHOTO (flex: 1)           │  │  ← 20px radius, object-fit: cover
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                          20px gap       │
│  ┌───────────────────────────────────┐  │
│  │ ● Tick one                        │  │  ← white pill, green circle + SVG check
│  │ ● Tick two                        │  │
│  │ ● Tick three                      │  │
│  └───────────────────────────────────┘  │
│                          24px gap       │
│  [tutero logo]     tutero.com.au        │  ← footer
│  56px padding bottom                    │
└─────────────────────────────────────────┘
```

**Key CSS:**
```css
.ad {
  width: 1080px; height: 1350px;
  background: #F0FAFF;
  border-radius: 32px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 56px 56px;
}
.hero-word {
  font-family: 'Satoshi', sans-serif;
  font-weight: 900;
  font-size: 104px;
  line-height: 1.25;
  text-align: center;
  background: linear-gradient(90deg, #1D49E3 0%, #00A3FF 15%, #66A693 35%, #E8A909 60%, #FF7A00 85%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* NO -webkit-text-stroke */
}
.subhead {
  font-family: 'Satoshi', sans-serif;
  font-weight: 900;
  font-size: 42px;
  line-height: 1.1;
  text-align: center;
  color: #004166;
  /* NO -webkit-text-stroke */
}
.photo-wrap {
  width: 100%; flex: 1; min-height: 0;
  border-radius: 20px; overflow: hidden;
}
.photo-wrap img { width: 100%; height: 100%; object-fit: cover; }
```

**Tick format (white pills):**
```html
<div class="tick">
  <div class="tick-check">
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  </div>
  <span>Value proposition here</span>
</div>
```
```css
.tick {
  background: #FFFFFF; border-radius: 14px;
  padding: 14px 22px; display: flex; align-items: center; gap: 14px;
  box-shadow: 0 2px 8px rgba(0,65,102,0.06);
}
.tick-check {
  width: 30px; height: 30px; background: #22c55e;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.tick span {
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600; font-size: 22px; color: #004166;
}
.ticks { margin-bottom: 24px; }  /* gives footer breathing room */
```

---

### Template B: Text-on-Photo (Full-Bleed) — Split Layout

**When to use:** When the photo IS the ad — a strong portrait, a kitchen scene, an evocative home moment. The text overlays the image. This feels more native in the feed (less "designed", more like a real post). Works best for: single tutor portraits, Ed Manager angle, lifestyle scenes, persona stories.

**Layout (split — hero at top, ticks at bottom):**
```
┌─────────────────────────────────────────┐  ← 32px radius
│  64px padding top                       │
│  ┌── top-group ──────────────────────┐  │
│  │  Online Tutoring                  │  │  ← bright gradient (no stroke)
│  │  for Prep – Year 12 🇦🇺           │  │  ← white text
│  └───────────────────────────────────┘  │
│                                         │
│         FULL-BLEED PHOTO                │  ← photo visible in middle zone
│         (dark overlay fades to clear)   │     through the transparent gradient
│                                         │
│  ┌── bottom-group ───────────────────┐  │
│  │  ✅ Tick one                      │  │  ← emoji + white bold text
│  │  ✅ Tick two                      │  │
│  │  ✅ Tick three                    │  │
│  │  ✅ Tick four                     │  │
│  │                       28px gap    │  │
│  │  [logo white]    tutero.com.au    │  │  ← white logo, muted URL
│  └───────────────────────────────────┘  │
│  80px padding bottom                    │
└─────────────────────────────────────────┘
```

**Key differences from Template A:**
- **Split layout** — hero at top, ticks+footer at bottom, photo visible in middle. Uses `justify-content: space-between` with `.top-group` and `.bottom-group` wrapper divs
- **Dual-zone gradient overlay** — dark at top AND bottom (for text readability), clear in the middle (so photo shows through). NOT bottom-only
- NO eyebrow pill (keep it simpler — the photo speaks)
- NO white tick pills (too "UI" on a photo background)
- Ticks use ✅ emoji + white bold text directly on the dark gradient
- Subhead is white (not blue)
- Can have **4 ticks** (more visual room since no pill cards)
- Logo is **white** (inverted)
- Bottom padding is **80px** (prevents border-radius clipping, gives logo space)
- Uses **brighter gradient variant** for hero text

**Key CSS:**
```css
.ad {
  width: 1080px; height: 1350px;
  border-radius: 32px; overflow: hidden; position: relative;
}
.bg-photo {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
  object-position: center 30%;  /* adjust per image — center the subject's face */
}
/* DUAL-ZONE gradient — dark top + dark bottom, clear middle */
.overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg,
    rgba(0,15,30,0.72) 0%,     /* dark at top — hero text zone */
    rgba(0,15,30,0.25) 20%,
    rgba(0,15,30,0.08) 45%,    /* nearly clear — photo shows through */
    rgba(0,15,30,0.25) 62%,
    rgba(0,15,30,0.72) 80%,    /* darkens again — tick zone */
    rgba(0,15,30,0.9) 100%     /* darkest at bottom */
  );
}
/* SPLIT layout — hero at top, ticks at bottom */
.content {
  position: relative; z-index: 2;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  justify-content: space-between;  /* hero pushed to top, ticks to bottom */
  padding: 64px 60px 80px;
}
.hero-word {
  font-family: 'Satoshi', sans-serif;
  font-weight: 900;
  font-size: 100px;
  line-height: 1.25;
  background: linear-gradient(90deg, #5B8CFF 0%, #33C8FF 15%, #7EC9A8 35%, #F5C542 60%, #FF8C33 85%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* NO -webkit-text-stroke — the brighter gradient reads on its own */
}
.subhead {
  font-family: 'Satoshi', sans-serif;
  font-weight: 900;
  font-size: 48px;
  line-height: 1.1;
  color: #FFFFFF;
  /* NO stroke */
}
```

**HTML structure (split groups):**
```html
<div class="content">
  <div class="top-group">
    <div class="hero-word">Online Tutoring</div>
    <div class="subhead">for Prep – Year 12 🇦🇺</div>
  </div>
  <div class="bottom-group">
    <div class="ticks">...</div>
    <div class="footer">...</div>
  </div>
</div>
```

**Tick format (emoji on photo):**
```html
<div class="tick"><span class="emoji">✅</span> Value proposition here</div>
```
```css
.tick {
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600; font-size: 28px; color: #FFFFFF;
  display: flex; align-items: center; gap: 12px;
}
.ticks { margin-bottom: 28px; }
```

**Critical: Photo object-position.** Every photo needs a tailored `object-position` to center the subject's face in the visible middle zone. Default `center center` often cuts off heads. For portraits: `center 15%` or `center 20%`. For group scenes: `center 30%`. Always test and adjust per image.

---

### Template C: Tutor Grid

**When to use:** "Meet your teacher", abundance/choice, faculty quality. Uses the light-blue card background with a grid of headshots replacing the single photo. Direct descendant of Winners 2 and 12.

**Layout:** Same as Template A, but the photo-wrap is replaced by a grid:
```css
.tutor-grid {
  width: 100%; flex: 1; min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 12px;
}
.tutor-cell {
  border-radius: 16px; overflow: hidden;
  background: #fff; display: flex; flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,65,102,0.06);
}
.tutor-cell img { width: 100%; flex: 1; min-height: 0; object-fit: cover; }
.tutor-cell .name-bar { padding: 8px 12px; text-align: center; }
.tutor-cell .name { font-family: 'Satoshi'; font-weight: 700; font-size: 19px; color: #004166; }
.tutor-cell .detail { font-family: 'Hanken Grotesk'; font-size: 13px; color: #5A5A70; }
```

**Grid rules:**
- 2×3 (6 tutors) is the standard — "enough to feel selectivity, not so many it's overwhelming"
- 4×2 (8 tutors) for a density variant — test it against 2×3
- Each tile needs: headshot photo, first name, subject + year levels
- Names should be multicultural-Australian (e.g., Anna, Liam, Priya, Tom, Hannah, Marcus)

---

### Template D: Testimonial Quote Card

**When to use:** Real parent testimonial, outcome substitution (Winner 3). The pull-quote is the hero. This template has a gradient hero title AND a testimonial card.

**Layout:**
```
┌─────────────────────────────────────────┐  ← #F0FAFF bg
│  48px padding top                       │
│                                         │
│  ┌───────────────────────┐              │
│  │ Eyebrow pill (context)│              │  ← sets up the testimonial
│  └───────────────────────┘              │
│                                         │
│     1-on-1 Tutoring                     │  ← gradient (no stroke)
│     for Prep – Year 12 🇦🇺              │  ← #004166 (no stroke)
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  "                                │  │  ← large decorative quote mark
│  │  "I spent months thinking I was   │  │
│  │   failing him. Then I rang Tutero │  │  ← pull-quote, 36px
│  │   and met Anna. Now I worry less."│  │
│  │                                   │  │
│  │   (88px avatar)  — Mum of Year 5  │  │  ← avatar + attribution
│  └───────────────────────────────────┘  │
│                                         │
│  ● Tick one                             │  ← white pills
│  ● Tick two                             │
│  ● Tick three                           │
│                          24px gap       │
│  [tutero logo]     tutero.com.au        │
│  56px padding bottom                    │
└─────────────────────────────────────────┘
```

**Key rules:**
- The eyebrow sets CONTEXT for the quote (e.g., "What one mum said after week 3") — it is NOT a headline or punchline
- The quote should describe a **changed home life**, not praise the product. "Her confidence is through the roof" > "The tutors are great". Hunt for non-obvious outcomes: confidence, less screen time, less homework fights, guilt relief
- The avatar should be **88px** diameter minimum — big enough to add warmth and credibility
- Uses light-blue gradient variant for hero text (same as Template A)

---

### Template E: Persona Static — ⚠️ DEPRECATED

**Do not use this template.** Chat bubble mockups in paid social ads read as artificial and staged. Nobody scrolling Instagram thinks "this looks like a real chat." The template was tested and received feedback that it "does not really make sense."

**Instead:** For persona-story angles (working mum, ADHD parent, regional family), use **Template B (Text-on-Photo)** with the persona's image as the full-bleed background. The ticks tell the story; the photo shows the persona in their real environment.

---

### Template F: Polaroid Collage

**When to use:** When you have 3+ real customer photos. Volume of evidence — "lots of families do this" (Winner 11). Three tilted polaroid-style photos beat one perfect stock photo.

**Layout:**
```
┌─────────────────────────────────────────┐  ← #F0FAFF bg
│                                         │
│     Online Tutoring                     │  ← gradient hero (no stroke)
│     for Prep – Year 12 🇦🇺              │
│                                         │
│     ┌──────┐  ┌──────┐  ┌──────┐       │
│     │ 📷   │  │ 📷   │  │ 📷   │       │  ← 3 photos, tilted ±3–5°
│     │      │  │      │  │      │       │     white border (polaroid)
│     │      │  │      │  │      │       │     each shows parent+child+laptop
│     └──────┘  └──────┘  └──────┘       │
│                                         │
│  ✅ Qualified Teachers & Tutors         │  ← ticks (green pill or emoji)
│  ✅ Personalised 1:1 Lessons            │
│                                         │
│  [logo]              tutero.com.au      │
└─────────────────────────────────────────┘
```

**Key rule:** The polaroid tilt signals "user-submitted" which raises trust. Use `transform: rotate(±3deg)`.

---

## Part 4 — Copy Rules for On-Image Text

### Eyebrow pill (Templates A, C, D only — NEVER on photo-overlay)

The eyebrow is the **sharpest hypothesis-specific hook**. It's the first thing the eye reads after the gradient hero. One sentence max.

**Good eyebrows:**
- "She made one phone call you haven't" (reframe, specific, intriguing)
- "Meet your teacher before you commit" (action, low-risk)
- "We accept 1.3% of teachers who apply" (stat, selectivity)
- "What one mum said after week 3" (sets context for testimonial)

**Bad eyebrows:**
- "Personalised tutoring for your child" (generic, could be any service)
- "Every family gets a real Education Manager" (descriptive, not a hook)
- "Online tutoring for Australian students" (just describing the product)
- "Less worry. More Anna." (this is a headline/punchline, not a setup — eyebrows set context)

The test: if you could put this eyebrow on a Cluey ad and it would still make sense, it's too generic.

**Eyebrow deconfliction rule:** No two ads within the same hypothesis batch may start their eyebrow with the same opening phrase. If Ad 2A says "She made one phone call you haven't", Ad 4A cannot say "She made one phone call. It changed Tuesdays." — they blur together in the feed. Every eyebrow must be instantly distinguishable.

### Ticks — hypothesis-locking and overlap prevention

Every ad's ticks must be **unique to its hypothesis**. Never copy-paste the same 3 ticks across all ads in a batch.

**The overlap rule: No two ads within the same hypothesis may share more than 1 tick.** This is the most commonly violated rule and the single biggest reason ads feel repetitive.

Example of correct tick distribution (Pickup-Line Mum hypothesis, 4 ads):

| Ad | Tick 1 | Tick 2 | Tick 3 |
|---|---|---|---|
| 2A | Same Teacher Every Week | See Progress After 3 Lessons | Pay Per Lesson |
| 2B | Your Own Education Manager | A Real Person Picks Up The Phone | Weekly Lesson Reports |
| 4A | Matched by a Real Human | No Call Centre, No Chatbot | Pay Per Lesson |
| 4B | She Reads Every Lesson Report | Written Progress Summary Each Session | Cancel Anytime — No Contract |

Check: every pair shares 0 ticks. ✅

**Tick pool by pillar (draw from these, never repeat across ads):**

**Education Manager pillar:**
- A Real Person Picks Up The Phone
- Your Own Education Manager
- Same Teacher Every Week
- Weekly Lesson Reports / Written Report After Every Session
- She Reads Every Lesson Report
- Matched by a Real Human — Not an Algorithm
- No Call Centre, No Chatbot
- See Progress After 3 Lessons

**Tutor Audition / 1.3% pillar:**
- Meet Your Teacher First — No Commitment
- Meticulously Handpicked Tutors
- We Accept 1.3% of Teachers Who Apply / 1.3% Acceptance Rate
- Qualified Teachers & Tutors
- Same Teacher Every Lesson
- Your Own Education Manager
- Weekly Progress Reports

**Risk/cost pillar:**
- Pay Per Lesson
- No Lock-in Contract
- No Hidden Fees
- Cancel Anytime — No Contract
- Transparent Pricing

**Move 3 rule:** The middle tick should always be the risk-reducer ("Pay Per Lesson", "No Lock-in Contract"). This is the tick that converts — parents are loss-averse.

### Tick format by template

| Template | Tick format | Max ticks |
|---|---|---|
| A (Workhorse), C (Grid) | White pill with green circle + SVG checkmark | 3 |
| B (Text-on-Photo) | ✅ emoji + white bold text on dark gradient | 4 |
| D (Quote Card) | White pill with green circle + SVG checkmark | 3 |
| F (Polaroid) | Either format works | 2–3 |

---

## Part 5 — Image Generation

### API setup

Use Gemini Flash image preview via OpenRouter:

```python
response = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": "google/gemini-3.1-flash-image-preview",
        "messages": [{"role": "user", "content": prompt}],
        "image_config": {"aspect_ratio": aspect_ratio},
    },
    timeout=120,
)
```

Aspect ratios: `"4:5"` for full-bleed photos, `"1:1"` for tutor headshots and testimonial avatars.

### The anti-AI negative block

**MANDATORY on every prompt.** Append this to the end of every image generation prompt:

```
NEGATIVE / AVOID: AI glow, soft rim lighting around subjects, halo lighting, golden hour orange tint, teal and orange colour grading, dreamy bokeh, extreme shallow depth of field, smooth airbrushed skin, perfect skin, retouched skin, flawless complexion, perfect symmetrical composition, cinematic colour science, HDR look, over-saturated colours, warm peachy skin tones, oversaturated warmth, studio lighting, softbox lighting, ring light, fashion editorial aesthetic, magazine photoshoot, Pinterest mood board feel, generic stock photo, diverse stock group arrangement, perfectly tidy environment, sterile modern interior, chalkboard background, apple on desk, graduation cap, headset on child, corporate tutoring centre, learning centre interior, text in image, watermark, brand logos visible, perfect lighting, dramatic lighting, moody lighting, film grain effect, Instagram filter, VSCO filter, beauty filter, AI rendering, 3D render, illustration, painting.
```

### Prompt structure

Every prompt must start with: `"Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter."`

### Photo composition for text-on-photo ads

When generating images for Template B, the subject must be positioned to work with the split layout:
- **Leave space at top and bottom** — the gradient overlay will darken these zones for text
- **Subject's face should be in the middle third** — the clear zone of the dual gradient
- **Specify text overlay space** in the prompt: "with clear space in the upper quarter and lower third for text overlay"

### Strategic object-position per image type

After generating images, set `object-position` CSS per image to center the subject correctly:

| Image type | Recommended object-position |
|---|---|
| Portrait / headshot (for photo-wrap in Template A) | `center 15%` or `center 20%` |
| Full-bleed portrait (Template B) | `center 30%` (keeps face in clear middle zone) |
| Group scene (school gate, kitchen) | `center center` or `center 40%` |
| Overhead/flat lay (kitchen counter) | `center center` |

**Never rely on the default.** Always set an explicit `object-position`.

### Concurrent generation

Generate all images in parallel (4 workers max) for efficiency:

```python
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    futures = {executor.submit(generate_image, p, path, ar): name for name, p, ar, path in tasks}
```

### Image types needed per template

| Template | Images needed |
|---|---|
| A (Workhorse) | 1 scene photo (school gate, kitchen, home) |
| B (Text-on-Photo) | 1 strong photo (portrait, scene — must work with split layout overlay) |
| C (Tutor Grid) | 6–12 individual headshots (1:1 aspect ratio) |
| D (Quote Card) | 1 parent portrait/avatar (1:1 aspect, warm, candid) |
| F (Polaroid) | 3 different family photos |

---

## Part 6 — Technical Implementation

### File structure

```
ads/
  ads.json              ← registry of all ads
  index.html            ← gallery page (serves from /ads/)
  images/               ← generated images
    tutero-logo.svg     ← logo (copy from shared/images/)
    2a-school-gate.png
    3a-tutor-anna.png
    ...
  creatives/            ← HTML ad files (1080×1350 each)
    2a-mum-at-the-gate.html
    2b-anna-picks-up.html
    ...
  generate_images.py    ← image generation script
```

### ads.json schema

Every ad must be registered:

```json
{
  "name": "2A — The Mum at the Gate",
  "hypothesis": "Pickup-Line Mum",
  "format": "Feed",
  "headline": "The mum who knows something you don't.",
  "body": "Primary text for Meta Ads Manager...",
  "cta_label": "Book a 1-on-1 lesson →",
  "cta_url": "https://tutero.com",
  "audience": "Pickup-line mums, cold",
  "image": "images/2a-school-gate.png",
  "creative_file": "creatives/2a-mum-at-the-gate.html",
  "pillar": "Education Manager (white-glove)",
  "reframe": "The parents of thriving kids made one phone call.",
  "load_bearing_word": "one"
}
```

### Gallery page (index.html)

The gallery groups ads by hypothesis and renders HTML creatives as scaled iframes:

```javascript
// Group ads by hypothesis
var groups = {};
filtered.forEach(function(ad) {
  var key = ad.hypothesis || 'Uncategorised';
  if (!groups[key]) groups[key] = [];
  groups[key].push(ad);
});

// Render each group with a section header
groupOrder.map(function(hypothesis) {
  return '<div class="hypothesis-section">' +
    '<div class="hypothesis-header"><h2>' + hypothesis + '</h2>' +
    '<span class="count">' + ads.length + ' ads</span></div>' +
    '<div class="grid">' + cards + '</div></div>';
});
```

Iframe scaling:
```javascript
function scaleIframe(iframe) {
  var wrap = iframe.parentElement;
  var scale = wrap.offsetWidth / 1080;
  iframe.style.transform = 'scale(' + scale + ')';
}
```

---

## Part 7 — Anti-Patterns (Learned from Iteration)

These are specific mistakes made during the development of this skill. Each one wasted a round of feedback. Don't repeat them.

### Anti-pattern 1: Dark backgrounds

**What happened:** First iteration used dark (#2a2520) backgrounds with custom layouts, speech bubbles, phone mockups, translucent overlay bars.

**Why it's wrong:** Tutoring ads MUST use light blue (#F0FAFF) or full-bleed photos. Dark backgrounds feel corporate and off-brand.

**Rule:** Background is either #F0FAFF (light blue card) or a full-bleed photo. Nothing else.

### Anti-pattern 2: Cookie-cutter templates

**What happened:** Second iteration made all 4 ads follow the identical template with no variation.

**Why it's wrong:** Variety in the feed is a competitive advantage. If all 4 ads look identical, the parent sees one and scrolls past the rest.

**Rule:** A batch of 4+ ads must use at least 2 different templates. Preferably 3.

### Anti-pattern 3: Generic copy recycled across ads

**What happened:** All 4 ads had the same generic ticks and the eyebrow was descriptive rather than hypothesis-specific.

**Why it's wrong:** If the ticks are interchangeable between ads, the ads aren't testing different hypotheses.

**Rule:** No two ads in a batch should share more than 1 tick. The eyebrow must be unrecyclable.

### Anti-pattern 4: White tick pills on photo backgrounds

**What happened:** Photo-overlay ads used the same white rounded pill cards as the light-blue card ads.

**Why it's wrong:** The white pills look like "app UI" on a photo background. Winning reference ads use ✅ emoji + bold text directly on the dark gradient.

**Rule:** White pill ticks on light-blue backgrounds. ✅ emoji ticks on photo backgrounds. Never mix.

### Anti-pattern 5: White stroke on gradient hero text

**What happened:** Multiple iterations added `-webkit-text-stroke: 5px #FFFFFF` and `paint-order: stroke fill` to the gradient hero text.

**Why it's wrong:** The winning ads do NOT feature a white outline on the gradient text. The stroke makes the text look bloated and is NOT part of the brand aesthetic. This was confirmed across multiple feedback rounds. The gradient itself provides enough visual impact.

**Rule:** NEVER add `-webkit-text-stroke` or `paint-order: stroke fill` to the gradient hero text. On ANY template, ANY background. This is the single most common CSS mistake in this skill.

### Anti-pattern 6: Bottom overflow / border-radius clipping / cramped logo

**What happened:** Photo-overlay layouts had content sitting too close to the bottom edge. The logo felt squished against the bottom. The 32px border-radius clipped into the footer area.

**Why it's wrong:** Content gets cut off, logo feels cramped, whole ad looks amateur.

**Rule:** Photo-overlay layouts: **80px bottom padding** minimum. Light-blue card layouts: **56px** minimum. Ticks must have **24px margin-bottom** before the footer. Always account for the 32px border-radius eating into the visual padding.

### Anti-pattern 7: Eyebrow pills on photo-overlay layouts

**What happened:** Photo-overlay ads had an eyebrow pill floating at the top of the image.

**Why it's wrong:** The photo-overlay format should be simpler — the photo speaks. Adding eyebrow + hero + subhead + ticks makes it too busy.

**Rule:** Eyebrow pills belong on light-blue card templates (A, C, D) only. Never on photo-overlay (B).

### Anti-pattern 8: "Too busy" (the most common failure)

**What happened:** First iteration had overlapping speech bubbles, phone mockups, translucent bars, multiple text zones competing for attention.

**Why it's wrong:** Paid social ads must be scannable in under 2 seconds.

**Rule:** Count the visual elements. If there are more than 5 (including the photo), remove something.

### Anti-pattern 9: Chat bubbles / Persona Static template

**What happened:** Template E used chat bubble mockups to tell a persona story. Feedback: "this ad does not really make sense."

**Why it's wrong:** Chat bubble mockups are artificial. Nobody scrolling a feed thinks they're looking at a real conversation. The concept is forced.

**Rule:** Template E is deprecated. For persona-story angles, use Template B (Text-on-Photo) with the persona's image as full bleed. Let the ticks tell the story.

### Anti-pattern 10: Bottom-only content on text-on-photo (wasted space at top)

**What happened:** All text-on-photo ads used `justify-content: flex-end` to push all content to the bottom. The top 50% of the ad was empty photo with a light gradient — a massive waste of visual real estate.

**Why it's wrong:** It makes the ad look like a photo with a caption slapped on the bottom. The top half is "wasted space" that adds nothing.

**Rule:** Use the split layout: hero text at TOP, ticks+footer at BOTTOM, photo visible in the MIDDLE. `justify-content: space-between` with top-group and bottom-group wrapper divs. The dual-zone gradient darkens both text zones while leaving the middle clear for the photo.

### Anti-pattern 11: Same gradient colours on dark backgrounds

**What happened:** Used the standard gradient (#1D49E3 → #00A3FF → #66A693 → #E8A909 → #FF7A00) on photo-overlay ads. The dark blue and teal portions disappeared against the dark overlay.

**Why it's wrong:** The blue (#1D49E3) and teal (#66A693) are too dark to read against a dark background. Only the gold and orange were visible, making the gradient look "messed up."

**Rule:** Use the brighter gradient variant on photo-overlay backgrounds: `#5B8CFF → #33C8FF → #7EC9A8 → #F5C542 → #FF8C33`. Same hues, lifted ~30%.

### Anti-pattern 12: Gradient stops at 100% (orange never visible)

**What happened:** Gradient stops were evenly distributed (0%, 25%, 50%, 75%, 100%). The orange end of the gradient was invisible because `background-clip: text` renders the gradient across the full element width, but the text only occupies a portion.

**Why it's wrong:** The rightmost colours (gold, orange) — which are the most eye-catching — fell outside the visible text area. The gradient looked like it ended on teal/green instead of the signature orange.

**Rule:** Compress gradient stops to end at 85%: `0% → 15% → 35% → 60% → 85%`. This ensures the full blue-to-orange spectrum completes within the visible text.

### Anti-pattern 13: Descender clipping (line-height too low)

**What happened:** Used `line-height: 1` (then `1.15`) on the hero text. The bottom of the 'g' in "Tutoring" was clipped.

**Why it's wrong:** Satoshi 900 at 100–108px has deep descenders. Standard line-heights clip them.

**Rule:** Hero text `line-height: 1.25` minimum. Never use `1` or `1.15`.

### Anti-pattern 14: Content too close to edges

**What happened:** Side padding was 52px, making content feel cramped against the edges. Bottom padding was 44px (card) / 64px (photo), making the logo feel squished.

**Why it's wrong:** The "squished" feeling is the single most common reason ads look amateur rather than professional.

**Rule:** Minimum padding: 48px top, 56px sides, 56px bottom (card) / 64px top, 60px sides, 80px bottom (photo). No content element should be closer than 56px to any edge.

### Anti-pattern 15: Eyebrow repetition within hypothesis batch

**What happened:** Two ads in the Pickup-Line Mum hypothesis both started with "She made one phone call..." — one said "...you haven't", the other said "...It changed Tuesdays."

**Why it's wrong:** If a parent sees both ads in the same session, they blur together. The eyebrows need to be instantly distinguishable.

**Rule:** No two eyebrows within the same hypothesis may share their opening phrase. Every eyebrow must be independently recognisable.

### Anti-pattern 16: Inconsistent footer and subhead

**What happened:** Some ads said "Choose your dream tutor at tutero.com.au", others just "tutero.com.au". Some subheads had capital "For" and double flags, others lowercase "for" and single flag.

**Why it's wrong:** Inconsistency undermines brand trust and looks sloppy.

**Rule:** Footer is always `tutero.com.au`. Subhead is always `for Prep – Year 12 🇦🇺` (lowercase, one flag, right side).

---

## Part 8 — Full Production Checklist

Run this before delivering any ad batch:

### Per-ad checks
- [ ] Background is **light blue (#F0FAFF)** OR **full-bleed photo** — not dark, not white, not purple
- [ ] Hero noun has the **correct gradient variant** (standard on light-blue, bright on photo-overlay)
- [ ] Gradient stops end at **85%** not 100%
- [ ] Hero text has **NO `-webkit-text-stroke`** (no white outline)
- [ ] Hero text has **`line-height: 1.25`** (descenders not clipped)
- [ ] Subhead has **NO stroke** — plain colour only
- [ ] Subhead format: lowercase `for Prep – Year 12 🇦🇺` (one flag, right side)
- [ ] At least one **🇦🇺 AU flag** visible
- [ ] Photography is **UGC-style** — not stock, not classrooms, not studios
- [ ] At least one **human face** in the creative
- [ ] Photo has explicit **`object-position`** set (not relying on default)
- [ ] Ticks are **hypothesis-locked** — not recycled from other ads
- [ ] One tick is a **risk-reducer** ("Pay Per Lesson", "No Lock-in Contract")
- [ ] Tick format matches the background: **white pills on light blue**, **✅ emoji on photo**
- [ ] No purple anywhere — this is tutoring, not tutero.ai
- [ ] Tutero logo is present (primary on light, white on dark)
- [ ] Footer says **just "tutero.com.au"** — no extra copy
- [ ] Bottom padding: **56px min on card**, **80px min on photo-overlay**
- [ ] Side padding: **56px min** — no content touching edge zone
- [ ] Total visual elements ≤ 5 (not busy)
- [ ] No eyebrow pill on photo-overlay templates
- [ ] Text-on-Photo uses **split layout** (hero at top, ticks at bottom)
- [ ] Pre-flight score ≥ 3 (against the 7 moves)

### Batch checks
- [ ] **At least 1 ad uses an experimental layout from the style inspiration file (not Templates A–F)**
- [ ] **No single template letter accounts for more than 30% of the batch**
- [ ] **No two ads share more than 1 tick** within same hypothesis
- [ ] **No two eyebrows share their opening phrase** within same hypothesis
- [ ] Each ad tests a distinct hypothesis angle
- [ ] ads.json updated with all entries (including hypothesis field for gallery grouping)
- [ ] **All images generated via `generate_image()` and saved to ads/images/** — verify every file exists on disk, not just listed in ads.json
- [ ] **Every HTML creative's `<img src>` resolves to an existing file** — no broken image references
- [ ] **ads.json `image` field matches the actual filename used in the HTML** for every ad
- [ ] Gallery page renders all creatives correctly in hypothesis groups
- [ ] Primary text (Meta ad copy) written for each ad
- [ ] Load-bearing word identified for each ad

---

## Part 9 — Example Workflow

Here's the exact sequence for producing a batch of 4 ads:

1. **Receive hypotheses** — Read the brief. Extract: wound, pillar, reframe, load-bearing word for each ad.

2. **Run the cognition system** (Part 1, Steps 1–6) for each ad. Write down: template choice, eyebrow, ticks, primary text, image description.

3. **Deconflict ticks and eyebrows** — Before generating anything, lay out all ticks in a table. Check every pair within each hypothesis shares ≤ 1 tick. Check no two eyebrows share their opening phrase. Fix overlaps before proceeding.

4. **Generate images (MANDATORY — DO NOT SKIP)** — For each ad, list every image file needed (filename + prompt). Execute `generate_image()` from `tutoring-image-generator-australia` for every image. Append the ANTI_GLOW suffix to every prompt. For Template B images, specify text overlay space in the prompt. Generate all images concurrently (4 workers max). Review every generated image for AI glow — regenerate any that fail the 5-second test. **⚠️ HARD GATE: After generation, verify every image file exists on disk in `ads/images/`. Do not proceed to step 5 until all images are confirmed. This is the #1 failure mode — building HTML that references images that were never generated.**

5. **Copy the logo** — `cp shared/images/tutero-logo.svg ads/images/tutero-logo.svg`

6. **Build HTML creatives** — One file per ad in `ads/creatives/`. Use the exact template CSS from Part 3. **Every `<img src="...">` must reference an image that already exists from step 4.** Key checks per file:
   - Correct gradient variant (standard vs bright)
   - Gradient stops at 85%
   - NO `-webkit-text-stroke` anywhere
   - `line-height: 1.25` on hero
   - Correct padding (48/56/56 card, 64/60/80 photo)
   - Template B uses split layout with top-group/bottom-group
   - Explicit `object-position` on all photos
   - Footer is just "tutero.com.au"

7. **Update ads.json** — Register all ads with full metadata including `hypothesis` field.

8. **Run the production checklist** (Part 8) — Every checkbox must pass.

9. **Preview** — Open the gallery page. Verify each creative renders correctly in the iframe preview. Open each creative at full size (1080×1350) to verify: layout balance, text legibility, tick alignment, descender integrity, gradient colour completion (must end on orange), logo breathing room.

---

## Part 10 — What This Skill Does NOT Cover

- **Video/Reel ads** — This skill is for static creatives only. Video UGC follows different rules.
- **Carousel ads** — Different format, different layout logic.
- **Florida/US ads** — Use `tutero-florida-sufs-creative-designer` instead.
- **tutero.ai / Schools ads** — Use `tutero-ai-ad-rules` instead. Never use blue palette for Schools.
- **Copywriting theory** — For the full copy system (forbidden words, pillars, thinking moves, objection map), see `tutero-tutoring-parent-copy-australia`.
- **Brand fundamentals** — For logos, typography rules, and the gradient recipe, see `tutero-brand`.
- **Image generation deep dive** — For prompt templates, persona skeletons, and anti-AI aesthetic rules, see `tutoring-image-generator-australia`.
