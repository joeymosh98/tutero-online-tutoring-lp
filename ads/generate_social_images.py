"""Generate organic-social Instagram images via OpenRouter → google/gemini-3.1-flash-image-preview (Nano Banana 2).

Mirrors the pattern in ads/generate_images.py. Writes PNGs to ads/images/ so they live
alongside the paid-ad images. Social HTMLs reference them via ../../images/<name>.png.

Run: OPENROUTER_API_KEY=... python3 ads/generate_social_images.py
"""

import requests
import os
import base64
import json
import concurrent.futures

API_KEY = os.environ.get("OPENROUTER_API_KEY")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, "images")

NEGATIVE_BLOCK = """NEGATIVE / AVOID: AI glow, soft rim lighting around subjects, halo lighting, golden hour orange tint, teal and orange colour grading, dreamy bokeh, extreme shallow depth of field, smooth airbrushed skin, perfect skin, retouched skin, flawless complexion, perfect symmetrical composition, cinematic colour science, HDR look, over-saturated colours, warm peachy skin tones, oversaturated warmth, studio lighting, softbox lighting, ring light, fashion editorial aesthetic, magazine photoshoot, Pinterest mood board feel, generic stock photo, diverse stock group arrangement, perfectly tidy environment, sterile modern interior, chalkboard background, apple on desk, graduation cap, headset on child, corporate tutoring centre, learning centre interior, text in image, watermark, brand logos visible, perfect lighting, dramatic lighting, moody lighting, film grain effect, Instagram filter, VSCO filter, beauty filter, AI rendering, 3D render, illustration, painting, posing for camera, eye contact with camera, big open-mouth smile."""

CHARACTER_BLOCK = """Consistent character across images: an Australian girl aged about 13, shoulder-length brown hair usually tied back loosely, a few freckles across her nose, wearing a plain oatmeal hoodie or a soft t-shirt. For the mum: early 40s, soft features, no makeup, light brown hair in a loose low bun, wearing a cardigan or knit jumper. Keep them consistent so the images read like one family's story."""


def generate_image(prompt, save_path, aspect_ratio="4:5"):
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
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
        print(f"ERROR for {save_path}: {response.status_code} — {response.text[:300]}")
        return None

    data = response.json()
    content = data["choices"][0]["message"]["content"]

    if isinstance(content, list):
        for part in content:
            if part.get("type") == "image_url":
                image_data = part["image_url"]["url"]
                if image_data.startswith("data:"):
                    image_data = image_data.split(",", 1)[1]
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(image_data))
                print(f"OK: {save_path}")
                return save_path
            if "inline_data" in part:
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(part["inline_data"]["data"]))
                print(f"OK: {save_path}")
                return save_path

    message = data["choices"][0]["message"]
    if "images" in message:
        for img in message["images"]:
            url = img.get("image_url", {}).get("url", "")
            if url.startswith("data:"):
                image_data = url.split(",", 1)[1]
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(image_data))
                print(f"OK: {save_path}")
                return save_path

    print(f"NO IMAGE for {save_path}: {json.dumps(data, default=str)[:500]}")
    return None


# --- PROMPTS ---

# s-02 Carousel — "You interview them. Then you choose."

PROMPT_S02_2 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of an Australian mum in her early 40s sitting at a timber kitchen table in the late afternoon, holding an iPhone to her ear with her left hand. She is mid-conversation, expression relaxed and curious — not smiling for the camera, just listening carefully. A half-drunk mug of tea sits beside her, an open notebook with a pen resting across the page. Behind her, a blurred suburban kitchen — a fruit bowl, a pot plant on the windowsill, a pendant light. Flat afternoon Australian daylight through a window behind her, slightly blown out. Neutral white balance. Natural skin texture with visible pores, fine lines around eyes, no retouching. Shot from across the table, slightly below eye level. Subject in the right two-thirds of the frame with clear space on the left. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

PROMPT_S02_3 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Over-the-shoulder photograph of a 13-year-old Australian girl's MacBook open on a cream-coloured bedroom desk in the early evening. The laptop screen shows a simple portrait-style intro video of a friendly young adult tutor (late 20s, warm natural smile, plain t-shirt, lived-in home background — NOT a corporate office) paused on screen. Below the main tile, two smaller secondary tiles sit out of focus — other tutor options. The girl's hand is barely visible in frame, resting near the trackpad, a simple bracelet on her wrist. Warm bedside lamp glow mixing with cool laptop light. Shallow depth of field, focus on the tutor's face on screen. Slight natural screen reflection. No Zoom or Teams logos visible, no corporate branding. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

