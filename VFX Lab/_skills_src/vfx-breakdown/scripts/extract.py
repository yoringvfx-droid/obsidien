#!/usr/bin/env python3
"""영상 → 프레임 · 프레임별 측정값 · 스프라이트 시트 · 컨택트 시트.

사용:
  python3 extract.py VIDEO WORKDIR [--plate 1 | --plate 1:1-149,270:150-291] [--roi-a x0,y0,x1,y1] [--roi-b x0,y0,x1,y1] [--max-frames 900]

ROI는 화면 비율(0–1) 좌표. 시전체/대상처럼 "누가 더 밝은가"를 비교할 두 영역.
plate는 이펙트가 없는 기준 프레임 번호(1부터). 이펙트 픽셀 = plate 대비 ΔE > 10.
대상이 쓰러지거나 배경이 바뀌는 영상은 구간별 plate를 준다: --plate 1:1-149,270:150-284,1:285-291
(빠진 프레임은 첫 plate를 쓴다). 프레임 추출은 한 번만 하므로 plate만 바꿔 다시 돌려도 빠르다.

출력(WORKDIR):
  frames/f001.png …      원본 해상도 프레임
  small/f001.png …       가로 480 축소본(측정용)
  sheet0.jpg …           템플릿용 스프라이트(셀 가로 512, 7×7)
  contact_1.jpg …        검토용 컨택트 시트(6×8, 프레임 번호 표시)
  data.json              프레임별 18개 측정값(템플릿 D 배열)
  meta.json              frames, fps, size, sprite 정보
"""
import argparse, glob, json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('video'); ap.add_argument('work')
ap.add_argument('--plate', default='1')
ap.add_argument('--roi-a'); ap.add_argument('--roi-b')
ap.add_argument('--max-frames', type=int, default=900)
a = ap.parse_args()
os.makedirs(a.work, exist_ok=True)
F = os.path.join(a.work, 'frames'); S = os.path.join(a.work, 'small')
os.makedirs(F, exist_ok=True); os.makedirs(S, exist_ok=True)

probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                            'stream=width,height,r_frame_rate,nb_frames', '-show_entries', 'format=duration', '-of', 'json', a.video]))
st = probe['streams'][0]; num, den = st['r_frame_rate'].split('/'); fps = round(float(num) / float(den), 3)
if not glob.glob(F + '/f*.png'):
    subprocess.check_call(['ffmpeg', '-v', 'error', '-i', a.video, '-vsync', '0', '-frames:v', str(a.max_frames), F + '/f%03d.png'])
    subprocess.check_call(['ffmpeg', '-v', 'error', '-i', a.video, '-vsync', '0', '-frames:v', str(a.max_frames), '-vf', 'scale=480:-2', S + '/f%03d.png'])
files = sorted(glob.glob(S + '/f*.png')); full = sorted(glob.glob(F + '/f*.png')); N = len(files)
W0, H0 = Image.open(full[0]).size
print(f'frames {N}  fps {fps}  size {W0}x{H0}')


def lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])


def lab(a_):
    xyz = lin(a_) @ M.T / np.array([0.95047, 1, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return 116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])


def hsv(a_):
    mx = a_.max(-1); mn = a_.min(-1); d = np.maximum(mx - mn, 1e-6); r, g, b = a_[..., 0], a_[..., 1], a_[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0), mx


def circ(h, w):
    if w.sum() < 1e-6: return None
    r = np.deg2rad(h); return int(round(float(np.rad2deg(np.arctan2((np.sin(r) * w).sum(), (np.cos(r) * w).sum())) % 360)))


def hexof(px): return '#%02x%02x%02x' % tuple(int(round(c * 255)) for c in np.median(px, 0))


def roi(spec, h, w):
    if not spec: return None
    x0, y0, x1, y1 = [float(v) for v in spec.split(',')]
    return (slice(int(y0 * h), int(y1 * h)), slice(int(x0 * w), int(x1 * w)))


pmap = []
for part in str(a.plate).split(','):
    if ':' in part:
        p_, r_ = part.split(':'); x_, y_ = r_.split('-'); pmap.append([int(p_), int(x_), int(y_)])
    else: pmap.append([int(part), 1, N])
def plate_of(f):
    for p_, x_, y_ in pmap:
        if x_ <= f <= y_: return p_
    return pmap[0][0]
