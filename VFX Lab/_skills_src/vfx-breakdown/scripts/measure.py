#!/usr/bin/env python3
"""extract.py 결과(WORKDIR)에서 분석에 필요한 수치를 뽑는다. 모든 출력은 그대로 근거 팩에 옮겨 쓸 수 있는 형태다.

  measure.py WORK summary                     막·비트 나누기 전 전체 흐름(1초 단위 요약표)
  measure.py WORK peaks [--min 1.0] [--drop 0.2]  강도 피크·간격·피크 직전 밝기 누르기 후보
  measure.py WORK palette "이름:a-b;이름:a-b"  구간별 밝기 단계(코어/바디/엣지/헤이즈) 대표색·면적
  measure.py WORK hue a-b                     구간의 프레임별 층 색상 + 층별 전환 구간(10–90%)
  measure.py WORK lstats f1,f2 [--crop x,y,w,h]  프레임(영역)의 명도 분포 비교 (crop은 스프라이트 셀 좌표)
  measure.py WORK scene a-b                   화면 평균 색상 변화
  measure.py WORK focus a-b                   ROI A/B 중 어느 쪽이 더 밝은지 구간 요약
  measure.py WORK strip f1,f2,... OUT.jpg [--crop x,y,w,h] [--cols 3]   원본 해상도 키프레임 몽타주
  measure.py WORK dupes                       직전 프레임과 같은(녹화 드롭으로 복제된) 프레임 찾기
  measure.py WORK bg                          기준 프레임(배경)의 평균색·색상·명도·선명도 (hueL 카드 bg 값)
  measure.py WORK focus a-b [--relative]      --relative: 각 ROI의 기준 프레임 밝기를 뺀 상승량으로 비교

좌표: --crop은 모든 명령에서 스프라시트 셀 좌표(가로 512, 세로 meta.sprite.h)다. 템플릿 config의 crop과 같다.
peaks의 --min 기본값은 영상 강도 상위 2% 값의 30%(작은 이펙트도 잡히게).
  measure.py WORK chroma #hex1 #hex2          HSV S(색 선택기 채도)과 선명도(눈에 보이는 채도) 비교

평가(05 REVIEW)용 검사:
  measure.py WORK flash [--area 0.1]          섬광 근사 검사(WCAG 2.3.1식). 1초 안 섬광 횟수 최대값
  measure.py WORK cover f1,f2|a-b --crop x,y,w,h [--lmin 85]  영역(대상 실루엣 등)이 밝은 이펙트로 덮인 비율
  measure.py WORK col K a-b [--over X]        data K열 값 나열 + X를 넘는 연속 구간(예: 10열 이펙트 면적 --over 50)
  measure.py WORK grid f1,f2,... OUT.jpg       스프라이트 셀 좌표 격자를 덮은 프레임(투사체 머리 위치 읽기용, projectile.py --follow)
  measure.py WORK cpath a-b [--crop x,y,w,h] [--band 60-85]  색 전환 경로: 프레임별 명도 단계(기본 바디)의 명도·선명도·색상. 회색 경유 판정용
"""
import colorsys, glob, json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

if len(sys.argv) < 3: print(__doc__); sys.exit(1)
W = sys.argv[1]; cmd = sys.argv[2]; args = sys.argv[3:]
D = json.load(open(os.path.join(W, 'data.json'))); meta = json.load(open(os.path.join(W, 'meta.json')))
N = len(D); FPS = meta['fps']


def opt(name, default=None):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default


def lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])


def lab(a_):
    xyz = lin(a_) @ M.T / np.array([0.95047, 1, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return 116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])


def plate_of(f):
    for p_, x_, y_ in meta.get('plate_map', [[meta.get('plate', 1), 1, N]]):
        if x_ <= f <= y_: return p_
    return meta.get('plate', 1)


def load(i): return np.asarray(Image.open(os.path.join(W, 'small', f'f{i:03d}.png')).convert('RGB')).astype(np.float32) / 255


