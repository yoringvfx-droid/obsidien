#!/usr/bin/env python3
"""config.json + WORKDIR(data.json, meta.json, sheet*.jpg) → 단일 HTML 분석 페이지.

  python3 build_page.py CONFIG.json WORKDIR OUT.html [--handbook "<볼트>/VFX Handbook v2"]

--handbook을 주면 카드 파일명(ID 이름.md)에서 카드 이름표를 새로 읽는다. 없으면 references/handbook_cards.json을 쓴다.
페이지는 카드 ID 옆에 이 이름을 함께 보여준다(ID만 보면 무슨 원리인지 알 수 없기 때문).

템플릿(assets/breakdown_template.html)은 고정 양식이다. 페이지마다 바뀌는 내용은 전부 config에 둔다.
스프라이트는 data URI로 넣어서 HTML 파일 하나만 있으면 어디서든 열린다.
"""
import base64, glob, json, os, sys, urllib.parse

import re
argv = sys.argv[1:]; hb = None
if '--handbook' in argv:
    i = argv.index('--handbook'); hb = argv[i + 1]; del argv[i:i + 2]
cfg_p, work, out = argv[:3]
here = os.path.dirname(os.path.abspath(__file__))
names = {}
if hb and os.path.isdir(hb):
    for p_ in glob.glob(os.path.join(hb, '*', '*.md')):
        r_ = re.match(r'^([A-Z]{1,2}\d\d) (.+)$', os.path.splitext(os.path.basename(p_))[0])
        if r_: names[r_.group(1)] = r_.group(2)
    json.dump(dict(sorted(names.items())), open(os.path.join(here, '..', 'references', 'handbook_cards.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
else:
    try: names = json.load(open(os.path.join(here, '..', 'references', 'handbook_cards.json'), encoding='utf-8'))
    except Exception: names = {}
tpl = open(os.path.join(here, '..', 'assets', 'breakdown_template.html'), encoding='utf-8').read()
cfg = json.load(open(cfg_p, encoding='utf-8'))
meta = json.load(open(os.path.join(work, 'meta.json')))
data = open(os.path.join(work, 'data.json')).read()
cfg.setdefault('frames', meta['frames']); cfg.setdefault('fps', meta['fps']); cfg.setdefault('sprite', meta['sprite'])
cfg['card_names'] = {**names, **cfg.get('card_names', {})}
cfg.setdefault('plate', meta.get('plate', 1)); cfg.setdefault('plate_map', meta.get('plate_map', []))
sheets = sorted(glob.glob(os.path.join(work, 'sheet*.jpg')), key=lambda p: int(os.path.basename(p)[5:-4]))
uris = ['data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode() for p in sheets]
title = cfg.get('page_title') or (cfg['title'] + ' 이펙트 분해')
html = (tpl.replace('__TITLE__', title)
        .replace('__TITLETEXT__', urllib.parse.quote(''.join(sorted(set(cfg['title']))), safe=''))
        .replace('/*SHEETS*/', 'const SHEETS=' + json.dumps(uris) + ';')
        .replace('/*CONFIG*/', json.dumps(cfg, ensure_ascii=False))
        .replace('/*DATA*/', data))
open(out, 'w', encoding='utf-8').write(html)
print(f'{out}  {os.path.getsize(out)/1e6:.2f} MB')
