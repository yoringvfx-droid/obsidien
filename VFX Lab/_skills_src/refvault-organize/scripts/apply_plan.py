"""승인된 변경안을 RefVault 라이브러리에 적용한다. RefVault가 완전히 종료된 상태에서만 실행.
사용: python apply_plan.py <library 경로> <plan.json> <backup_dir>
plan.json: {"items":[{"id":..,"new":"새이름","folder":"01_Reference/TFT/Set8","tags":[..],"annotation":"(선택) 메모"}],
            "tag_groups":{"출처":[..],"속성":[..],...}}   (tag_groups는 선택, 기존 그룹에 없는 태그만 추가)
- 백업: library.json, 대상 항목 metadata.json, rename_log.json, restore.py
- 폴더 경로가 없으면 library.json에 만든다(parentId 방식). 이름 변경 시 원본 파일만 바꾼다(썸네일은 thumb.webp 고정).
- 항목 폴더 이름(items/<id>), eagleId, palette 등 다른 필드는 건드리지 않는다.
- 파일은 임시 파일에 쓴 뒤 바꿔 끼운다(쓰다가 끊겨도 원본 JSON이 깨지지 않게).
"""
import json, os, sys, time, secrets, shutil
lib, planf, B = sys.argv[1], sys.argv[2], sys.argv[3]
plan = json.load(open(planf, encoding='utf-8')); now = int(time.time() * 1000)
os.makedirs(B, exist_ok=True)
LF = os.path.join(lib, 'library.json'); shutil.copy(LF, B)
L = json.load(open(LF, encoding='utf-8'))


def b36(n):
    s = ''
    while n: n, r = divmod(n, 36); s = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[r] + s
    return s


def nid(): return 'M' + b36(now)[-7:] + secrets.token_hex(4).upper()  # RefVault 기존 id와 같은 16자 형식


def wjson(path, obj):
    tmp = path + '.tmp'; json.dump(obj, open(tmp, 'w', encoding='utf-8'), ensure_ascii=False, indent=2); os.replace(tmp, path)


def ensure(path):
    parent = None
    for part in path.split('/'):
        node = next((f for f in L['folders'] if f['name'] == part and f.get('parentId') == parent), None)
        if not node:
            sib = [f.get('order', 0) for f in L['folders'] if f.get('parentId') == parent]
            node = {"id": nid(), "name": part, "parentId": parent, "createdAt": now, "expanded": True, "order": (max(sib) + 1) if sib else 0}
            L['folders'].append(node); print('new folder:', path)
        parent = node['id']
    return parent


names = [x['new'] for x in plan['items']]; assert len(set(names)) == len(names), 'duplicate new names'
log = []
for it in plan['items']:
    d = os.path.join(lib, 'items', it['id']); mf = os.path.join(d, 'metadata.json')
    md = json.load(open(mf, encoding='utf-8'))
    os.makedirs(os.path.join(B, 'items', it['id']), exist_ok=True); shutil.copy(mf, os.path.join(B, 'items', it['id']))
    old_fn = md.get('fileName') or f"{md['name']}.{md['ext']}"; new = it.get('new') or md['name']; new_fn = f"{new}.{md['ext']}"
    if new_fn != old_fn:
        assert not os.path.exists(os.path.join(d, new_fn)), f'already exists: {new_fn}'
        os.rename(os.path.join(d, old_fn), os.path.join(d, new_fn)); log.append([it['id'], new_fn, old_fn])
    md['name'] = new; md['fileName'] = new_fn
    if it.get('folder'): md['folders'] = [ensure(it['folder'])]
    if 'tags' in it: md['tags'] = it['tags']
    if 'annotation' in it: md['annotation'] = it['annotation']  # vfx-breakdown 분석 노트 링크 등
    md['modifiedAt'] = now
    wjson(mf, md)
groups = L.setdefault('tagGroups', [])
for gname, tags in (plan.get('tag_groups') or {}).items():
    g = next((x for x in groups if x['name'] == gname), None)
    if not g: g = {"id": nid(), "name": gname, "color": "#8a8d96", "tags": [], "collapsed": False}; groups.append(g); print('new tag group:', gname)
    g['tags'] += [t for t in tags if t not in g['tags']]
wjson(LF, L)
json.dump(log, open(os.path.join(B, 'rename_log.json'), 'w', encoding='utf-8'), ensure_ascii=False)
shutil.copy(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'restore.py'), B)
# 검증: 파일이 metadata.fileName과 맞는지, 폴더 id가 library.json에 있는지
fids = {f['id'] for f in L['folders']}; bad = []
for it in plan['items']:
    d = os.path.join(lib, 'items', it['id']); md = json.load(open(os.path.join(d, 'metadata.json'), encoding='utf-8'))
    if not os.path.exists(os.path.join(d, md['fileName'])): bad.append(f"{md['name']}: 파일 없음")
    if any(f not in fids for f in md.get('folders', [])): bad.append(f"{md['name']}: 폴더 id 없음")
print(f"applied {len(plan['items'])} items, renamed files {len(log)}, problems: {bad or 'none'}")
print('backup:', B)