def rng(s): a, b = s.split('-'); return int(a), int(b)


if cmd == 'summary':
    step = max(1, int(round(FPS / 2)))
    print('F | t(s) | 화면 명도 | 이펙트 상위5% 명도 | 강도 | 이펙트 면적% | 코어/바디/엣지 색상° | 바디색 | ROI A/B 최대 명도')
    for f in range(1, N + 1, step):
        r = D[f - 1]
        print(f"F{f} | {(f-1)/FPS:.2f} | {r[0]} | {r[1]} | {r[12]} | {r[10]} | {r[4]}/{r[5]}/{r[6]} | {r[14]} | {r[2]}/{r[3]}")

elif cmd == 'peaks':
    e = [r[12] for r in D]; mn = float(opt('--min', str(round(0.3 * float(np.percentile(e, 98)), 3))))
    pk = [i + 1 for i in range(1, N - 1) if e[i] >= e[i - 1] and e[i] >= e[i + 1] and e[i] >= mn]
    # 너무 붙은 피크는 큰 쪽만
    out = []
    for f in pk:
        if out and f - out[-1] < 4:
            if e[f - 1] > e[out[-1] - 1]: out[-1] = f
        else: out.append(f)
    drop = float(opt('--drop', '0.2'))
    keep = []
    for f in out:
        seg = list(range(max(1, f - 10), f)); m = min(seg, key=lambda x: e[x - 1]) if seg else f
        if e[m - 1] <= e[f - 1] * (1 - drop): keep.append(f)
    print(f'강도 피크 {len(keep)}개 (직전 10f 안에서 {drop*100:.0f}% 이상 내려갔다 올라온 것만. 걸러진 작은 피크 {len(out)-len(keep)}개, --drop 0으로 전부 보기)')
    print('프레임, 강도, 직전 10f 안 최저 강도 프레임·값·피크 대비 비율')
    out = keep
    for f in out:
        a0 = max(1, f - 10); seg = list(range(a0, f)); m = min(seg, key=lambda x: e[x - 1]) if seg else f
        print(f'F{f}  강도 {e[f-1]:.2f} | 누르기 후보 F{m} {e[m-1]:.2f} ({e[m-1]/max(e[f-1],1e-6)*100:.0f}%)  화면 명도 {D[m-1][0]}→{D[f-1][0]}  이펙트 상위5% 명도 {D[m-1][1]}→{D[f-1][1]}')
    print('간격:', ' · '.join(str(b - a_) for a_, b in zip(out, out[1:])))

elif cmd == 'palette':
    PLS = {}
    bands = [('코어', 85, 101), ('바디', 60, 85), ('엣지', 35, 60), ('헤이즈', 22, 35)]
    for part in args[0].split(';'):
        name, r_ = part.split(':'); a0, b0 = rng(r_); acc = {k: [] for k, _, _ in bands}
        for i in range(a0, b0 + 1):
            pp = plate_of(i)
            if pp not in PLS: PLS[pp] = lab(load(pp))
            PL, PA, PB = PLS[pp]
            im = load(i); L, A, B = lab(im); m = np.sqrt((L - PL) ** 2 + (A - PA) ** 2 + (B - PB) ** 2) > 10
            for k, lo, hi in bands:
                mm = m & (L >= lo) & (L < hi)
                if mm.sum(): acc[k].append(im[mm])
        tot = sum(sum(len(x) for x in acc[k]) for k, _, _ in bands)
        print(f'## {name} F{a0}–{b0}')
        for k, _, _ in bands:
            if not acc[k]: print(f'  {k}: 없음'); continue
            px = np.concatenate(acc[k]); med = np.median(px, 0); h, s, v = colorsys.rgb_to_hsv(*med)
            Lm, Am, Bm = lab(med[None, None, :])
            hx = '#%02x%02x%02x' % tuple(int(round(c * 255)) for c in med)
            print(f'  {k}: {hx}  색상 {h*360:.0f}°  HSV S {s*100:.0f}  명도 {float(Lm[0,0]):.1f}  선명도 {float(np.hypot(Am,Bm)[0,0]):.0f}  면적 {len(px)/tot*100:.1f}%')