PROMPT_S02_4 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of a 13-year-old Australian girl sitting at her bedroom desk in the early evening, facing a laptop. She is leaning forward slightly, one earbud in, the other hanging loose, looking at the screen with a small thoughtful expression — not performing, just thinking. A notebook and pencil open beside the laptop, a glass of water. Warm lamp light from the left, soft cool glow from the laptop screen. Bed partially visible behind her, a few posters slightly out of focus. Shot from the side, three-quarters back, so we see her profile and the edge of the screen but not the full contents. Slight natural lens flare from the lamp. Neutral white balance, phone-camera quality. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

# s-03 Carousel — "Six weeks, quietly."

PROMPT_S03_2 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of a 13-year-old Australian girl at her bedroom desk, afternoon light. She is hunched slightly forward over an open maths workbook, chin resting on her left hand, pencil untouched on the page. Expression flat, a little bored — not sad or dramatic, just switched off. A few scribbled attempts on the page, one eraser smudge. Neutral cool daylight coming through a window to her right, slightly grey. Shot from behind and to the side, so we see her shoulder, the page, and just a sliver of her face. Slightly underexposed, honest phone snapshot quality. Teenager's bedroom in the background — unmade bed, a hoodie tossed on a chair. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

PROMPT_S03_3 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of the same 13-year-old Australian girl at the same bedroom desk a couple of weeks later, mid-afternoon. She is leaning in toward her open laptop, chin slightly lifted, mouth partly open as if asking a question. One hand holding a pencil, the other pointing at something on her workbook page. The workbook has more writing on it now, one small tick visible. Warmer window light from the left this time, slightly softer than the previous image. Shot from the same side angle as the week-one image so the two read as a visual pair. Natural skin texture, honest phone snapshot quality. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

PROMPT_S03_4 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of an Australian mum in her early 40s and her 13-year-old daughter standing together in a warm kitchen in the late afternoon. The girl is holding a folded A4 school paper — a graded maths paper, a number softly blurred but visible in the top corner. Neither is smiling widely. Mum has one hand on her daughter's back, looking down at the page, not the camera. Daughter is looking down at the page, small private smile — pride more than triumph. Warm afternoon daylight from a window behind them, subtle halo. Shot from across the kitchen, a little low, like someone caught them mid-conversation. Shallow depth of field. No posing, no hugging, no trophies. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

# s-04 Static — parent quote

PROMPT_S04 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of an Australian mum in her early 40s sitting on a grey fabric couch in the early evening, one leg folded under her, holding a ceramic mug with both hands. She is looking off to the side toward a warm-lit doorway in the mid-distance — from that doorway angle you can faintly see the edge of a teenager's bedroom, a slice of desk lamp light, a shadow of a girl at a desk (don't need to see her clearly). The mum's expression is quiet and a little wistful, the face someone makes when they've just noticed a small good thing. A throw blanket on the couch beside her, a book face-down. Warm tungsten ambient light from a nearby lamp, cream-painted walls, soft bloom around the distant doorway. Shot from across the living room, 35mm feel, shallow depth. No eye contact with camera. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

# s-05 Static — micro-moment close-up

PROMPT_S05 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Extreme close-up photograph looking down over the shoulder at a 13-year-old Australian girl's hands working through a maths problem in an open exercise book. Right hand holding a 2B pencil mid-stroke, left hand steadying the page. A pink eraser and a small graphite smudge on the paper. Her sleeve is a soft oatmeal-coloured hoodie. Natural side light from a window to the left, gentle shadow across the page. We see just her hands, the paper, the edge of the desk, and a sliver of a water bottle. The working on the page has a mix of neat attempts and crossed-out attempts — real, not pristine. No school uniform sleeve, no adult hands. Phone-camera angle and compression.

