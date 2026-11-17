"""สร้างวิดีโอการ์ตูนตัวอย่าง (placeholder) สำหรับส่วน "สมาชิก"
ตัวการ์ตูน 3 ตัวเดินเข้ามาจากด้านหลัง แล้วหยุดยืน ซ้าย / กลาง / ขวา

วิธีรัน:  pip install pillow numpy imageio-ffmpeg
          python tools/make_cartoon_video.py
ผลลัพธ์:  client/public/members.mp4  (แทนที่ด้วยวิดีโอจริงของกลุ่มได้เลย)
"""
import math
import os
import subprocess

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw

W, H = 1280, 720
SS = 2                      # วาดใหญ่ 2 เท่าแล้วย่อ เพื่อให้ขอบเนียน
FPS = 30
DURATION = 7.0
OUT = os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'members.mp4')

# ตำแหน่งสุดท้ายของแต่ละคน (สัดส่วนของความกว้าง) — ต้องตรงกับ NAME_POSITIONS ใน MembersVideo.jsx
FINAL_X = [0.22, 0.5, 0.78]
CHARS = [
    {'shirt': (124, 104, 238), 'pants': (60, 60, 90), 'hair': (40, 30, 30), 'skin': (255, 214, 180), 'hair_style': 'spiky', 'delay': 0.0},
    {'shirt': (255, 140, 120), 'pants': (70, 70, 110), 'hair': (90, 50, 30), 'skin': (245, 200, 165), 'hair_style': 'long', 'delay': 0.35},
    {'shirt': (80, 190, 170), 'pants': (55, 65, 95), 'hair': (30, 30, 40), 'skin': (230, 185, 150), 'hair_style': 'round', 'delay': 0.7},
]
WALK_TIME = 4.2             # เวลาที่ใช้เดินจากไกลมาใกล้
HORIZON = 300
FINAL_FOOT = 640


def ease_out(t):
    return 1 - (1 - t) ** 3


def background():
    img = Image.new('RGB', (W * SS, H * SS))
    px = np.zeros((H * SS, W * SS, 3), dtype=np.float32)
    y = np.linspace(0, 1, H * SS)[:, None]
    top, mid = np.array([236, 233, 253]), np.array([200, 190, 250])
    sky = top + (mid - top) * np.clip(y / (HORIZON / H), 0, 1)[..., None]
    floor_top, floor_bot = np.array([185, 172, 240]), np.array([140, 120, 225])
    fy = np.clip((y - HORIZON / H) / (1 - HORIZON / H), 0, 1)[..., None]
    floor = floor_top + (floor_bot - floor_top) * fy
    px[:] = np.where((y < HORIZON / H)[..., None], sky, floor)
    img = Image.fromarray(px.astype(np.uint8))
    d = ImageDraw.Draw(img, 'RGBA')
    # เส้นพื้นแบบ perspective
    cx = W * SS / 2
    for i in range(-8, 9):
        d.line([(cx + i * 30 * SS, HORIZON * SS), (cx + i * 260 * SS, H * SS)], fill=(255, 255, 255, 40), width=2 * SS)
    # สปอตไลต์
    for cxr in FINAL_X:
        x = cxr * W * SS
        d.ellipse([x - 150 * SS, (FINAL_FOOT - 25) * SS, x + 150 * SS, (FINAL_FOOT + 25) * SS], fill=(255, 255, 255, 45))
    return img


