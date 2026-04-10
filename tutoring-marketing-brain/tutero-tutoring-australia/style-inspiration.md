---
name: style-inspiration
description: >
  Layout blueprint library for paid social ad creatives. Contains structural inspiration
  extracted from diverse ads across industries. Zara reads this for LAYOUT MOVES ONLY —
  never for colours, copy, typography, or image style. User-populated.
---

# Style Inspiration Library

This file contains **layout blueprints** — abstract structural templates extracted from high-performing ads across industries. Each entry describes HOW elements are arranged, not what they say or how they look.

## Hard Rules

**NEVER extract from these entries:**
- Colours or palettes — always use Tutero palette from Part 2 of the design system
- Copy, messaging, or tone — always use Tutero copy rules from Skill 3
- Typography choices — always use Satoshi / Hanken Grotesk from Part 2
- Image aesthetics or style — always follow anti-AI aesthetic from Skill 4
- Brand-specific design details (logos, icons, ornamental elements)

**DO extract from these entries:**
- Element arrangement — where text, images, and supporting elements sit on the canvas
- Visual hierarchy — what the eye hits first, second, third
- Proportional relationships — how much canvas each element claims
- Novel compositional devices — the structural move that makes the layout fresh

Each blueprint is a **floor plan, not a photo of a house.** Build it with Tutero materials.

---

## CSS Adaptation Guidelines

When building an experimental layout from a blueprint, follow this process:

**Step 1: Start with brand constants (these never change):**
- Canvas: 1080×1350px, `border-radius: 32px`
- Background: `#F0FAFF` (light-blue) or full-bleed photo
- Hero text: Satoshi 900, gradient fill (standard or bright variant), `line-height: 1.25`, stops at 85%
- Body/ticks: Hanken Grotesk 600
- Minimum padding: 56px sides, 48px top, 56px bottom (card) / 64px top, 60px sides, 80px bottom (photo)
- Footer: `tutero.com.au`, Hanken Grotesk 600, 18–20px
- Logo: 34–36px height
- NO `-webkit-text-stroke` anywhere

**Step 2: Adapt only the element arrangement:**
- Change WHERE elements sit (top/middle/bottom/left/right/centered)
- Change HOW MUCH canvas each element claims (50/50 split, 60/40, etc.)
- Change WHICH elements are present (you may omit eyebrow, ticks, subhead, or photo — but logo and footer are always required)
- Change the FLOW (vertical stack, horizontal split, grid, diagonal)

**Step 3: Handle elements that don't apply:**
- If the blueprint has no photo (e.g., Metric Wall, Stacked Headline): omit the photo — the layout works without it
- If the blueprint has no ticks (e.g., Magazine Cover, Giant Quote): omit ticks — the layout works without them
- If the blueprint has no eyebrow: omit it
- Always keep: logo, footer (`tutero.com.au`), at least one headline or text element with the Tutero gradient

**What you're building is a Tutero ad that HAPPENS to use a different layout — not a different brand's ad.**

---

## How to Add an Entry

```
### [Name of the layout move]

**Element arrangement:** [Where text, image, and supporting elements sit — proportions, hierarchy, spatial relationships]

**The novel device:** [The ONE structural thing that differentiates this from Templates A–F]

**When this works:** [What kind of hypothesis, message, or tone this layout serves]
```

---

## Entries

### 1. The Oversized Statement

**Element arrangement:** A single bold headline claims 50–60% of the canvas height, set large enough that it becomes a visual texture, not just text. A lifestyle photo sits below in the remaining 40%, supporting the statement but clearly secondary. Very few other elements — maybe a small logo and one line of subtext. The text IS the visual.

**The novel device:** Scale inversion — the headline is so oversized that it dominates the way a photo normally would. The photo becomes the supporting element, not the hero. This is the opposite of most Tutero templates where photo and text share the stage.

**When this works:** Bold reframes and provocative hypotheses that need the words to hit first. When the headline alone is strong enough to stop a scroll — "Actually, She's Fine" or "One Phone Call" type energy.

---

### 2. The Magazine Cover

