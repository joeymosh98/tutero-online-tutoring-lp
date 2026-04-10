import requests
import os
import base64
import json
import sys
import concurrent.futures

API_KEY = os.environ.get("OPENROUTER_API_KEY")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE_DIR, "images")

NEGATIVE_BLOCK = """NEGATIVE / AVOID: AI glow, soft rim lighting around subjects, halo lighting, golden hour orange tint, teal and orange colour grading, dreamy bokeh, extreme shallow depth of field, smooth airbrushed skin, perfect skin, retouched skin, flawless complexion, perfect symmetrical composition, cinematic colour science, HDR look, over-saturated colours, warm peachy skin tones, oversaturated warmth, studio lighting, softbox lighting, ring light, fashion editorial aesthetic, magazine photoshoot, Pinterest mood board feel, generic stock photo, diverse stock group arrangement, perfectly tidy environment, sterile modern interior, chalkboard background, apple on desk, graduation cap, headset on child, corporate tutoring centre, learning centre interior, text in image, watermark, brand logos visible, perfect lighting, dramatic lighting, moody lighting, film grain effect, Instagram filter, VSCO filter, beauty filter, AI rendering, 3D render, illustration, painting."""


def generate_image(prompt, save_path, aspect_ratio="1:1"):
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
        timeout=120,
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

# Ad 2A — School gate scene
PROMPT_2A = f"""Documentary photograph, NOT a stylised AI image. Plain household lighting only. Shot on iPhone 13, default camera app, no editing, no filter.

Photograph of two Australian mums in their late 30s chatting near a primary school gate at afternoon pickup time. Both wearing casual activewear — leggings, sneakers, light zip-up jackets. One is mid-laugh with her hand casually touching the other mum's arm. School bags are on the ground beside them. In the background, slightly out of focus, kids in typical Australian primary school uniforms (white polo shirts, navy shorts/checked dresses) running past. The school behind them is red brick with a metal fence gate, gum trees visible, a "School Zone" sign partially visible. Flat afternoon Australian daylight, slightly overcast, harsh but diffused. Neutral white balance. Natural skin texture with visible pores, not retouched. Slight phone camera compression and noise. The kind of photo another mum took while walking up to say hello. Slightly off-centre composition, the two mums in the right two-thirds of the frame with clear space on the left third for text overlay.

{NEGATIVE_BLOCK}"""

# Ad 2B — Kitchen background with mum's hand holding phone (overhead shot)
PROMPT_2B = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter.

Overhead photograph looking down at a woman's hands holding an iPhone on a kitchen counter. The phone screen shows an incoming call. The kitchen counter is a typical Australian suburban kitchen benchtop — light stone or laminate with a few everyday items: a half-drunk mug of tea, a set of car keys, a school newsletter folded nearby. The woman's hands are natural — visible nail texture, a simple wedding band, no manicure. One hand holds the phone, the other rests on the counter. The kitchen behind the hands is blurred but shows white melamine cabinets, a tiled splashback, late afternoon light from a window. Flat overhead kitchen ceiling light, neutral white balance, cool fluorescent white. Looks like the photo a mum took of her own phone to send to a friend. Natural skin texture, slight phone camera compression.

{NEGATIVE_BLOCK}"""

# Ad 3B — Hannah tutor portrait (home office)
PROMPT_3B = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter.

Photograph of a friendly Australian woman in her mid-30s sitting at a desk in a home office. She has shoulder-length brown hair, natural and slightly wavy, wearing a soft blue jumper over a white t-shirt. She is looking directly into the camera with a warm, genuine, relaxed smile — the kind of smile you give when a colleague says "let me take a quick photo for the website". Behind her: a bookshelf with textbooks, a few novels, a small pot plant, and some colourful sticky notes on the shelf edge. A laptop is open on her desk beside her. The room has a window to one side letting in cool daylight through sheer curtains. Flat ceiling pendant light on, neutral white balance, slightly cool. Natural skin texture with visible pores, fine lines around the eyes, a few freckles. Hair slightly imperfect. The photo is head and shoulders, framed slightly off-centre. Looks like a real staff photo taken on a phone, not a professional headshot session. Slight phone camera compression and noise.

{NEGATIVE_BLOCK}"""