def draw_char(d, c, cx, foot, s, phase, walking, wave):
    S = s * SS
    cx *= SS
    foot *= SS
    bob = abs(math.sin(phase)) * 5 * S if walking else 0
    hip = foot - 62 * S - bob
    sh = hip - 70 * S
    head_y = sh - 38 * S
    lw = int(16 * S)

    d.ellipse([cx - 45 * S, foot - 10 * S, cx + 45 * S, foot + 10 * S], fill=(60, 40, 120, 70))  # เงา

    # ขา: ยกสลับกัน
    for side, ph in ((-1, 0), (1, math.pi)):
        lift = max(0, math.sin(phase + ph)) * 18 * S if walking else 0
        fx = cx + side * 16 * S
        d.line([(cx + side * 13 * S, hip), (fx, foot - lift)], fill=c['pants'], width=lw)
        d.ellipse([fx - 14 * S, foot - lift - 9 * S, fx + 14 * S, foot - lift + 6 * S], fill=(50, 45, 70))

    # แขน
    for side, ph in ((-1, math.pi), (1, 0)):
        if side == 1 and wave is not None:
            hx = cx + 62 * S + math.sin(wave) * 14 * S
            hy = sh - 62 * S
        else:
            swing = math.sin(phase + ph) * 14 * S if walking else 0
            hx = cx + side * 44 * S
            hy = sh + 62 * S + swing
        d.line([(cx + side * 30 * S, sh + 10 * S), (hx, hy)], fill=c['shirt'], width=lw)
        d.ellipse([hx - 10 * S, hy - 10 * S, hx + 10 * S, hy + 10 * S], fill=c['skin'])

    # ลำตัว
    d.rounded_rectangle([cx - 34 * S, sh - 4 * S, cx + 34 * S, hip + 8 * S], radius=22 * S, fill=c['shirt'])

    # ผมด้านหลัง (ทรงยาว)
    r = 36 * S
    if c['hair_style'] == 'long':
        d.rounded_rectangle([cx - r - 4 * S, head_y - r * 0.6, cx + r + 4 * S, head_y + r * 1.25], radius=20 * S, fill=c['hair'])
    # หัว
    d.ellipse([cx - r, head_y - r, cx + r, head_y + r], fill=c['skin'])
    # ผม
    if c['hair_style'] == 'spiky':
        pts = [(cx - r, head_y - 4 * S)]
        for i in range(7):
            x = cx - r + (i + 0.5) * (2 * r / 7)
            pts += [(x, head_y - r - 14 * S), (cx - r + (i + 1) * (2 * r / 7), head_y - r + 8 * S)]
        pts += [(cx + r, head_y - 4 * S), (cx + r, head_y - r * 0.4), (cx - r, head_y - r * 0.4)]
        d.polygon(pts, fill=c['hair'])
    else:
        d.chord([cx - r - 2 * S, head_y - r - 6 * S, cx + r + 2 * S, head_y + r * 0.5], 180, 360, fill=c['hair'])
    # หน้า
    for side in (-1, 1):
        ex = cx + side * 13 * S
        d.ellipse([ex - 4.5 * S, head_y + 2 * S, ex + 4.5 * S, head_y + 12 * S], fill=(35, 30, 45))
        d.ellipse([ex + side * 8 * S - 6 * S, head_y + 14 * S, ex + side * 8 * S + 6 * S, head_y + 20 * S], fill=(255, 130, 140, 110))
    d.arc([cx - 11 * S, head_y + 8 * S, cx + 11 * S, head_y + 24 * S], 20, 160, fill=(120, 50, 60), width=int(3 * S))


def frame(bg, t):
    img = bg.copy()
    d = ImageDraw.Draw(img, 'RGBA')
    states = []
    for i, c in enumerate(CHARS):
        p = min(1, max(0, (t - c['delay']) / WALK_TIME))
        e = ease_out(p)
        x = W / 2 + (FINAL_X[i] * W - W / 2) * e
        foot = HORIZON + 10 + (FINAL_FOOT - HORIZON - 10) * e
        s = 0.45 + 0.95 * e
        walking = p < 1
        phase = (t - c['delay']) * 9 * (1 - 0.5 * e)
        done_at = c['delay'] + WALK_TIME
        wave = (t - done_at) * 12 if 0.15 < t - done_at < 1.3 else None
        states.append((foot, c, x, s, phase, walking and t >= c['delay'], wave))
    for foot, c, x, s, phase, walking, wave in sorted(states, key=lambda st: st[0]):  # ไกลวาดก่อน
        draw_char(d, c, x, foot, s, phase, walking, wave)
    return img.resize((W, H), Image.LANCZOS)


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bg = background()
    n = int(DURATION * FPS)
    writer = subprocess.Popen([
        imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
        '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-preset', 'slow', '-movflags', '+faststart',
        os.path.abspath(OUT),
    ], stdin=subprocess.PIPE)
    for i in range(n):
        writer.stdin.write(frame(bg, i / FPS).tobytes())
    writer.stdin.close()
    writer.wait()
    print('saved', os.path.abspath(OUT), os.path.getsize(OUT) // 1024, 'KB')


if __name__ == '__main__':
    main()
