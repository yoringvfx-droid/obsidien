// ============================== 2D 스탠딩 일러스트(SVG) ==============================
// 오리지널 캐릭터 5명 + 보스 실루엣. 같은 몸 틀(420×960) 위에 머리·옷·무기만 바꾸고, 표정은 얼굴 층만 갈아 끼운다.
// tachie/<id>_<표정>.png 또는 tachie/<id>.png 파일이 HTML 옆에 있으면 그쪽을 먼저 쓴다(직접 그린 그림으로 교체).
const TACHIE = (() => {
  const W = 420;
  // 절대 좌표 경로의 x를 좌우 반전(M L C Q 쌍 좌표만 쓴다)
  const mx = d => d.replace(/([MLCQT])([^MLCQTZ]*)/g, (m, c, nums) => { const n = nums.trim().split(/[\s,]+/).filter(Boolean).map(Number); const o = []; for (let i = 0; i < n.length; i += 2) o.push(+(W - n[i]).toFixed(1), n[i + 1]); return c + o.join(' ') + ' ' });
  const P = (d, fill, line, w = 2.6, extra = '') => `<path d="${d}" fill="${fill}" stroke="${line || 'none'}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
  const both = (d, fill, line, w, extra) => P(d, fill, line, w, extra) + P(mx(d), fill, line, w, extra);
  const PAL = {
    fene: { skin: '#FCE7DC', skinS: '#F1C5B4', line: '#5B3348', hair: '#F6B5D1', hairS: '#E08BB2', hairH: '#FFE8F2', eye: '#C23F7B', eyeL: '#F8A8CB', blush: '#F48FB1' },
    malus: { skin: '#FCE8DE', skinS: '#F0C8B8', line: '#3E4658', hair: '#EEF2F8', hairS: '#C3CCDD', hairH: '#FFFFFF', eye: '#3478C2', eyeL: '#A3D0F5', blush: '#F2A0A8' },
    adelie: { skin: '#FBE6DA', skinS: '#EEC4B2', line: '#1F232B', hair: '#262A33', hairS: '#14161B', hairH: '#525968', eye: '#2B8A5A', eyeL: '#96E3B8', blush: '#F09A9A' },
    prom: { skin: '#F5DED1', skinS: '#E5BFAE', line: '#2A221E', hair: '#1C1D23', hairS: '#0E0F13', hairH: '#43475400', eye: '#D4872A', eyeL: '#FFD48E', blush: '#E39C8C' },
    noti: { skin: '#FDEEE7', skinS: '#F2CDBF', line: '#3B4C66', hair: '#C4E8FF', hairS: '#8FC8EE', hairH: '#FFFFFF', eye: '#3FA2E6', eyeL: '#A8DCFF', blush: '#F6A4B8' },
  };
  // ---------- 얼굴 ----------
  function eye(c, x, y, s, ex, id) { // s: -1 왼눈(바깥쪽이 왼쪽), +1 오른눈
    const o = x + s * 27, i = x - s * 25; let g = '';
    if (ex === 'joy' || ex === 'closed') { const up = ex === 'joy'; // 감은 눈: 기쁨은 ^ 모양, 차분함은 아래로 휜 선
      return P(up ? `M${i} ${y + 6} Q${x} ${y - 16} ${o} ${y + 4}` : `M${i} ${y + 2} Q${x} ${y + 14} ${o} ${y}`, 'none', c.line, 4.2) + P(`M${o} ${y + (up ? 4 : 0)} L${o + s * 7} ${y - 4}`, 'none', c.line, 3) }
    const big = ex === 'surprised' ? 1.08 : 1, blank = ex === 'blank', half = ex === 'half';
    g += P(`M${i} ${y - 3} Q${x - s * 2} ${y - 30 * big} ${o} ${y - 6} Q${o - s * 2} ${y + 25} ${x} ${y + 28 * big} Q${i + s * 2} ${y + 25} ${i} ${y - 3} Z`, '#FFFFFF', 'none');
    const pr = blank ? .55 : ex === 'surprised' ? .7 : 1;
    g += `<ellipse cx="${x + s * 1}" cy="${y + 5}" rx="${16.5 * big}" ry="${22 * big}" fill="url(#ir_${id})"/>`;
    g += `<ellipse cx="${x + s * 1}" cy="${y + 7}" rx="${7.5 * pr}" ry="${11.5 * pr}" fill="${c.line}" opacity="${blank ? .55 : .9}"/>`;
    if (!blank) g += `<circle cx="${x - 6}" cy="${y - 5}" r="6.2" fill="#fff"/><circle cx="${x + 7}" cy="${y + 13}" r="2.8" fill="#fff" opacity=".9"/>`;
    if (half) g += P(`M${i - s * 2} ${y - 5} Q${x} ${y - 26} ${o + s * 2} ${y - 8} L${o + s * 2} ${y + 6} Q${x} ${y - 4} ${i - s * 2} ${y + 7} Z`, c.skin, 'none'); // 반쯤 감은 눈꺼풀
    const ly = half ? 10 : 0; // 윗속눈썹: 굵은 선 + 바깥 꼬리
    g += P(`M${i - s * 2} ${y - 2 + ly} Q${x - s * 4} ${y - 33 * big + ly} ${o + s * 2} ${y - 8 + ly} Q${x - s * 1} ${y - 25 * big + ly} ${i} ${y + 2 + ly} Z`, c.line, c.line, 1.5);
    g += P(`M${o} ${y - 7 + ly} L${o + s * 8} ${y - 13 + ly}`, 'none', c.line, 3);
    g += P(`M${x - 12} ${y + 27 * big} Q${x} ${y + 30 * big} ${x + 12} ${y + 26 * big}`, 'none', c.line, 1.6, 'opacity=".55"');
    return g }
  function brow(c, x, y, s, ex) { const i = x - s * 18, o = x + s * 21; const [yi, yo] = ex === 'sad' || ex === 'cry' ? [y - 52, y - 40] : ex === 'angry' ? [y - 36, y - 47] : ex === 'surprised' ? [y - 52, y - 50] : [y - 45, y - 44];
    return P(`M${i} ${yi} Q${x} ${Math.min(yi, yo) - 4} ${o} ${yo}`, 'none', c.line, 3.2, 'opacity=".62"') }
  function mouth(c, ex) { const y = 270;
    if (ex === 'joy') return P(`M193 ${y - 4} Q210 ${y + 22} 227 ${y - 4} Q210 ${y + 2} 193 ${y - 4} Z`, '#B8455A', c.line, 2) + P(`M201 ${y + 7} Q210 ${y + 14} 219 ${y + 7} Q210 ${y + 4} 201 ${y + 7} Z`, '#F28B9B', 'none');
    if (ex === 'smile') return P(`M197 ${y - 3} Q210 ${y + 9} 223 ${y - 3}`, 'none', c.line, 2.6);
    if (ex === 'sad' || ex === 'cry') return P(`M200 ${y + 4} Q210 ${y - 3} 220 ${y + 4}`, 'none', c.line, 2.4);
    if (ex === 'surprised') return `<ellipse cx="210" cy="${y + 2}" rx="6.5" ry="8.5" fill="#B8455A" stroke="${c.line}" stroke-width="2"/>`;
    if (ex === 'angry') return P(`M199 ${y + 2} Q210 ${y - 3} 221 ${y + 2}`, 'none', c.line, 2.6) + P(`M196 ${y - 1} L199 ${y + 2}`, 'none', c.line, 2);
    if (ex === 'blank') return P(`M204 ${y} L216 ${y}`, 'none', c.line, 2);
    return P(`M201 ${y} Q210 ${y + 4} 219 ${y}`, 'none', c.line, 2.4) }
  const brows = (c, ex) => brow(c, 170, 220, -1, ex) + brow(c, 250, 220, 1, ex); // 눈썹은 앞머리 위에 반투명으로(애니 관례)
  function face(c, ex, id) { let g = '';
    g += `<ellipse cx="160" cy="250" rx="17" ry="7.5" fill="${c.blush}" opacity="${ex === 'joy' || ex === 'smile' ? .45 : .28}"/><ellipse cx="260" cy="250" rx="17" ry="7.5" fill="${c.blush}" opacity="${ex === 'joy' || ex === 'smile' ? .45 : .28}"/>`;
    g += `<ellipse cx="210" cy="204" rx="86" ry="16" fill="${c.skinS}" opacity=".55"/>`; // 앞머리 그림자
    g += eye(c, 170, 220, -1, ex, id) + eye(c, 250, 220, 1, ex, id);
    g += P('M211 244 L208 252', 'none', c.line, 1.8, 'opacity=".45"') + mouth(c, ex);
    if (ex === 'cry') g += P('M156 250 C150 262 152 276 158 278 C164 276 165 262 156 250 Z', '#BDE6FF', '#7FB8E0', 1.4, 'opacity=".9"') + P('M262 252 C256 264 258 278 264 280 C270 278 271 264 262 252 Z', '#BDE6FF', '#7FB8E0', 1.4, 'opacity=".9"');
    if (ex === 'angry') g += P('M268 160 L280 152 M274 166 L288 162', 'none', '#E0475A', 3);
    return g }
  // ---------- 몸 틀 ----------
  const HEAD = 'M126 168 C124 238 160 288 210 302 C260 288 296 238 294 168 C294 108 126 108 126 168 Z';
  const NECK = 'M190 286 L190 340 Q210 350 230 340 L230 286 Z';
  const ARM_L = 'M152 352 C128 362 112 420 109 480 C106 530 111 568 117 598 L143 596 C141 560 140 522 144 482 C149 444 159 404 170 374 Z';
  const HAND_L = 'M116 590 C110 610 118 634 132 634 C146 632 149 612 144 590 Z';
  const LEG_L = 'M160 556 C158 630 166 700 172 760 C176 820 180 880 182 924 L204 924 C206 880 208 820 210 760 C214 700 216 630 214 556 Z';
  const TORSO = 'M150 348 C168 340 186 334 196 332 L224 332 C234 334 252 340 270 348 C278 400 264 440 252 484 L168 484 C156 440 142 400 150 348 Z';
  const SKIRT = 'M168 478 L252 478 L324 640 L302 632 L284 646 L264 634 L246 648 L228 636 L210 650 L192 636 L174 648 L156 634 L136 646 L118 632 L96 640 Z';
  const SHOE_L = 'M174 902 L210 902 L214 944 C200 952 170 952 166 944 Z';
  function base(c, o) { let g = '';
    g += both(LEG_L, o.leg, c.line, 2.4); if (o.legS) g += both('M196 600 C198 700 198 800 200 920 L205 920 C205 800 206 700 208 600 Z', o.legS, 'none');
    g += both(SHOE_L, o.shoe, c.line, 2.4);
    return g }
  function arms(c, o) { return both(ARM_L, o.sleeve, c.line, 2.4) + both(HAND_L, c.skin, c.line, 2.2) + (o.cuff ? both('M115 572 L145 570 L144 590 L116 592 Z', o.cuff, c.line, 2) : '') }
  function headSkin(c) { return P(NECK, c.skin, c.line, 2.2) + P('M190 300 Q210 324 230 300 L230 318 Q210 338 190 318 Z', c.skinS, 'none') + P(HEAD, c.skin, c.line, 2.6) }
  function defs(c, id) { return `<defs><linearGradient id="ir_${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.line}"/><stop offset=".35" stop-color="${c.eye}"/><stop offset="1" stop-color="${c.eyeL}"/></linearGradient>
    <radialGradient id="orb_${id}"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#FFC3DE"/><stop offset="1" stop-color="#F06AA8" stop-opacity="0"/></radialGradient></defs>` }
  const ring = (c, y = 128) => P(`M150 ${y + 8} Q210 ${y - 22} 270 ${y + 8}`, 'none', c.hairH, 7, 'opacity=".55"'); // 머리카락 하이라이트(천사 고리)
  // ---------- 캐릭터 ----------
  const DRAW = {
    fene(c, ex, id) { const o = { leg: '#FFFFFF', legS: '#E8E2F2', shoe: '#9C76C8', sleeve: '#FFFFFF', cuff: '#B894E0' }; let g = defs(c, id);
      // 트윈테일(뒤)
      g += both('M128 118 C52 150 26 330 46 520 C58 600 86 650 104 676 C96 610 92 540 102 470 C112 380 132 270 150 196 Z', c.hair, c.line, 2.6) + both('M96 300 C84 400 84 520 98 620', 'none', c.hairS, 3);
      g += P('M118 170 C110 80 310 80 302 170 L306 300 C270 318 150 318 114 300 Z', c.hairS, c.line, 2.4); // 뒷머리
      // 지팡이(뒤쪽 막대)
      g += P('M334 240 L300 940', 'none', '#4A3240', 9) + P('M334 240 L300 940', 'none', '#7A5466', 4);
      g += base(c, o) + P(SKIRT, '#B894E0', c.line, 2.4) + P('M210 482 L210 650 M180 484 L156 634 M240 484 L264 634', 'none', '#9772C6', 2.4);
      g += P(TORSO, '#FFFFFF', c.line, 2.4) + P('M168 470 L252 470 L252 486 L168 486 Z', '#6FD4E8', c.line, 2); // 허리띠
      g += P(mx(ARM_L), o.sleeve, c.line, 2.4) + P(mx(HAND_L), c.skin, c.line, 2.2) + P(mx('M115 572 L145 570 L144 590 L116 592 Z'), o.cuff, c.line, 2); // 오른팔: 지팡이
      g += headSkin(c);
      g += P('M158 344 L196 334 L210 386 L224 334 L262 344 L278 374 L234 394 L210 424 L186 394 L142 374 Z', '#B894E0', c.line, 2.4) + P('M150 368 L188 386 M270 368 L232 386', 'none', '#FFFFFF', 3); // 세일러 칼라
      g += P('M210 396 L184 384 L186 412 Z M210 396 L236 384 L234 412 Z', '#6FD4E8', c.line, 2) + P('M204 396 L210 430 L216 396 Z', '#6FD4E8', c.line, 2);
      g += P('M152 352 C130 362 118 410 120 462 C122 480 132 490 146 486 C150 450 156 410 170 374 Z', o.sleeve, c.line, 2.4) + P('M124 462 C140 482 168 470 196 440 L206 456 C178 494 140 506 120 482 Z', o.sleeve, c.line, 2.4) + P('M194 436 L210 452 L206 462 L190 448 Z', o.cuff, c.line, 2) + `<ellipse cx="212" cy="446" rx="15" ry="13" fill="${c.skin}" stroke="${c.line}" stroke-width="2.2"/>`; // 왼손: 가슴께
      g += face(c, ex, id);
      g += P('M118 178 C120 96 300 96 302 178 C298 192 294 200 290 208 C286 192 280 180 272 172 C270 190 264 204 254 214 C252 196 244 180 236 170 C234 186 228 202 218 214 C214 196 210 180 206 166 C200 186 192 200 180 212 C178 194 174 182 168 172 C160 186 152 198 140 208 C140 194 138 182 134 176 C128 188 124 198 120 208 Z', c.hair, c.line, 2.6) + P('M206 170 C204 186 200 196 196 204 M254 176 C254 190 252 200 248 208', 'none', c.hairS, 2); // 앞머리(곡선 가닥)
      g += both('M124 176 C116 230 122 290 136 318 C140 276 140 230 146 196 Z', c.hair, c.line, 2.4) + ring(c);
      g += both('M120 118 C112 104 124 92 136 100 C142 110 134 124 120 118 Z', '#6FD4E8', c.line, 2); // 머리끈
      g += P('M270 128 L296 124 L300 150 L274 154 Z', '#6FD4E8', c.line, 2) + P('M285 126 L287 152 M272 141 L298 137', 'none', '#FFFFFF', 2.4); // 창틀 머리핀
      g += `<circle cx="336" cy="222" r="38" fill="url(#orb_${id})"/><circle cx="336" cy="222" r="16" fill="#FFD6EA" stroke="${c.line}" stroke-width="2.2"/>` + P('M320 242 L352 242 L348 254 L324 254 Z', '#7A5466', c.line, 2);
      g += brows(c, ex); return g },
    malus(c, ex, id) { const o = { leg: '#2A3142', legS: '#3A4358', shoe: '#F2F5FA', sleeve: '#FBFCFF', cuff: '#7FB6E8' }; let g = defs(c, id);
      g += P('M112 176 C104 70 316 70 308 176 L314 282 C290 292 270 292 250 286 L170 286 C150 292 130 292 106 282 Z', c.hairS, c.line, 2.4); // 단발 뒷머리
      g += P('M298 612 L334 936', 'none', '#9AA6B8', 9) + P('M298 612 L334 936', 'none', '#EEF3FA', 3.5); // 검(아래로 든 칼날)
      g += base(c, o) + P('M168 478 L252 478 L292 610 L128 610 Z', '#FBFCFF', c.line, 2.4) + P('M210 480 L210 610', 'none', '#7FB6E8', 3);
      g += P(TORSO, '#FBFCFF', c.line, 2.4) + P('M210 336 L210 484', 'none', '#7FB6E8', 3) + P('M168 470 L252 470', 'none', '#C3CCDD', 2.4);
      g += arms(c, o) + P('M276 604 L318 598 L320 610 L278 616 Z', '#C3CCDD', c.line, 2) + headSkin(c); // 코등이
      g += P('M186 318 L234 318 L240 350 L210 362 L180 350 Z', '#FBFCFF', c.line, 2.4) + P('M196 340 L224 340', 'none', '#7FB6E8', 2.4); // 높은 깃
      g += face(c, ex, id);
      g += P('M114 182 C118 98 300 92 306 176 L304 212 C290 188 270 172 246 166 C226 176 196 182 170 196 C150 208 132 222 118 232 Z', c.hair, c.line, 2.6); // 옆으로 넘긴 앞머리
      g += both('M114 182 C108 230 112 270 120 288 C132 270 136 226 140 196 Z', c.hair, c.line, 2.4) + ring(c, 124);
      g += P('M212 84 C206 64 214 46 236 40 C244 60 232 78 212 84 Z', '#79C46A', '#3E6E3A', 2.2) + P('M212 84 L230 50', 'none', '#3E6E3A', 1.6) + P('M210 96 Q208 88 212 84', 'none', '#6B4A32', 3); // 사과잎 더듬이
      g += brows(c, ex); return g },
    adelie(c, ex, id) { const o = { leg: '#2B2F38', legS: '#3A3F4A', shoe: '#F39A3D', sleeve: '#262A33', cuff: '#F7F8FA' }; let g = defs(c, id);
      g += P('M96 196 C80 70 340 70 324 196 C330 280 300 330 270 344 L150 344 C120 330 90 280 96 196 Z', '#262A33', c.line, 2.4) + P('M118 200 C110 110 310 110 302 200 C304 270 284 312 260 326 L160 326 C136 312 116 270 118 200 Z', '#F7F8FA', 'none', 0, 'opacity=".9"'); // 후드(펭귄)
      g += P('M92 330 C80 450 90 560 116 640 L124 636 C104 560 98 450 108 336 Z', '#7A5130', c.line, 2.2) + P('M100 334 L118 638', 'none', '#D9E4EA', 1.4); // 활(뒤)
      g += base(c, o) + P('M166 478 L254 478 L262 566 L158 566 Z', '#20232B', c.line, 2.4);
      g += P(TORSO, '#262A33', c.line, 2.4) + P('M210 360 C182 372 176 420 186 470 L234 470 C244 420 238 372 210 360 Z', '#F7F8FA', c.line, 2.2); // 흰 배 패널
      g += P('M210 336 L210 478', 'none', '#525968', 2);
      g += arms(c, o) + headSkin(c);
      g += P('M164 322 C176 346 244 346 256 322 L264 344 C246 372 174 372 156 344 Z', '#F39A3D', c.line, 2.4) + P('M236 352 L252 430 L234 436 L226 360 Z', '#F39A3D', c.line, 2.2) + P('M232 380 L248 376', 'none', '#D27A22', 2); // 주황 스카프
      g += face(c, ex, id);
      g += P('M120 186 C118 104 302 104 300 186 C298 196 294 204 290 210 C284 196 276 186 266 180 C262 194 256 204 246 212 C244 196 236 184 226 176 C222 192 214 202 204 210 C202 194 198 184 190 176 C182 190 174 200 162 208 C162 194 158 184 150 178 C144 190 136 200 124 208 Z', '#F7F8FA', c.line, 2.6); // 흰 앞머리
      g += P('M120 186 C118 104 302 104 300 186 C268 150 152 150 120 186 Z', c.hair, c.line, 2.6) + both('M120 190 C112 236 118 276 130 296 C138 262 138 226 142 200 Z', c.hair, c.line, 2.4) + ring(c, 120);
      g += brows(c, ex); return g },
    prom(c, ex, id) { const o = { leg: '#18191E', legS: '#26282F', shoe: '#18191E', sleeve: '#3A2E28', cuff: '#F2B35E' }; let g = defs(c, id);
      g += P('M110 176 C100 66 320 66 310 176 L322 760 C300 790 260 800 210 800 C160 800 120 790 98 760 Z', c.hair, c.line, 2.4) + P('M302 260 L314 740', 'none', '#F2B35E', 5); // 아주 긴 뒷머리 + 앰버 한 줄
      g += P('M312 420 L300 900', 'none', '#2A221E', 12) + P('M276 880 L338 880 L340 944 L272 944 Z', '#5A5E68', c.line, 2.4) + P('M276 900 L338 900', 'none', '#F2B35E', 4); // 망치(세워 둠)
      g += base(c, o) + P('M152 470 L268 470 L304 900 L250 912 L210 760 L170 912 L116 900 Z', '#3A2E28', c.line, 2.4) + P('M168 480 L132 896 M252 480 L288 896', 'none', '#2A211C', 3); // 긴 코트 자락
      g += P(TORSO, '#23252B', c.line, 2.4) + P('M150 348 C160 400 166 440 170 484 L190 484 L196 340 Z', '#3A2E28', c.line, 2.2) + P(mx('M150 348 C160 400 166 440 170 484 L190 484 L196 340 Z'), '#3A2E28', c.line, 2.2);
      g += P('M160 466 L260 466 L260 482 L160 482 Z', '#F2B35E', c.line, 2) + P('M202 462 L218 462 L218 486 L202 486 Z', '#1C1D23', c.line, 1.6);
      g += arms(c, o) + headSkin(c) + P('M186 312 L234 312 L236 344 L184 344 Z', '#23252B', c.line, 2.2); // 터틀넥
      g += face(c, ex, id);
      g += P('M116 186 C116 96 304 96 304 186 L304 200 L116 200 Z', c.hair, c.line, 2.6); // 일자 앞머리(히메컷)
      g += both('M116 196 L116 296 L142 296 L144 200 Z', c.hair, c.line, 2.4) + P('M282 200 L282 294', 'none', '#F2B35E', 3) + P('M150 128 Q210 104 270 128', 'none', '#43475A', 6, 'opacity=".7"');
      g += brows(c, ex); return g },
    noti(c, ex, id) { let g = defs(c, id);
      g += both('M150 330 C80 270 40 300 52 350 C62 390 120 400 168 380 Z', '#BDE3FF', '#7FB8E0', 2, 'opacity=".75"') + both('M156 390 C96 400 74 440 92 470 C110 494 150 470 176 430 Z', '#D8EFFF', '#7FB8E0', 2, 'opacity=".7"'); // 알림창 날개
      g += P('M164 470 L256 470 L300 640 C260 662 160 662 120 640 Z', '#FFFFFF', c.line, 2.4) + P('M120 640 C160 662 260 662 300 640', 'none', '#8FD3FF', 4);
      g += P(TORSO, '#FFFFFF', c.line, 2.4) + P('M196 380 L208 396 L230 364', 'none', '#4ED39A', 6); // 가슴의 ✓
      g += both('M152 352 C134 380 128 420 132 460 L152 458 C152 420 158 392 170 372 Z', '#FFFFFF', c.line, 2.2) + both('M130 454 C126 474 136 488 146 486 C156 484 156 466 152 454 Z', c.skin, c.line, 2);
      g += P('M110 176 C102 74 318 74 310 176 L318 286 C280 300 140 300 102 286 Z', c.hairS, c.line, 2.4) + headSkin(c) + face(c, ex, id);
      g += P('M118 178 C120 96 300 96 302 178 C298 192 294 200 290 208 C286 192 280 180 272 172 C270 190 264 204 254 214 C252 196 244 180 236 170 C234 186 228 202 218 214 C214 196 210 180 206 166 C200 186 192 200 180 212 C178 194 174 182 168 172 C160 186 152 198 140 208 C140 194 138 182 134 176 C128 188 124 198 120 208 Z', c.hair, c.line, 2.6) + ring(c);
      g += `<circle cx="276" cy="122" r="17" fill="#4ED39A" stroke="${c.line}" stroke-width="2"/>` + P('M268 122 L274 129 L285 115', 'none', '#fff', 3.4); // ✓ 머리핀
      g += `<rect x="150" y="34" width="120" height="44" rx="14" fill="#fff" stroke="#8FD3FF" stroke-width="3" opacity=".9"/>` + P('M170 56 L232 56 M170 66 L214 66', 'none', '#8FD3FF', 4); // 머리 위 알림 풍선
      g += brows(c, ex); return g },
  };
  // 보스: 같은 몸 틀의 실루엣 + 빛나는 눈 + 글리치 띠
  const FOE = { loop: { col: '#262A55', eye: '#9AA6FF', extra: 'ring' }, orphan: { col: '#20362A', eye: '#B9F0C8', scale: .78 }, classic: { col: '#3A3A44', eye: '#E8E8F0', extra: 'box' }, floppy: { col: '#1E2638', eye: '#9FB4D8', extra: 'disk' }, lprom: { col: '#140F0E', eye: '#FF9A5C', extra: 'hair' } };
  function foe(id) { const f = FOE[id], c = { line: f.eye }; let g = `<defs><filter id="gl_${id}"><feGaussianBlur stdDeviation="6"/></filter></defs>`;
    const body = [f.extra === 'hair' ? 'M110 176 C100 66 320 66 310 176 L322 780 L98 780 Z' : '', LEG_L, mx(LEG_L), SKIRT, TORSO, ARM_L, mx(ARM_L), NECK, f.extra === 'box' ? 'M118 96 L302 96 L302 300 L118 300 Z' : HEAD].filter(Boolean);
    g += `<g filter="url(#gl_${id})" opacity=".55">${body.map(d => P(d, f.eye, 'none')).join('')}</g>` + body.map(d => P(d, f.col, 'none')).join('');
    if (f.extra === 'ring') g += `<ellipse cx="210" cy="430" rx="190" ry="46" fill="none" stroke="${f.eye}" stroke-width="10" opacity=".8"/>`;
    if (f.extra === 'box') g += `<rect x="142" y="132" width="136" height="104" rx="10" fill="#0B0C10" stroke="${f.eye}" stroke-width="3"/>`;
    if (f.extra === 'disk') g += `<rect x="150" y="360" width="120" height="120" rx="6" fill="#141A28" stroke="${f.eye}" stroke-width="3"/><rect x="176" y="362" width="68" height="36" fill="${f.eye}" opacity=".7"/>`;
    g += `<rect x="150" y="196" width="40" height="12" fill="${f.eye}"/><rect x="230" y="196" width="40" height="12" fill="${f.eye}"/>`;
    for (let i = 0; i < 7; i++) { const y = 120 + ((i * 137) % 700), w = 60 + ((i * 53) % 140), x = 60 + ((i * 97) % 220); g += `<rect x="${x}" y="${y}" width="${w}" height="${4 + (i % 3) * 3}" fill="${f.eye}" opacity="${.25 + (i % 3) * .15}"/>` } // 글리치 띠
    return { g, scale: f.scale || 1 } }
  function svg(id, ex = 'normal', uid = '') { const key = id + '_' + ex + uid; let inner, sc = 1;
    if (DRAW[id]) inner = DRAW[id](PAL[id], ex, key); else if (FOE[id]) { const r = foe(id); inner = r.g; sc = r.scale } else return '';
    const tr = sc !== 1 ? ` transform="translate(${210 * (1 - sc)} ${960 * (1 - sc)}) scale(${sc})"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 960" preserveAspectRatio="xMidYMax meet"><g${tr}>${inner}</g></svg>` }
  return { svg, ids: Object.keys(DRAW), foes: Object.keys(FOE), exprs: ['normal', 'smile', 'joy', 'sad', 'cry', 'surprised', 'angry', 'closed', 'half', 'blank'] };
})();
if (typeof module !== 'undefined') module.exports = TACHIE;
