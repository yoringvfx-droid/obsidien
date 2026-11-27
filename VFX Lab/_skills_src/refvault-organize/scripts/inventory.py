"""RefVault 라이브러리 목록 뽑기.
사용: python inventory.py <library 경로> <out.json> [--all]
기본: 폴더도 태그도 없는 '새 항목'만(휴지통 항목 제외). --all: 전체.
라이브러리 구조: library.json(폴더 목록·태그 그룹) + items/<id>/{metadata.json, <fileName>, thumb.webp}
출력 JSON: [{id,name,ext,duration,width,height,path,folders,tags,url}] 와 폴더 트리 요약을 stdout에 출력.
"""
import json, glob, os, sys
lib, out = sys.argv[1], sys.argv[2]; allmode = '--all' in sys.argv
L = json.load(open(os.path.join(lib, 'library.json'), encoding='utf-8'))
by = {f['id']: f for f in L.get('folders', [])}


def fpath(fid):
    p = []; f = by.get(fid)
    while f: p.append(f['name']); f = by.get(f.get('parentId'))
    return '/'.join(reversed(p)) if p else fid


print('FOLDERS:', *sorted(fpath(i) for i in by), sep='\n  ')
items = []; missing = []
for mf in glob.glob(os.path.join(lib, 'items', '*', 'metadata.json')):
    j = json.load(open(mf, encoding='utf-8'))
    if j.get('deletedAt'): continue
    if not allmode and (j.get('folders') or j.get('tags')): continue
    p = os.path.join(os.path.dirname(mf), j.get('fileName') or f"{j['name']}.{j['ext']}")
    if not os.path.exists(p): missing.append(p)
    items.append(dict(id=j['id'], name=j['name'], ext=j['ext'], duration=j.get('duration'), width=j.get('width'), height=j.get('height'),
                      path=p, folders=[fpath(f) for f in j.get('folders', [])], tags=j.get('tags', []), url=j.get('url', '')))
items.sort(key=lambda x: x['name'])
json.dump(items, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'ITEMS: {len(items)} ({"all" if allmode else "new only"}) -> {out}')
for i in items: print(f"  {i['id']}  {i['name']}.{i['ext']}  {i['folders']} {i['tags']}")
if missing: print('파일 없음(OneDrive 온라인 전용일 수 있음):', *missing, sep='\n  ')