{NEGATIVE_BLOCK}"""

# s-06 Static — session moment

PROMPT_S06 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Over-the-shoulder photograph of a 13-year-old Australian girl at her bedroom desk on a laptop, early evening. On the laptop screen is a live video-call tile showing a friendly young adult tutor (late 20s, warm natural expression, plain cotton t-shirt, lived-in bedroom or kitchen background behind them — NOT a corporate office) listening mid-sentence, hand partly gesturing off-screen. The girl is leaning on one elbow, pencil in her other hand, open notebook next to her, a glass of water, a half-eaten piece of toast on a small plate. Warm desk lamp from the left mixing with cool laptop light. Shot from behind and slightly above so the tutor's face on the screen is in focus; the girl's ear and shoulder frame the foreground softly. Slight natural screen reflection. No Zoom or Teams branding visible, no corporate aesthetic, no headset. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""


# s-08 Carousel — "Your Tutero experience in Term 2." (6-step documentary)

PROMPT_S08_1 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of an Australian mum in her early 40s sitting at a kitchen island bench in the late morning, laptop open in front of her, mid-way through typing on it. Her reading glasses are on, head slightly tilted as she reads. Beside the laptop: a mug of tea, a phone face-down, a scribbled sticky note. A simple white web form is visible on the laptop screen but angled away from camera so specific text isn't readable — just the shape of form fields. The kitchen is a typical suburban Australian kitchen — white melamine cabinets, stone benchtop, a fruit bowl, morning light through a window on the right. Flat ceiling light supplementing. Neutral white balance, slightly cool. Natural skin texture with visible pores, fine lines around eyes, no retouching. Shot from the side and slightly back, so we see her laptop, her hands, and her face in profile at three-quarters. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

PROMPT_S08_2 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Over-the-shoulder photograph of the same Australian mum at her kitchen table in the early afternoon, laptop open, on a video call. On the laptop screen is a friendly Australian account-manager type — a woman in her late 20s to early 30s, warm natural expression, plain knit jumper, lived-in home-office background (not a corporate setup) — listening attentively mid-conversation. The mum is leaning forward on her elbows, one hand resting on an open notebook with handwritten notes, a mug of coffee beside her. Soft afternoon light from a side window, flat kitchen ceiling light. The mum's face is in profile, just a sliver visible, so the account manager on screen is the focal point. Slight natural screen reflection. No Zoom or Teams logos, no corporate branding. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

PROMPT_S08_3 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Over-the-shoulder photograph of a 13-year-old Australian girl at her bedroom desk on a laptop in the early evening — her first tutoring lesson. On the laptop screen is a friendly young adult male tutor (late 20s, warm natural expression, a plain grey henley or t-shirt, lived-in home background with a bookshelf behind him — NOT a corporate office) mid-explanation, looking down at something just off camera. The girl is leaning forward slightly, open notebook and a pencil on the desk. A glass of water. Warm desk lamp from the left, cool laptop glow. Slight screen reflection. Shot from behind and slightly above so we see the tutor's face on the screen in soft focus and the girl's shoulder and ear in the foreground. No Zoom logos, no headset, no corporate aesthetic. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

PROMPT_S08_4 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Close-up photograph of an Australian mum's hand holding her iPhone in a sunlit kitchen, the phone screen showing an iMessage conversation thread. The thread shows two short grey message bubbles on the left (from the contact) and a half-typed blue reply bubble on the right. Text is small and slightly angled so legibility is partial — we read the shape of a casual check-in conversation, not specific words. Time stamp visible. The contact name at the top reads as a short name. Her thumb rests on the screen, a simple wedding band visible. Background: a slightly out-of-focus kitchen counter, a mug, a fruit bowl. Flat afternoon daylight through a window, neutral white balance. Natural skin texture, visible veins on the hand, no retouching, no manicure. Shot from just above her hand, looking down at the phone. The phone is held slightly off-vertical, the way people actually hold phones. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

PROMPT_S08_5 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of the same 13-year-old Australian girl at her bedroom desk on a laptop, a week after her first lesson — her second session. On the laptop screen is the same young adult male tutor as before (late 20s, plain grey henley or t-shirt, lived-in home background, NOT corporate), smiling gently mid-conversation, looking at the camera in the video tile. The girl is sitting up a little straighter than last time, pencil moving across her notebook page as she writes something down, a small focused expression — not performing, just engaged. The page now has more writing on it than in the first lesson. Warm desk lamp from the left, cool laptop glow. Shot from a slightly different angle than image three — more from the front-left so we see more of the girl's face in three-quarters profile. Natural skin texture. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""

PROMPT_S08_6 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of the same 13-year-old Australian girl sitting at her family's kitchen table in the mid-afternoon, a few weeks into the term. Her laptop is open in front of her, a workbook and a few pencils scattered beside it, a bowl of chopped fruit, a glass of water. She is working by herself — no one else at the table — reading something on the laptop screen with quiet concentration, one hand tucking hair behind her ear. Soft afternoon Australian daylight coming through a kitchen window, flat and slightly bright, touching the edge of the table. Warm timber table, muted kitchen in the background slightly out of focus — fruit bowl, a tea towel, a pot plant. Natural skin texture, visible freckles, no retouching. Shot from across the kitchen, slightly above, so we see her from the side at three-quarters. She is not looking at the camera and does not know it is there. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""


# s-09 Static — "Term 1 report just came home."

PROMPT_S09 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of an Australian mum in her early 40s standing at a kitchen counter on a Tuesday afternoon, holding a folded A4 school report paper in both hands. She has just opened an envelope — the torn envelope sits on the counter beside her, next to a set of house keys and a half-full glass of water. Her reading glasses are pushed up on her head. She is looking down at the page, lips slightly pressed together — not dramatic, just quietly taking it in. The paper itself is angled so we can't read the specific marks, just the shape of a school letterhead and a grid of subject rows. Flat afternoon Australian daylight from a window behind her, slightly blown out. Muted suburban kitchen — white cabinets, stone benchtop, a fruit bowl. Shot from across the kitchen at counter height, three-quarters profile. Natural skin texture with fine lines and visible pores, no retouching. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""


# s-10 Static — "Our April is getting full."

PROMPT_S10 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Top-down flatlay-style photograph of a simple paper desk planner opened to the April spread, sitting on a warm timber desk. A few dates in the first two weeks of April have been circled in blue ballpoint pen or marked with a small handwritten tick — understated, not every date, just a scattered few. A pen rests diagonally across the page. Beside the planner: a half-drunk mug of tea on a cork coaster, a pair of reading glasses folded, the edge of a closed laptop. No people in frame, no hands. Soft natural daylight from a window at the top of the frame, casting a gentle, honest shadow from the mug across the page. Warm timber grain visible. Slight paper texture, genuine wear on the planner edges. Neutral white balance, phone-camera quality. Shot from directly above, centred on the April spread. No text labels overlaid, no branding visible, no stock-photo sheen.

{NEGATIVE_BLOCK}"""