# Tutor headshots for Ad 3A grid (6 tutors)
TUTOR_HEADSHOTS = [
    {
        "name": "anna",
        "prompt": f"""Photograph of Anna — a friendly Australian woman in her late 20s with long dark brown hair pulled back in a low ponytail, a few loose strands framing her face. Wearing a soft olive green t-shirt. Head and shoulders shot, looking directly at the camera with a warm, genuine, natural smile showing a little teeth. Plain neutral background — soft cream wall. Flat soft daylight from a large window slightly off camera, no harsh shadows. Natural skin texture, visible pores, slight redness on cheeks, no retouching. Looks like an honest photo taken on a phone for a staff profile, NOT a corporate headshot, NOT a fashion portrait. Subject framed centre, eyes in upper third. Shot on iPhone 13, no filter, no editing.

{NEGATIVE_BLOCK}"""
    },
    {
        "name": "liam",
        "prompt": f"""Photograph of Liam — a friendly Australian man in his early 30s with short sandy brown hair and light stubble. Wearing a soft blue cotton button-up shirt, top button undone. Head and shoulders shot, looking directly at the camera with a warm, approachable, closed-mouth smile. Plain neutral background — light grey wall. Flat soft daylight from a large window slightly off camera, no harsh shadows. Natural skin texture, visible pores, slight sun lines on forehead, no retouching. Looks like an honest photo taken on a phone for a staff profile, NOT a corporate headshot. Subject framed centre, eyes in upper third. Shot on iPhone 13, no filter, no editing.

{NEGATIVE_BLOCK}"""
    },
    {
        "name": "priya",
        "prompt": f"""Photograph of Priya — a friendly Indian-Australian woman in her late 20s with long black hair worn down, dark eyes. Wearing a cream linen blouse. Head and shoulders shot, looking directly at the camera with a warm, genuine smile showing a little teeth. Plain neutral background — soft cream wall. Flat soft daylight from a large window slightly off camera, no harsh shadows. Natural skin texture, visible pores, natural skin tone neither warmed nor cooled, no retouching. Looks like an honest photo taken on a phone for a staff profile, NOT a corporate headshot, NOT a fashion portrait. Subject framed centre, eyes in upper third. Shot on iPhone 13, no filter, no editing.

{NEGATIVE_BLOCK}"""
    },
    {
        "name": "tom",
        "prompt": f"""Photograph of Tom — a friendly Australian man in his mid-20s with curly auburn hair, clean-shaven, freckles across his nose and cheeks. Wearing a forest green crew-neck t-shirt. Head and shoulders shot, looking directly at the camera with a warm, genuine, open smile. Plain neutral background — pale sage green wall. Flat soft daylight from a large window slightly off camera, no harsh shadows. Natural skin texture, visible freckles, natural complexion, no retouching. Looks like an honest photo taken on a phone for a staff profile, NOT a corporate headshot. Subject framed centre, eyes in upper third. Shot on iPhone 13, no filter, no editing.

{NEGATIVE_BLOCK}"""
    },
    {
        "name": "hannah",
        "prompt": f"""Photograph of Hannah — a friendly Australian woman in her mid-30s with shoulder-length brown hair, side-parted, wearing a soft navy blue jumper. Head and shoulders shot, looking directly at the camera with a warm, natural, closed-mouth smile. Plain neutral background — soft cream wall. Flat soft daylight from a large window slightly off camera, no harsh shadows. Natural skin texture, visible pores, fine lines around the eyes, a few freckles on nose, no retouching. Looks like an honest photo taken on a phone for a staff profile, NOT a corporate headshot, NOT a fashion portrait. Subject framed centre, eyes in upper third. Shot on iPhone 13, no filter, no editing.

{NEGATIVE_BLOCK}"""
    },
    {
        "name": "marcus",
        "prompt": f"""Photograph of Marcus — a friendly African-Australian man in his early 30s with a short fade haircut and a warm expression. Wearing a charcoal grey henley shirt. Head and shoulders shot, looking directly at the camera with a confident, warm, natural smile showing teeth. Plain neutral background — light grey wall. Flat soft daylight from a large window slightly off camera, no harsh shadows. Natural skin texture, natural skin tone, no retouching, no smoothing. Looks like an honest photo taken on a phone for a staff profile, NOT a corporate headshot. Subject framed centre, eyes in upper third. Shot on iPhone 13, no filter, no editing.

{NEGATIVE_BLOCK}"""
    },
]

# Ad 4A — Working mum at school gate with daughter
PROMPT_4A = f"""Documentary photograph, NOT a stylised AI image. Plain natural daylight only. Shot on iPhone 13, default camera app, no editing, no filter.

Photograph of an Australian working mum in her mid-30s walking through a primary school gate holding her daughter's hand. The mum is wearing smart-casual work clothes — a soft blazer over a plain white tee, dark jeans, white sneakers — like she came straight from the office. Her daughter is about 8 years old, wearing a typical Australian primary school uniform (white polo shirt, navy checked dress, black school shoes) and carrying a school backpack. They are mid-stride, the daughter looking up at her mum and smiling. The school gate is metal with red brick pillars, gum trees in the background, a "SCHOOL ZONE" sign partially visible. Other parents and kids are slightly blurred in the background. Flat afternoon Australian daylight, slightly overcast. Natural skin texture with visible pores, not retouched. Slight phone camera compression and noise. The pair is positioned in the right two-thirds of the frame with clear space on the left for text overlay.

{NEGATIVE_BLOCK}"""

