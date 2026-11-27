#!/usr/bin/env python3
"""핸드북·분석 노트 검사. 수정 후 반드시 실행한다.

  python3 validate_handbook.py VAULT_ROOT
  python3 validate_handbook.py VAULT_ROOT --save-baseline before.txt   # 반영 전에 현재 문제를 기록
  python3 validate_handbook.py VAULT_ROOT --baseline before.txt        # 반영 후: 새로 생긴 문제만 보고
볼트에 원래 있던 문제(사본이라 없는 노트 등)와 이번 작업이 만든 문제를 구분하려고 기준선을 쓴다.

검사 항목
- 카드(파일명이 'XX00 ' 형태): frontmatter id 일치, 제목 순서(원리 → 왜 → 규칙 → (실측 근거) → (충돌·주의) → 체크 → 연결 → 출처)
- frontmatter evidence에 코드가 있으면 '## 실측 근거' 섹션이 있는지
- VFX Handbook v2 / Effect Breakdown 안의 모든 [[링크]]·![[그림]]이 볼트에 실제로 있는지(#제목 링크는 제목까지 확인)
- 카드 목록: 장 노트 표와 목차에 빠진 카드가 없는지
"""
import glob, os, re, sys

V = sys.argv[1].rstrip('/')
SAVE = sys.argv[sys.argv.index('--save-baseline') + 1] if '--save-baseline' in sys.argv else None
BASE = sys.argv[sys.argv.index('--baseline') + 1] if '--baseline' in sys.argv else None
HB = os.path.join(V, 'VFX Handbook v2'); EB = os.path.join(V, 'Effect Breakdown')
md_all = glob.glob(V + '/**/*.md', recursive=True)
names = {os.path.splitext(os.path.basename(p))[0]: p for p in md_all}
imgs = {os.path.basename(p) for p in glob.glob(V + '/**/*', recursive=True) if re.search(r'\.(svg|png|jpe?g|gif|webp)$', p, re.I)}
others = {os.path.basename(p) for p in glob.glob(V + '/**/*', recursive=True) if os.path.isfile(p)}
ORDER = ['> [!abstract] 원리', '## 왜', '## 규칙', '## 실측 근거', '## 충돌·주의', '## 체크', '## 연결', '## 출처']
REQ = ['> [!abstract] 원리', '## 왜', '## 규칙', '## 체크', '## 연결', '## 출처']
probs = []
cards = [p for p in glob.glob(HB + '/*/*.md') if re.match(r'^[A-Z]{1,3}\d{2} ', os.path.basename(p))]
for p in cards:
    s = open(p, encoding='utf-8').read(); cid = os.path.basename(p).split(' ')[0]
    fm = re.match(r'---\n(.*?)\n---\n', s, re.S)
    if not fm: probs.append((cid, 'frontmatter 없음')); continue
    if f'id: {cid}' not in fm.group(1): probs.append((cid, 'frontmatter id 불일치'))
    body = s[fm.end():]
    pos = [body.find(h) for h in ORDER if body.find(h) >= 0]
    if pos != sorted(pos): probs.append((cid, '섹션 순서 틀림'))
    for h in REQ:
        if h not in body: probs.append((cid, f'섹션 없음: {h}'))
    ev = re.search(r'evidence:\s*\[(.*?)\]', fm.group(1))
    if ev and ev.group(1).strip() and '## 실측 근거' not in body and cid[:2] != 'AP':
        probs.append((cid, 'evidence가 있는데 실측 근거 섹션 없음'))
heads = {}
for p in md_all:
    heads[os.path.splitext(os.path.basename(p))[0]] = set(re.findall(r'^#+ (.+)$', open(p, encoding='utf-8').read(), re.M))
scope = [p for p in md_all if p.startswith(HB) or p.startswith(EB)]
for p in scope:
    for m in re.findall(r'!?\[\[([^\]]+)\]\]', open(p, encoding='utf-8').read()):
        t = m.split('|')[0].replace('\\', ''); h = None
        if '#' in t: t, h = t.split('#', 1)
        t = t.strip()
        if re.search(r'\.(svg|png|jpe?g|gif|webp)$', t, re.I): ok = t in imgs
        elif '.' in t and not t.endswith('.md') and t in others: ok = True
        else: ok = t in names and (h is None or h.strip() in heads.get(t, set()))
        if not ok: probs.append((os.path.relpath(p, V), f'끊긴 링크: {m}'))
# chapter tables & index coverage
idx = os.path.join(HB, 'VFX Handbook v2.md'); idx_s = open(idx, encoding='utf-8').read() if os.path.exists(idx) else ''
for p in cards:
    fn = os.path.splitext(os.path.basename(p))[0]; ch = os.path.basename(os.path.dirname(p))
    chn = os.path.join(os.path.dirname(p), ch + '.md')
    if os.path.exists(chn) and f'![[{fn}]]' not in open(chn, encoding='utf-8').read(): probs.append((fn, f'장 노트({ch})에 끼워 넣기 없음'))
    if idx_s and f'[[{fn}|' not in idx_s: probs.append((fn, '목차에 없음'))
lines = [' · '.join(x) for x in probs]
if SAVE:
    open(SAVE, 'w', encoding='utf-8').write('\n'.join(lines)); print(f'기준선 저장: 문제 {len(lines)}건 → {SAVE}'); sys.exit(0)
if BASE:
    old = set(open(BASE, encoding='utf-8').read().splitlines()); new = [l for l in lines if l not in old]
    for l in new: print(l)
    print(f'카드 {len(cards)}장 검사, 기준선 {len(old)}건 대비 새 문제 {len(new)}건'); sys.exit(1 if new else 0)
for l in lines: print(l)
print(f'카드 {len(cards)}장 검사, 문제 {len(probs)}건')
sys.exit(1 if probs else 0)
