// 헤드리스 크롬으로 분석 페이지를 찍는다. setup.sh가 설치한 모듈을 NODE_PATH로 찾는다.
//   node shoot.js review PAGE.html OUTDIR [WIDTH]      섹션별 스크린샷 + 가로 넘침·스크립트 오류 보고 (검수용)
//     idInProse: 본문에 카드 ID만 쓴 곳. 0건이어야 한다(원리를 풀어 쓰거나 카드 이름을 쓴다).
//     jargon: 글 속 측정 기호(L*, C*, Lab). 0건이어야 한다(명도·선명도로 쓴다. HSV S는 허용). 확인 줄(.chk)은 명령이라 뺀다.
//     frameLinks: 눌러서 볼 수 있는 프레임 링크 개수.
//     scrollClipped: 좁은 폭에서 가로 스크롤로 잘리는 그림 카드 id. 오류는 아니지만, 그 카드의 핵심 강조가 왼쪽(첫 화면)에 보이는지 스크린샷으로 확인한다.
//   node shoot.js export PAGE.html OUTDIR id:name,...  카드(figure id)별 JPG용 PNG (옵시디언 Index 노트용)
const chromium = require('@sparticuz/chromium'); const puppeteer = require('puppeteer-core');
const path = require('path'); const fs = require('fs');
const [mode, page, out, extra] = process.argv.slice(2);
if (!mode || !page || !out) { console.log('usage: node shoot.js review|export PAGE.html OUTDIR [WIDTH|id:name,...]'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
(async () => {
  const W = mode === 'review' ? +(extra || 1280) : 1240;
  const b = await puppeteer.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true,
    defaultViewport: { width: W, height: 900, deviceScaleFactor: mode === 'export' ? 1.5 : 1 } });
  const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto('file://' + path.resolve(page), { waitUntil: 'load', timeout: 60000 }).catch(e => errs.push('LOAD ' + e.message));
  await p.addStyleTag({ content: '#mini{display:none!important}' });
  await new Promise(r => setTimeout(r, 1500));
  const rep = await p.evaluate(() => {
    const bad = []; document.querySelectorAll('body *').forEach(e => { const r = e.getBoundingClientRect(); if (r.right > window.innerWidth + 1 && !e.closest('.scroll')) bad.push((e.id || e.className || e.tagName) + '@' + Math.round(r.right)); });
    const figErr = [...document.querySelectorAll('#sections .grid > *')].filter(f => /그림 오류|알 수 없는 그림/.test(f.textContent)).map(f => f.id + ': ' + f.textContent.slice(0, 80));
    const clipped = [...document.querySelectorAll('.scroll')].filter(x => x.scrollWidth > x.clientWidth + 2).map(x => (x.closest('figure') || {}).id || '?');
    // 글 속에 카드 ID만 쓴 곳(이름표 .cdn, 평가 참조 줄 제외). 읽는 사람은 ID만 보고는 무슨 원리인지 모른다.
    const pre = [...new Set(Object.keys((typeof CFG !== 'undefined' && CFG.card_names) || {}).map(k => k.replace(/\d+$/, '')).filter(k => k.length === 2))];
    const idIn = []; if (pre.length) { const re = new RegExp('(?<![A-Za-z])(' + pre.join('|') + ')\\d\\d(?!\\d)', 'g');
      const w = document.createTreeWalker(document.getElementById('sections'), NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { const p = n.parentElement; if (!p || p.closest('.cdn,.vd-col li>span,svg,.tag')) continue; const m = n.nodeValue.match(re); if (m) idIn.push(((p.closest('figure') || {}).id || '?') + ': ' + m.join(',') + ' — ' + n.nodeValue.trim().slice(0, 40)); } }
    // 글 속 측정 기호(L*, C*, Lab). 처음 읽는 사람은 모른다 → 명도·선명도로 쓴다
    const jar = []; { const re = /L\*|C\*|\bLab\b/g; const w = document.createTreeWalker(document.getElementById('sections'), NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { const p = n.parentElement; if (!p || p.closest('.chk,.method')) continue; const m = n.nodeValue.match(re); if (m) jar.push(((p.closest('figure') || {}).id || '?') + ': ' + [...new Set(m)].join(',') + ' — ' + n.nodeValue.trim().slice(0, 40)); } }
    const frameLinks = document.querySelectorAll('#sections .fj').length;
    return { scrollW: document.documentElement.scrollWidth, overflow: bad.slice(0, 10), figErr, scrollClipped: clipped, idInProse: idIn.slice(0, 20), jargon: jar.slice(0, 20), frameLinks };
  });
  console.log(JSON.stringify({ width: W, ...rep, errors: errs }, null, 1));
  if (mode === 'review') {
    const targets = ['#lab', '#idx', ...await p.$$eval('section.sec', s => s.map(x => '#' + x.id))];
    for (const t of targets) { const el = await p.$(t); if (el) await el.screenshot({ path: path.join(out, `review_${W}_${t.slice(1)}.png`), captureBeyondViewport: true }); }
  } else {
    for (const pair of (extra || '').split(',').filter(Boolean)) {
      const [id, name] = pair.split(':'); const el = await p.$('#' + id);
      if (!el) { console.log('missing', id); continue; }
      await el.screenshot({ path: path.join(out, name + '.png'), captureBeyondViewport: true });
    }
  }
  await b.close(); console.log('done');
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
