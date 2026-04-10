import requests, os, base64, json, sys

API_KEY = os.environ.get('OPENROUTER_API_KEY')
if not API_KEY:
    print("ERROR: OPENROUTER_API_KEY not set")
    sys.exit(1)

def generate_image(prompt, save_path, aspect_ratio='4:5'):
    print(f"  Generating: {save_path}...")
    response = requests.post(
        'https://openrouter.ai/api/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json',
        },
        json={
            'model': 'google/gemini-3.1-flash-image-preview',
            'messages': [{'role': 'user', 'content': prompt}],
            'image_config': {'aspect_ratio': aspect_ratio},
        },
        timeout=180,
    )
    if response.status_code != 200:
        print(f"  ERROR: API returned {response.status_code}")
        return None

    data = response.json()
    content = data['choices'][0]['message']['content']

    # Format 1: content is a list with image parts
    if isinstance(content, list):
        for part in content:
            if part.get('type') == 'image_url':
                image_data = part['image_url']['url']
                if image_data.startswith('data:'):
                    image_data = image_data.split(',', 1)[1]
                with open(save_path, 'wb') as f:
                    f.write(base64.b64decode(image_data))
                print(f"  OK (from content)")
                return save_path
            if 'inline_data' in part:
                with open(save_path, 'wb') as f:
                    f.write(base64.b64decode(part['inline_data']['data']))
                print(f"  OK (from inline_data)")
                return save_path

    # Format 2: images field on the message
    message = data['choices'][0]['message']
    if 'images' in message:
        for img in message['images']:
            url = img.get('image_url', {}).get('url', '')
            if url.startswith('data:'):
                image_data = url.split(',', 1)[1]
                with open(save_path, 'wb') as f:
                    f.write(base64.b64decode(image_data))
                print(f"  OK (from images field)")
                return save_path

    print(f"  FAILED: No image in response")
    return None

# ─── Anti-AI-glow suffix appended to every prompt ───
ANTI_GLOW = """
NEGATIVE / AVOID: AI glow, soft rim lighting, halo lighting, golden hour orange, teal and orange grading, dreamy bokeh, smooth airbrushed skin, perfect symmetry, cinematic colour science, HDR, over-saturated warm peachy skin tones, studio lighting, fashion editorial, Pinterest mood board, stock photo, headset on child, text or watermark, brand logos, perfect tidy environment.
POSITIVE EMPHASIS: Flat household lighting. Neutral white balance. Natural skin texture with visible pores. Real Australian suburban home. iPhone photo quality, not a stylised AI render."""

# ─── Prompts ───

