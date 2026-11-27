"""apply_plan.py 백업으로 되돌린다. RefVault 종료 후 실행.
사용: python restore.py <library 경로> [backup_dir(기본: 이 파일 위치)]
"""
import json, os, sys, shutil
lib = sys.argv[1]; B = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(__file__))
for iid, new, old in json.load(open(os.path.join(B, 'rename_log.json'), encoding='utf-8')):
    d = os.path.join(lib, 'items', iid)
    if os.path.exists(os.path.join(d, new)): os.rename(os.path.join(d, new), os.path.join(d, old))
shutil.copy(os.path.join(B, 'library.json'), lib)
bi = os.path.join(B, 'items')
for d in os.listdir(bi) if os.path.isdir(bi) else []:
    shutil.copy(os.path.join(bi, d, 'metadata.json'), os.path.join(lib, 'items', d, 'metadata.json'))
print('restored from', B)