# Ad 4B — Mum testimonial portrait at home on couch
PROMPT_4B = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter.

Photograph of an Australian mum in her late 30s sitting on a grey fabric couch in a typical suburban Australian living room. She has light brown hair pulled back in a messy bun, wearing a soft maroon jumper. She is looking at the camera with a warm, relieved, genuine half-smile — not posed, not beaming, just genuinely calm. One hand rests on a throw cushion beside her. Behind her: a bookshelf with a few kids' books, a framed family photo, a small indoor plant. The room has cool white ceiling light plus some natural light from a nearby window. Neutral white balance, slightly cool. Natural skin texture, visible pores, fine lines around eyes, no retouching. The photo is a candid waist-up shot, slightly off-centre. Looks like the kind of photo a friend took on the couch during a morning coffee. Slight phone camera compression and noise.

{NEGATIVE_BLOCK}"""

# Ad 5A — Mum and daughter at kitchen table with tutor on laptop screen
PROMPT_5A = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter.

Photograph of an Australian mum and her primary-school-aged daughter (about 10 years old) sitting side by side at a kitchen table, both looking at an open laptop screen. The laptop screen shows a video call with a young female tutor who is smiling and pointing at something. The daughter has a workbook and pencils in front of her. The mum has one arm around the daughter's chair back, leaning in slightly with a pleased, engaged expression. The daughter is in casual after-school clothes — t-shirt and shorts. The kitchen is a typical Australian suburban kitchen — white melamine cabinets, stone benchtop, a fruit bowl and water bottle on the table. Late afternoon light from a nearby window, flat ceiling light on. Neutral white balance. Natural skin texture, no retouching. Shot from slightly to the side and above, capturing both their faces and the laptop screen. Slight phone camera compression.

{NEGATIVE_BLOCK}"""

# Ad 5B — Priya tutor portrait at desk
PROMPT_5B = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter.

Photograph of Priya — a friendly Indian-Australian woman in her late 20s with long black hair worn down, dark eyes, wearing a cream linen blouse. She is sitting at a home office desk, turned slightly towards the camera with a warm, genuine smile showing a little teeth. Behind her: a neat bookshelf with textbooks and a few novels, a small succulent plant, and some colourful post-it notes. A laptop is open on her desk to one side. The room has a window letting in cool daylight through sheer curtains, plus a desk lamp providing warm fill light. Natural skin texture, visible pores, natural skin tone, no retouching. The photo is head and shoulders, framed slightly off-centre. Looks like a real staff photo taken on a phone, not a professional headshot session. Slight phone camera compression and noise.

{NEGATIVE_BLOCK}"""


# Ad 6A — Boy and mum at kitchen table with laptop (The Quiet Kid)
PROMPT_6A = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter.

Photograph of an Australian mum in her late 30s and her son aged about 13 sitting together at a kitchen table with an open laptop in front of them. The boy has messy light brown hair, wearing a navy school jumper (just home from school), and is smiling at the camera — a genuine, slightly shy smile. The mum is beside him with one hand on his shoulder, also smiling warmly at the camera. The laptop screen shows a video call (slightly pixelated, a male tutor visible). On the table: a school workbook, a pencil case, a glass of water. The kitchen is a typical Australian suburban kitchen — white cabinets, tiled splashback, a fruit bowl on the counter behind them. Flat overhead kitchen ceiling light, neutral white balance, slightly cool. Natural skin texture, visible pores, not retouched. The pair is positioned in the centre of the frame. Looks like a photo another family member took on their phone. Slight phone camera compression and noise. With clear space in the upper quarter for text overlay.

{NEGATIVE_BLOCK}"""

# Ad 6B — Quiet teen at desk, candid (The Quiet Kid — Text-on-Photo)
PROMPT_6B = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter.