PLATES = {}
for p_ in {m_[0] for m_ in pmap}:
    pim = np.asarray(Image.open(files[p_ - 1]).convert('RGB')).astype(np.float32) / 255
    PLATES[p_] = lab(pim)
h_, w_ = pim.shape[:2]
RA = roi(a.roi_a, h_, w_); RB = roi(a.roi_b, h_, w_)
rows = []
for i, fp in enumerate(files):
    im = np.asarray(Image.open(fp).convert('RGB')).astype(np.float32) / 255
    L, A, B = lab(im); hh, ss, vv = hsv(im); PL, PA, PB = PLATES[plate_of(i + 1)]
    m = np.sqrt((L - PL) ** 2 + (A - PA) ** 2 + (B - PB) ** 2) > 10
    n = int(m.sum()); wsv = ss * vv
    def band(lo, hi): return m & (L >= lo) & (L < hi)
    bc, bb, be = band(85, 101), band(60, 85), band(35, 60)
    hc = circ(hh[bc], wsv[bc]) if bc.sum() > 10 else None
    hb = circ(hh[bb], wsv[bb]) if bb.sum() > 10 else None
    he = circ(hh[be], wsv[be]) if be.sum() > 10 else None
    row = [round(float(L.mean()), 1), round(float(np.percentile(L[m], 95)), 1) if n > 50 else None,
           round(float(np.percentile(L[RA], 99)), 1) if RA else None, round(float(np.percentile(L[RB], 99)), 1) if RB else None,
           hc, hb, he,
           round(bc.sum() / max(n, 1) * 100, 1) if n > 50 else None, round(bb.sum() / max(n, 1) * 100, 1) if n > 50 else None, round(be.sum() / max(n, 1) * 100, 1) if n > 50 else None,
           round(n / m.size * 100, 2), circ(hh.ravel(), wsv.ravel()),
           round(float(np.clip(L - 45, 0, None).mean()), 2),
           hexof(im[bc]) if bc.sum() >= 20 else None, hexof(im[bb]) if bb.sum() >= 20 else None, hexof(im[be]) if be.sum() >= 20 else None,
           '#%02x%02x%02x' % tuple(int(round(c * 255)) for c in im.reshape(-1, 3).mean(0)),
           round(float(np.percentile(L, 99.8)), 1)]
    rows.append(row)
json.dump(rows, open(os.path.join(a.work, 'data.json'), 'w'), separators=(',', ':'))

# sprite sheets (cell width 512)
CW = 512; CH = int(round(512 * H0 / W0 / 2)) * 2; COLS = ROWS = 7; per = COLS * ROWS
for s in range(0, N, per):
    sheet = Image.new('RGB', (COLS * CW, ROWS * CH))
    for k, fp in enumerate(full[s:s + per]):
        sheet.paste(Image.open(fp).convert('RGB').resize((CW, CH), Image.LANCZOS), ((k % COLS) * CW, (k // COLS) * CH))
    sheet.save(os.path.join(a.work, f'sheet{s // per}.jpg'), quality=82, optimize=True, progressive=True)

# contact sheets
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except Exception: font = ImageFont.load_default()
tw = 320; th = int(round(320 * H0 / W0)); C6, R8 = 6, 8
for s in range(0, N, C6 * R8):
    sh = Image.new('RGB', (C6 * tw, R8 * th), 'black')
    for k, fp in enumerate(files[s:s + C6 * R8]):
        t = Image.open(fp).convert('RGB').resize((tw, th)); d = ImageDraw.Draw(t)
        d.rectangle([0, 0, 52, 22], fill='black'); d.text((3, 1), str(s + k + 1), fill='yellow', font=font)
        sh.paste(t, ((k % C6) * tw, (k // C6) * th))
    sh.save(os.path.join(a.work, f'contact_{s // (C6 * R8) + 1}.jpg'), quality=82)

meta = dict(frames=N, fps=fps, width=W0, height=H0, duration=round(N / fps, 2),
            sprite=dict(w=CW, h=CH, cols=COLS, rows=ROWS), plate=pmap[0][0], plate_map=pmap, roi_a=a.roi_a, roi_b=a.roi_b)
json.dump(meta, open(os.path.join(a.work, 'meta.json'), 'w'), indent=1)
print(json.dumps(meta, ensure_ascii=False))
print('contact sheets:', len(glob.glob(os.path.join(a.work, 'contact_*.jpg'))), ' sprite sheets:', len(glob.glob(os.path.join(a.work, 'sheet*.jpg'))))