elif cmd == 'hue':
    a0, b0 = rng(args[0])
    print('F | 코어° | 바디° | 엣지° | 바디색 | 바디 HSV S(색 선택기 채도, 눈과 다를 수 있음 → 선명도는 cpath)')
    for f in range(a0, b0 + 1):
        r = D[f - 1]; hx = r[14]
        s = colorsys.rgb_to_hsv(*[int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5)])[1] if hx else None
        print(f'F{f} | {r[4]} | {r[5]} | {r[6]} | {hx} | {round(s,2) if s is not None else None}')
    for k, name in ((4, '코어'), (5, '바디'), (6, '엣지')):
        seq = [(f, D[f - 1][k]) for f in range(a0, b0 + 1) if D[f - 1][k] is not None]
        if len(seq) < 3: continue
        hs, he = seq[0][1], seq[-1][1]; d = ((he - hs + 540) % 360) - 180
        if abs(d) < 15: print(f'{name}: 변화 작음({hs}°→{he}°)'); continue
        prog = lambda h: (((h - hs + 540) % 360) - 180) / d
        f10 = next((f for f, h in seq if prog(h) >= 0.1), None); f90 = next((f for f, h in seq if prog(h) >= 0.9), None)
        print(f'{name}: {hs}°→{he}° ({d:+d}°)  전환 구간 F{f10}–F{f90} ({(f90-f10+1) if f10 and f90 else "?"}f)')

elif cmd == 'lstats':
    frames = [int(x) for x in args[0].split(',')]; crop = opt('--crop')
    sw = meta['sprite']['w']; sh = meta['sprite']['h']
    for f in frames:
        im = np.asarray(Image.open(os.path.join(W, 'frames', f'f{f:03d}.png')).convert('RGB')).astype(np.float32) / 255
        if crop:
            x, y, w, h = [float(v) for v in crop.split(',')]; H0, W0 = im.shape[:2]
            im = im[int(y / sh * H0):int((y + h) / sh * H0), int(x / sw * W0):int((x + w) / sw * W0)]
        L, _, _ = lab(im)
        print(f'F{f}: 명도 평균 {L.mean():.1f} | 중앙값 / 상위 10% / 상위 1% ' + ' / '.join(f'{np.percentile(L, p):.0f}' for p in (50, 90, 99)))