**Element arrangement:** A full-bleed close-up portrait photograph fills the entire canvas. A short, bold headline is overlaid in the upper third, sitting on the photo with enough contrast to read (via overlay, text shadow, or strategic placement on a darker area of the photo). No ticks, no eyebrow, no subhead — just face + one line. Logo tucked in a corner.

**The novel device:** Radical reduction — stripping away every element except the face and one line of text. The photo does 80%+ of the emotional work. Most Tutero templates layer 5+ elements; this uses 2.

**When this works:** Persona-specific hypotheses where a single face + a single line creates instant identification. "Working mum" or "ATAR-stressed teen" — when the parent should see themselves (or their child) in one glance.

---

### 3. The Metric Wall

**Element arrangement:** 3–4 large statistics or data points arranged in a grid (2×2) or vertical stack, each displayed as an oversized number with a small label beneath it. The numbers are the hero visual — sized at headline scale (80–100px+). A short headline sits above the grid, and a small logo/footer below. No lifestyle photos.

**The novel device:** Data as visual design — the numbers themselves create the layout composition. Instead of a photo stopping the scroll, it's the density of impressive figures. None of Zara's current templates use stats as the primary visual element.

**When this works:** Faculty/proof hypotheses — "Top 1.3%", "30,000+ applications", "4,000+ families", "200,000+ lessons". When the proof stack is more compelling than any photo. Cold audiences who need credibility signals.

---

### 4. The Stacked Headline

**Element arrangement:** 3–5 short text lines stacked vertically, each line given its own typographic treatment — alternating between large/small, heavy/light, or gradient/solid. No photo. The text block occupies the central 60% of the canvas, vertically centered. Supporting elements (ticks, footer) sit below. The canvas background is a single flat colour.

**The novel device:** Typographic rhythm as visual interest — the variation between lines creates a visual pattern that functions like an image. The eye bounces between treatments. None of Zara's templates use text-only layouts with deliberate weight/scale alternation.

**When this works:** Sharp antithesis copy that benefits from line-by-line reading. "She didn't fail. The system did." / "Not a platform. A person." — where the pause between lines does emotional work.

---

### 5. The Inset Frame

**Element arrangement:** A photo is contained within a rounded rectangle that's noticeably smaller than the full canvas — inset by 40–60px on all sides. The canvas background colour is visible around the entire photo, creating a "mat" or "frame" effect. The headline sits above the photo (outside the frame), ticks sit below. The framed photo is the centrepiece but feels curated, not raw.

**The novel device:** Deliberate containment — the visible border around the photo signals curation and care. It says "we chose this image" rather than "here's a photo." This is different from Template A where the photo fills its container edge-to-edge.

**When this works:** White-glove / premium hypotheses — Education Manager, curated experience, "hand-picked tutor." The framing device itself communicates selectivity. Also good for testimonial photos that should feel presented, not casual.

---

### 6. The Horizontal Split

**Element arrangement:** The canvas is divided into two roughly equal zones — left and right (or top and bottom). One zone contains the photo, the other contains all text (headline, subhead, ticks). A clear vertical (or horizontal) dividing line or colour change separates them. Neither zone dominates — they carry equal visual weight.

**The novel device:** Equal-weight dualism — text and image share the stage 50/50 instead of one being primary. Creates a "two panels, one message" reading pattern. None of Zara's templates use a true 50/50 split.

**When this works:** Before/after or cause-and-effect hypotheses — "This side is the problem, this side is the solution." Also works when you have a strong photo AND strong copy and don't want to sacrifice either.

---

### 7. The Floating Cutout

**Element arrangement:** A person (or group) is cut out from their original photo background — no rectangular frame, just the silhouette of the figure(s) floating on a flat canvas colour. Text wraps around or sits beside the floating figure. Ticks and footer below. The cutout creates irregular white space around the figure that feels dynamic.

**The novel device:** Breaking the rectangle — every Tutero template puts photos in rectangular containers. A cutout figure feels more editorial, more magazine, more premium. The irregular edges create organic negative space.

