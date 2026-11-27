"""항목마다 8프레임 컨택트 시트(움직임이 큰 프레임 우선)를 만들고, 5개씩 묶은 페이지 이미지를 만든다.
사용: python contact_sheets.py <items.json> <out_dir>
out_dir/sheets/<id>.jpg (항목별), out_dir/pages/pNN.jpg (확인용 페이지)
"""
import json, os, sys, glob, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont
from concurrent.futures import ThreadPoolExecutor
items = json.load(open(sys.argv[1], encoding='utf-8')); out = sys.argv[2]
S = os.path.join(out, 'sheets'); P = os.path.join(out, 'pages'); T = os.path.join(out, 'tmp')
for d in (S, P, T): os.makedirs(d, exist_ok=True)
def dur(p, fb):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout.strip()
    try: return float(r)
    except: return fb or 1.0
def run(j):
    o = os.path.join(S, j['id'] + '.jpg')
    if os.path.exists(o): return
    d = dur(j['path'], j.get('duration')); n = 24
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', j['path'], '-vf', f'fps={n/max(d,0.1)},scale=640:-2', '-frames:v', str(n), os.path.join(T, j['id'] + '_%03d.png')])
    fs = sorted(glob.glob(os.path.join(T, j['id'] + '_*.png')))
    if not fs: print('FAIL', j['name']); return
    A = np.stack([np.asarray(Image.open(f).convert('RGB')).astype(np.int16) for f in fs])
    diff = np.abs(A - np.median(A, axis=0)).sum(-1).reshape(len(fs), -1).mean(1)
    pick = sorted(np.argsort(diff)[::-1][:8])
    sheet = Image.new('RGB', (1280, 360))
    for k, i in enumerate(pick):
        sheet.paste(Image.fromarray(A[i].astype(np.uint8)).resize((320, 180)), ((k % 4) * 320, (k // 4) * 180))
    sheet.save(o, quality=82)
    for f in fs: os.remove(f)
with ThreadPoolExecutor(6) as ex: list(ex.map(run, items))
fp = next(iter(glob.glob('/usr/share/fonts/**/NotoSansCJK-Regular.ttc', recursive=True)), None)
font = ImageFont.truetype(fp, 26) if fp else ImageFont.load_default()
for p in range(0, len(items), 5):
    grp = [j for j in items[p:p+5] if os.path.exists(os.path.join(S, j['id'] + '.jpg'))]
    if not grp: continue
    page = Image.new('RGB', (1280, len(grp) * 396), 'white'); dr = ImageDraw.Draw(page)
    for k, j in enumerate(grp):
        dr.text((8, k * 396 + 2), f"#{p+k+1} {j['name']}", fill='black', font=font)
        page.paste(Image.open(os.path.join(S, j['id'] + '.jpg')), (0, k * 396 + 36))
    page.save(os.path.join(P, f'p{p//5+1:02d}.jpg'), quality=78)
print('pages:', sorted(os.listdir(P)))