elif cmd == 'scene':
    a0, b0 = rng(args[0])
    for f in range(a0, b0 + 1, max(1, (b0 - a0) // 30)):
        r = D[f - 1]; print(f'F{f}  화면 평균색 {r[16]}  색상 {r[11]}°  명도 {r[0]}  가장 밝은 점(상위 0.2%) 명도 {r[17]}')

elif cmd == 'focus':
    rel = '--relative' in args
    if rel: args.remove('--relative')
    a0, b0 = rng(args[0]); cur = None; st = a0
    bA = (lambda f: D[plate_of(f) - 1][2]) if rel else (lambda f: 0); bB = (lambda f: D[plate_of(f) - 1][3]) if rel else (lambda f: 0)
    if rel: print('프레임마다 그 구간 기준 프레임(plate)의 A/B 밝기를 뺀 상승량으로 비교')
    if D[0][2] is None: print('ROI가 없음: extract.py를 --roi-a/--roi-b로 다시 실행'); sys.exit(0)
    for f in range(a0, b0 + 2):
        if f > b0: w = None
        else:
            seg = range(max(a0, f - 2), min(b0, f + 2) + 1)
            dv = sum((D[g_ - 1][2] - bA(g_)) - (D[g_ - 1][3] - bB(g_)) for g_ in seg)
            w = 'A' if dv > 0 else 'B'
        if w != cur:
            if cur: print(f'F{st}–{f-1}: {cur}가 더 밝음  (A {D[st-1][2]}→{D[f-2][2]}, B {D[st-1][3]}→{D[f-2][3]})')
            cur, st = w, f

elif cmd == 'strip':
    frames = [int(x) for x in args[0].split(',')]; out = args[1]; crop = opt('--crop'); cols = int(opt('--cols', '3'))
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
    except Exception: font = ImageFont.load_default()
    ims = []
    for f in frames:
        im = Image.open(os.path.join(W, 'frames', f'f{f:03d}.png')).convert('RGB')
        if crop:
            x, y, w, h = [float(v) for v in crop.split(',')]; k = im.width / meta['sprite']['w']
            im = im.crop((int(x * k), int(y * k), int((x + w) * k), int((y + h) * k)))
        im = im.resize((640, int(640 * im.height / im.width))); d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 70, 28], fill='black'); d.text((4, 2), str(f), fill='yellow', font=font); ims.append(im)
    w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols; sh_ = Image.new('RGB', (cols * w, rows * h))
    for i, im in enumerate(ims): sh_.paste(im, ((i % cols) * w, (i // cols) * h))
    sh_.save(out, quality=88); print(out)

elif cmd == 'bg':
    for p_ in sorted({m_[0] for m_ in meta.get('plate_map', [[meta.get('plate', 1), 1, N]])}):
        im = load(p_); L, A, B = lab(im); mean = im.reshape(-1, 3).mean(0)
        h, s, v = colorsys.rgb_to_hsv(*mean); Lm, Am, Bm = lab(mean[None, None, :])
        print(f'기준 F{p_}: 배경 평균 #%02x%02x%02x' % tuple(int(round(c * 255)) for c in mean) + f'  색상 {h*360:.0f}°  명도 {float(Lm[0,0]):.1f}  선명도 {float(np.hypot(Am,Bm)[0,0]):.0f}  (hueL 카드의 bg로 쓴다. 선명도 10 안팎이면 거의 무채색 배경)')

elif cmd == 'dupes':
    # 움직임 중간에 혼자 멈춘 프레임만 복제로 본다(정지 구간은 제외)
    g = [np.asarray(Image.open(os.path.join(W, 'small', f'f{f:03d}.png')).convert('L')).astype(np.float32) for f in range(1, N + 1)]
    d = [0.0] + [float(np.abs(g[i] - g[i - 1]).mean()) for i in range(1, N)]
    dup = [i + 1 for i in range(1, N - 1) if d[i] < 0.15 and d[i - 1] > 1.0 and d[i + 1] > 1.0]
    print(f'직전과 같은 프레임 {len(dup)}개:', ', '.join(f'F{x}' for x in dup) if dup else '없음')
    if dup: print('→ 이 구간의 프레임 수는 ±1f 오차. 타이밍 수치에 표시한다.')

elif cmd == 'chroma':
    for hx in args:
        rgb = np.array([int(hx[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
        L, A, B = lab(rgb[None, None, :]); s = colorsys.rgb_to_hsv(*rgb)[1]
        print(f'{hx}: HSV S(색 선택기) {s*100:.0f} | 선명도(C*) {float(np.hypot(A,B)[0,0]):.0f} | 명도(L*) {float(L[0,0]):.1f}')
elif cmd == 'flash':
    # 상대휘도 Y가 0.1 이상 바뀌고(어두운 쪽 Y<0.8) 그 면적이 화면의 area 이상이면 전환 1회. 반대 방향 전환 한 쌍 = 섬광 1회.
    area = float(opt('--area', '0.1')); fps_i = int(round(FPS))
    def Y(i): return (lin(load(i)) @ M[1])
    prev = Y(1); ev = []
    for f in range(2, N + 1):
        cur = Y(f); dY = cur - prev; dark = np.minimum(cur, prev) < 0.8
        up = float(((dY >= 0.1) & dark).mean()); dn = float(((dY <= -0.1) & dark).mean())
        if up >= area or dn >= area: ev.append((f, '+' if up >= dn else '-', round(max(up, dn) * 100)))
        prev = cur
    fl = []; last = None
    for f, sg, a_ in ev:
        if last and sg != last[1]: fl.append(f); last = None
        else: last = (f, sg)
    worst = max((sum(1 for x in fl if s0 <= x < s0 + fps_i), s0) for s0 in range(1, N + 1)) if fl else (0, 1)
    print(f'면적 {area*100:.0f}% 이상 휘도 전환 {len(ev)}회: ' + (', '.join(f'F{f}{sg}{a_}%' for f, sg, a_ in ev) or '없음'))
    print(f'섬광(반대 방향 전환 한 쌍) {len(fl)}회: ' + (', '.join(f'F{x}' for x in fl) or '없음'))
    print(f'1초 안 최대 {worst[0]}회 (F{worst[1]}–{worst[1]+fps_i-1}). 기준: 1초에 3회 이하. 근사 검사다(붉은 섬광·시야각은 따지지 않음)')

elif cmd == 'cover':
    crop = opt('--crop'); lmin = float(opt('--lmin', '85'))
    if not crop: print('--crop x,y,w,h 가 필요하다(스프라이트 셀 좌표)'); sys.exit(1)
    fr = list(range(*[int(v) + i for i, v in enumerate(args[0].split('-'))])) if '-' in args[0] else [int(x) for x in args[0].split(',')]
    x, y, w, h = [float(v) for v in crop.split(',')]; sw = meta['sprite']['w']; sh = meta['sprite']['h']
    PLS = {}; res = []
    for f in fr:
        pp = plate_of(f)
        if pp not in PLS: PLS[pp] = lab(load(pp))
        PL, PA, PB = PLS[pp]; L, A, B = lab(load(f)); H0, W0 = L.shape
        sl = (slice(int(y / sh * H0), int((y + h) / sh * H0)), slice(int(x / sw * W0), int((x + w) / sw * W0)))
        m = (np.sqrt((L - PL) ** 2 + (A - PA) ** 2 + (B - PB) ** 2) > 10)[sl]; Lc = L[sl]
        res.append((f, float((m & (Lc >= lmin)).mean() * 100), float(m.mean() * 100)))
    for f, c_, e_ in res: print(f'F{f}: 명도 {lmin:.0f} 이상 이펙트가 덮은 비율 {c_:.1f}%  (이펙트 전체 {e_:.1f}%)')
    if len(res) > 1:
        mx = max(res, key=lambda r: r[1]); runs = []; st = None
        for (f, c_, _), nxt in zip(res, res[1:] + [(None, 0, 0)]):
            if c_ > 30: st = st or f
            if st and (c_ <= 30 or nxt[0] != f + 1): runs.append((st, f if c_ > 30 else f - 1)); st = None
        print(f'최대 F{mx[0]} {mx[1]:.1f}%. 30% 넘는 구간: ' + (', '.join((f'F{a}–{b}' if b > a else f'F{a}') + f' ({b-a+1}f)' for a, b in runs) or '없음'))
        print('대상 실루엣을 30% 넘게 덮는 프레임이 2f 이상 이어지면 가독성 위험 후보. 대상이 움직이면 구간마다 crop을 따로 준다')

elif cmd == 'grid':
    frames = [int(x) for x in args[0].split(',')]; out = args[1]; sw = meta['sprite']['w']; sh = meta['sprite']['h']
    try: ft = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
    except Exception: ft = ImageFont.load_default()
    ims = []
    for f in frames:
        im = Image.open(os.path.join(W, 'frames', f'f{f:03d}.png')).convert('RGB'); k = 768 / sw; im = im.resize((768, round(sh * k))); d = ImageDraw.Draw(im)
        for x in range(0, sw + 1, 32):
            d.line([(x * k, 0), (x * k, im.height)], fill=(255, 255, 0) if x % 128 == 0 else (90, 90, 40))
            if x % 64 == 0: d.text((x * k + 2, 2), str(x), fill=(255, 255, 0), font=ft)
        for y in range(0, sh + 1, 32):
            d.line([(0, y * k), (768, y * k)], fill=(255, 255, 0) if y % 128 == 0 else (90, 90, 40))
            if y % 64 == 0: d.text((2, y * k + 2), str(y), fill=(255, 255, 0), font=ft)
        d.rectangle([700, im.height - 30, 768, im.height], fill='black'); d.text((706, im.height - 24), f'F{f}', fill='white', font=ft); ims.append(im)
    cols = 3; rows = (len(ims) + cols - 1) // cols; sh_ = Image.new('RGB', (768 * cols, ims[0].height * rows))
    for i, im in enumerate(ims): sh_.paste(im, ((i % cols) * 768, (i // cols) * im.height))
    sh_.save(out, quality=85); print(out, '(격자 숫자 = 스프라이트 셀 좌표. 머리 위치를 읽어 projectile.py --follow "f:x,y;..."에 넣는다)')

elif cmd == 'cpath':
    a0, b0 = rng(args[0]); crop = opt('--crop'); lo_, hi_ = [float(v) for v in opt('--band', '60-85').split('-')]
    sw = meta['sprite']['w']; sh = meta['sprite']['h']; PLS = {}; rows = []
    for f in range(a0, b0 + 1):
        pp = plate_of(f)
        if pp not in PLS: PLS[pp] = lab(load(pp))
        PL, PA, PB = PLS[pp]; L, A, B = lab(load(f)); m = (np.sqrt((L - PL) ** 2 + (A - PA) ** 2 + (B - PB) ** 2) > 10) & (L >= lo_) & (L < hi_)
        if crop:
            x, y, w, h = [float(v) for v in crop.split(',')]; H0, W0 = L.shape; mm = np.zeros_like(m)
            mm[int(y / sh * H0):int((y + h) / sh * H0), int(x / sw * W0):int((x + w) / sw * W0)] = True; m &= mm
        if m.sum() < 20: rows.append((f, None)); continue
        Lm, Am, Bm = float(np.median(L[m])), float(np.median(A[m])), float(np.median(B[m]))
        med = np.median(load(f)[m], 0); hh = colorsys.rgb_to_hsv(*med)[0] * 360
        rows.append((f, (Lm, float(np.hypot(Am, Bm)), hh, int(m.sum()))))
    print(f'F | 명도 | 선명도 | 색상° | 픽셀 수   (명도 {lo_:g}–{hi_:g} 단계{", crop " + crop if crop else ""})')
    for f, r in rows: print(f'F{f} | ' + ('픽셀 부족' if r is None else f'{r[0]:.1f} | {r[1]:.1f} | {r[2]:.0f}° | {r[3]}'))
    ok = [(f, r) for f, r in rows if r]
    if len(ok) >= 3:
        mn = min(ok[1:-1], key=lambda x: x[1][1]); lowend = min(ok[0][1][1], ok[-1][1][1])
        print(f'양 끝 선명도 {ok[0][1][1]:.0f} → {ok[-1][1][1]:.0f}, 중간 최저 F{mn[0]} 선명도 {mn[1][1]:.0f} (낮은 끝 대비 {mn[1][1]-lowend:+.0f}). -10보다 낮으면 회색 경유 후보. 색상이 30° 넘게 바뀌는 전환에만 쓴다')

elif cmd == 'col':
    k = int(args[0]); a0, b0 = rng(args[1]); over = opt('--over')
    vals = [(f, D[f - 1][k]) for f in range(a0, b0 + 1)]
    print(' '.join(f'F{f}:{v}' for f, v in vals))
    if over is not None:
        x = float(over); runs = []; st = None
        for f, v in vals + [(b0 + 1, None)]:
            if v is not None and v > x:
                st = st or f
            elif st:
                runs.append((st, f - 1)); st = None
        print(f'{x:g} 초과 구간: ' + (', '.join(f'F{a}–{b} ({b-a+1}f · {(b-a+1)/FPS:.2f}s)' for a, b in runs) or '없음'))

else:
    print(__doc__)