Photograph of an Australian teenage boy aged about 14 sitting at a desk in his bedroom, looking at an open laptop screen. He is wearing a grey hoodie, headphones around his neck (not on ears). His posture is slightly hunched but engaged — he's concentrating on the screen. The bedroom is a typical Australian teen's room — a single bed with a navy doona behind him, a bookshelf with a few novels and a basketball, some school papers scattered on the desk, a poster partially visible on the wall. Late afternoon light coming through venetian blinds creating soft horizontal light bars on the wall. The boy's face is in the middle third of the frame, lit from the laptop screen and the window. Cool white balance, flat overhead light supplementing the window. Natural skin texture, slight acne on chin, natural complexion. Shot from slightly behind and to the side, capturing his profile and the laptop. The subject is positioned so his face sits in the centre-middle of the frame with clear space at top and bottom for text overlay.

{NEGATIVE_BLOCK}"""

# Ad 7A — Mum portrait for testimonial (Melbourne mum)
PROMPT_7A = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter.

Photograph of an Australian mum in her early 40s sitting at a kitchen island bench with a mug of coffee. She has auburn hair in a loose low ponytail, wearing a soft sage green knit jumper. She is looking at the camera with a warm, relieved expression — a quiet half-smile, like she's just told a friend some good news. Behind her: a typical Australian kitchen — white shaker-style cabinets, a window with sheer curtains letting in cool morning light, a kids' school artwork magnet on the fridge. One hand wraps around the coffee mug. Flat kitchen ceiling light on, neutral white balance, slightly cool. Natural skin texture, visible pores, fine lines around eyes, light freckles on nose, no retouching. The photo is waist-up, slightly off-centre. Looks like the kind of photo a friend took during morning coffee. Slight phone camera compression and noise.

{NEGATIVE_BLOCK}"""

# Ad 7B — Mum and teen daughter on couch with laptop
PROMPT_7B = f"""Documentary photograph, NOT a stylised AI image. Shot on iPhone 13, default camera app, no editing, no filter.

Photograph of an Australian mum in her late 30s and her teenage daughter (about 15) sitting together on a grey fabric couch, both looking at an open laptop on the daughter's lap. The daughter has long dark hair tied back, wearing a school jumper (just home from school). The mum has short brown hair, wearing a casual navy top, leaning in to look at the screen with an interested expression. They're both lit by the laptop screen glow plus flat ceiling light. The living room behind them shows a bookshelf, a cushion, a throw blanket draped on the couch arm. Neutral white balance, cool tones. Natural skin texture, no retouching. Shot from slightly to the side, capturing both faces and the laptop. Their faces are in the centre-middle of the frame with clear space at top and bottom for text overlay. Slight phone camera compression and noise.

{NEGATIVE_BLOCK}"""


def gen_task(name, prompt, aspect_ratio, filename):
    path = os.path.join(IMG_DIR, filename)
    return generate_image(prompt, path, aspect_ratio)


if __name__ == "__main__":
    tasks = []

    # Scene images
    tasks.append(("2a-scene", PROMPT_2A, "4:5", "2a-school-gate.png"))
    tasks.append(("2b-scene", PROMPT_2B, "4:5", "2b-kitchen-phone.png"))
    tasks.append(("3b-portrait", PROMPT_3B, "4:5", "3b-hannah-portrait.png"))

    # New ads — round 2
    tasks.append(("4a-mum-rang", PROMPT_4A, "4:5", "4a-mum-rang.png"))
    tasks.append(("4b-testimonial", PROMPT_4B, "1:1", "4b-mum-testimonial.png"))
    tasks.append(("5a-family-laptop", PROMPT_5A, "4:5", "5a-family-laptop.png"))
    tasks.append(("5b-priya", PROMPT_5B, "4:5", "5b-priya-portrait.png"))

    # The Quiet Kid hypothesis
    tasks.append(("6a-boy-kitchen", PROMPT_6A, "4:5", "6a-boy-kitchen.png"))
    tasks.append(("6b-quiet-teen", PROMPT_6B, "4:5", "6b-quiet-teen.png"))
    tasks.append(("7a-mum-melbourne", PROMPT_7A, "1:1", "7a-mum-melbourne.png"))
    tasks.append(("7b-mum-daughter-couch", PROMPT_7B, "4:5", "7b-mum-daughter-couch.png"))

    # Tutor headshots
    for t in TUTOR_HEADSHOTS:
        tasks.append((t["name"], t["prompt"], "1:1", f"3a-tutor-{t['name']}.png"))

    print(f"Generating {len(tasks)} images...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = {}
        for name, prompt, ar, filename in tasks:
            f = executor.submit(gen_task, name, prompt, ar, filename)
            futures[f] = name

        for f in concurrent.futures.as_completed(futures):
            name = futures[f]
            try:
                result = f.result()
                if result:
                    print(f"  ✓ {name} done")
                else:
                    print(f"  ✗ {name} failed")
            except Exception as e:
                print(f"  ✗ {name} error: {e}")

    print("\nDone! Check ads/images/")
