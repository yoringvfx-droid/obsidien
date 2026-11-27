"""변경안 미리보기 HTML.
사용: python preview.py <plan.json> <items.json> <sheets_dir> <out.html>
plan.json items에 "low": true 를 넣으면 '확신도 낮음' 표시.
"""
import json, sys, os, io, base64, html, collections
from PIL import Image
plan = json.load(open(sys.argv[1], encoding='utf-8')); items = {i['id']: i for i in json.load(open(sys.argv[2], encoding='utf-8'))}
S, out = sys.argv[3], sys.argv[4]
groups = plan.get('tag_groups', {}); gof = {t: g for g, ts in groups.items() for t in ts}
def thumb(i):
    p = os.path.join(S, i + '.jpg')
    if not os.path.exists(p): return ''
    b = io.BytesIO(); Image.open(p).resize((480, 135)).save(b, 'JPEG', quality=70)
    return f'<img src="data:image/jpeg;base64,{base64.b64encode(b.getvalue()).decode()}">'
cls = {'출처': 'src', '속성': 'el', '형태': 'fo'}
chip = lambda t: f'<span class="c {cls.get(gof.get(t), "ex")}">{html.escape(t)}</span>'
rows, cur = [], None
its = sorted(plan['items'], key=lambda x: (x.get('folder', ''), x['new']))
cnt = collections.Counter(x.get('folder', '') for x in its)
for p in its:
    if p.get('folder') != cur:
        cur = p.get('folder'); rows.append(f'<tr class="g"><td colspan="3">📁 {html.escape(cur or "(폴더 변경 없음)")} <small>{cnt[cur]}개</small></td></tr>')
    o = items.get(p['id'], {})
    rows.append(f'<tr><td>{thumb(p["id"])}</td><td><div class="new">{html.escape(p["new"])}</div><div class="old">{html.escape(o.get("name",""))}.{o.get("ext","")}</div>'
                + ('<div class="flag">이펙트가 작아서 태그 확신도 낮음</div>' if p.get('low') else '') + f'</td><td>{"".join(chip(t) for t in p.get("tags", []))}</td></tr>')
low = sum(1 for p in its if p.get('low'))
doc = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RefVault 정리 변경안</title><style>
:root{{--bg:#f4f1ea;--ink:#1a1a1a;--mute:#6b6b6b;--line:#d8d2c4;--red:#d7261e;--card:#fff}}
@media (prefers-color-scheme:dark){{:root{{--bg:#1b1a18;--ink:#eee;--mute:#9a9a9a;--line:#3a3833;--card:#25241f}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:14px/1.45 -apple-system,"Segoe UI","Malgun Gothic",sans-serif}}
main{{max-width:1100px;margin:0 auto;padding:24px 16px}}h1{{font-size:28px;margin:0 0 4px}}.sub{{color:var(--mute);margin-bottom:16px}}
table{{width:100%;border-collapse:collapse;background:var(--card)}}td{{border-bottom:1px solid var(--line);padding:8px;vertical-align:top}}
td:first-child{{width:240px}}img{{width:240px;display:block}}tr.g td{{background:var(--ink);color:var(--bg);font-weight:700}}tr.g small{{font-weight:400;opacity:.7}}
.new{{font-weight:700;word-break:break-all}}.old{{color:var(--mute);font-size:12px;word-break:break-all}}.flag{{color:var(--red);font-size:12px}}
.c{{display:inline-block;padding:1px 7px;margin:2px 3px 2px 0;font-size:12px;border:1px solid var(--line)}}.c.src{{background:var(--ink);color:var(--bg)}}.c.el{{border-color:var(--red);color:var(--red)}}.c.ex{{border-style:dashed}}
@media (max-width:640px){{td:first-child,img{{width:120px}}}}</style></head><body><main>
<h1>RefVault 정리 변경안</h1><div class="sub">{len(its)}개 · 확신도 낮음 {low}개 · 승인 전 미리보기</div><table>{"".join(rows)}</table></main></body></html>'''
open(out, 'w', encoding='utf-8').write(doc); print('wrote', out)
