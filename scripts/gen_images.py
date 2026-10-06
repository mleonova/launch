"""
Generates soft, abstract gradient placeholder images for the Launch Aesthetics
site. These stand in for real product photography until real device photos
are dropped into /images (same filenames).
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "images")
os.makedirs(OUT, exist_ok=True)


def lerp(a, b, t):
    return a + (b - a) * t


def make_gradient(size, c1, c2, direction="diag"):
    w, h = size
    base = Image.new("RGB", size, c1)
    top = Image.new("RGB", size, c2)
    mask = Image.new("L", size)
    md = mask.load()
    for y in range(h):
        for x in range(w):
            if direction == "diag":
                t = (x / w + y / h) / 2
            elif direction == "vert":
                t = y / h
            else:
                t = x / w
            md[x, y] = int(255 * t)
    return Image.composite(top, base, mask)


def add_blob(img, cx, cy, r, color, alpha=90, blur=40):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (alpha,))
    overlay = overlay.filter(ImageFilter.GaussianBlur(blur))
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"), (0, 0))
    return img


def hero_device(path, size=(700, 900)):
    img = make_gradient(size, (245, 240, 232), (255, 255, 255), "vert")
    img = add_blob(img, size[0] * 0.5, size[1] * 0.35, 260, (210, 205, 195), 60, 60)
    draw = ImageDraw.Draw(img)
    cx = size[0] * 0.5
    body_top = size[1] * 0.30
    body_h = size[1] * 0.38
    body_w = size[0] * 0.30
    draw.rounded_rectangle(
        [cx - body_w / 2, body_top, cx + body_w / 2, body_top + body_h],
        radius=28, fill=(250, 250, 250), outline=(200, 198, 194), width=3,
    )
    screen_pad = 18
    draw.rounded_rectangle(
        [cx - body_w / 2 + screen_pad, body_top + screen_pad,
         cx + body_w / 2 - screen_pad, body_top + body_h * 0.32],
        radius=10, fill=(40, 42, 46),
    )
    arm_top = body_top - 6
    draw.line([cx, arm_top, cx - 70, arm_top - 140], fill=(190, 188, 184), width=10)
    draw.line([cx - 70, arm_top - 140, cx - 10, arm_top - 260], fill=(190, 188, 184), width=10)
    draw.ellipse([cx - 22, arm_top - 280, cx + 2, arm_top - 256], fill=(60, 62, 66))
    base_y = body_top + body_h
    draw.rounded_rectangle(
        [cx - body_w * 0.42, base_y, cx + body_w * 0.42, base_y + 40],
        radius=10, fill=(235, 233, 229), outline=(200, 198, 194), width=2,
    )
    for dx in (-body_w * 0.35, body_w * 0.35):
        draw.ellipse([cx + dx - 16, base_y + 34, cx + dx + 16, base_y + 66], fill=(70, 70, 74))
    img = img.filter(ImageFilter.SMOOTH_MORE)
    img.save(path, quality=88)


def macro_tile(path, size, c1, c2, ring_color, direction="diag"):
    img = make_gradient(size, c1, c2, direction)
    img = add_blob(img, size[0] * 0.72, size[1] * 0.28, size[1] * 0.55, tuple(min(255, v + 25) for v in c2), 70, 50)
    img = add_blob(img, size[0] * 0.25, size[1] * 0.78, size[1] * 0.45, tuple(max(0, v - 15) for v in c1), 60, 45)
    draw = ImageDraw.Draw(img, "RGBA")
    cx, cy = size[0] * 0.5, size[1] * 0.52
    r = min(size) * 0.22
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=ring_color + (180,), width=8)
    draw.ellipse([cx - r * 0.45, cy - r * 0.45, cx + r * 0.45, cy + r * 0.45], fill=ring_color + (200,))
    img = img.filter(ImageFilter.SMOOTH)
    img.save(path, quality=88)


def wide_photo(path, size, c1, c2, ring_color, direction="diag"):
    img = make_gradient(size, c1, c2, direction)
    img = add_blob(img, size[0] * 0.75, size[1] * 0.35, size[1] * 0.9, tuple(min(255, v + 30) for v in c2), 80, 60)
    draw = ImageDraw.Draw(img, "RGBA")
    cx, cy = size[0] * 0.62, size[1] * 0.5
    r = min(size) * 0.30
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=ring_color + (200,), width=10)
    draw.ellipse([cx - r * 0.4, cy - r * 0.4, cx + r * 0.4, cy + r * 0.4], fill=ring_color + (220,))
    img = img.filter(ImageFilter.SMOOTH)
    img.save(path, quality=88)


hero_device(os.path.join(OUT, "hero-device.jpg"))

categories = [
    ("cat-skin-tightening.jpg", (40, 55, 70), (90, 120, 150), (150, 190, 230)),
    ("cat-pigmented-lesion.jpg", (210, 150, 90), (240, 200, 140), (255, 230, 180)),
    ("cat-skin-rejuvenation.jpg", (230, 200, 160), (250, 225, 190), (255, 245, 225)),
    ("cat-hair-removal.jpg", (225, 195, 150), (245, 215, 175), (255, 235, 200)),
    ("cat-tattoo-removal.jpg", (60, 75, 95), (110, 130, 155), (170, 200, 230)),
    ("cat-skin-resurfacing.jpg", (235, 235, 235), (250, 250, 250), (210, 210, 215)),
    ("cat-vascular-lesion.jpg", (215, 175, 130), (245, 210, 165), (255, 235, 200)),
    ("cat-womens-health.jpg", (235, 210, 175), (252, 232, 200), (255, 245, 225)),
]
for name, c1, c2, ring in categories:
    macro_tile(os.path.join(OUT, name), (480, 480), c1, c2, ring)

wide_photo(os.path.join(OUT, "operations.jpg"), (700, 620), (15, 25, 35), (35, 60, 85), (90, 160, 220))
wide_photo(os.path.join(OUT, "partnerships.jpg"), (700, 620), (200, 210, 218), (235, 240, 245), (120, 150, 190))

print("done")
