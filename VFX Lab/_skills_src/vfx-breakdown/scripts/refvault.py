#!/usr/bin/env python3
"""RefVault 라이브러리에서 분석할 영상을 찾는다(읽기 전용).

  python3 refvault.py find "<library>" <검색어> [<검색어> ...]   이름·파일명·태그·폴더에 검색어가 모두 들어간 항목
  python3 refvault.py show "<library>" <item id>                 항목 하나의 정보와 원본 파일 경로

기본 라이브러리: C:\\Users\\yoringvfx\\OneDrive - KRAFTON\\새 폴더\\yoring_nest.library (셸에서는 마운트 경로)
구조: library.json(폴더·태그 그룹) + items/<id>/{metadata.json, <fileName>, thumb.webp}
이 스크립트는 아무것도 쓰지 않는다. RefVault에 메모(annotation)를 남기는 일은 refvault-organize 스킬의 승인·종료·백업 절차로만 한다.
"""
import glob, json, os, sys

if len(sys.argv) < 4: print(__doc__); sys.exit(1)
cmd, lib = sys.argv[1], sys.argv[2]
L = json.load(open(os.path.join(lib, 'library.json'), encoding='utf-8'))
by = {f['id']: f for f in L.get('folders', [])}


def fpath(fid):
    p = []; f = by.get(fid)
    while f: p.append(f['name']); f = by.get(f.get('parentId'))
    return '/'.join(reversed(p)) or fid


def row(j):
    p = os.path.join(lib, 'items', j['id'], j.get('fileName') or f"{j['name']}.{j['ext']}")
    return {'id': j['id'], 'name': j['name'], 'path': p, 'exists': os.path.exists(p), 'folders': [fpath(f) for f in j.get('folders', [])],
            'tags': j.get('tags', []), 'duration': j.get('duration'), 'size': [j.get('width'), j.get('height')], 'annotation': j.get('annotation', '')}


items = [json.load(open(m, encoding='utf-8')) for m in glob.glob(os.path.join(lib, 'items', '*', 'metadata.json'))]
items = [j for j in items if not j.get('deletedAt')]
if cmd == 'find':
    qs = [q.lower() for q in sys.argv[3:]]
    hits = [row(j) for j in items if all(q in ' '.join([j['name'], j.get('fileName', ''), *j.get('tags', []), *[fpath(f) for f in j.get('folders', [])]]).lower() for q in qs)]
    for r in sorted(hits, key=lambda r: r['name']):
        print(f"{r['id']}  {r['name']}  {r['folders']} {r['tags']}  {'' if r['exists'] else '(파일 없음: OneDrive 온라인 전용일 수 있음)'}\n    {r['path']}")
    print(f'{len(hits)}개')
elif cmd == 'show':
    j = next((x for x in items if x['id'] == sys.argv[3]), None)
    print(json.dumps(row(j), ensure_ascii=False, indent=1) if j else '없음')
