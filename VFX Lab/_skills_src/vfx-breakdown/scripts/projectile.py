#!/usr/bin/env python3
"""투사체 측정: 비행 구간에서 투사체 덩어리를 찾아 프레임마다 추적하고 형태·질감·색 변화를 잰다.

  python3 projectile.py WORK a-b [--lmin 50] [--min-area 40] [--crop x,y,w,h] [--out DIR] [--min-len 4]

  a-b       비행 구간(발사 직후 ~ 착탄 직전). 섬광 프레임은 빼야 덩어리가 깨끗하다.
  --lmin    투사체로 볼 최소 명도(기본 50). 바닥에 번진 빛까지 잡히면 올린다.
  --crop    스프라이트 셀 좌표로 영역 제한(시전체·대상 이펙트를 뺄 때).
  --min-move 투사체로 볼 최소 이동 거리(화면 폭 %, 기본 4). 길이÷두께 1.5 미만(둥근 덩어리)도 뺀다.
  --gate    프레임 사이 머리 이동 한계(화면 폭 %, 기본 6). 투사체끼리 엇갈리면 낮춘다.
  --follow  "f:x,y;f:x,y;..."  투사체 하나를 따라간다(머리 위치를 몇 프레임만 스프라이트 셀 좌표로 준다, 사이는 보간).
            여러 투사체가 엇갈리거나 연기·바닥 빛과 붙어 있으면 자동 추적보다 이게 정확하다. 위치는 격자 그림(measure.py grid)으로 읽는다.
  --radius  --follow에서 머리 주변 몇 %(화면 폭) 안의 덩어리만 볼지(기본 9)
  --name    결과 파일 이름 꼬리표(기본 a-b)
  --out     그림 저장 폴더(기본 WORK/pj). tracks.jpg(경로), profile.jpg(머리→꼬리 색 띠), heads.jpg(머리 모양)

출력(투사체 하나 = 트랙 하나):
  비행      프레임 수·초, 화면 폭 대비 속도(%/f, 화면/초), 직진도(직선 거리 ÷ 실제 경로, 1 = 직선), 총 방향 변화(°)
  형태감    길이·두께(화면 폭 %), 길이÷두께, 머리 크기(명도 85 이상 면적 %), 비행 중 길이 변화
  질감      윤곽 선명도(경계에서 명도가 바뀌는 기울기, 클수록 하드 엣지), 결 거칠기(덩어리 안 잔무늬), 주변 잔입자 수
  컬러      머리→꼬리 8구간의 명도·선명도·색상(공간 램프), 비행 시작→끝 머리 색(시간 변화)
모든 길이는 화면 가로 폭 대비 %라서 해상도가 달라도 비교된다.
"""
import colorsys, json, math, os, sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

if len(sys.argv) < 3: print(__doc__); sys.exit(1)
W = sys.argv[1]; args = sys.argv[2:]


def opt(name, default=None):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default


LMIN = float(opt('--lmin', '50')); MINMOVE = float(opt('--min-move', '4')); MINA = float(opt('--min-area', '40')); CROP = opt('--crop'); MINLEN = int(opt('--min-len', '4')); GATE = float(opt('--gate', '6')); FOLLOW = opt('--follow'); NAME = opt('--name'); RAD = float(opt('--radius', '9'))
OUT = opt('--out', os.path.join(W, 'pj')); os.makedirs(OUT, exist_ok=True)
a0, b0 = [int(x) for x in args[0].split('-')]; SUF = NAME or f'{a0}-{b0}'
meta = json.load(open(os.path.join(W, 'meta.json'))); FPS = meta['fps']; N = meta['frames']
SW, SH = meta['sprite']['w'], meta['sprite']['h']
PW = 960  # 분석 해상도(가로)
M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])


def lab(rgb):
    c = rgb.astype(np.float32) / 255; l = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    xyz = l @ M.T / np.array([0.95047, 1, 1.08883]); f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return 116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])


def plate_of(f):
    for p_, x_, y_ in meta.get('plate_map', [[meta.get('plate', 1), 1, N]]):
        if x_ <= f <= y_: return p_
    return meta.get('plate', 1)