**When this works:** Tutor spotlight or faculty hypotheses — showing a tutor "stepping out" of a box feels more personal than a contained headshot. Also good for parent-child pairs where the relationship (body language, proximity) is the message.

---

### 8. The Full-Scene Immersion

**Element arrangement:** An edge-to-edge lifestyle photograph fills 100% of the canvas. Text is radically minimal — only a logo, a URL, and optionally one very short line (5 words max). No headline competing for attention. The scene itself IS the entire message. A subtle gradient overlay at the bottom provides contrast for the logo/URL.

**The novel device:** Maximum restraint — trusting the photo to do ALL the communication. No headline, no ticks, no eyebrow. This is the anti-Template A: instead of 5 layered elements, it's 1 element doing everything. Zara's templates always layer copy onto images; this removes the copy.

**When this works:** Retargeting / warm audiences who already know Tutero. Also works for brand-awareness plays where the goal is emotional association, not information delivery. The kitchen scene, the school gate moment, the laptop lesson — when the scene is so specific it doesn't need words.

---

### 9. The Giant Quote

**Element arrangement:** A pull-quote occupies the central 70% of the canvas, displayed in large text (60–80px) with open/close quotation marks as decorative elements. A small circular avatar (60–80px diameter) and one-line attribution sit below the quote. Minimal other elements — just the canvas colour, the quote, and the person who said it.

**The novel device:** Quote as hero visual — the quotation marks and large text size turn words into a graphic element. Different from Template D (Testimonial Quote Card) because it strips away the eyebrow, ticks, and subhead — it's JUST the quote. Radical simplicity.

**When this works:** When you have a testimonial so good it can stand completely alone. "Her confidence is through the roof and she barely touches her phone now" — that doesn't need ticks or a subhead. Let it breathe.

---

### 10. The Tilted Grid

**Element arrangement:** 3–6 photos arranged in a grid or cluster, but each photo is rotated 2–5 degrees in alternating directions (some clockwise, some counter-clockwise). The slight tilt gives the grid a handmade, pinboard feeling. Text (headline, ticks) sits above or below the photo cluster. The photos may slightly overlap.

**The novel device:** Controlled imperfection — the rotation breaks the rigid grid that Zara's Tutor Grid (Template C) uses. Tilted photos signal "real, not corporate" and feel user-submitted. The slight overlap creates depth. This could evolve Template C from "database of headshots" to "wall of real people."

**When this works:** Volume-of-evidence and social proof hypotheses. Multiple tutors, multiple families, multiple success stories. When you want the quantity to feel organic rather than corporate.

---

### 11. The Storyboard Strip

**Element arrangement:** The canvas divided into 2–3 distinct horizontal bands or vertical columns. Each panel contains a different photo and/or text moment. Together they tell a micro-story: panel 1 is the "before" (problem), panel 2 is the "during" (product), panel 3 is the "after" (outcome). Thin dividers or gaps between panels. Text can be overlaid on each panel or sit outside them.

**The novel device:** Sequential narrative in a static frame — it forces the viewer to read left-to-right or top-to-bottom in sequence, creating a story arc in a single image. None of Zara's templates tell a temporal story; they all present a single moment.

**When this works:** Transformation hypotheses — showing the journey from problem to solution. "Before Tutero / During a lesson / After 3 months." Also works for showing the parent, the tutor, and the child as three connected panels.

---

### 12. The Negative Space Hero

**Element arrangement:** 60%+ of the canvas is intentionally empty — just the background colour. One element (a small photo, a short headline, or both) is placed off-centre, deliberately small relative to the canvas. The vast surrounding space amplifies the single element. Footer/logo positioned with extra breathing room.

**The novel device:** Deliberate emptiness as a design statement — most ads try to fill space. This does the opposite, using emptiness to signal confidence and draw the eye magnetically to the one element that exists. None of Zara's templates embrace empty space this aggressively.

**When this works:** Premium positioning and quiet confidence hypotheses. When Tutero should feel like the brand that doesn't need to shout. Also effective as a pattern-break in a batch — after several information-dense ads, one empty canvas stops the scroll through contrast alone.