# s-11 Static — "One free lesson. Before week one."

PROMPT_S11 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of a 13-year-old Australian girl sitting at her bedroom desk in the late afternoon, setting up for the first time. Her laptop is open in front of her, closed on the desk beside it: a brand-new notebook still with its plastic band around it (partly peeled off), a fresh pencil case, a sharp 2B pencil, a glass of water. She is leaning slightly forward, looking at the laptop screen with a small curious expression — not performing, just about to start. Warm late-afternoon Australian daylight through a bedroom window on the left, a small desk lamp switched off. Muted teenager's bedroom in the background: a poster slightly out of focus, a made bed with a throw, a jumper draped over a chair. Shot from the side at three-quarters, slightly lower than eye level, so we see her profile, the open laptop, and the new stationery. Natural skin texture, visible freckles, no retouching. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""


# s-13 Static — "Parents who book in April usually noticed something in March."

PROMPT_S13 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of an Australian mum in her early 40s standing at her kitchen counter in the late morning, scrolling on her iPhone with both hands. A half-finished mug of coffee sits beside her, a set of keys, a folded receipt. Her phone screen is angled away from camera — we can see the warm glow of a website but not the specific content. Her expression is contemplative, a little still — the look someone makes when they're thinking about whether to do the thing they've been putting off. Natural morning Australian daylight from a window on the right, white kitchen cabinets and a stone benchtop softly blurred behind her. She is in the right two-thirds of the frame, wearing a simple cardigan or knit jumper. Shot from across the kitchen at counter height, three-quarters profile, slightly above hip. Natural skin texture, soft fine lines around her eyes, no retouching. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""


# s-15 Static — "The night before."

PROMPT_S15 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of a teenager's bedroom desk at dusk, set up neatly for the first day of school tomorrow. A closed laptop centred on the desk. To its left, a fresh spiral notebook with a pen placed diagonally across it, and a sharpened pencil beside it. A full water bottle, a small pencil case zipped shut. The desk lamp is on, casting a warm pool of amber light. Behind the desk, a window showing deep blue twilight sky. The room is tidy but lived-in — a hoodie draped over the desk chair, a small stack of books on the windowsill, a photo tucked into the edge of a mirror in the background. The desk surface is timber. Nobody is in the frame. Shot from a standing position looking down and across, as if a parent paused in the doorway. Warm tungsten lamp mixed with cool twilight. Quiet, anticipatory mood.