def load(f):
    im = Image.open(os.path.join(W, 'frames', f'f{f:03d}.png')).convert('RGB'); h = round(im.height * PW / im.width)
    return np.asarray(im.resize((PW, h), Image.BILINEAR))


def hue_of(rgbs):
    if len(rgbs) == 0: return None
    hs = np.array([colorsys.rgb_to_hsv(*(c / 255))[:2] + (colorsys.rgb_to_hsv(*(c / 255))[2],) for c in rgbs[:: max(1, len(rgbs) // 400)]])
    w = hs[:, 1] * hs[:, 2]
    if w.sum() < 1e-6: return None
    ang = hs[:, 0] * 2 * math.pi; return round((math.degrees(math.atan2((np.sin(ang) * w).sum(), (np.cos(ang) * w).sum())) + 360) % 360)


KEYS = sorted((int(k), [float(v) * PW / SW for v in xy.split(',')]) for k, xy in (p.split(':') for p in FOLLOW.split(';'))) if FOLLOW else []


def guess(f):
    if f <= KEYS[0][0]: return KEYS[0][1]
    if f >= KEYS[-1][0]: return KEYS[-1][1]
    for (fa, pa), (fb, pb) in zip(KEYS, KEYS[1:]):
        if fa <= f <= fb: t = (f - fa) / max(1, fb - fa); return [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t]


PL = {}
frames = {}
for f in range(a0, b0 + 1):
    rgb = load(f); H = rgb.shape[0]; pp = plate_of(f)
    if pp not in PL: PL[pp] = lab(load(pp))
    L, A, B = lab(rgb); PLc, PAc, PBc = PL[pp]
    m = ((np.sqrt((L - PLc) ** 2 + (A - PAc) ** 2 + (B - PBc) ** 2) > 10) & (L >= LMIN)).astype(np.uint8)
    if CROP:
        x, y, w, h = [float(v) for v in CROP.split(',')]; k = PW / SW; cm = np.zeros_like(m); cm[int(y * k):int((y + h) * k), int(x * k):int((x + w) * k)] = 1; m &= cm
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    if FOLLOW:
        g = guess(f); yy, xx = np.ogrid[:m.shape[0], :m.shape[1]]; m &= (((xx - g[0]) ** 2 + (yy - g[1]) ** 2) <= (PW * RAD / 100) ** 2).astype(np.uint8)
    n, lab_img, st, cen = cv2.connectedComponentsWithStats(m, 8)
    gx = cv2.Sobel(L.astype(np.float32), cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(L.astype(np.float32), cv2.CV_32F, 0, 1, ksize=3); grad = np.hypot(gx, gy) / 8
    detail = np.abs(L - cv2.GaussianBlur(L.astype(np.float32), (0, 0), 2))
    small = [cen[i] for i in range(1, n) if 2 <= st[i, cv2.CC_STAT_AREA] < MINA]
    comps = []
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < MINA: continue
        ys, xs = np.nonzero(lab_img == i); Lc = L[ys, xs]
        top = Lc >= np.percentile(Lc, 95); hx, hy = xs[top].mean(), ys[top].mean()
        d = np.hypot(xs - hx, ys - hy); j = int(d.argmax()); length = float(d[j])
        if length < 4: continue
        ax = np.array([xs[j] - hx, ys[j] - hy]) / length; t = (xs - hx) * ax[0] + (ys - hy) * ax[1]
        bins = []
        for q in range(8):
            sel = (t >= length * q / 8) & (t < length * (q + 1) / 8 + (q == 7))
            if sel.sum() < 3: bins.append(None); continue
            px = rgb[ys[sel], xs[sel]]; Lm = float(np.median(L[ys[sel], xs[sel]])); Am = float(np.median(A[ys[sel], xs[sel]])); Bm = float(np.median(B[ys[sel], xs[sel]]))
            bins.append({'L': round(Lm, 1), 'C': round(math.hypot(Am, Bm), 1), 'H': hue_of(px), 'hex': '#%02x%02x%02x' % tuple(int(v) for v in np.median(px, 0))})
        comp = (lab_img == i).astype(np.uint8); edge = comp - cv2.erode(comp, np.ones((3, 3), np.uint8)); ey, ex = np.nonzero(edge)
        te = (ex - hx) * ax[0] + (ey - hy) * ax[1]; eh = grad[ey, ex][te < length * 0.25]; et = grad[ey, ex][te >= length * 0.5]  # 머리(앞 1/4)·꼬리(뒤 1/2) 윤곽 따로
        sparks = sum(1 for c in small if math.hypot(c[0] - hx, c[1] - hy) < max(30, length * 1.5))
        comps.append({'f': f, 'hx': hx, 'hy': hy, 'len': length, 'area': len(xs), 'wid': len(xs) / max(length, 1), 'core': int((Lc >= 85).sum()),
                      'edge': float(np.median(grad[ey, ex])) if len(ey) else 0, 'edge_h': float(np.median(eh)) if len(eh) else 0, 'edge_t': float(np.median(et)) if len(et) else 0, 'grain': float(detail[ys, xs].mean()), 'sparks': sparks, 'bins': bins,
                      'box': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())], 'px': (xs[::2], ys[::2])})
    if FOLLOW and comps:
        g = guess(f); comps = [min(comps, key=lambda c: math.hypot(c['hx'] - g[0], c['hy'] - g[1]))]
    frames[f] = comps

# 추적: 직전 프레임 머리와 가장 가까운 덩어리를 잇는다
tracks = []; alive = []
gate = PW * GATE / 100  # 프레임 사이 머리가 이만큼(화면 폭 %) 넘게 뛰면 다른 투사체로 본다
for f in range(a0, b0 + 1):
    used = set(); nxt = []
    for tr in alive:
        last = tr[-1]; best = None
        for k, c in enumerate(frames[f]):
            if k in used: continue
            d = math.hypot(c['hx'] - last['hx'], c['hy'] - last['hy'])
            if d < gate and (best is None or d < best[0]): best = (d, k)
        if best: used.add(best[1]); tr.append(frames[f][best[1]]); nxt.append(tr)
        elif len(tr) >= MINLEN: tracks.append(tr)
    for k, c in enumerate(frames[f]):
        if k not in used: nxt.append([c])
    alive = nxt
tracks += [t for t in alive if len(t) >= MINLEN]
if FOLLOW: tracks = [[frames[f][0] for f in range(a0, b0 + 1) if frames[f]]]
tracks.sort(key=lambda t: (t[0]['f'], t[0]['hx']))

pct = lambda v: round(v / PW * 100, 2)
res = []
for tr in tracks:
    raw = np.array([[c['hx'], c['hy']] for c in tr]); k_ = min(5, len(raw)) | 1
    pts = np.array([raw[max(0, i - k_ // 2):i + k_ // 2 + 1].mean(0) for i in range(len(raw))])  # 머리 위치 흔들림을 5f 이동평균으로 고른다
    seg = np.hypot(*np.diff(pts, axis=0).T); path = seg.sum(); chord = float(np.hypot(*(pts[-1] - pts[0])))
    if not FOLLOW and path / PW * 100 < MINMOVE or not FOLLOW and np.median([c['len'] / max(c['wid'], 1) for c in tr]) < 1.5: continue  # 거의 안 움직이거나 둥근 덩어리(섬광·인물)는 투사체가 아니다
    head = np.degrees(np.arctan2(*np.diff(pts, axis=0).T[::-1])); turn = float(np.abs(((np.diff(head) + 180) % 360) - 180).sum()) if len(head) > 1 else 0
    mid = tr[len(tr) // 2]
    def headcol(c):
        b = c['bins'][0] or {}; return {k: b.get(k) for k in ('L', 'C', 'H', 'hex')}
    r = {'id': len(res) + 1, 'frames': [tr[0]['f'], tr[-1]['f']], 'n': len(tr), 'sec': round(len(tr) / FPS, 2),
         'speed_pct_f': pct(path / max(1, len(tr) - 1)), 'speed_screen_s': round(path / max(1, len(tr) - 1) * FPS / PW, 2),
         'straight': round(chord / path, 2) if path else 1, 'turn_deg': round(turn),
         'len_pct': pct(float(np.median([c['len'] for c in tr]))), 'len_range': [pct(min(c['len'] for c in tr)), pct(max(c['len'] for c in tr))],
         'wid_pct': pct(float(np.median([c['wid'] for c in tr]))), 'aspect': round(float(np.median([c['len'] / max(c['wid'], 1) for c in tr])), 1),
         'head_pct': round(float(np.median([c['core'] for c in tr])) / (PW * PW * 9 / 16) * 100, 3),
         'edge': round(float(np.median([c['edge'] for c in tr])), 1), 'edge_head': round(float(np.median([c['edge_h'] for c in tr])), 1), 'edge_tail': round(float(np.median([c['edge_t'] for c in tr])), 1), 'grain': round(float(np.median([c['grain'] for c in tr])), 2),
         'sparks': round(float(np.median([c['sparks'] for c in tr])), 1),
         'profile_mid': mid['bins'], 'mid_f': mid['f'], 'head_start': headcol(tr[0]), 'head_mid': headcol(mid), 'head_end': headcol(tr[-1]),
         'path': [[c['f'], round(float(q[0]) / PW * SW), round(float(q[1]) / PW * SW)] for c, q in zip(tr, pts)]}  # 5f 이동평균한 머리 경로
    r_px = None
    res.append(r)
json.dump(res, open(os.path.join(OUT, f'tracks_{SUF}.json'), 'w'), ensure_ascii=False, indent=1)

print(f'F{a0}–{b0} 투사체 {len(res)}개 (명도 {LMIN:g} 이상, {MINLEN}f 이상 이어진 덩어리). 길이·속도는 화면 가로 폭 대비 %')
for r in res:
    print(f"\n#{r['id']} F{r['frames'][0]}–{r['frames'][1]} ({r['n']}f · {r['sec']}s)")
    print(f"  비행   속도 {r['speed_pct_f']}%/f (화면 {r['speed_screen_s']}배/초) · 직진도 {r['straight']} · 방향 변화 {r['turn_deg']}°")
    print(f"  형태감 길이 {r['len_pct']}% ({r['len_range'][0]}–{r['len_range'][1]}) · 두께 {r['wid_pct']}% · 길이÷두께 {r['aspect']} · 머리(명도 85↑) 화면의 {r['head_pct']}%")
    print(f"  질감   윤곽 선명도 {r['edge']} (머리 {r['edge_head']} / 꼬리 {r['edge_tail']}) · 결 거칠기 {r['grain']} · 주변 잔입자 {r['sparks']}개")
    pr = [b for b in r['profile_mid'] if b]
    print(f"  공간 램프(F{r['mid_f']} 머리→꼬리) " + ' → '.join(f"{b['hex']} 명도{b['L']:.0f}/선명도{b['C']:.0f}/{b['H']}°" for b in pr[::2]))
    hs, he = r['head_start'], r['head_end']
    print(f"  시간 변화(머리) F{r['frames'][0]} {hs['hex']} 명도{hs['L']}·선명도{hs['C']}·{hs['H']}° → F{r['frames'][1]} {he['hex']} 명도{he['L']}·선명도{he['C']}·{he['H']}°")

# 그림: 경로 / 색 띠 / 머리 모양
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except Exception: font = ImageFont.load_default()
base = Image.fromarray(load(res[len(res) // 2]['mid_f'] if res else a0)).convert('RGB'); dr = ImageDraw.Draw(base)
cols = [(255, 214, 102), (102, 224, 255), (255, 120, 200), (140, 255, 140), (255, 160, 90), (190, 150, 255)]
for r in res:
    c = cols[(r['id'] - 1) % len(cols)]; P = [(x * PW / SW, y * PW / SW) for _, x, y in r['path']]
    dr.line(P, fill=c, width=3); dr.ellipse([P[0][0] - 5, P[0][1] - 5, P[0][0] + 5, P[0][1] + 5], outline=c, width=2); dr.text((P[-1][0] + 6, P[-1][1] - 10), f"#{r['id']}", fill=c, font=font)
base.save(os.path.join(OUT, f'tracks_{SUF}.jpg'), quality=88)
if res:
    rows = []
    for r in res:
        im = Image.new('RGB', (520, 44), (14, 18, 26)); d = ImageDraw.Draw(im); d.text((6, 12), f"#{r['id']}", fill=(220, 220, 220), font=font)
        for q, b in enumerate(r['profile_mid']):
            if b: d.rectangle([60 + q * 56, 6, 60 + q * 56 + 54, 38], fill=b['hex'])
        rows.append(im)
    sheet = Image.new('RGB', (520, 44 * len(rows)), (14, 18, 26))
    for i, im in enumerate(rows): sheet.paste(im, (0, 44 * i))
    sheet.save(os.path.join(OUT, f'profile_{SUF}.jpg'), quality=90)
    full = load(res[0]['mid_f']); heads = []
    for r in res:
        pm = [p for p in r['path'] if p[0] == r['mid_f']]
        c = min(frames[r['mid_f']], key=lambda c: math.hypot(c['hx'] / PW * SW - pm[0][1], c['hy'] / PW * SW - pm[0][2])) if pm and frames[r['mid_f']] else None
        if not c: continue
        x0, y0, x1, y1 = c['box']; pad = 12; fr_ = load(r['mid_f'])
        crop = Image.fromarray(fr_[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]); crop.thumbnail((240, 240)); tile = Image.new('RGB', (250, 270), (14, 18, 26)); tile.paste(crop, (5, 5))
        ImageDraw.Draw(tile).text((8, 246), f"#{r['id']} F{r['mid_f']}", fill=(220, 220, 220), font=font); heads.append(tile)
    if heads:
        hs_ = Image.new('RGB', (250 * len(heads), 270), (14, 18, 26))
        for i, t in enumerate(heads): hs_.paste(t, (250 * i, 0))
        hs_.save(os.path.join(OUT, f'heads_{SUF}.jpg'), quality=90)
# 잡힌 영역 확인용: 비행 중 4프레임에서 투사체로 잡힌 픽셀을 노랑으로 칠한다(문턱값이 맞는지 눈으로 본다)
for r in res:
    tr = next(t for t in tracks if t[0]['f'] == r['frames'][0] and len(t) == r['n'])
    pick = [tr[int(i * (len(tr) - 1) / 3)] for i in range(4)]; tiles = []
    for c in pick:
        fr_ = load(c['f']).copy(); xs_, ys_ = c['px']; ov = fr_.copy(); ov[ys_, xs_] = [255, 230, 0]
        x0, y0, x1, y1 = c['box']; pad = 30; sl = (slice(max(0, y0 - pad), y1 + pad), slice(max(0, x0 - pad), x1 + pad))
        a = Image.fromarray(fr_[sl]); b = Image.fromarray((fr_[sl] * 0.5 + ov[sl] * 0.5).astype(np.uint8)); w_ = a.width
        t_ = Image.new('RGB', (w_ * 2 + 6, a.height + 24), (14, 18, 26)); t_.paste(a, (0, 24)); t_.paste(b, (w_ + 6, 24)); ImageDraw.Draw(t_).text((4, 2), f"#{r['id']} F{c['f']}", fill=(230, 230, 230), font=font); t_.thumbnail((560, 400)); tiles.append(t_)
    Wt = sum(t.width for t in tiles) + 8 * len(tiles); Ht = max(t.height for t in tiles); sh_ = Image.new('RGB', (Wt, Ht), (14, 18, 26)); x_ = 0
    for t in tiles: sh_.paste(t, (x_, 0)); x_ += t.width + 8
    sh_.save(os.path.join(OUT, f"mask_{SUF}_{r['id']}.jpg"), quality=88)
print(f"\n그림: {OUT}/tracks_{SUF}.jpg · profile_{SUF}.jpg · heads_{SUF}.jpg · mask_{SUF}_n.jpg(잡힌 영역 확인, 꼭 볼 것)   데이터: tracks_{SUF}.json")