PROMPTS = {
    # 10B — Dinner table variant for dark full-bleed background
    "images/10b-dinner-no-homework.png": {
        "ar": "4:5",
        "prompt": f"""Create a warm, candid photograph of a woman and a teenage boy having dinner together at a kitchen table in a typical Australian suburban home. They are eating pasta and salad, laughing together mid-conversation. The kitchen has white cabinets and kids drawings on the fridge. Flat overhead ceiling light, neutral white balance. The woman wears a casual navy top, the boy wears a grey hoodie. No textbooks or homework on the table — just dinner plates and glasses. Wide framing showing the room context. iPhone photo quality.{ANTI_GLOW}"""
    },

    # 8A — Mum on couch looking at phone with gentle surprised smile (for Kid's Text background)
    "images/8a-mum-phone-couch.png": {
        "ar": "4:5",
        "prompt": f"""Create a photograph of a woman sitting on a couch in her living room, looking down at her phone with a gentle, surprised smile — as if she just read something that made her happy. She is wearing a comfortable oversized cream jumper. The living room is a typical Australian suburban living room — soft grey couch, cushions, a throw blanket, a coffee table with a water glass and remote. Late afternoon daylight through a window, mixed with the overhead light. She is slightly off-centre in the frame, leaving space on the left side. Natural skin texture, slight under-eye shadows. iPhone photo quality, like a photo a partner took.{ANTI_GLOW}"""
    },

    # 8B — Same concept but tighter crop for dark template
    "images/8b-mum-phone-dark.png": {
        "ar": "4:5",
        "prompt": f"""Create a photograph of a woman sitting at a kitchen counter in the evening, looking at her phone with a small warm smile. The kitchen behind her is softly out of focus — Australian suburban kitchen, overhead light. She wears a grey t-shirt, hair loosely tied. The phone screen casts a faint blue glow on her face. Tight framing from chest up, slightly off-centre. Natural skin, slight redness on cheeks. Flat overhead kitchen light, neutral white balance. iPhone photo at night.{ANTI_GLOW}"""
    },

    # 11A — Dark bedroom, phone glow (for Midnight Google)
    "images/11a-midnight-phone.png": {
        "ar": "4:5",
        "prompt": f"""Create a photograph of a woman lying in bed in a dark bedroom at night, her face softly illuminated by the glow of her phone screen. She is on her side, propped on one elbow, looking at the phone with a slightly worried, contemplative expression. The bedroom is dark — just the phone light and a faint ambient glow from a hallway through the door crack. Rumpled duvet, pillow, a glass of water on the bedside table. Natural skin, slight under-eye shadows from tiredness. The phone screen is the main light source. iPhone photo taken in a dark room, grainy, natural. No golden hour, no rim light.{ANTI_GLOW}"""
    },

    # 13A — POV from inside car at school pickup line
    "images/13a-car-pickup.png": {
        "ar": "4:5",
        "prompt": f"""Create a photograph taken from inside a car through the windshield at an Australian primary school pickup. The view shows the school gate area with a handful of parents waiting outside — some chatting, one checking her phone. Kids in navy/grey Australian school uniforms are walking out. The car dashboard is slightly visible at the bottom of the frame, creating a voyeuristic POV feeling. Overcast afternoon light, flat and grey-white sky. The focus is on the scene outside the windshield, slightly soft through the glass. This is the feeling of sitting in the pickup line, watching other mums. iPhone photo shot through a car windshield.{ANTI_GLOW}"""
    },

    # 13B — Phone on couch showing lesson report notification
    "images/13b-phone-couch.png": {
        "ar": "4:5",
        "prompt": f"""Create a photograph of a smartphone lying face-up on a grey fabric couch cushion. The phone screen shows a notification or message preview — blurred enough that you cannot read specific text, but clearly a message notification with a blue accent. Next to the phone is a throw blanket bunched up and a TV remote. Warm evening lamplight from the side. The rest of the room is softly out of focus — a typical Australian suburban living room. No person visible, just the phone on the couch. The composition suggests someone just set the phone down. Overhead view at about 45 degrees. iPhone photo quality, natural lighting.{ANTI_GLOW}"""
    },

    # 14A — Close-up of hand holding phone at school gate
    "images/14a-hand-phone-gate.png": {
        "ar": "4:5",
        "prompt": f"""Create a photograph of a woman's hand holding a phone at her side, shot from waist level. She is standing at a school gate. The phone screen is slightly tilted toward camera showing a blurred notification. In the background, out of focus, you can see the school fence, a few other parents, and kids in Australian school uniforms. The focus is on the hand and phone in the mid-ground, with the school gate scene softly blurred behind. Afternoon light, overcast sky. The woman wears a casual jacket sleeve visible. This is the moment of glancing at a lesson report while waiting for pickup. iPhone photo quality, candid and unstaged.{ANTI_GLOW}"""
    },

    # 14B — Wide shot of school gate at pickup time, atmospheric
    "images/14b-school-gate-wide.png": {
        "ar": "4:5",
        "prompt": f"""Create a wide atmospheric photograph of an Australian primary school gate at 3:15pm pickup time. Shot from across the street or from a slight distance. A row of parents — mostly mums — stand along the fence waiting. Some are chatting in pairs, one is alone checking her phone, one has a pram. Kids in navy and grey uniforms are starting to come out. The school is a typical Australian brick public school with a metal fence. Afternoon light, slightly flat and overcast. The mood is observational and slightly melancholic — the universal pickup line. No single person is the focus, it's the collective scene. Wide framing, environmental. iPhone photo quality from a distance.{ANTI_GLOW}"""
    },
}

# ─── Generate ───
os.chdir(os.path.dirname(os.path.abspath(__file__)))

for path, cfg in PROMPTS.items():
    result = generate_image(cfg["prompt"], path, cfg["ar"])
    if not result:
        print(f"  Retrying {path}...")
        result = generate_image(cfg["prompt"], path, cfg["ar"])

print("\nDone.")