{NEGATIVE_BLOCK}"""


# s-16 Static — "She set her own alarm."

PROMPT_S16 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph of a 13-year-old Australian girl walking into a suburban kitchen on a Monday morning, early light. Shot from behind and to the side — we see her back, one hand on the doorframe, school bag already slung over one shoulder. She's wearing school uniform trousers and a jumper, hair loosely tied. The kitchen ahead of her is softly lit by grey-blue morning light through a window, a mug of coffee already on the counter (mum's, out of focus), a fruit bowl. The kitchen clock on the wall reads roughly 7:15. Her posture is upright, unhurried, purposeful — not slouched or dragging. Natural morning light, slightly cool and flat, honest. No one else visible but mum's coffee implies she's nearby. Shot from the hallway behind the girl, phone-snapshot quality, slightly underexposed. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""


# s-17 Static — "She walked in different."

PROMPT_S17 = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter. 4:5 vertical.

Photograph taken from behind of a 13-year-old Australian girl walking through a school gate on an autumn morning. She is wearing a navy school jumper and a backpack, walking with her shoulders back and head up — not looking at her phone, just walking in. Autumn morning light, slightly misty, soft diffused sun low on the horizon. Trees with a few golden leaves in the background. Other students visible but soft and blurred, walking in the same direction. A chain-link or low brick school fence frames the left side. Shot from about ten metres behind her, slightly low, as if a parent is watching from the car or the footpath. She does not know the photo is being taken. Natural, honest, no editing. Flat Australian morning light. {CHARACTER_BLOCK}

{NEGATIVE_BLOCK}"""


def gen_task(name, prompt, aspect_ratio, filename):
    path = os.path.join(IMG_DIR, filename)
    if os.path.exists(path):
        print(f"SKIP (exists): {filename}")
        return path
    return generate_image(prompt, path, aspect_ratio)


if __name__ == "__main__":
    if not API_KEY:
        raise SystemExit("OPENROUTER_API_KEY not set. export it, then re-run.")

    os.makedirs(IMG_DIR, exist_ok=True)

    tasks = [
        ("s-02-img-2", PROMPT_S02_2, "4:5", "s-02-img-2.png"),
        ("s-02-img-3", PROMPT_S02_3, "4:5", "s-02-img-3.png"),
        ("s-02-img-4", PROMPT_S02_4, "4:5", "s-02-img-4.png"),
        ("s-03-img-2", PROMPT_S03_2, "4:5", "s-03-img-2.png"),
        ("s-03-img-3", PROMPT_S03_3, "4:5", "s-03-img-3.png"),
        ("s-03-img-4", PROMPT_S03_4, "4:5", "s-03-img-4.png"),
        ("s-04-img",   PROMPT_S04,   "4:5", "s-04-img.png"),
        ("s-05-img",   PROMPT_S05,   "4:5", "s-05-img.png"),
        ("s-06-img",   PROMPT_S06,   "4:5", "s-06-img.png"),
        ("s-08-img-1", PROMPT_S08_1, "4:5", "s-08-img-1.png"),
        ("s-08-img-2", PROMPT_S08_2, "4:5", "s-08-img-2.png"),
        ("s-08-img-3", PROMPT_S08_3, "4:5", "s-08-img-3.png"),
        ("s-08-img-4", PROMPT_S08_4, "4:5", "s-08-img-4.png"),
        ("s-08-img-5", PROMPT_S08_5, "4:5", "s-08-img-5.png"),
        ("s-08-img-6", PROMPT_S08_6, "4:5", "s-08-img-6.png"),
        ("s-09-img",   PROMPT_S09,   "4:5", "s-09-img.png"),
        ("s-10-img",   PROMPT_S10,   "4:5", "s-10-img.png"),
        ("s-11-img",   PROMPT_S11,   "4:5", "s-11-img.png"),
        ("s-13-img",   PROMPT_S13,   "4:5", "s-13-img.png"),
        ("s-15-img",   PROMPT_S15,   "4:5", "s-15-img.png"),
        ("s-16-img",   PROMPT_S16,   "4:5", "s-16-img.png"),
        ("s-17-img",   PROMPT_S17,   "4:5", "s-17-img.png"),
    ]

    print(f"Generating {len(tasks)} images via Nano Banana 2 (gemini-3.1-flash-image-preview)...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = {}
        for name, prompt, ar, filename in tasks:
            f = executor.submit(gen_task, name, prompt, ar, filename)
            futures[f] = name

        for f in concurrent.futures.as_completed(futures):
            name = futures[f]
            try:
                result = f.result()
                print(f"  {'OK' if result else 'FAIL'} — {name}")
            except Exception as e:
                print(f"  ERR — {name}: {e}")

    print("\nDone. Images in ads/images/.")
