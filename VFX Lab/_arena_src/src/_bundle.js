'use strict';
/* 이펙트 아레나 — VFX Handbook v2 원리로 만든 스킬 4종을 3D 쿼터뷰에서 게임처럼 써 보는 환경.
   색은 명도(L*)·선명도(C*)·색상(h)으로 정하고, 렌더러는 색 변환 없이 그대로 출력한다(쓴 값 = 화면 값). */

// ============================== 색 ==============================
const lin = v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4), gam = v => v <= .0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - .055;
function lab2rgb(L, a, b) { const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200, inv = t => t ** 3 > .008856 ? t ** 3 : (t - 16 / 116) / 7.787;
  const X = inv(fx) * .95047, Y = inv(fy), Z = inv(fz) * 1.08883; return [3.2406 * X - 1.5372 * Y - .4986 * Z, -.9689 * X + 1.8758 * Y + .0415 * Z, .0557 * X - .204 * Y + 1.057 * Z].map(gam) }
function lch(L, C, h) { let lo = 0, hi = C, rgb = null; const t = h * Math.PI / 180;
  for (let i = 0; i < 18; i++) { const c = i ? (lo + hi) / 2 : C, r = lab2rgb(L, c * Math.cos(t), c * Math.sin(t)); if (r.every(v => v >= -1e-4 && v <= 1 + 1e-4)) { rgb = r; lo = c; if (!i) break } else hi = c }
  return (rgb || lab2rgb(L, 0, 0)).map(v => Math.max(0, Math.min(1, v))) }
function hsv(h, s, v) { h = ((h % 360) + 360) % 360; const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)) }; return [f(5), f(3), f(1)] }
const Lstar = (r, g, b) => { const Y = lin(r) * .2126 + lin(g) * .7152 + lin(b) * .0722; return Y > .008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y };
const LIN8 = new Float32Array(256).map((_, i) => lin(i / 255));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t), hex = c => '#' + c.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
const towardHue = (a, b, t) => { const d = ((b - a + 540) % 360) - 180; return (a + d * t + 360) % 360 };
// 화면의 '색상(°)'은 핸드북과 같은 색상환(HSV: 0 빨강 · 60 노랑 · 120 초록 · 180 청록 · 240 파랑 · 300 자홍). 램프는 Lab 색상각으로 바꿔 만든다
function rgb2labA(c) { const R = lin(c[0]), G = lin(c[1]), B = lin(c[2]), X = (R * .4124 + G * .3576 + B * .1805) / .95047, Y = R * .2126 + G * .7152 + B * .0722, Z = (R * .0193 + G * .1192 + B * .9505) / 1.08883, f = t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))] }
const LABH = Array.from({ length: 360 }, (_, h) => { const l = rgb2labA(hsv(h, 1, 1)); return (Math.atan2(l[2], l[1]) * 180 / Math.PI + 360) % 360 });
const labH = h => { h = ((h % 360) + 360) % 360; const a = Math.floor(h), b = (a + 1) % 360, t = h - a; let d = ((LABH[b] - LABH[a] + 540) % 360) - 180; return (LABH[a] + d * t + 360) % 360 };

// ============================== 설정 ==============================
const PRINCIPLES = [
  // 키, 그룹, 이름, 설명, 근거 카드, 기본값
  ['lchRamp', '컬러', '램프를 명도 기준으로', '코어·바디·엣지·헤이즈 명도를 95 / 70 / 46 / 30으로 고정하고 색상만 바꾼다. 끄면 색 선택기(HSV) 값이라 색마다 명도가 흔들린다.', '색이 바뀌어도 밸류는 고정 · 숫자 ≠ 지각명도', true],
  ['tailDark', '컬러', '꼬리로 갈수록 어둡고 진하게', '투사체 몸통을 따라 명도는 내리고 선명도는 지킨다. 끄면 한 색에 투명도만 빠진다.', '투사체 — 유형 노트', true],
  ['hueShift', '컬러', '밝기 따라 색상 이동', '어두운 단계일수록 색상을 돌린다(따뜻한 색은 빨강·자주 쪽, 시안·파랑은 깊은 파랑 쪽).', '램프 — 밝기 따라 색상 이동', true],
  ['tintCore', '컬러', '코어는 색을 품은 백색', '코어에 선명도 10 안팎을 남긴다. 순백은 궁극기 정점에만.', '코어는 색을 품은 백색', true],
  ['darkEnv', '컬러', '연기·잔해는 바닥색 쪽으로', '어두운 끝(연기·데칼)을 바닥 색상 쪽으로 기울여 장면에 녹인다.', '램프 — 밝기 따라 색상 이동', true],
  ['hardHead', '질감', '하드한 머리, 소프트한 꼬리', '투사체 머리·충격 코어는 또렷하게, 꼬리·연기는 번지게. 빔은 안쪽 흐름선이 하드.', '하드·소프트 엣지 · 투사체 — 유형 노트', true],
  ['translucent', '질감', '빔은 투명한 막', '빔 몸통을 반투명 막으로 만들어 뒤가 비친다(물 · 빔 사례). 끄면 불투명 몸통.', '물 — 속성 노트 · 빔 — 유형 노트', true],
  ['bigImpact', '형태감', '착탄은 발사보다 크게', '착탄·폭발을 발사 섬광의 2–5배로. 끄면 발사가 더 크다.', '시간적 위계 · 투사체 — 유형 노트', true],
  ['motif', '쉐입', '머리에 모티프', '투사체 머리를 하트·별 같은 모양으로. 끄면 둥근 점.', '모티프와 형태 문법', true],
  ['dip', '타이밍', '피크 앞 밝기 누르기', '착탄·폭발 직전 1–4f 밝기를 뺀다. 궁극기는 7f → 1f로 짧아진다.', '피크 앞 밝기 누르기', true],
  ['grammar', '타이밍', '같은 문법 두 번', '궁극기를 작은 1막 → 큰 2막으로. 2막은 모으기 ×2.6, 맞히기 ×4.4 빠르게.', '모으기는 길게, 맞히기는 빠르게 · 리듬', true],
  ['impactFrame', '타이밍', '궁극기 임팩트 프레임 1f', '궁극기 정점 1f를 흑백 극단 밸류로. 섬광 횟수를 모니터로 같이 본다.', '임팩트 프레임', true],
  ['sceneLight', '컬러', '장면에 남는 빛', '착탄 때 바닥이 물들고, 궁극기 뒤 장면 색이 약 1.1초에 돌아온다.', '빛의 4층위 · 소멸과 여운', true],
  ['anim', '게임 감각', '몸이 이펙트와 같은 박자로', '모으기 동안 몸을 낮추고(예비동작), 맞히는 프레임에 내딛고 숙이고, 맞힌 뒤 그 자세를 잠깐 유지했다가 천천히 돌아온다. 끄면 무기만 움직인다.', '모으기는 길게, 맞히기는 빠르게 · 히트스톱', true],
  ['hitStop', '게임 감각', '히트스톱', '타격 순간 게임을 몇 프레임 멈춘다(투사체 3f · 폭발 4f · 궁극기 6f).', '임팩트 · 타격감', true],
  ['shake', '게임 감각', '화면 흔들림', '타격 크기에 비례해 카메라를 흔든다.', '화면 레벨 장치', true],
  ['telegraph', '가독성', '범위 표시 · 빔 끝 표시', '폭발 범위를 바닥에 미리 그리고, 빔 끝에 하드한 고리를 둔다.', '빔 — 유형 노트 · 실루엣과 가독성', true],
  ['ultCam', '카메라', '궁극기 카메라 연출', '2막 모으기 동안 시전자와 대상을 화면 대각선 하나에 놓고 천천히 밀어 들어간다. 모으기 끝에 비네트를 조이고, 정점에 대상 클로즈업 인서트를 한 번 끼운 뒤 넓게 빠졌다가 돌아온다.', '임팩트 프레임 · 구도 축 하나로 왕복 · 화면 레벨 장치', true],
  ['teamColor', '가독성', '적 공격은 다른 색', '적 투사체를 빨강 계열 + 하드 테두리로 구분한다. 끄면 내 투사체와 같은 색.', '게임 비주얼 스택', true],
];
const PR = {}; PRINCIPLES.forEach(p => PR[p[0]] = p[5]);
const SK = {
  Q: { name: '투사체', hue: 320, size: 1, speed: 24, trail: 1, motifShape: 'heart', cd: 30 },
  E: { name: '빔', hue: 195, size: 1, len: 17, cd: 120 },
  R: { name: '차지 폭발', hue: 28, size: 1, radius: 3.2, charge: 36, impactFrame: false, cd: 120 },
  F: { name: '궁극기', hue: 272, size: 1, cd: 360 },
};
const SC = { floorL: 24, floorHue: 214, bloom: .8, enemies: 6, enemyAttack: true, enemyMove: true, camH: 1, camStyle: 'cine' };
const PRESETS = [['핑크', 320], ['파랑', 225], ['물', 195], ['불', 25], ['독', 110], ['빛', 52], ['보라', 272]];

function ramp(hue) { // 코어·바디·엣지·헤이즈 + 연기
  const h0 = hue, sh = !PR.hueShift ? [0, 0] : (h0 >= 20 && h0 <= 110) ? [-28, -52] : (h0 >= 150 && h0 <= 260) ? [14, 28] : [-10, -20];
  const hE = (h0 + sh[0] + 360) % 360, hH = (h0 + sh[1] + 360) % 360, fh = SC.floorHue;
  const eh = PR.darkEnv ? towardHue(hE, fh, .12) : hE, hh = PR.darkEnv ? towardHue(hH, fh, .35) : hH, smh = PR.darkEnv ? towardHue(hH, fh, .6) : hH;
  if (PR.lchRamp) return { core: lch(95, PR.tintCore ? 11 : 0, labH(h0)), body: lch(70, 58, labH(h0)), edge: lch(46, 64, labH(eh)), haze: lch(30, 46, labH(hh)), smoke: lch(Math.max(SC.floorL + 8, 30), 14, labH(smh)), hi: lch(86, 30, labH(h0)) };
  return { core: PR.tintCore ? hsv(h0, .12, 1) : [1, 1, 1], body: hsv(h0, .85, 1), edge: hsv(eh, .85, .7), haze: hsv(hh, .8, .42), smoke: hsv(smh, .3, .4), hi: hsv(h0, .4, 1) };
}

// ============================== 렌더러 ==============================
const cv = document.getElementById('cv'), stage = document.getElementById('stage');
const RW = 1280, RH = 720;
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(RW, RH, false); renderer.outputEncoding = THREE.LinearEncoding; renderer.autoClear = true;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, RW / RH, .5, 200); camera.layers.enable(1);
const rtMain = new THREE.WebGLRenderTarget(RW, RH, { samples: 4 });
const rtBr = new THREE.WebGLRenderTarget(RW / 4, RH / 4), rtBa = new THREE.WebGLRenderTarget(RW / 4, RH / 4), rtBb = new THREE.WebGLRenderTarget(RW / 4, RH / 4);
const MW = 96, MH = 54, rtMon = new THREE.WebGLRenderTarget(MW, MH), rtFx = new THREE.WebGLRenderTarget(MW, MH);
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quadScene = new THREE.Scene(), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); quadScene.add(quad);
const VQ = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const matBright = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, th: { value: .8 } }, vertexShader: VQ, fragmentShader: 'uniform sampler2D t;uniform float th;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float v=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th,1.,v),1.);}' });
const matBlur = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, d: { value: new THREE.Vector2() } }, vertexShader: VQ,
  fragmentShader: 'uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec3 s=texture2D(t,vUv).rgb*.227;s+=texture2D(t,vUv+d*1.38).rgb*.316;s+=texture2D(t,vUv-d*1.38).rgb*.316;s+=texture2D(t,vUv+d*3.23).rgb*.07;s+=texture2D(t,vUv-d*3.23).rgb*.07;gl_FragColor=vec4(s,1.);}' });
const matFinal = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, b: { value: null }, bloom: { value: .55 }, mode: { value: 0 }, inv: { value: 0 }, flash: { value: 0 }, dim: { value: 0 }, tint: { value: new THREE.Vector3() }, tintA: { value: 0 },
    lb: { value: 0 }, vig: { value: 0 }, ca: { value: 0 }, ach: { value: 0 }, spd: { value: 0 }, sc: { value: new THREE.Vector2(.5, .5) } }, vertexShader: VQ,
  fragmentShader: `uniform sampler2D t,b;uniform float bloom,mode,inv,flash,dim,tintA,lb,vig,ca,ach,spd;uniform vec3 tint;uniform vec2 sc;varying vec2 vUv;
  float lin1(float v){return v<=.04045?v/12.92:pow((v+.055)/1.055,2.4);} float gam1(float v){return v<=.0031308?12.92*v:1.055*pow(v,1./2.4)-.055;}
  vec3 S(vec2 u){return texture2D(t,u).rgb+texture2D(b,u).rgb*bloom;}
  void main(){vec2 q=vUv-.5;vec3 c;
    if(ca>.002){vec2 o=q*ca*.035;c=vec3(S(vUv+o).r,S(vUv).g,S(vUv-o).b);} else c=S(vUv); // 색수차: 가장자리일수록 RGB가 갈라진다
    c=mix(c,c*tint*1.6+tint*.08,tintA);c=c*(1.-dim)+vec3(flash);
    c*=1.-dot(q,q)*(.55+2.2*vig);c=clamp(c,0.,1.); // 비네트: 모으기 끝에 조인다
    float Y=lin1(c.r)*.2126+lin1(c.g)*.7152+lin1(c.b)*.0722;float L=Y>.008856?116.*pow(Y,1./3.)-16.:903.3*Y;
    if(ach>.5){float v=smoothstep(22.,80.,L);c=vec3(mix(.02,.96,v*v*(3.-2.*v))*(1.-.75*step(1.5,ach)));
      vec2 d=vUv-sc;d.x*=1.7778;float a=atan(d.y,d.x)*9.549,id=floor(a),f=fract(a),n=fract(sin(id*91.7)*437.5),r=length(d),wd=.06+.14*fract(n*7.3);
      float ln=step(.55,n)*(1.-smoothstep(wd*.6,wd,abs(f-.5)))*smoothstep(.3+.25*n,.75,r)*spd*(1.-step(1.5,ach));c=max(c,vec3(.92*ln));} // 집중선: 가늘게, 가장자리에만
    if(inv>.5){float v=L>34.?.055:.94;c=vec3(v);} else if(mode>1.5){float v=L>=85.?.94:L>=60.?.65:L>=35.?.36:.11;c=vec3(v);} else if(mode>.5){c=vec3(gam1(Y));}
    if(abs(vUv.y-.5)>.5-.115*lb)c=vec3(0.); // 레터박스
    gl_FragColor=vec4(c,1.);}` });
function pass(mat, target) { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam) }

// ============================== 아틀라스 ==============================
const TILE = { glow: 0, disc: 1, discSoft: 2, ring: 3, spark: 4, heart: 5, heartSoft: 6, star: 7, starSoft: 8, smoke: 9, flow: 10, drops: 11, ringSoft: 12, shard: 13, ringThin: 14, dot: 15, crack: 16, arrow: 17, dustRing: 18, crescent: 19, rock: 20, cross: 21, flare: 22, line: 23 };
const atlas = (() => { const S = 128, c = document.createElement('canvas'); c.width = S * 4; c.height = S * 6; const x = c.getContext('2d');
  const at = (i, fn, blur) => { const tx = (i % 4) * S, ty = Math.floor(i / 4) * S; x.save(); x.beginPath(); x.rect(tx, ty, S, S); x.clip(); x.translate(tx + S / 2, ty + S / 2); if (blur) x.filter = `blur(${blur}px)`; x.fillStyle = x.strokeStyle = '#fff'; fn(x, S / 2); x.restore() };
  const heart = (g, r) => { g.beginPath(); g.moveTo(0, r * .62); g.bezierCurveTo(-r * 1.25, -r * .05, -r * .62, -r * .95, 0, -r * .36); g.bezierCurveTo(r * .62, -r * .95, r * 1.25, -r * .05, 0, r * .62); g.fill() };
  const star = (g, r) => { g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * .2 : r * .92; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) } g.closePath(); g.fill() };
  at(0, (g, r) => { const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.55)'); gr.addColorStop(.6, 'rgba(255,255,255,.12)'); gr.addColorStop(.92, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2) });
  at(1, (g, r) => { g.beginPath(); g.arc(0, 0, r * .82, 0, 7); g.fill() });
  at(2, (g, r) => { g.beginPath(); g.arc(0, 0, r * .55, 0, 7); g.fill() }, 12);
  at(3, (g, r) => { g.lineWidth = r * .12; g.beginPath(); g.arc(0, 0, r * .82, 0, 7); g.stroke() });
  at(4, (g, r) => { const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.35, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r * .16, r * .95, 0, 0, 7); g.fill() });
  at(5, heart); at(6, heart, 7); at(7, star); at(8, star, 6);
  at(9, (g, r) => { const R = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647 })(); for (let i = 0; i < 9; i++) { const a = R() * 6.28, d = R() * r * .35, rr = r * (.28 + R() * .3), gr = g.createRadialGradient(Math.cos(a) * d, Math.sin(a) * d, 0, Math.cos(a) * d, Math.sin(a) * d, rr); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2) } });
  at(10, (g, r) => { g.beginPath(); g.ellipse(0, 0, r * .07, r * .9, 0, 0, 7); g.fill() });
  at(11, (g, r) => { const R = (() => { let s = 3; return () => (s = (s * 16807) % 2147483647) / 2147483647 })(); for (let i = 0; i < 9; i++) { g.beginPath(); g.arc((R() - .5) * r * 1.4, (R() - .5) * r * 1.4, r * (.05 + R() * .08), 0, 7); g.fill() } });
  at(12, (g, r) => { const gr = g.createRadialGradient(0, 0, r * .45, 0, 0, r); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.55, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2) });
  at(13, (g, r) => { g.beginPath(); g.moveTo(0, -r * .9); g.lineTo(r * .42, r * .6); g.lineTo(-r * .3, r * .4); g.closePath(); g.fill() });
  at(14, (g, r) => { g.lineWidth = r * .045; g.beginPath(); g.arc(0, 0, r * .9, 0, 7); g.stroke() });
  at(15, (g, r) => { g.beginPath(); g.arc(0, 0, r * .4, 0, 7); g.fill() });
  { const R = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647 })();
    at(16, (g, r) => { g.lineCap = 'butt'; g.lineJoin = 'miter'; const br = (x0, y0, a, len, w, d) => { if (d > 2 || len < 6) return; let x1 = x0, y1 = y0; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); for (let k = 0; k < 4; k++) { a += (R() - .5) * 1.0; x1 += Math.cos(a) * len / 4; y1 += Math.sin(a) * len / 4; g.lineTo(x1, y1) } g.stroke(); if (R() < .7) br(x1, y1, a + (R() - .5) * 1.2, len * .6, w * .65, d + 1); if (R() < .3) br(x0 + (x1 - x0) * .5, y0 + (y1 - y0) * .5, a + (R() > .5 ? 1 : -1) * (.5 + R() * .6), len * .5, w * .6, d + 1) };
      for (let i = 0; i < 7; i++) br(0, 0, i / 7 * 6.28 + R() * .5, r * (.55 + R() * .35), 3, 0); g.beginPath(); g.arc(0, 0, r * .07, 0, 7); g.fill() });
    at(17, (g, r) => { g.fillRect(-r * .035, -r * .55, r * .07, r * 1.45); g.beginPath(); g.moveTo(0, -r * .95); g.lineTo(r * .16, -r * .52); g.lineTo(-r * .16, -r * .52); g.closePath(); g.fill(); g.globalAlpha = .7; g.beginPath(); g.moveTo(0, r * .6); g.lineTo(r * .18, r * .92); g.lineTo(0, r * .8); g.lineTo(-r * .18, r * .92); g.closePath(); g.fill() });
    at(18, (g, r) => { for (let i = 0; i < 22; i++) { const a = i / 22 * 6.28, d = r * (.62 + R() * .2), rr = r * (.12 + R() * .14), gr = g.createRadialGradient(Math.cos(a) * d, Math.sin(a) * d, 0, Math.cos(a) * d, Math.sin(a) * d, rr); gr.addColorStop(0, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2) } });
    at(19, (g, r) => { g.beginPath(); g.arc(0, r * .45, r * .9, Math.PI * 1.18, Math.PI * 1.82); g.arc(0, r * .78, r * 1.05, Math.PI * 1.75, Math.PI * 1.25, true); g.closePath(); g.fill() });
    at(20, (g, r) => { g.beginPath(); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28, d = r * (.5 + R() * .35); g.lineTo(Math.cos(a) * d, Math.sin(a) * d) } g.closePath(); g.fill() });
    at(21, (g, r) => { for (const a of [.785, -.785]) { g.save(); g.rotate(a); g.beginPath(); g.moveTo(0, -r * .95); g.lineTo(r * .07, 0); g.lineTo(0, r * .95); g.lineTo(-r * .07, 0); g.closePath(); g.fill(); g.restore() } });
    at(22, (g, r) => { const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.scale(1, .12); g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill() });
    at(23, (g, r) => { g.beginPath(); g.moveTo(-r * .95, 0); g.lineTo(0, -r * .045); g.lineTo(r * .95, 0); g.lineTo(0, r * .045); g.closePath(); g.fill() }); }
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; return t })();

// ============================== 파티클 풀 ==============================
// 빌보드(카메라를 봄)와 바닥(누움) 두 종류 × 가산/반투명 두 블렌딩
function makePool(max, ground, additive) {
  const base = new THREE.PlaneGeometry(1, 1), g = new THREE.InstancedBufferGeometry();
  g.index = base.index; g.setAttribute('position', base.attributes.position); g.setAttribute('uv', base.attributes.uv);
  const A = { iPos: new Float32Array(max * 3), iSize: new Float32Array(max * 2), iRot: new Float32Array(max), iCol: new Float32Array(max * 4), iTex: new Float32Array(max) };
  g.setAttribute('iPos', new THREE.InstancedBufferAttribute(A.iPos, 3)); g.setAttribute('iSize', new THREE.InstancedBufferAttribute(A.iSize, 2));
  g.setAttribute('iRot', new THREE.InstancedBufferAttribute(A.iRot, 1)); g.setAttribute('iCol', new THREE.InstancedBufferAttribute(A.iCol, 4)); g.setAttribute('iTex', new THREE.InstancedBufferAttribute(A.iTex, 1));
  g.instanceCount = 0;
  const vs = `attribute vec3 iPos;attribute vec2 iSize;attribute float iRot;attribute vec4 iCol;attribute float iTex;varying vec2 vUv;varying vec4 vCol;
  void main(){vec2 p=position.xy*iSize;float c=cos(iRot),s=sin(iRot);p=vec2(c*p.x-s*p.y,s*p.x+c*p.y);
  ${ground ? 'vec4 mv=modelViewMatrix*vec4(iPos+vec3(p.x,0.,-p.y),1.);' : 'vec4 mv=modelViewMatrix*vec4(iPos,1.);mv.xy+=p;'}
  gl_Position=projectionMatrix*mv;float tx=mod(iTex,4.),ty=floor(iTex/4.);vUv=(uv*.94+.03+vec2(tx,5.-ty))/vec2(4.,6.);vCol=iCol;}`;
  const fs = `uniform sampler2D map;varying vec2 vUv;varying vec4 vCol;void main(){float a=texture2D(map,vUv).a*vCol.a;if(a<.003)discard;gl_FragColor=vec4(vCol.rgb,a);}`;
  const m = new THREE.ShaderMaterial({ uniforms: { map: { value: atlas } }, vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.layers.set(1); mesh.renderOrder = ground ? (additive ? 1 : 2) : (additive ? 3 : 5); scene.add(mesh); // 가산 글로우를 먼저, 반투명 코어·몸통을 나중에: 코어 색이 글로우에 하얗게 날아가지 않게
  return { max, A, g, mesh, n: 0, ground };
}
const POOL = { add: makePool(4000, false, true), alpha: makePool(2000, false, false), gadd: makePool(500, true, true), galpha: makePool(500, true, false) };
let parts = [];
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// 파티클 하나: pool, p, v, life, s0, s1([w,h] 가능), c0, c1(rgba), tex, rot, rv, drag, g, stretch
function spawn(o) { const q = { pool: o.pool || 'add', p: o.p.clone(), v: o.v ? o.v.clone() : V3(0, 0, 0), life: o.life || 1, age: 0, s0: o.s0 ?? 1, s1: o.s1 ?? o.s0 ?? 1, c0: o.c0, c1: o.c1 || o.c0, tex: o.tex ?? 0, rot: o.rot || 0, rv: o.rv || 0, drag: o.drag || 0, g: o.g || 0, stretch: o.stretch || 0, ease: o.ease || 1, follow: o.follow || null }; parts.push(q); return q }
const once = o => spawn({ ...o, life: 1 }); // 이번 프레임에만 그리는 스프라이트
const tmpV = new THREE.Vector3(), tmpW = new THREE.Vector3();
function updateParts() { for (const q of parts) { q.age++; q.v.multiplyScalar(1 - q.drag); q.v.y -= q.g / 60; q.p.addScaledVector(q.v, 1 / 60); q.rot += q.rv / 60 } parts = parts.filter(q => q.age < q.life) }
function fillPools() {
  for (const k in POOL) POOL[k].n = 0; camera.updateMatrixWorld(); const inv = camera.matrixWorldInverse;
  for (const q of parts) { const P = POOL[q.pool]; if (P.n >= P.max) continue; const t = Math.pow(q.age / Math.max(1, q.life), q.ease), i = P.n++;
    const s0 = Array.isArray(q.s0) ? q.s0 : [q.s0, q.s0], s1 = Array.isArray(q.s1) ? q.s1 : [q.s1, q.s1]; let w = s0[0] + (s1[0] - s0[0]) * t, h = s0[1] + (s1[1] - s0[1]) * t, rot = q.rot;
    const pos = q.follow ? tmpW.copy(q.p).add(q.follow) : q.p;
    if (q.stretch && !P.ground) { const sp = q.v.length(); if (sp > .01) { tmpV.copy(pos).applyMatrix4(inv); const a = tmpV.clone(); tmpV.copy(pos).addScaledVector(q.v, .05).applyMatrix4(inv); rot = Math.atan2(tmpV.y - a.y, tmpV.x - a.x) - Math.PI / 2; h *= 1 + sp * q.stretch } }
    P.A.iPos[i * 3] = pos.x; P.A.iPos[i * 3 + 1] = pos.y; P.A.iPos[i * 3 + 2] = pos.z; P.A.iSize[i * 2] = w; P.A.iSize[i * 2 + 1] = h; P.A.iRot[i] = rot; P.A.iTex[i] = q.tex;
    for (let k = 0; k < 4; k++) P.A.iCol[i * 4 + k] = q.c0[k] + (q.c1[k] - q.c0[k]) * t }
  for (const k in POOL) { const P = POOL[k]; P.g.instanceCount = P.n; for (const a of ['iPos', 'iSize', 'iRot', 'iCol', 'iTex']) P.g.attributes[a].needsUpdate = true }
}
const rgba = (c, a) => [c[0], c[1], c[2], a];

// ============================== 리본(꼬리 · 빔) ==============================
const RIB_VS = 'attribute vec4 col;varying vec4 vCol;varying vec2 vUv;void main(){vCol=col;vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const RIB_FS = 'uniform float soft,flow,dash,time;varying vec4 vCol;varying vec2 vUv;void main(){float a=vCol.a;float x=abs(vUv.y-.5)*2.;a*=1.-smoothstep(1.-soft,1.,x);if(flow>0.){float u=vUv.x*dash-time*flow;float f=fract(u),k=fract(sin(floor(u)*91.7)*437.5);a*=smoothstep(0.,.08,f)*(1.-smoothstep(.25+.45*k,.4+.5*k,f))*(.45+.55*k);}if(a<.003)discard;gl_FragColor=vec4(vCol.rgb,a);}';
class Ribbon {
  constructor(max, additive, soft, flow = 0, dash = 1) { this.max = max; const g = new THREE.BufferGeometry(); this.pos = new Float32Array(max * 6); this.col = new Float32Array(max * 8); this.uv = new Float32Array(max * 4);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('col', new THREE.BufferAttribute(this.col, 4)); g.setAttribute('uv', new THREE.BufferAttribute(this.uv, 2));
    const idx = []; for (let i = 0; i < max - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) } g.setIndex(idx); this.g = g;
    this.mat = new THREE.ShaderMaterial({ uniforms: { soft: { value: soft }, flow: { value: flow }, dash: { value: dash }, time: { value: 0 } }, vertexShader: RIB_VS, fragmentShader: RIB_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.mesh.layers.set(1); this.mesh.renderOrder = additive ? 3.5 : 4.5; scene.add(this.mesh); this.mesh.visible = false }
  set(pts, widths, cols, flat) { const n = Math.min(pts.length, this.max); if (n < 2) { this.mesh.visible = false; return } this.mesh.visible = true; const camP = camera.position;
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[Math.min(n - 1, i + 1)], o = pts[Math.max(0, i - 1)]; const tan = tmpV.copy(q).sub(o).normalize();
      let side; if (flat) side = V3(-tan.z, 0, tan.x); else { const view = tmpW.copy(camP).sub(p).normalize(); side = new THREE.Vector3().crossVectors(tan, view).normalize() }
      const w = widths[i] / 2; this.pos.set([p.x + side.x * w, p.y + side.y * w, p.z + side.z * w, p.x - side.x * w, p.y - side.y * w, p.z - side.z * w], i * 6);
      const c = cols[i]; this.col.set([c[0], c[1], c[2], c[3], c[0], c[1], c[2], c[3]], i * 8); const u = i / (n - 1); this.uv.set([u, 0, u, 1], i * 4) }
    this.g.setDrawRange(0, (n - 1) * 6); this.g.attributes.position.needsUpdate = this.g.attributes.col.needsUpdate = this.g.attributes.uv.needsUpdate = true }
  hide() { this.mesh.visible = false }
  dispose() { scene.remove(this.mesh); this.g.dispose(); this.mat.dispose() }
}

// ============================== 월드 ==============================
const floorTex = document.createElement('canvas'); floorTex.width = floorTex.height = 1024; const floorMap = new THREE.CanvasTexture(floorTex); floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping; floorMap.repeat.set(6, 6);
function paintFloor() { const fh = labH(SC.floorHue), x = floorTex.getContext('2d'), base = lch(SC.floorL, 8, fh), line = lch(Math.min(100, SC.floorL + 6), 8, fh), dark = lch(Math.max(0, SC.floorL - 4), 8, fh);
  x.fillStyle = hex(base); x.fillRect(0, 0, 1024, 1024); for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) { x.fillStyle = hex(dark); x.globalAlpha = .35; x.fillRect(i * 128, j * 128, 128, 128); x.globalAlpha = 1 }
  x.strokeStyle = hex(line); x.lineWidth = 3; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 128, 0); x.lineTo(i * 128, 1024); x.stroke(); x.beginPath(); x.moveTo(0, i * 128); x.lineTo(1024, i * 128); x.stroke() } floorMap.needsUpdate = true;
  scene.background = new THREE.Color(...lch(Math.max(0, SC.floorL - 12), 6, fh)) }
const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshBasicMaterial({ map: floorMap })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x30343c, .9)); const sun = new THREE.DirectionalLight(0xffffff, .55); sun.position.set(-6, 14, 8); scene.add(sun);
const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c) })();
function blob(r) { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = .015; scene.add(m); return m }
for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, p = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6 + (i % 3) * .8, 1.4), new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(40, 4, 230)) })); p.position.set(Math.cos(a) * 24, 1.3, Math.sin(a) * 24); scene.add(p) }
function makeChar(bodyC, accent, r, h) { const g = new THREE.Group(), mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(...bodyC), emissive: 0x000000 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r * .9, r, h * .62, 18), mat); body.position.y = h * .31; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(r * .72, 18, 14), mat); head.position.y = h * .62 + r * .55; g.add(head);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(r * .5, r * .3, r * .6), new THREE.MeshLambertMaterial({ color: new THREE.Color(...accent) })); nose.position.set(0, h * .5, -r * .95); g.add(nose);
  scene.add(g); return { g, mat, shadow: blob(r * 1.4), flash: 0 } }
const player = { ...makeChar(lch(56, 6, 240), lch(70, 40, 200), .45, 1.7), pos: V3(0, 0, 2), face: 0, slow: 0, hp: 1000, pose: { swing: 0, raise: 0, lift: 0, draw: 0 }, lock: 0 };
let enemies = [];
function spawnEnemies() { enemies.forEach(e => { scene.remove(e.g); scene.remove(e.shadow); e.hpEl.remove() }); enemies = [];
  for (let i = 0; i < SC.enemies; i++) { const a = i / SC.enemies * Math.PI * 2 + .4, d = 6 + (i % 2) * 2.5; const e = { ...makeChar(lch(48, 6, 30), lch(52, 55, 25), .55, 1.9), pos: V3(Math.cos(a) * d, 0, Math.sin(a) * d - 3), vel: V3(0, 0, 0), hp: 1000, max: 1000, dead: 0, home: null, wt: 0, atk: 120 + i * 37 };
    e.home = e.pos.clone(); e.hpEl = document.createElement('div'); e.hpEl.className = 'hp'; e.hpEl.innerHTML = '<i></i>'; document.getElementById('overlay').appendChild(e.hpEl); enemies.push(e) } }

// ============================== 입력 ==============================
const keys = new Set(); let aim = V3(0, 0, -6), moveTo = null; const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(V3(0, 1, 0), 0);
function groundAt(ev) { const r = cv.getBoundingClientRect(); ndc.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ndc, camera); const p = V3(); return ray.ray.intersectPlane(plane, p) ? p : null }
cv.addEventListener('mousemove', e => { const p = groundAt(e); if (p) aim.copy(p) });
cv.addEventListener('contextmenu', e => { e.preventDefault(); const p = groundAt(e); if (p) moveTo = p });
cv.addEventListener('mousedown', e => { cv.focus(); if (STORY.on && STORY.talk) { advance(); return } if (STORY.on && storyBlocking()) return; if (e.button === 0) { const p = groundAt(e); if (p) { aim.copy(p); cast('Q') } } });
window.addEventListener('keydown', e => { if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return; const k = e.key.toLowerCase();
  if (STORY.on && storyKey(k, e)) return;
  if (['w', 'a', 's', 'd', 'e'].includes(k)) keys.add(k);
  if (k === 'q' || k === '1') cast('Q'); if (k === 'e' || k === '2') cast('E'); if (k === 'r' || k === '3') cast('R'); if (k === 'f' || k === '4') cast('F'); if (k === 'tab') { setWeapon(WKEYS[(WKEYS.indexOf(W) + 1) % WKEYS.length]); e.preventDefault() } if (k === '5' || k === '6' || k === '7' || k === '8') setWeapon(WKEYS[+k - 5]);
  if (k === 'p') togglePause(); if (k === '.') { paused = true; stepReq = true; syncBar() } if (k === '[') setTS(Math.max(.1, TS / 2)); if (k === ']') setTS(Math.min(1, TS * 2));
  if (k === 'v') setVM((VM + 1) % 3); if (k === 'b') toggleAll(); if (['q', 'e', 'r', 'f', 'p', 'v', 'b', ' '].includes(k)) e.preventDefault() });
window.addEventListener('keyup', e => { const k = e.key.toLowerCase(); keys.delete(k); if (k === 'e' || k === '2') holdUp('E') });

// ============================== 게임 감각 ==============================
let freeze = 0, shakeA = 0, simF = 0, dmgs = [], flashV = 0, dimV = 0, tintA = 0, tintC = [0, 0, 0], invF = 0;
const overlay = document.getElementById('overlay');
function hitStop(n) { if (PR.hitStop) freeze = Math.max(freeze, n) }
function shake(a) { if (PR.shake) shakeA = Math.max(shakeA, a) }
function dmgNum(pos, v, cls) { const el = document.createElement('div'); el.className = 'dmg ' + (cls || ''); el.textContent = v; overlay.appendChild(el); dmgs.push({ el, p: pos.clone().add(V3((Math.random() - .5) * .6, 2.2, 0)), age: 0 }) }
function damage(e, v, kind, kb) { if (e.dead) return; e.hp -= v; e.flash = 2; { const fd = kb && kb.lengthSq() > 1e-6 ? kb.clone().setY(0) : e.pos.clone().sub(player.pos).setY(0); if (fd.lengthSq() > 1e-6) { e.fl = (e.fl || V3(0, 0, 0)).add(fd.normalize().multiplyScalar(kind === 'big' ? .42 : kind === 'tick' ? .06 : .22)); if (e.fl.length() > .6) e.fl.setLength(.6) } } if (e.boss && e.fl) e.fl.multiplyScalar(.5); dmgNum(e.pos, Math.round(v), kind); if (kb) e.vel.add(e.boss ? kb.clone().multiplyScalar(.1) : kb); if (e.hp <= 0) { e.dead = 150; e.g.visible = false; e.shadow.visible = false; fxDeath(e.pos); if (e.onDie) e.onDie(e) } }

// ============================== 공통 이펙트 ==============================
const up = V3(0, 1, 0), rnd = (a, b) => a + Math.random() * (b - a);
function groundLight(p, size, col, life, a) { if (!PR.sceneLight) return; spawn({ pool: 'gadd', p: V3(p.x, .03, p.z), life, s0: size, s1: size * 1.1, c0: rgba(col, a), c1: rgba(col, 0), tex: TILE.glow, ease: .7 }) }
function decal(p, size, life) { spawn({ pool: 'galpha', p: V3(p.x, .02, p.z), life, s0: size, s1: size * 1.05, c0: [0, 0, 0, .35], c1: [0, 0, 0, 0], tex: TILE.discSoft, ease: 2 }) }
function fxLaunch(p, R, scale) { const s = scale * (PR.bigImpact ? 1 : 1.7);
  spawn({ p, life: 8, s0: 1.4 * s, s1: 2.6 * s, c0: rgba(R.body, .7), c1: rgba(R.body, 0), tex: TILE.glow });
  spawn({ pool: 'alpha', p, life: 5, s0: .9 * s, s1: .4 * s, c0: rgba(R.core, 1), c1: rgba(R.core, 0), tex: PR.hardHead ? TILE.star : TILE.starSoft, rot: rnd(0, 6) });
  for (let i = 0; i < 6; i++) { const d = V3(rnd(-1, 1), rnd(0, .8), rnd(-1, 1)).normalize(); spawn({ p, v: d.multiplyScalar(rnd(5, 9) * s), life: 9, s0: [.08 * s, .4 * s], s1: [.04, .1], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.spark, stretch: .06, drag: .12 }) } }
function fxImpact(p, R, scale, o = {}) { const s = scale * (PR.bigImpact ? 1 : .55), hard = PR.hardHead;
  spawn({ p, life: 10, s0: 3.2 * s, s1: 5 * s, c0: rgba(R.body, .9), c1: rgba(R.body, 0), tex: TILE.glow, ease: .6 });
  spawn({ pool: 'alpha', p: p.clone().add(V3(0, .05, 0)), life: 5, s0: 1.6 * s, s1: .5 * s, c0: rgba(R.core, 1), c1: rgba(R.core, .0), tex: hard ? TILE.star : TILE.starSoft, rot: rnd(0, 6) });
  spawn({ p, life: 4, s0: 1.1 * s, s1: 1.6 * s, c0: rgba(R.core, .9), c1: rgba(R.body, 0), tex: hard ? TILE.disc : TILE.discSoft });
  spawn({ pool: 'gadd', p: V3(p.x, .05, p.z), life: 13, s0: .6 * s, s1: 5.2 * s, c0: rgba(R.hi, .95), c1: rgba(R.edge, 0), tex: hard ? TILE.ring : TILE.ringSoft, ease: .55 });
  const n = Math.round((o.sparks ?? 14) * Math.min(1.6, s)); for (let i = 0; i < n; i++) { const d = V3(rnd(-1, 1), rnd(-.1, .9), rnd(-1, 1)).normalize(); spawn({ p, v: d.multiplyScalar(rnd(7, 15) * Math.sqrt(s)), life: rnd(9, 16) | 0, s0: [.1 * s, .5 * s], s1: [.03, .12], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.spark, stretch: .07, drag: .1, g: 6 }) }
  const sm = o.smoke ?? 5; for (let i = 0; i < sm; i++) spawn({ pool: 'alpha', p: p.clone().add(V3(rnd(-.6, .6) * s, rnd(.1, .6), rnd(-.6, .6) * s)), v: V3(rnd(-.6, .6), rnd(.4, 1.1), rnd(-.6, .6)), life: rnd(40, 60) | 0, s0: 1.2 * s, s1: 2.8 * s, c0: rgba(R.smoke, 0), c1: rgba(R.smoke, 0), tex: TILE.smoke, rot: rnd(0, 6), rv: rnd(-.6, .6), drag: .03, fadeIn: 1 });
  parts.slice(-sm).forEach(q => { q.c0 = rgba(R.smoke, .55); q.ease = 1.4 });
  groundLight(p, 7 * s, R.body, 60, .5); decal(p, 2.4 * s, 80);
  if (o.shards) for (let i = 0; i < o.shards; i++) { const d = V3(rnd(-1, 1), rnd(.4, 1.2), rnd(-1, 1)).normalize(); spawn({ pool: 'alpha', p, v: d.multiplyScalar(rnd(6, 12) * Math.sqrt(s)), life: rnd(28, 44) | 0, s0: .35 * s, s1: .2 * s, c0: rgba(R.hi, 1), c1: rgba(R.edge, 0), tex: TILE.shard, rot: rnd(0, 6), rv: rnd(-12, 12), g: 18, drag: .01 }) } }
function fxDeath(p) { const R = ramp(20); for (let i = 0; i < 10; i++) spawn({ pool: 'alpha', p: p.clone().add(V3(0, 1, 0)), v: V3(rnd(-2, 2), rnd(1, 3), rnd(-2, 2)), life: 40, s0: .8, s1: 1.6, c0: rgba(lch(40, 4, 250), .5), c1: rgba(lch(40, 4, 250), 0), tex: TILE.smoke, rot: rnd(0, 6) }) }
function nearestEnemyOnSeg(a, b, rad) { let best = null, bt = 2; const ab = tmpV.copy(b).sub(a), L2 = ab.lengthSq() || 1e-6;
  for (const e of enemies) { if (e.dead) continue; const c = e.pos.clone().setY(a.y); const t = Math.max(0, Math.min(1, c.clone().sub(a).dot(ab) / L2)); const q = a.clone().addScaledVector(ab, t); if (q.distanceTo(c) < rad + (e.hitR || .55) && t < bt) { bt = t; best = e } } return best ? { e: best, t: bt } : null }

// ============================== 스킬 ==============================
let actives = [], cds = { Q: 0, E: 0, R: 0, F: 0 }, holdAct = null;
const hand = () => { updateRig(); return RIG.hL.clone() }; // 시전 손(왼손) 위치: 애니메이션을 따라간다
function castStaff(k) { if (cds[k] > 0 || player.cast) return; const t = aim.clone(); if (k === 'Q') { actives.push(new Projectile(t)); cds.Q = SK.Q.cd } if (k === 'R') { actives.push(new ChargeBlast(t)); cds.R = SK.R.cd } if (k === 'F') { actives.push(new Ultimate(t)); cds.F = SK.F.cd } }
function beamDown() { holdDown('E') }
function beamUp() { holdUp('E') }

class Projectile { // Q · 투사체 + 착탄
  constructor(target, o = {}) { this.t = 0; this.o = o; this.R = ramp(o.hue ?? SK.Q.hue); this.target = target; this.dead = false; this.hist = []; this.charge = o.noCharge ? 0 : 6; this.size = (o.size ?? SK.Q.size) * .95;
    this.rb = new Ribbon(24, false, .55); this.rg = new Ribbon(24, true, 1); this.speed = o.speed ?? SK.Q.speed; this.range = o.range ?? 26; this.enemy = !!o.enemy; this.homing = o.homing || null }
  update() { this.t++; const R = this.R, s = this.size;
    if (this.t <= this.charge) { const h = hand(); spawn({ p: h, life: 1, s0: .4 + this.t * .12, c0: rgba(R.body, .5), tex: TILE.glow }); if (this.t === this.charge) { this.pos = h.clone(); const d = this.target.clone().setY(h.y).sub(h); d.y = 0; this.dir = d.normalize(); this.dist = 0; fxLaunch(h, R, .55 * (o => o)(1)) } return }
    if (!this.pos) { this.pos = this.o.from.clone(); const d = this.target.clone().setY(this.pos.y).sub(this.pos); d.y = 0; this.dir = d.normalize(); this.dist = 0 }
    if (this.homing && !this.homing.dead) { const d = this.homing.pos.clone().setY(this.pos.y).sub(this.pos).normalize(); this.dir.lerp(d, .12).normalize() }
    const step = this.speed / 60, nx = this.pos.clone().addScaledVector(this.dir, step);
    // 착탄 판정
    if (this.enemy) { const c = player.pos.clone().setY(this.pos.y); if (nx.distanceTo(c) < .9) return this.hit(nx, null) }
    else { const h = nearestEnemyOnSeg(this.pos, nx, .25 * s + .2); if (h) return this.hit(this.pos.clone().lerp(nx, h.t), h.e) }
    this.pos.copy(nx); this.dist += step; if (this.dist > this.range) return this.hit(this.pos.clone(), null, true);
    // 착탄 직전 밝기 누르기: 다음 n프레임 안에 맞을 예정이면 어둡게
    let dip = false; if (PR.dip && !this.enemy) { const n = 2, ahead = this.pos.clone().addScaledVector(this.dir, step * n); dip = !!nearestEnemyOnSeg(this.pos, ahead, .25 * s + .2) }
    const dk = dip ? .45 : 1; this.hist.unshift(this.pos.clone()); const maxH = Math.round(10 * (this.o.trail ?? SK.Q.trail)) + 2; if (this.hist.length > maxH) this.hist.pop();
    // 머리
    const shape = this.enemy ? 'disc' : (PR.motif ? SK.Q.motifShape : 'disc'), hard = PR.hardHead, T = shape === 'heart' ? (hard ? TILE.heart : TILE.heartSoft) : shape === 'star' ? (hard ? TILE.star : TILE.starSoft) : (hard ? TILE.disc : TILE.discSoft);
    once({ p: this.pos, s0: 2.4 * s, c0: rgba(R.body, .5 * dk), tex: TILE.glow });
    once({ pool: 'alpha', p: this.pos, s0: 1.05 * s, c0: rgba(dip ? R.edge : R.body, 1), tex: T, rot: Math.PI });
    once({ pool: 'alpha', p: this.pos, s0: .55 * s, c0: rgba(dip ? R.body : (this.enemy ? lch(84, 30, labH(20)) : R.core), 1), tex: T, rot: Math.PI });
    if (this.enemy && PR.teamColor) once({ pool: 'alpha', p: this.pos, s0: 1.45 * s, c0: rgba(lch(58, 70, labH(8)), .95), tex: TILE.ring });
    groundLight(this.pos, 2.6 * s, R.body, 1, .14 * dk);
    // 꼬리: 명도 내리고 선명도 유지(원리) / 한 색 + 투명도(끔)
    const n = this.hist.length, pts = this.hist, w = [], c = [], wg = [], cg = [];
    for (let i = 0; i < n; i++) { const u = i / Math.max(1, n - 1); w.push(.75 * s * Math.pow(1 - u * .92, 1.3)); wg.push(1.9 * s * (1 - u));
      if (PR.tailDark) c.push(rgba(u < .55 ? mix(R.body, R.edge, u / .55) : mix(R.edge, R.haze, (u - .55) / .45), (u > .85 ? (1 - u) / .15 : 1) * dk)); else c.push(rgba(R.body, (1 - u) * dk));
      cg.push(rgba(R.body, .28 * (1 - u) * dk)) }
    this.rb.mat.uniforms.soft.value = hard ? .45 : .9; this.rb.set(pts, w, c); this.rg.set(pts, wg, cg);
    if (this.t % 2 === 0 && n > 4) { const q = pts[Math.floor(n * rnd(.5, .9))]; spawn({ pool: 'alpha', p: q, v: V3(rnd(-.5, .5), rnd(.2, .8), rnd(-.5, .5)), life: 16, s0: .12 * s, s1: .05, c0: rgba(PR.tailDark ? R.edge : R.body, .9), c1: rgba(R.haze, 0), tex: TILE.dot }) } }
  hit(p, e, fizzle) { this.dead = true; this.rb.dispose(); this.rg.dispose(); const R = this.R;
    if (fizzle) { spawn({ p, life: 8, s0: .6, s1: 1.4, c0: rgba(R.body, .5), c1: rgba(R.body, 0), tex: TILE.glow }); return }
    if (this.enemy) { fxImpact(p, R, .45, { sparks: 6, smoke: 1 }); hurtPlayer(Math.round(this.o.pdmg ?? rnd(40, 60))); return }
    fxImpact(p, R, (this.o.impact ?? .85) * (SK.Q.size) * (PR.bigImpact ? 1 : 1), { sparks: 12, smoke: 3 }); hitStop(this.o.stop ?? 3); shake(.16);
    if (e) damage(e, rnd(120, 170) * (this.o.dmg ?? 1), this.o.big ? 'big' : '', this.dir.clone().multiplyScalar(2.5)) }
}

class Beam { // E · 빔(누르고 있는 동안)
  constructor() { this.t = 0; this.R = ramp(SK.E.hue); this.release = false; this.dir = null; this.len = 0;
    this.body = new Ribbon(20, false, .7); this.glowR = new Ribbon(20, true, 1); this.flows = [0, 1, 2].map(i => new Ribbon(20, true, .25, 1.4 + i * .4, 9 + i * 3)); this.core = new Ribbon(20, true, .6); this.dead = false; player.slow = .45 }
  update() { this.t++; const R = this.R, s = SK.E.size, h = hand(), want = aim.clone().setY(h.y).sub(h); want.y = 0; want.normalize();
    if (!this.dir) this.dir = want.clone(); else this.dir.lerp(want, .18).normalize();
    if (this.t <= 8) { spawn({ p: h, life: 1, s0: .5 + this.t * .16, c0: rgba(R.body, .6), tex: TILE.glow }); if (this.t === 8) fxLaunch(h, R, .45); return }
    if ((this.release && this.t > 26) || this.t > 160) return this.end();
    const maxL = SK.E.len, far = h.clone().addScaledVector(this.dir, maxL), hitE = nearestEnemyOnSeg(h, far, .45 * s); const L = hitE ? maxL * hitE.t : maxL; this.len += (L - this.len) * .5;
    const tip = h.clone().addScaledVector(this.dir, this.len), n = 16, side = V3(-this.dir.z, 0, this.dir.x), pts = [], wB = [], cB = [], wG = [], cG = [];
    for (let i = 0; i < n; i++) { const u = i / (n - 1), wob = Math.sin(u * 9 - this.t * .35) * .12 * s * Math.min(1, u * 3); pts.push(h.clone().lerp(tip, u).addScaledVector(side, wob));
      const W = (.9 + .1 * Math.sin(this.t * .3 + u * 6)) * s * 1.35 * (.55 + .45 * Math.min(1, u * 4)); wB.push(W * 1.1); wG.push(W * 2.6);
      cB.push(rgba(lch(68, 26 + 26 * u, labH(SK.E.hue)), PR.translucent ? .62 : .97)); cG.push(rgba(R.edge, .16)) }
    this.body.set(pts, wB, cB); this.glowR.set(pts, wG, cG);
    this.flows.forEach((r, k) => { const off = (k - 1) * .38 * s, P = pts.map((p, i) => p.clone().addScaledVector(side, off * (1 - i / (n - 1) * .3))); r.mat.uniforms.time.value = this.t / 60; r.mat.uniforms.soft.value = PR.hardHead ? .2 : .95;
      r.set(P, P.map(() => .13 * s), P.map((_, i) => rgba(R.hi, .9 * Math.min(1, i / 2)))) });
    const cn = Math.ceil(n * .45); this.core.set(pts.slice(0, cn), pts.slice(0, cn).map((_, i) => .32 * s * (1 - i / cn)), pts.slice(0, cn).map((_, i) => rgba(R.core, .85 * (1 - i / cn))));
    once({ p: h, s0: 1.4 * s, c0: rgba(R.body, .55), tex: TILE.glow }); once({ pool: 'alpha', p: h, s0: .5 * s, c0: rgba(R.core, 1), tex: PR.hardHead ? TILE.disc : TILE.discSoft });
    groundLight(h.clone().lerp(tip, .5), this.len * .9, R.body, 1, .1);
    if (hitE) { once({ p: tip, s0: 2.2 * s, c0: rgba(R.body, .6), tex: TILE.glow });
      if (this.t % 3 === 0) { for (let i = 0; i < 4; i++) spawn({ pool: 'alpha', p: tip, v: V3(rnd(-3, 3), rnd(2, 5), rnd(-3, 3)), life: 22, s0: .18 * s, s1: .06, c0: rgba(lch(92, 12, labH(SK.E.hue)), 1), c1: rgba(R.body, 0), tex: TILE.dot, g: 14 });
        spawn({ p: tip, life: 10, s0: .6 * s, s1: 2 * s, c0: rgba(R.hi, .8), c1: rgba(R.edge, 0), tex: PR.hardHead ? TILE.ring : TILE.ringSoft }) }
      if (this.t % 10 === 0) damage(hitE.e, rnd(18, 26), 'tick', this.dir.clone().multiplyScalar(.6)) }
    else if (PR.telegraph) once({ pool: 'alpha', p: tip, s0: .9 * s, c0: rgba(R.hi, .9), tex: TILE.ring }) }
  end() { this.dead = true; [this.body, this.glowR, this.core, ...this.flows].forEach(r => r.dispose()); player.slow = 0; holdAct = null; cds.E = SK.E.cd;
    if (this.dir) spawn({ p: hand().addScaledVector(this.dir, this.len), life: 14, s0: 1, s1: 2.4, c0: rgba(this.R.body, .5), c1: rgba(this.R.body, 0), tex: TILE.glow }) }
}

class ChargeBlast { // R · 범위 차지 → 폭발
  constructor(target) { const from = player.pos.clone(); const d = target.clone().sub(from); d.y = 0; if (d.length() > 13) d.setLength(13); this.c = from.add(d).setY(0); this.t = 0; this.R = ramp(SK.R.hue); this.r = SK.R.radius * SK.R.size; this.N = SK.R.charge; this.dead = false; player.cast = 10 }
  update() { this.t++; const R = this.R, r = this.r, N = this.N, c = this.c, k = this.t / N, dipping = PR.dip && this.t > N - 2 && this.t <= N;
    if (this.t <= N) { if (this.t <= 8) once({ p: hand(), s0: .6 + this.t * .1, c0: rgba(R.body, .5), tex: TILE.glow });
      if (PR.telegraph) { once({ pool: 'galpha', p: V3(c.x, .04, c.z), s0: r * 2.1, c0: rgba(R.edge, .85), tex: TILE.ringThin }); once({ pool: 'galpha', p: V3(c.x, .035, c.z), s0: r * 2 * k, c0: rgba(R.edge, .22), tex: TILE.disc }) }
      if (!dipping) { for (let i = 0; i < 3; i++) { const a = rnd(0, 6.28), p = V3(c.x + Math.cos(a) * r * 1.2, rnd(.2, 1.6), c.z + Math.sin(a) * r * 1.2), to = V3(c.x, .8, c.z).sub(p), tan = V3(-to.z, 0, to.x).multiplyScalar(.35);
          spawn({ p, v: to.add(tan).multiplyScalar(2.6), life: 22, s0: [.08, .5], s1: [.04, .2], c0: rgba(R.body, 0), c1: rgba(R.core, 1), tex: TILE.spark, stretch: .05, ease: .6 }) }
        once({ p: V3(c.x, .9, c.z), s0: .5 + 2.2 * k * k, c0: rgba(R.body, .3 + .5 * k), tex: TILE.glow }); if (this.t > N * .65) once({ pool: 'alpha', p: V3(c.x, .9, c.z), s0: .3 + .7 * k, c0: rgba(R.core, .9), tex: PR.hardHead ? TILE.star : TILE.starSoft, rot: this.t * .08 }) }
      else { once({ p: V3(c.x, .9, c.z), s0: .8, c0: rgba(R.edge, .25), tex: TILE.glow }); dimV = Math.max(dimV, .12) }
      if (this.t === N) this.boom(); return }
    if (this.t > N + 80) this.dead = true }
  boom() { const R = this.R, c = V3(this.c.x, .7, this.c.z), s = this.r / 2.2; fxImpact(c, R, s, { sparks: 22, smoke: 8, shards: 16 });
    spawn({ pool: 'gadd', p: V3(c.x, .06, c.z), life: 10, s0: 1, s1: this.r * 3.4, c0: rgba(R.core, 1), c1: rgba(R.edge, 0), tex: PR.hardHead ? TILE.ring : TILE.ringSoft, ease: .5 });
    if (SK.R.impactFrame) invF = 1; hitStop(4); shake(.32);
    for (const e of enemies) { if (e.dead) continue; const d = e.pos.clone().sub(this.c); d.y = 0; if (d.length() < this.r + .5) damage(e, rnd(220, 300), 'big', d.normalize().multiplyScalar(9)) } }
}

class Ultimate { // F · 같은 문법 두 번: 작은 1막 → 큰 2막(모으기 ×2.6, 맞히기 ×4.4 빠르게)
  constructor(target) { this.t = 0; this.R = ramp(SK.F.hue); const d = target.clone().sub(player.pos); d.y = 0; if (d.length() > 12) d.setLength(12); this.c = player.pos.clone().add(d).setY(0); this.dead = false; player.cast = 40;
    const G = PR.grammar; this.A1 = G ? { charge: 20, dip: PR.dip ? 4 : 0 } : null; this.a2s = G ? 48 : 0; this.A2 = { charge: G ? 52 : 24, dip: PR.dip ? (G ? 1 : 3) : 0, slam: G ? 4 : 12 }; this.s = SK.F.size }
  update() { this.t++; const R = this.R, t = this.t, s = this.s;
    // 1막: 시전자 주변 차지 → 섬광 → 누르기 → 유도탄 3발
    if (this.A1 && t <= this.a2s) { const A = this.A1, p = player.pos.clone().setY(1);
      if (t <= A.charge) { const k = t / A.charge; for (let i = 0; i < 2; i++) { const a = rnd(0, 6.28), q = p.clone().add(V3(Math.cos(a) * 2.4, rnd(-.4, .8), Math.sin(a) * 2.4)); spawn({ p: q, v: p.clone().sub(q).multiplyScalar(2.8), life: 20, s0: [.06, .4], s1: [.03, .15], c0: rgba(R.body, 0), c1: rgba(R.core, 1), tex: TILE.spark, stretch: .05, ease: .6 }) }
        once({ p, s0: .8 + 2 * k, c0: rgba(R.body, .25 + .35 * k), tex: TILE.glow }) }
      if (t === A.charge) fxLaunch(p, R, .7 * s);
      if (t > A.charge && t <= A.charge + A.dip) once({ p, s0: 1, c0: rgba(R.edge, .2), tex: TILE.glow });
      if (t === A.charge + A.dip + 1) { const tg = enemies.filter(e => !e.dead).sort((a, b) => a.pos.distanceTo(player.pos) - b.pos.distanceTo(player.pos)).slice(0, 3);
        tg.forEach((e, i) => { const a = (i - 1) * .9 + player.face; const from = p.clone().add(V3(-Math.sin(a) * .8, .3, -Math.cos(a) * .8)); actives.push(new Projectile(e.pos.clone(), { from, noCharge: true, homing: e, hue: SK.F.hue, size: .8 * s, speed: 20, trail: .8, impact: .6, stop: 2, dmg: .8 })) }) }
      return }
    // 2막: 하늘에서 모으기 → 섬광 → 누르기 → 수직 낙하 → 임팩트
    const T2 = t - this.a2s, A = this.A2, c = this.c, top = V3(c.x, 5.2, c.z), k = Math.min(1, T2 / A.charge);
    if (T2 <= A.charge) { if (PR.telegraph) { once({ pool: 'galpha', p: V3(c.x, .04, c.z), s0: 11 * s, c0: rgba(R.edge, .8), tex: TILE.ringThin }); once({ pool: 'galpha', p: V3(c.x, .035, c.z), s0: 11 * s * k, c0: rgba(R.edge, .18), tex: TILE.disc }) }
      for (let i = 0; i < 4; i++) { const a = rnd(0, 6.28), d = rnd(4, 8) * s, q = top.clone().add(V3(Math.cos(a) * d, rnd(-3, 2), Math.sin(a) * d)), to = top.clone().sub(q), tan = V3(-to.z, 0, to.x).multiplyScalar(.4); spawn({ p: q, v: to.add(tan).multiplyScalar(2.2), life: 26, s0: [.1, .7], s1: [.05, .25], c0: rgba(R.body, 0), c1: rgba(R.core, 1), tex: TILE.spark, stretch: .04, ease: .6 }) }
      once({ p: top, s0: 1 + 4.2 * k * k * s, c0: rgba(R.body, .18 + .22 * k), tex: TILE.glow }); once({ pool: 'alpha', p: top, s0: (.5 + 1.6 * k) * s, c0: rgba(R.body, 1), tex: PR.hardHead ? TILE.disc : TILE.discSoft }); once({ pool: 'alpha', p: top, s0: (.25 + .75 * k) * s, c0: rgba(R.core, 1), tex: PR.hardHead ? TILE.disc : TILE.discSoft });
      if (PR.sceneLight) { tintC = R.edge; tintA = Math.max(tintA, .18 * k) } camCharge(player.pos, c, k) }
    if (T2 === A.charge) fxLaunch(top, R, 1.1 * s);
    const ds = A.charge, de = ds + A.dip; if (T2 > ds && T2 <= de) { once({ p: top, s0: 1.4 * s, c0: rgba(R.edge, .25), tex: TILE.glow }); dimV = Math.max(dimV, .22); camHold() }
    if (T2 > de && T2 <= de + A.slam) camHold();
    if (T2 > de && T2 <= de + A.slam) { const u = (T2 - de) / A.slam, bot = top.clone().lerp(V3(c.x, 0, c.z), u); if (!this.col) { this.col = new Ribbon(4, true, 1); this.colB = new Ribbon(4, false, .5) }
      const P = [top, top.clone().lerp(bot, .5), bot]; this.col.set(P, [.6 * s, 2 * s, 2.8 * s], [rgba(R.body, .15), rgba(R.body, .45), rgba(R.body, .75)]); this.colB.set(P, [.15 * s, .45 * s, .8 * s], [rgba(R.body, .9), rgba(R.core, 1), rgba(R.core, 1)]) }
    if (T2 === de + A.slam) { if (this.col) { this.col.dispose(); this.colB.dispose() } this.boom() }
    if (T2 > de + A.slam + 120) this.dead = true }
  boom() { const R = this.R, c = V3(this.c.x, .8, this.c.z), s = this.s; fxImpact(c, R, 2.3 * s, { sparks: 34, smoke: 14, shards: 30 });
    spawn({ pool: 'gadd', p: V3(c.x, .06, c.z), life: 14, s0: 1, s1: 17 * s, c0: rgba(R.core, 1), c1: rgba(R.edge, 0), tex: PR.hardHead ? TILE.ring : TILE.ringSoft, ease: .5 });
    if (PR.impactFrame) invF = 1; else flashV = .28; if (PR.sceneLight) { tintC = R.body; tintA = .32 } hitStop(6); shake(.6); camPeak(this.c, this.c.clone().sub(player.pos), { back: 5.5, side: 2, h: 2.2, lookY: 1.1 });
    for (const e of enemies) { if (e.dead) continue; const d = e.pos.clone().sub(this.c); d.y = 0; if (d.length() < 6.5 * s) damage(e, rnd(600, 800), 'big', d.normalize().multiplyScalar(14)) } }
}

// ============================== 무기 ==============================
// 지팡이(마법) · 검 · 활 · 망치. 무기마다 Q/E/R/F 4개 스킬. 원리 스위치(PR)는 모든 무기에 같이 적용된다.
SK.E.hold = true;
const WEAPONS = {
  staff: { name: '지팡이', skills: SK },
  sword: { name: '검', skills: {
    Q: { name: '3연 베기', desc: '1·2타 7f로 빠르게 → 3타는 1f 누르기 뒤 크게. 호의 머리는 하드 라인, 끝으로 갈수록 어둡게', hue: 200, size: 1, cd: 0 },
    E: { name: '검기', desc: '휘두른 호가 그대로 날아간다. 관통 · 잔상 2겹 · 앞 가장자리 하드', hue: 195, size: 1, speed: 22, cd: 70 },
    R: { name: '돌진 베기', desc: '경로 표시 → 6f 돌진 → 남은 선이 멈췄다가 터진다', hue: 205, size: 1, dist: 7, cd: 110 },
    F: { name: '궁극기 · 난무', desc: '1막 빠른 3번 베기 → 2막 모으기 → X자 베기 4f · 임팩트 프레임', hue: 215, size: 1, cd: 360 } } },
  bow: { name: '활', skills: {
    Q: { name: '화살', desc: '6f 당김 → 가늘고 긴 하드 머리 + 얇은 꼬리 · 히트스톱 1f', hue: 125, size: 1, speed: 38, cd: 16 },
    E: { name: '차징 샷', desc: '누르는 동안 모은다(최대 1초) → 놓으면 관통. 오래 모을수록 크고 빠르다', hue: 120, size: 1, cd: 70, hold: true },
    R: { name: '화살비', desc: '범위 표시 → 위로 한 발 → 30f 동안 쏟아진다', hue: 132, size: 1, radius: 3, cd: 140 },
    F: { name: '궁극기 · 폭렬 화살', desc: '1막 부채꼴 3발 → 2막 직선 표시 · 모으기 → 거대 화살이 4f 만에 끝까지', hue: 140, size: 1, cd: 360 } } },
  hammer: { name: '망치', skills: {
    Q: { name: '내려찍기', desc: '16f 들어올림 → 3f 내려침 · 균열 · 먼지 고리 · 파편 · 긴 히트스톱', hue: 28, size: 1, cd: 40 },
    E: { name: '회전', desc: '누르는 동안 회전 · 12f마다 타격 · 바닥 먼지', hue: 34, size: 1, cd: 90, hold: true },
    R: { name: '도약 강타', desc: '착지 표시 → 포물선 도약 → 착지 직전 누르기 → 쾅', hue: 22, size: 1, cd: 140 },
    F: { name: '궁극기 · 지진', desc: '1막 작은 내려찍기 → 2막 긴 들어올림 → 사방으로 균열 · 가시가 굴러 나간다', hue: 16, size: 1, cd: 360 } } },
};
const WKEYS = ['staff', 'sword', 'bow', 'hammer'];
let W = 'staff';
const WS = () => WEAPONS[W].skills;
const MAKERS = {
  staff: { Q: t => new Projectile(t), E: () => new Beam(), R: t => new ChargeBlast(t), F: t => new Ultimate(t) },
  sword: { Q: t => swordQ(t), E: t => new SwordWave(t), R: t => new SwordDash(t), F: t => new SwordUlt(t) },
  bow: { Q: t => new BowShot(t), E: t => new BowCharge(t), R: t => new ArrowRain(t), F: t => new BowUlt(t) },
  hammer: { Q: t => new HammerSmash(t), E: t => new HammerSpin(t), R: t => new HammerLeap(t), F: t => new HammerQuake(t) },
};
const faceAim = () => { if (!player.faceLock) player.face = angTo(player.pos, aim) };
function cast(k) { const sk = WS()[k]; if (sk.hold) return holdDown(k); if (player.lock) return; faceAim();
  if (W === 'sword' && k === 'Q') { swordQ(aim.clone()); return }
  if (cds[k] > 0 || player.cast) return; const a = MAKERS[W][k](aim.clone()); if (a) { actives.push(a); cds[k] = sk.cd } }
function holdDown(k) { if (holdAct || cds[k] > 0 || player.cast || player.lock) return; faceAim(); holdAct = MAKERS[W][k](aim.clone()); holdAct.key = k; actives.push(holdAct) }
function holdUp(k) { if (holdAct && (holdAct.key === k || !holdAct.key)) holdAct.release = true }
function endHold(k) { holdAct = null; player.slow = 0; cds[k] = WS()[k].cd }

// ---------- 무기 모델 ----------
const wpnRoot = new THREE.Group(); wpnRoot.rotation.order = 'YXZ'; wpnRoot.position.set(.38, 1.0, -.15); player.g.add(wpnRoot); let wpnParts = {};
function buildWeapon() { while (wpnRoot.children.length) wpnRoot.remove(wpnRoot.children[0]); if (wpnParts.s1) scene.remove(wpnParts.s1, wpnParts.s2); wpnParts = {};
  const metal = new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(62, 4, 240)) }), dark = new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(30, 6, 30)) });
  const sk = WS(), glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(...ramp(sk.Q.hue).body) }), add = m => { wpnRoot.add(m); return m }, handle = z => { const o = new THREE.Object3D(); o.position.set(0, W === 'staff' ? z : 0, W === 'staff' ? 0 : z); wpnRoot.add(o); wpnParts.h2 = o };
  if (W === 'staff') { const rod = add(new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 1.7, 8), dark)); rod.position.y = .1; const orb = add(new THREE.Mesh(new THREE.SphereGeometry(.12, 14, 10), glow)); orb.position.y = .98; wpnParts.tip = orb }
  if (W === 'sword') { const blade = add(new THREE.Mesh(new THREE.BoxGeometry(.075, .025, 1.25), new THREE.MeshBasicMaterial({ color: new THREE.Color(...lch(84, 8, labH(sk.Q.hue))) }))); blade.position.z = -.76;
    const guard = add(new THREE.Mesh(new THREE.BoxGeometry(.32, .06, .06), metal)); guard.position.z = -.12; const grip = add(new THREE.Mesh(new THREE.BoxGeometry(.05, .05, .24), dark)); grip.position.z = .02; wpnParts.tip = new THREE.Object3D(); wpnParts.tip.position.z = -1.38; wpnRoot.add(wpnParts.tip) }
  if (W === 'bow') { const A = Math.PI * .9, Rr = .78, g = new THREE.Group(); g.rotation.set(0, Math.PI / 2, 0); wpnRoot.add(g); wpnRoot.position.set(.2, 1.1, -.3);
    const wood = new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(52, 18, 60)) }), arc = new THREE.Mesh(new THREE.TorusGeometry(Rr, .05, 6, 26, A), wood); arc.rotation.z = -A / 2; g.add(arc);
    const str = new THREE.Mesh(new THREE.BoxGeometry(.022, 2 * Rr * Math.sin(A / 2), .022), new THREE.MeshBasicMaterial({ color: new THREE.Color(...lch(80, 20, labH(sk.Q.hue))) })); str.position.x = Rr * Math.cos(A / 2); g.add(str); str.visible = false; wpnParts.str = str; wpnParts.strX = str.position.x;
    const bt = new THREE.Object3D(), bb = new THREE.Object3D(); bt.position.set(Rr * Math.cos(A / 2), Rr * Math.sin(A / 2), 0); bb.position.set(Rr * Math.cos(A / 2), -Rr * Math.sin(A / 2), 0); g.add(bt, bb); // 시위: 활 끝 두 점 → 당기는 손
    const sg = new THREE.CylinderGeometry(.011, .011, 1, 5); sg.translate(0, -.5, 0); const sm = str.material; wpnParts.bt = bt; wpnParts.bb = bb; wpnParts.s1 = new THREE.Mesh(sg, sm); wpnParts.s2 = new THREE.Mesh(sg, sm); scene.add(wpnParts.s1, wpnParts.s2);
    wpnParts.tip = new THREE.Object3D(); wpnParts.tip.position.z = -.62; wpnRoot.add(wpnParts.tip) } else wpnRoot.position.set(.38, W === 'hammer' ? .95 : 1.0, -.15);
  if (W === 'hammer') { const h = add(new THREE.Mesh(new THREE.BoxGeometry(.06, .06, 1.35), dark)); h.position.z = -.6; const head = add(new THREE.Mesh(new THREE.BoxGeometry(.56, .34, .34), metal)); head.position.z = -1.3;
    const band = add(new THREE.Mesh(new THREE.BoxGeometry(.58, .08, .36), glow)); band.position.z = -1.3; wpnParts.tip = head }
  handle({ staff: -.34, sword: .12, hammer: -.36, bow: -.78 }[W]) }
const restPose = () => ({ swing: 0, raise: W === 'hammer' ? -.55 : W === 'sword' ? -.25 : 0, lift: 0, draw: 0, spin: 0 });
function tintWeapon() { if (W !== 'staff' && W !== 'sword' && W !== 'bow' && W !== 'hammer') return; const keep = player.pose; buildWeapon(); player.pose = keep }
function setWeapon(w) { if (!WEAPONS[w]) return; if (STORY.on && !STORY.allowW) { bark('sys', '스토리에서는 챕터의 캐릭터로 싸워요'); return } if (holdAct) { holdAct.release = true } W = w; for (const k in cds) cds[k] = 0; player.lock = 0; player.cast = 0; player.slow = 0; player.faceLock = false; if (combo) combo.finish(); buildWeapon(); player.pose = restPose(); if (typeof dress === 'function') dress(w); buildUI(); syncBar() }

// ---------- 공통 도우미 ----------
const dirOf = a => V3(-Math.sin(a), 0, -Math.cos(a));
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const angTo = (from, p) => { const d = p.clone().sub(from); return Math.atan2(-d.x, -d.z) };
const alive = () => enemies.filter(e => !e.dead);
const inRad = (p, r) => alive().filter(e => { const d = e.pos.clone().sub(p); d.y = 0; return d.length() < r + (e.hitR || .5) });
const dust = () => lch(Math.min(70, SC.floorL + 22), 6, labH(SC.floorHue));
function slashHit(p, R, s) { const q = p.clone().setY(1.1);
  spawn({ pool: 'alpha', p: q, life: 7, s0: 1.3 * s, s1: 2 * s, c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.cross, rot: rnd(0, 3.14) });
  spawn({ p: q, life: 8, s0: [2.6 * s, 2.6 * s], s1: [4 * s, 4 * s], c0: rgba(R.body, .8), c1: rgba(R.body, 0), tex: TILE.flare, rot: rnd(-.4, .4) });
  spawn({ p: q, life: 6, s0: 1.6 * s, s1: 2.4 * s, c0: rgba(R.body, .6), c1: rgba(R.body, 0), tex: TILE.glow });
  for (let i = 0; i < 8; i++) { const d = V3(rnd(-1, 1), rnd(-.2, .8), rnd(-1, 1)).normalize(); spawn({ p: q, v: d.multiplyScalar(rnd(6, 12)), life: rnd(8, 14) | 0, s0: [.07, .45], s1: [.03, .1], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.spark, stretch: .07, drag: .1 }) } }
function cracks(p, R, size, life = 140) { const r = rnd(0, 6.28);
  spawn({ pool: 'galpha', p: V3(p.x, .022, p.z), life, s0: size, s1: size, c0: [0, 0, 0, .6], c1: [0, 0, 0, 0], tex: TILE.crack, rot: r, ease: 3 });
  spawn({ pool: 'gadd', p: V3(p.x, .03, p.z), life: 26, s0: size * .97, s1: size * .97, c0: rgba(mix(R.body, R.hi, .3), .95), c1: rgba(R.edge, 0), tex: TILE.crack, rot: r, ease: .6 }) }
function dustRing(p, size, life = 34) { spawn({ pool: 'galpha', p: V3(p.x, .05, p.z), life, s0: size * .3, s1: size, c0: rgba(dust(), .55), c1: rgba(dust(), 0), tex: TILE.dustRing, rot: rnd(0, 6), ease: .5 });
  for (let i = 0; i < 8; i++) { const a = rnd(0, 6.28); spawn({ pool: 'alpha', p: V3(p.x + Math.cos(a) * size * .25, .3, p.z + Math.sin(a) * size * .25), v: V3(Math.cos(a) * 3.5, rnd(.6, 1.6), Math.sin(a) * 3.5), life: rnd(28, 40) | 0, s0: .8, s1: 2.2, c0: rgba(dust(), .5), c1: rgba(dust(), 0), tex: TILE.smoke, rot: rnd(0, 6), drag: .06 }) } }
function rocks(p, n, s, R) { const rc = lch(Math.max(22, SC.floorL + 4), 6, labH(SC.floorHue));
  for (let i = 0; i < n; i++) { const d = V3(rnd(-1, 1), rnd(.6, 1.4), rnd(-1, 1)).normalize(); spawn({ pool: 'alpha', p: V3(p.x, .4, p.z), v: d.multiplyScalar(rnd(4, 10) * Math.sqrt(s)), life: rnd(30, 46) | 0, s0: rnd(.18, .4) * s, s1: .15 * s, c0: rgba(rc, 1), c1: rgba(rc, 0), tex: TILE.rock, rot: rnd(0, 6), rv: rnd(-10, 10), g: 22, ease: 3 }) }
  for (let i = 0; i < n * .6; i++) { const d = V3(rnd(-1, 1), rnd(.3, 1), rnd(-1, 1)).normalize(); spawn({ p: V3(p.x, .3, p.z), v: d.multiplyScalar(rnd(5, 11)), life: rnd(10, 18) | 0, s0: [.06, .35], s1: [.03, .1], c0: rgba(R.hi, 1), c1: rgba(R.edge, 0), tex: TILE.spark, stretch: .06, g: 10 }) } }
function spike(p, R, s, delay = 0) { const rc = lch(Math.max(24, SC.floorL + 6), 6, labH(SC.floorHue)), q = V3(p.x, .55 * s, p.z);
  spawn({ pool: 'alpha', p: q, life: 30 + delay, s0: [.5 * s, .3 * s], s1: [.75 * s, 2.2 * s], c0: rgba(rc, 1), c1: rgba(rc, 0), tex: TILE.shard, rot: rnd(-.25, .25), ease: 2.5 });
  spawn({ p: q, life: 14, s0: [.4 * s, .4 * s], s1: [.6 * s, 2 * s], c0: rgba(R.hi, .7), c1: rgba(R.edge, 0), tex: TILE.shard, rot: rnd(-.25, .25) }) }
function telegraphCircle(c, r, k, R, fill = true) { if (!PR.telegraph) return; once({ pool: 'galpha', p: V3(c.x, .04, c.z), s0: r * 2.1, c0: rgba(R.edge, .85), tex: TILE.ringThin }); if (fill) once({ pool: 'galpha', p: V3(c.x, .035, c.z), s0: r * 2 * k, c0: rgba(R.edge, .2), tex: TILE.disc }); else once({ pool: 'galpha', p: V3(c.x, .04, c.z), s0: r * 2.1 * k, c0: rgba(R.edge, .5), tex: TILE.ringThin }) }
function telegraphLine(a, b, w, R, rib) { if (!PR.telegraph) { rib.hide(); return } const P = [a.clone().setY(.04), b.clone().setY(.04)]; rib.set(P, [w, w], [rgba(R.edge, .35), rgba(R.edge, .35)], true) }
// 호(arc) 리본: 중심 c, 각도 a0→a1 (캐릭터 정면 기준 상대각), 반지름 r, 두께 w. 최신 쪽이 머리
function arcPts(c, face, a0, a1, r, n) { const P = []; for (let i = 0; i < n; i++) { const a = face + a1 + (a0 - a1) * (i / (n - 1)); P.push(c.clone().addScaledVector(dirOf(a), r)) } return P }
function arcCols(n, R, fade, dk = 1) { const C = []; for (let i = 0; i < n; i++) { const u = i / (n - 1), al = (u > .8 ? (1 - u) / .2 : 1) * fade * dk;
  C.push(PR.tailDark ? rgba(u < .1 ? mix(R.core, R.body, u / .1) : u < .6 ? mix(R.body, R.edge, (u - .1) / .5) : mix(R.edge, R.haze, (u - .6) / .4), al) : rgba(R.body, (1 - u) * fade * dk)) } return C }

// ============================== 검 ==============================
let combo = null;
function swordQ() { if (combo && !combo.dead) { combo.queue = true; return } if (player.cast || player.lock) return; combo = new SwordCombo(); actives.push(combo) }
class SwordCombo { // Q · 3연 베기: 1·2타는 빠르게, 3타는 짧은 누르기 뒤 크게(같은 문법의 압축)
  constructor() { this.R = ramp(WEAPONS.sword.skills.Q.hue); this.dead = false; this.queue = false; this.rb = new Ribbon(18, false, .55); this.rl = new Ribbon(18, true, .12); this.rg = new Ribbon(18, true, 1); this.start(0) }
  start(i) { const S = [{ a0: 1.35, a1: -1.35, f: 7, r: 1.75, w: 1.15, stop: 2, dmg: 1, wind: 3 }, { a0: -1.35, a1: 1.45, f: 7, r: 1.75, w: 1.15, stop: 2, dmg: 1, wind: 3 }, { a0: 2.1, a1: -2.3, f: 9, r: 2.25, w: 1.5, stop: 5, dmg: 2.2, wind: 7, big: true }][i];
    this.c = { ...S, t: 0, hit: new Set(), face: player.face, prev: S.a0, dip: S.big && PR.dip ? 1 : 0, s: WEAPONS.sword.skills.Q.size }; this.step = i; this.queue = false; player.faceLock = true; player.cast = S.wind + S.f + 2 }
  update() { const c = this.c, R = this.R, s = c.s; c.t++; const center = player.pos.clone().setY(1.05);
    if (c.t <= c.wind) { player.pose.swing += (c.a0 - player.pose.swing) * .5; player.pose.raise = c.big ? -.05 : -.2; if (c.t >= c.wind - 1) { const tp = tipWorld(); once({ pool: 'alpha', p: tp, s0: (c.big ? .7 : .4) * s, c0: rgba(R.core, 1), tex: PR.hardHead ? TILE.star : TILE.starSoft, rot: .3 }); once({ p: tp, s0: 1.2 * s, c0: rgba(R.body, .5), tex: TILE.glow }) } this.rb.hide(); this.rl.hide(); this.rg.hide(); return }
    const T = c.t - c.wind; if (c.dip && T === 1) { dimV = Math.max(dimV, .14); return }
    const u = Math.min(1, (T - c.dip) / c.f), e = 1 - Math.pow(1 - u, 2.2), a = c.a0 + (c.a1 - c.a0) * e; player.pose.swing = a;
    const span = (c.a1 - c.a0) * Math.min(e, .62), fade = u < 1 ? 1 : Math.max(0, 1 - (T - c.dip - c.f) / 8), n = 16, cs = c.big ? 1.25 : 1;
    if (fade > 0) { const P = arcPts(center, c.face, a - span, a, c.r * s, n); this.rb.mat.uniforms.soft.value = PR.hardHead ? .5 : .95; this.rb.set(P, P.map((_, i) => c.w * s * cs * (1 - i / n * .5)), arcCols(n, R, fade));
      const L = arcPts(center, c.face, a - span * .55, a, (c.r + c.w * .48) * s, 10); this.rl.mat.uniforms.soft.value = PR.hardHead ? .12 : .9; this.rl.set(L, L.map((_, i) => .09 * s * (1 - i / 10)), L.map((_, i) => rgba(R.core, (1 - i / 10) * fade)));
      this.rg.set(P, P.map(() => c.w * s * 2), P.map((_, i) => rgba(R.body, .22 * (1 - i / n) * fade))) } else { this.rb.hide(); this.rl.hide(); this.rg.hide() }
    if (u <= 1 && T - c.dip <= c.f) { const lo = Math.min(c.prev, a), hi = Math.max(c.prev, a);
      for (const en of alive()) { if (c.hit.has(en)) continue; const d = en.pos.clone().sub(player.pos); d.y = 0; const rel = wrap(angTo(player.pos, en.pos) - c.face);
        if (d.length() < (c.r + c.w * .5) * s + .55 && rel >= lo - .15 && rel <= hi + .15) { c.hit.add(en); slashHit(en.pos, R, c.big ? 1.3 : .9); damage(en, rnd(70, 95) * c.dmg, c.big ? 'big' : '', d.normalize().multiplyScalar(c.big ? 6 : 2)); hitStop(c.stop); shake(c.big ? .22 : .08); if (c.big) groundLight(en.pos, 4, R.body, 40, .4) } } c.prev = a }
    const end = c.wind + c.dip + c.f; if (c.t > end + 1 && this.queue && this.step < 2) return this.start(this.step + 1);
    if (c.t > end + 12) this.finish() }
  finish() { this.dead = true; [this.rb, this.rl, this.rg].forEach(r => r.dispose()); player.faceLock = false; player.pose.swing = 0; player.pose.raise = -.25; combo = null }
}
class SwordWave { // E · 검기: 휘두른 호가 그대로 날아간다. 관통, 잔상 2겹
  constructor() { this.cfg = WEAPONS.sword.skills.E; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; this.ribs = [0, 1, 2].map(i => new Ribbon(14, false, .5)); this.edge = new Ribbon(14, true, .12); this.glow = new Ribbon(14, true, 1); this.hit = new Set(); this.hist = []; player.cast = 12; player.faceLock = true }
  update() { this.t++; const R = this.R, s = this.cfg.size, W0 = 9;
    if (this.t <= W0) { player.pose.swing += (1.5 - player.pose.swing) * .4; const tp = tipWorld(); once({ p: tp, s0: (.6 + this.t * .1) * s, c0: rgba(R.body, .5), tex: TILE.glow }); if (this.t > W0 - 3) once({ pool: 'alpha', p: tp, s0: .55 * s, c0: rgba(R.core, 1), tex: PR.hardHead ? TILE.star : TILE.starSoft }); return }
    if (this.t === W0 + 1) { this.dir = dirOf(player.face); this.p = player.pos.clone().setY(1).addScaledVector(this.dir, 1.2); this.dist = 0; fxLaunch(this.p.clone(), R, .5); player.faceLock = false }
    if (this.t <= W0 + 4) player.pose.swing = 1.5 - 3 * (this.t - W0) / 4; else player.pose.swing *= .8;
    const step = this.cfg.speed / 60; this.p.addScaledVector(this.dir, step); this.dist += step; this.hist.unshift(this.p.clone()); if (this.hist.length > 9) this.hist.pop();
    const side = V3(-this.dir.z, 0, this.dir.x), rc = 1.7 * s, n = 14, crescent = (o, rr) => { const P = []; for (let i = 0; i < n; i++) { const th = -1.15 + 2.3 * i / (n - 1); P.push(o.clone().addScaledVector(this.dir, rr * Math.cos(th) - rr).addScaledVector(side, rr * Math.sin(th))) } return P };
    const fadeEnd = this.dist > 15 ? Math.max(0, 1 - (this.dist - 15) / 3) : 1, wid = i => .62 * s * Math.sin(Math.PI * i / (n - 1)) + .02;
    [0, 4, 8].forEach((h, k) => { const o = this.hist[Math.min(h, this.hist.length - 1)], P = crescent(o, rc), al = [1, .4, .18][k] * fadeEnd;
      this.ribs[k].set(P, P.map((_, i) => wid(i) * (1 - k * .15)), P.map((_, i) => { const u = Math.abs(i / (n - 1) - .5) * 2; return rgba(PR.tailDark ? (u < .35 ? mix(R.core, R.body, u / .35) : mix(R.body, R.edge, (u - .35) / .65)) : R.body, al * (PR.tailDark ? 1 : 1 - u * .6)) })) });
    const E = crescent(this.p.clone().addScaledVector(this.dir, .22 * s), rc * 1.04); this.edge.mat.uniforms.soft.value = PR.hardHead ? .12 : .9; this.edge.set(E, E.map((_, i) => .1 * s * Math.sin(Math.PI * i / (n - 1))), E.map(() => rgba(R.core, fadeEnd)));
    const G = crescent(this.p, rc); this.glow.set(G, G.map((_, i) => wid(i) * 3), G.map(() => rgba(R.body, .2 * fadeEnd)));
    groundLight(this.p, 3 * s, R.body, 1, .12 * fadeEnd);
    for (const en of alive()) { if (this.hit.has(en)) continue; const d = en.pos.clone().setY(1).sub(this.p), along = d.dot(this.dir), lat = d.dot(side); if (Math.abs(along) < .9 && Math.abs(lat) < rc + .3) { this.hit.add(en); slashHit(en.pos, R, 1); damage(en, rnd(110, 150), '', this.dir.clone().multiplyScalar(3)); hitStop(2); shake(.1) } }
    if (fadeEnd <= 0) { this.dead = true; [...this.ribs, this.edge, this.glow].forEach(r => r.dispose()); for (let i = 0; i < 10; i++) spawn({ p: this.p.clone().addScaledVector(side, rnd(-rc, rc)), v: this.dir.clone().multiplyScalar(rnd(2, 6)).add(V3(0, rnd(0, 2), 0)), life: 14, s0: [.06, .3], s1: [.02, .1], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.spark, stretch: .05 }) } }
}
class SwordDash { // R · 돌진 베기: 지나간 자리에 선을 남기고, 잠깐 멈춘 뒤 터진다(누르기 → 터짐)
  constructor(t) { this.cfg = WEAPONS.sword.skills.R; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; this.from = player.pos.clone(); const d = t.clone().sub(this.from); d.y = 0; if (d.length() < .3) d.copy(dirOf(player.face)); const L = Math.min(this.cfg.dist, Math.max(2, d.length())); this.dir = d.normalize(); this.to = this.from.clone().addScaledVector(this.dir, L);
    this.tele = new Ribbon(2, false, .3); this.line = new Ribbon(11, false, .35); this.lineG = new Ribbon(11, true, 1); this.core = null; player.lock = 40; player.faceLock = true; player.face = angTo(this.from, this.to) }
  update() { this.t++; const R = this.R, s = this.cfg.size, T0 = 8, D = 6, HOLD = 9;
    if (this.t <= T0) { telegraphLine(this.from, this.to, .5 * s, R, this.tele); player.pose.swing = .9; once({ p: tipWorld(), s0: .8 * s, c0: rgba(R.body, .5), tex: TILE.glow }); return }
    this.tele.hide();
    if (this.t <= T0 + D) { const u = (this.t - T0) / D; player.pos.copy(this.from).lerp(this.to, u); player.pose.swing = .9 - 2 * u;
      for (let i = 0; i < 2; i++) spawn({ pool: 'alpha', p: player.pos.clone().setY(.95), life: 16, s0: [.9, 1.9], s1: [.7, 1.7], c0: rgba(R.edge, .45), c1: rgba(R.haze, 0), tex: TILE.discSoft });
      spawn({ pool: 'galpha', p: player.pos.clone().setY(.03), life: 20, s0: 1, s1: .6, c0: rgba(dust(), .4), c1: rgba(dust(), 0), tex: TILE.smoke });
      if (this.t === T0 + D) { player.faceLock = false; for (let i = 0; i < 8; i++) spawn({ p: this.to.clone().setY(.4), v: V3(rnd(-3, 3), rnd(0, 2), rnd(-3, 3)), life: 18, s0: .6, s1: 1.4, c0: rgba(dust(), .45), c1: rgba(dust(), 0), tex: TILE.smoke, pool: 'alpha' }) } }
    const a = this.from.clone().setY(1), b = this.to.clone().setY(1), k = this.t - T0 - D;
    if (k > 0 && k <= HOLD + 14) { const pop = k > HOLD, u = pop ? (k - HOLD) / 14 : 0, f = pop ? 1 - u : 1, dip = PR.dip && k === HOLD, dm = dip ? .35 : 1;
      this.line.mat.uniforms.soft.value = PR.hardHead ? .2 : .9;
      if (!pop) { this.line.set([a, b], [.07 * s, .07 * s], [rgba(R.core, dm), rgba(R.core, dm)], true); this.lineG.set([a, b], [.7 * s, .7 * s], [rgba(R.body, .3 * dm), rgba(R.body, .3 * dm)], true) }
      else { const w = (.25 + 1.5 * (1 - Math.pow(1 - u, 3))) * s, col = PR.tailDark ? mix(R.body, R.edge, u) : R.body, N = 11, P = Array.from({ length: N }, (_, i) => a.clone().lerp(b, i / (N - 1))), tw = P.map((_, i) => Math.pow(Math.sin(Math.PI * (.04 + .92 * i / (N - 1))), .6)); this.line.set(P, tw.map(t => w * t), P.map(() => rgba(col, .95 * f)), true); this.lineG.set(P, tw.map(t => w * 2.2 * t), P.map(() => rgba(R.body, .25 * f)), true);
        if (k <= HOLD + 3) { this.core = this.core || new Ribbon(2, true, .3); this.core.set([a, b], [.12 * s, .12 * s], [rgba(R.core, 1), rgba(R.core, 1)], true) } else if (this.core) this.core.hide() }
      if (dip) dimV = Math.max(dimV, .12) }
    if (k === HOLD + 1) { const side = V3(-this.dir.z, 0, this.dir.x); for (let i = 0; i < 14; i++) { const q = a.clone().lerp(b, Math.random()); spawn({ p: q, v: side.clone().multiplyScalar(rnd(-8, 8)).add(V3(0, rnd(1, 4), 0)), life: 14, s0: [.06, .4], s1: [.03, .1], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.spark, stretch: .06 }) }
      let any = false; for (const en of alive()) { const ab = this.to.clone().sub(this.from), t = Math.max(0, Math.min(1, en.pos.clone().sub(this.from).dot(ab) / ab.lengthSq())), q = this.from.clone().addScaledVector(ab, t); if (q.distanceTo(en.pos.clone().setY(0)) < 1.1 * s) { any = true; slashHit(en.pos, R, 1.2); damage(en, rnd(200, 260), 'big', side.clone().multiplyScalar(rnd(-3, 3))) } }
      if (any) { hitStop(4); shake(.25) } groundLight(a.clone().lerp(b, .5), this.to.distanceTo(this.from), R.body, 30, .3) }
    if (k > HOLD + 15) { this.dead = true; [this.tele, this.line, this.lineG, this.core].forEach(r => r && r.dispose()); player.pose.swing = 0 } }
}
class SwordUlt { // F · 난무: 작은 1막(3번 베기) → 큰 2막(X자 베기 + 임팩트 프레임)
  constructor(t) { this.cfg = WEAPONS.sword.skills.F; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; const d = t.clone().sub(player.pos); d.y = 0; if (d.length() > 9) d.setLength(9); this.c = player.pos.clone().add(d).setY(0); player.cast = 40;
    const G = PR.grammar; this.A1 = G ? 20 : 0; this.d1 = PR.dip ? 4 : 0; this.a2s = G ? 50 : 0; this.A2 = G ? 52 : 24; this.d2 = PR.dip ? (G ? 1 : 3) : 0; this.slam = G ? 4 : 12; this.xs = [new Ribbon(2, false, .2), new Ribbon(2, false, .2), new Ribbon(2, true, 1), new Ribbon(2, true, 1)]; this.lines = [] }
  update() { this.t++; const R = this.R, t = this.t, s = this.cfg.size;
    if (this.A1 && t <= this.a2s) { const tp = tipWorld(); if (t <= this.A1) { player.pose.swing = 1.2; once({ p: tp, s0: (.5 + t * .05) * s, c0: rgba(R.body, .5), tex: TILE.glow }); for (let i = 0; i < 2; i++) { const q = tp.clone().add(V3(rnd(-2, 2), rnd(-1, 1.5), rnd(-2, 2))); spawn({ p: q, v: tp.clone().sub(q).multiplyScalar(3), life: 18, s0: [.05, .35], s1: [.02, .12], c0: rgba(R.body, 0), c1: rgba(R.core, 1), tex: TILE.spark, stretch: .05, ease: .6 }) } }
      const st = this.A1 + this.d1; if (t > this.A1 && t <= st) once({ p: tp, s0: .6, c0: rgba(R.edge, .2), tex: TILE.glow });
      [0, 1, 2].forEach(i => { if (t === st + 1 + i * 5) { const tg = alive().sort((a, b) => a.pos.distanceTo(player.pos) - b.pos.distanceTo(player.pos))[i]; player.pose.swing = i % 2 ? 1.3 : -1.3; if (tg && tg.pos.distanceTo(player.pos) < 9) { slashHit(tg.pos, R, 1); spawn({ pool: 'alpha', p: tg.pos.clone().setY(1.1), life: 10, s0: [.3, 3], s1: [.05, 3.6], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.line, rot: rnd(0, 3) }); damage(tg, rnd(90, 120), '', null); hitStop(2); shake(.1) } } });
      return }
    const T2 = t - this.a2s, c = this.c, k = Math.min(1, T2 / this.A2);
    if (T2 <= this.A2) { telegraphCircle(c, 5 * s, k, R); player.pose.raise = -.25 + 1.6 * k; player.pose.swing = 0; const tp = tipWorld(); once({ p: tp, s0: (.6 + 1.6 * k) * s, c0: rgba(R.body, .3 + .3 * k), tex: TILE.glow });
      for (let i = 0; i < 3; i++) { const a = rnd(0, 6.28), q = V3(c.x + Math.cos(a) * 5.5 * s, rnd(.3, 2), c.z + Math.sin(a) * 5.5 * s); spawn({ p: q, v: V3(c.x, 1, c.z).sub(q).multiplyScalar(2.4), life: 22, s0: [.06, .5], s1: [.03, .2], c0: rgba(R.body, 0), c1: rgba(R.core, 1), tex: TILE.spark, stretch: .05, ease: .6 }) }
      if (PR.sceneLight) { tintC = R.edge; tintA = Math.max(tintA, .14 * k) } camCharge(player.pos, c, k) }
    const ds = this.A2, de = ds + this.d2; if (T2 > ds && T2 <= de + this.slam - 1) { if (T2 <= de) dimV = Math.max(dimV, .22); camHold() }
    if (T2 > de && T2 <= de + this.slam) { const u = (T2 - de) / this.slam, L = 6 * s * u; player.pose.raise = 1.35 - 2 * u;
      [[.785, 0], [-.785, 1]].forEach(([ang, i]) => { const d = dirOf(ang), a = c.clone().setY(1).addScaledVector(d, -L), b = c.clone().setY(1).addScaledVector(d, L); this.xs[i].mat.uniforms.soft.value = PR.hardHead ? .15 : .9; this.xs[i].set([a, b], [.5 * s, .5 * s], [rgba(R.core, 1), rgba(R.core, 1)], true); this.xs[i + 2].set([a, b], [2.2 * s, 2.2 * s], [rgba(R.body, .4), rgba(R.body, .4)], true) }) }
    if (T2 === de + this.slam) this.boom();
    if (T2 > de + this.slam) { const f = Math.max(0, 1 - (T2 - de - this.slam) / 14); this.xs.forEach((r, i) => { if (f <= 0) r.hide(); else { const d = dirOf(i % 2 ? -.785 : .785), a = c.clone().setY(1).addScaledVector(d, -6 * s), b = c.clone().setY(1).addScaledVector(d, 6 * s); r.set([a, b], i < 2 ? [.5 * s * (1 + (1 - f) * 2), .5 * s * (1 + (1 - f) * 2)] : [2.2 * s, 2.2 * s], i < 2 ? [rgba(R.core, f), rgba(R.core, f)] : [rgba(R.body, .4 * f), rgba(R.body, .4 * f)], true) } }) }
    if (T2 > de + this.slam + 110) { this.dead = true; this.xs.forEach(r => r.dispose()); player.pose.raise = -.25 } }
  boom() { const R = this.R, c = V3(this.c.x, .9, this.c.z), s = this.cfg.size; fxImpact(c, R, 2 * s, { sparks: 30, smoke: 10, shards: 26 });
    for (let i = 0; i < 9; i++) { const a = rnd(0, 6.28), L = rnd(3, 6) * s; spawn({ pool: 'alpha', p: c.clone().add(V3(rnd(-1.5, 1.5), rnd(0, 1), rnd(-1.5, 1.5))), life: rnd(8, 14) | 0, s0: [L, .14], s1: [L * 1.2, .02], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.line, rot: a }) }
    if (PR.impactFrame) invF = 1; else flashV = .26; if (PR.sceneLight) { tintC = R.body; tintA = .3 } hitStop(6); shake(.55); camPeak(this.c, this.c.clone().sub(player.pos), { back: 5.5, side: 2.2, h: 2.8, lookY: .9 });
    for (const en of inRad(this.c, 5.5 * s)) { const d = en.pos.clone().sub(this.c); d.y = 0; damage(en, rnd(550, 750), 'big', d.normalize().multiplyScalar(12)) } }
}

// ============================== 활 ==============================
class Arrow { // 가늘고 긴 머리(하드) + 얇은 꼬리. 관통 옵션
  constructor(o) { Object.assign(this, { speed: 38, size: 1, pierce: false, dmg: [80, 110], range: 30, stop: 1, trail: 10, fx: .55 }, o); this.p = o.p.clone(); this.dir = o.dir.clone().normalize(); this.dist = 0; this.dead = false; this.hist = []; this.hit = new Set(); this.rb = new Ribbon(this.trail + 2, false, .6); this.rg = new Ribbon(this.trail + 2, true, 1); this.t = 0 }
  update() { this.t++; const R = this.R, s = this.size, step = this.speed / 60, nx = this.p.clone().addScaledVector(this.dir, step);
    if (this.vertical) { if (nx.y <= .05) return this.land(nx) } else { const h = nearestEnemyOnSeg(this.p, nx, .12 * s + .15); if (h && !this.hit.has(h.e)) { const q = this.p.clone().lerp(nx, h.t); this.hit.add(h.e); this.onHit(q, h.e); if (!this.pierce) return this.kill() } }
    this.p.copy(nx); this.dist += step; if (this.dist > this.range) { if (this.endBoom) this.endBoom(this.p.clone()); return this.kill() }
    this.hist.unshift(this.p.clone()); if (this.hist.length > this.trail) this.hist.pop();
    once({ pool: 'alpha', p: this.p, v: this.dir, s0: [.22 * s, 1.0 * s], c0: rgba(R.core, 1), tex: TILE.arrow, stretch: .0001 }); once({ p: this.p, s0: .9 * s, c0: rgba(R.body, .4), tex: TILE.glow });
    if (this.glint) once({ pool: 'alpha', p: this.p.clone().addScaledVector(this.dir, .45 * s), s0: .5 * s, c0: rgba(R.core, 1), tex: PR.hardHead ? TILE.star : TILE.starSoft });
    const n = this.hist.length; this.rb.set(this.hist, this.hist.map((_, i) => this.tw * s * (1 - i / n)), this.hist.map((_, i) => { const u = i / Math.max(1, n - 1); return PR.tailDark ? rgba(mix(R.body, R.edge, u), 1 - u * u) : rgba(R.body, 1 - u) }));
    this.rg.set(this.hist, this.hist.map((_, i) => this.tw * 3 * s * (1 - i / n)), this.hist.map((_, i) => rgba(R.body, .2 * (1 - i / n))));
    if (this.rings && this.t % 3 === 0) spawn({ pool: 'alpha', p: this.p.clone(), life: 12, s0: .5 * s, s1: 1.6 * s, c0: rgba(R.hi, .8), c1: rgba(R.edge, 0), tex: PR.hardHead ? TILE.ring : TILE.ringSoft }) }
  onHit(q, e) { const R = this.R; fxImpact(q, R, this.fx * this.size, { sparks: 8, smoke: 1 }); damage(e, rnd(this.dmg[0], this.dmg[1]), this.big ? 'big' : '', this.dir.clone().multiplyScalar(2)); hitStop(this.stop); shake(.06 + .05 * this.size) }
  land(q) { const R = this.R; q.y = .05; spawn({ p: q.clone().setY(.3), life: 6, s0: .5, s1: 1.2, c0: rgba(R.body, .6), c1: rgba(R.body, 0), tex: TILE.glow }); spawn({ pool: 'alpha', p: q.clone().setY(.3), v: V3(0, 1, 0), life: 22, s0: .5, s1: 1.2, c0: rgba(dust(), .45), c1: rgba(dust(), 0), tex: TILE.smoke });
    spawn({ pool: 'galpha', p: q, life: 40, s0: .35, s1: .35, c0: [0, 0, 0, .4], c1: [0, 0, 0, 0], tex: TILE.discSoft }); for (const e of inRad(q, .5)) damage(e, rnd(35, 50), 'tick', null); this.kill() }
  kill() { this.dead = true; this.rb.dispose(); this.rg.dispose() }
}
class BowShot { constructor() { this.cfg = WEAPONS.bow.skills.Q; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; player.cast = 6 }
  update() { this.t++; const R = this.R; player.pose.draw = Math.min(1, this.t / 5); once({ p: tipWorld(), s0: .5 + this.t * .08, c0: rgba(R.body, .45), tex: TILE.glow });
    if (this.t === 6) { player.pose.draw = 0; const p = tipWorld(), d = aim.clone().setY(p.y).sub(p); fxLaunch(p, R, .35); actives.push(new Arrow({ p, dir: d, R, speed: this.cfg.speed, size: this.cfg.size, tw: .1 })); this.dead = true } } }
class BowCharge { // E · 차징 샷: 누를수록 커지고, 놓으면 관통(모으기 길수록 맞히기 셈)
  constructor() { this.cfg = WEAPONS.bow.skills.E; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; this.release = false; player.slow = .6 }
  update() { this.t++; const R = this.R, k = Math.min(1, this.t / 60), s = this.cfg.size, p = tipWorld(); player.pose.draw = .3 + .7 * k;
    if ((!this.release || this.t < 10) && this.t < 150) { once({ p, s0: (.6 + 2 * k) * s, c0: rgba(R.body, .35 + .35 * k), tex: TILE.glow }); if (PR.telegraph) once({ pool: 'galpha', p: player.pos.clone().setY(.04), s0: (2.6 - 1.7 * k) * 2, c0: rgba(R.edge, .7), tex: TILE.ringThin });
      for (let i = 0; i < 2; i++) { const q = p.clone().add(V3(rnd(-1.8, 1.8), rnd(-1, 1.5), rnd(-1.8, 1.8))); spawn({ p: q, v: p.clone().sub(q).multiplyScalar(3), life: 16, s0: [.05, .3], s1: [.02, .1], c0: rgba(R.body, 0), c1: rgba(R.core, 1), tex: TILE.spark, stretch: .05, ease: .6 }) }
      if (k >= 1 && this.t % 10 < 5) once({ pool: 'alpha', p, s0: .7 * s, c0: rgba(R.core, 1), tex: PR.hardHead ? TILE.star : TILE.starSoft }); return }
    const d = aim.clone().setY(p.y).sub(p), sz = (1 + 1.3 * k) * s; fxLaunch(p, R, .4 + .6 * k); player.pose.draw = 0; shake(.06 + .12 * k);
    actives.push(new Arrow({ p, dir: d, R, speed: 50, size: sz, tw: .16 + .2 * k, pierce: true, dmg: [120 + 240 * k, 160 + 260 * k], stop: k > .9 ? 3 : 2, rings: k > .5, glint: true, trail: 14, fx: .7, big: k > .9 }));
    this.dead = true; endHold('E') }
}
class ArrowRain { // R · 화살비: 범위 표시 → 위로 쏘기 → 30f 동안 쏟아짐
  constructor(t) { this.cfg = WEAPONS.bow.skills.R; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; const d = t.clone().sub(player.pos); d.y = 0; if (d.length() > 13) d.setLength(13); this.c = player.pos.clone().add(d).setY(0); player.cast = 10 }
  update() { this.t++; const R = this.R, r = this.cfg.radius * this.cfg.size;
    if (this.t <= 52) telegraphCircle(this.c, r, Math.min(1, this.t / 18), R);
    if (this.t === 8) { const p = tipWorld(); fxLaunch(p, R, .45); actives.push(new Arrow({ p, dir: V3(0, 1, 0), R, speed: 40, tw: .1, range: 9 })) }
    if (this.t > 18 && this.t <= 50) for (let i = 0; i < (this.t % 2 ? 1 : 2); i++) { const a = rnd(0, 6.28), d = Math.sqrt(Math.random()) * r, q = V3(this.c.x + Math.cos(a) * d, 9, this.c.z + Math.sin(a) * d); actives.push(new Arrow({ p: q, dir: V3(.08, -1, .05), R, speed: 34, size: .8, tw: .07, vertical: true, trail: 6, range: 12 })) }
    if (this.t === 50) groundLight(this.c, r * 2.2, R.body, 40, .25);
    if (this.t > 60) this.dead = true }
}
class BowUlt { // F · 폭렬 화살: 1막 부채꼴 3발 → 2막 거대 화살이 4f 만에 끝까지
  constructor(t) { this.cfg = WEAPONS.bow.skills.F; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; player.cast = 30; const G = PR.grammar; this.A1 = G ? 20 : 0; this.d1 = PR.dip ? 4 : 0; this.a2s = G ? 46 : 0; this.A2 = G ? 52 : 24; this.d2 = PR.dip ? (G ? 1 : 3) : 0; this.slam = G ? 4 : 14; this.tele = new Ribbon(2, false, .3); this.beam = new Ribbon(2, true, .6); this.beamC = new Ribbon(2, false, .3) }
  update() { this.t++; const R = this.R, t = this.t, s = this.cfg.size;
    if (this.A1 && t <= this.a2s) { const p = tipWorld(); if (t <= this.A1) { player.pose.draw = t / this.A1; once({ p, s0: .6 + t * .05, c0: rgba(R.body, .45), tex: TILE.glow }) }
      if (t === this.A1 + this.d1 + 1) { player.pose.draw = 0; const base = aim.clone().setY(p.y).sub(p).normalize(); [-.28, 0, .28].forEach(o => { const d = base.clone().applyAxisAngle(up, o); actives.push(new Arrow({ p, dir: d, R, speed: 40, tw: .1, dmg: [70, 90] })) }); fxLaunch(p, R, .5) } return }
    const T2 = t - this.a2s, p = tipWorld(); if (T2 === 1) { this.dir = aim.clone().setY(p.y).sub(p).normalize(); this.p0 = p.clone(); this.p1 = p.clone().addScaledVector(this.dir, Math.max(8, Math.min(14, aim.distanceTo(p.clone().setY(0)) + 2))); player.lock = this.A2 + this.d2 + this.slam + 6; player.faceLock = true; player.face = angTo(player.pos, this.p1) }
    const k = Math.min(1, T2 / this.A2); if (T2 <= this.A2) { player.pose.draw = k; telegraphLine(this.p0, this.p1, 1.4 * s, R, this.tele); once({ p, s0: (.8 + 3 * k) * s, c0: rgba(R.body, .3 + .35 * k), tex: TILE.glow }); once({ pool: 'alpha', p, s0: (.3 + .6 * k) * s, c0: rgba(R.core, 1), tex: PR.hardHead ? TILE.disc : TILE.discSoft });
      for (let i = 0; i < 3; i++) { const q = this.p0.clone().addScaledVector(this.dir, rnd(1, 10)).add(V3(rnd(-2, 2), rnd(-.5, 2), rnd(-2, 2))); spawn({ p: q, v: p.clone().sub(q).multiplyScalar(2.2), life: 24, s0: [.06, .5], s1: [.03, .2], c0: rgba(R.body, 0), c1: rgba(R.core, 1), tex: TILE.spark, stretch: .05, ease: .6 }) } if (PR.sceneLight) { tintC = R.edge; tintA = Math.max(tintA, .12 * k) } camCharge(this.p0, this.p1, k); return }
    this.tele.hide(); const ds = this.A2, de = ds + this.d2; if (T2 > ds && T2 < de + this.slam) camHold(); if (T2 > ds && T2 <= de) { dimV = Math.max(dimV, .22); return }
    if (T2 > de && T2 <= de + this.slam) { const u = (T2 - de) / this.slam, tip = this.p0.clone().lerp(this.p1, u); player.pose.draw = 0; this.beam.set([this.p0, tip], [2.4 * s, 1.6 * s], [rgba(R.body, .35), rgba(R.body, .8)]); this.beamC.set([this.p0, tip], [.25 * s, .6 * s], [rgba(R.core, .7), rgba(R.core, 1)]); once({ pool: 'alpha', p: tip, v: this.dir, s0: [.6 * s, 2.6 * s], c0: rgba(R.core, 1), tex: TILE.arrow, stretch: .0001 }) }
    if (T2 === de + this.slam) { player.faceLock = false; const R2 = R, end = this.p1.clone(); fxImpact(end, R2, 2 * s, { sparks: 30, smoke: 12, shards: 20 }); if (PR.impactFrame) invF = 1; else flashV = .26; if (PR.sceneLight) { tintC = R.body; tintA = .28 } hitStop(6); shake(.5); camPeak(end, this.dir, { back: 5, side: 2.4, h: 2.4, lookY: 1 });
      for (const e of alive()) { const ab = this.p1.clone().sub(this.p0).setY(0), t2 = Math.max(0, Math.min(1, e.pos.clone().sub(this.p0).setY(0).dot(ab) / ab.lengthSq())), q = this.p0.clone().setY(0).addScaledVector(ab, t2); const dl = q.distanceTo(e.pos.clone().setY(0)), de2 = e.pos.distanceTo(end.clone().setY(0)); if (dl < 1.3 * s || de2 < 4 * s) damage(e, de2 < 4 * s ? rnd(550, 700) : rnd(250, 320), 'big', e.pos.clone().sub(end).setY(0).normalize().multiplyScalar(10)) } }
    if (T2 > de + this.slam) { const f = Math.max(0, 1 - (T2 - de - this.slam) / 16); if (f <= 0) { this.beam.hide(); this.beamC.hide() } else { this.beam.set([this.p0, this.p1], [2.4 * s * (1 + (1 - f)), 1.6 * s], [rgba(R.body, .35 * f), rgba(R.body, .6 * f)]); this.beamC.set([this.p0, this.p1], [.25 * s * f, .6 * s * f], [rgba(R.core, f), rgba(R.core, f)]) } }
    if (T2 > de + this.slam + 100) { this.dead = true;[this.tele, this.beam, this.beamC].forEach(r => r.dispose()) } }
}

// ============================== 망치 ==============================
// 무게가 핵심: 긴 들어올림(모으기) → 아주 짧은 내려침(맞히기) → 긴 히트스톱 · 균열 · 먼지 · 파편
function hammerImpact(p, R, s, o = {}) { const q = V3(p.x, .5, p.z);
  spawn({ p: q, life: 9, s0: 2 * s, s1: 3.4 * s, c0: rgba(R.body, .6), c1: rgba(R.body, 0), tex: TILE.glow, ease: .6 });
  spawn({ pool: 'alpha', p: q.clone().setY(.6), life: 5, s0: 1.4 * s, s1: .4 * s, c0: rgba(R.core, 1), c1: rgba(R.core, 0), tex: PR.hardHead ? TILE.star : TILE.starSoft, rot: rnd(0, 6) });
  spawn({ pool: 'gadd', p: V3(p.x, .06, p.z), life: 12, s0: .6 * s, s1: 5.5 * s, c0: rgba(R.hi, .95), c1: rgba(R.edge, 0), tex: PR.hardHead ? TILE.ring : TILE.ringSoft, ease: .5 });
  cracks(p, R, Math.min(6.5, 2.8 * s * (o.crack || 1))); dustRing(p, 4.5 * s * (o.crack || 1)); rocks(p, o.rocks || 10, s, R); groundLight(p, 4.5 * s, R.body, 40, .3); decal(p, 2.6 * s, 120) }
class HammerSmash { // Q · 내려찍기
  constructor() { this.cfg = WEAPONS.hammer.skills.Q; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; this.face = player.face; player.lock = 30; player.faceLock = true; this.W = 16 }
  update() { this.t++; const R = this.R, s = this.cfg.size, W0 = this.W, dip = PR.dip ? 1 : 0;
    if (this.t <= W0) { const u = this.t / W0; player.pose.raise = -.55 + 2.9 * (1 - Math.pow(1 - u, 2)); if (this.t > W0 - 5) once({ pool: 'alpha', p: tipWorld(), s0: .6 * s, c0: rgba(R.core, 1), tex: PR.hardHead ? TILE.star : TILE.starSoft, rot: this.t }); if (this.t % 3 === 0) spawn({ p: tipWorld(), life: 10, s0: .5, s1: 1, c0: rgba(R.body, .4), c1: rgba(R.body, 0), tex: TILE.glow }); return }
    if (dip && this.t === W0 + 1) { dimV = Math.max(dimV, .12); return }
    const k = this.t - W0 - dip; if (k <= 3) { player.pose.raise = 2.35 - 3.1 * (k / 3); if (k === 3) { const p = tipWorld().setY(0); hammerImpact(p, R, 1.1 * s); hitStop(6); shake(.38);
      for (const e of inRad(p, 2.2 * s)) { const d = e.pos.clone().sub(p); d.y = 0; damage(e, rnd(180, 240), 'big', d.normalize().multiplyScalar(7).add(V3(0, 0, 0))) } } return }
    if (k > 3) player.pose.raise += (-.55 - player.pose.raise) * .15; if (k > 22) { this.dead = true; player.faceLock = false } }
}
class HammerSpin { // E · 회전(누르는 동안)
  constructor() { this.cfg = WEAPONS.hammer.skills.E; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; this.release = false; this.rb = new Ribbon(20, false, .6); this.rg = new Ribbon(20, true, 1); player.slow = .5; player.faceLock = true; this.a = 0 }
  update() { this.t++; const R = this.R, s = this.cfg.size, w = Math.min(1, this.t / 12) * .36; this.a += w; player.pose.swing = this.a; player.pose.raise = -.1;
    const c = player.pos.clone().setY(.85), r = 1.7 * s, span = Math.min(this.a, 3.4), n = 18;
    const P = []; for (let i = 0; i < n; i++) { const ang = player.face + this.a - span * i / (n - 1); P.push(c.clone().addScaledVector(dirOf(ang), r)) }
    this.rb.mat.uniforms.soft.value = PR.hardHead ? .5 : .95; this.rb.set(P, P.map((_, i) => .75 * s * (1 - i / n * .6)), arcCols(n, R, 1), true); this.rg.set(P, P.map(() => 1.6 * s), P.map((_, i) => rgba(R.body, .18 * (1 - i / n))), true);
    if (this.t % 4 === 0) spawn({ pool: 'alpha', p: P[0].clone().setY(.2), v: V3(rnd(-1, 1), rnd(.5, 1.5), rnd(-1, 1)), life: 26, s0: .6, s1: 1.6, c0: rgba(dust(), .4), c1: rgba(dust(), 0), tex: TILE.smoke, rot: rnd(0, 6) });
    if (this.t % 12 === 0) for (const e of inRad(player.pos, 2.3 * s)) { slashHit(e.pos, R, .7); damage(e, rnd(40, 60), 'tick', e.pos.clone().sub(player.pos).setY(0).normalize().multiplyScalar(2.5)); shake(.05) }
    if ((this.release && this.t > 20) || this.t > 160) { this.dead = true; this.rb.dispose(); this.rg.dispose(); player.faceLock = false; player.pose.swing = 0; player.pose.raise = -.55; endHold('E') } }
}
class HammerLeap { // R · 도약 강타: 착지 지점 표시 → 포물선 도약 → 착지 직전 누르기 → 쾅
  constructor(t) { this.cfg = WEAPONS.hammer.skills.R; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; this.from = player.pos.clone(); const d = t.clone().sub(this.from); d.y = 0; if (d.length() > 10) d.setLength(10); this.to = this.from.clone().add(d); player.lock = 60; player.faceLock = true; player.face = angTo(this.from, this.to); this.N = 24 }
  update() { this.t++; const R = this.R, s = this.cfg.size, N = this.N, dip = PR.dip ? 1 : 0;
    if (this.t <= N + dip) telegraphCircle(this.to, 3 * s, Math.min(1, this.t / N), R);
    if (this.t <= 4) { player.pose.raise = -.55 + .6 * this.t / 4; if (this.t === 4) dustRing(this.from, 2) ; return }
    if (this.t <= N) { const u = (this.t - 4) / (N - 4); player.pos.copy(this.from).lerp(this.to, u); player.pose.lift = 3.4 * Math.sin(Math.PI * u) * (u < .85 ? 1 : 1); player.pose.raise = .05 + 2.3 * Math.min(1, u * 1.6); once({ p: tipWorld(), s0: (.5 + u) * s, c0: rgba(R.body, .4), tex: TILE.glow }); return }
    if (dip && this.t === N + 1) { player.pose.lift = 0; dimV = Math.max(dimV, .14); return }
    const k = this.t - N - dip; if (k === 1) { player.pose.lift = 0; player.pos.copy(this.to); player.pose.raise = -.75; hammerImpact(this.to, R, 1.6 * s, { crack: 1.4, rocks: 18 }); for (let i = 0; i < 6; i++) cracks(this.to.clone().add(dirOf(i / 6 * 6.28 + rnd(-.2, .2)).multiplyScalar(rnd(2, 3.4) * s)), R, 1.8 * s);
      hitStop(7); shake(.55); for (const e of inRad(this.to, 3.2 * s)) { const d = e.pos.clone().sub(this.to); d.y = 0; damage(e, rnd(260, 340), 'big', d.normalize().multiplyScalar(10)) } }
    if (k > 1) player.pose.raise += (-.55 - player.pose.raise) * .12; if (k > 26) { this.dead = true; player.faceLock = false } }
}
class HammerQuake { // F · 지진: 1막 작은 내려찍기 → 2막 긴 들어올림 → 내려침 → 사방으로 균열·가시가 굴러 나간다
  constructor() { this.cfg = WEAPONS.hammer.skills.F; this.R = ramp(this.cfg.hue); this.t = 0; this.dead = false; this.c = player.pos.clone(); player.lock = 160; player.faceLock = true; const G = PR.grammar; this.A1 = G ? 20 : 0; this.d1 = PR.dip ? 4 : 0; this.a2s = G ? 46 : 0; this.A2 = G ? 52 : 26; this.d2 = PR.dip ? (G ? 1 : 3) : 0; this.slam = G ? 3 : 10; this.wave = -1; this.hit = new Set() }
  update() { this.t++; const R = this.R, t = this.t, s = this.cfg.size, fwd = dirOf(player.face);
    if (this.A1 && t <= this.a2s) { if (t <= this.A1) player.pose.raise = -.55 + 2.6 * t / this.A1; const st = this.A1 + this.d1;
      if (t > st && t <= st + 2) player.pose.raise = 2.05 - 2.6 * (t - st) / 2; if (t === st + 2) { const p = tipWorld().setY(0); hammerImpact(p, R, .9 * s); hitStop(3); shake(.25); for (const e of inRad(p, 2 * s)) damage(e, rnd(120, 160), '', e.pos.clone().sub(p).setY(0).normalize().multiplyScalar(5)) }
      if (t > st + 2) player.pose.raise += (-.55 - player.pose.raise) * .2; return }
    const T2 = t - this.a2s, k = Math.min(1, T2 / this.A2);
    if (T2 <= this.A2) { player.pose.raise = -.55 + 3 * Math.min(1, k * 1.4); const tp = tipWorld(); once({ p: tp, s0: (.6 + 2.4 * k) * s, c0: rgba(R.body, .3 + .4 * k), tex: TILE.glow }); if (k > .5) once({ pool: 'alpha', p: tp, s0: .5 + .6 * k, c0: rgba(R.core, 1), tex: PR.hardHead ? TILE.star : TILE.starSoft, rot: T2 * .1 });
      if (T2 % 9 === 0) cracks(this.c.clone().add(dirOf(rnd(0, 6.28)).multiplyScalar(rnd(1, 3) * k)), R, (1 + 1.5 * k) * s, 50);
      if (T2 % 3 === 0) { const a = rnd(0, 6.28), q = this.c.clone().add(V3(Math.cos(a) * 4, .2, Math.sin(a) * 4)); spawn({ pool: 'alpha', p: q, v: this.c.clone().sub(q).multiplyScalar(.8).add(V3(0, .6, 0)), life: 30, s0: .8, s1: 1.8, c0: rgba(dust(), .35), c1: rgba(dust(), 0), tex: TILE.smoke }) }
      telegraphCircle(this.c, 9 * s, k, R, false); if (PR.sceneLight) { tintC = R.edge; tintA = Math.max(tintA, .14 * k) } camCharge(this.c, this.c, k); return }
    const ds = this.A2, de = ds + this.d2; if (T2 > ds && T2 < de + this.slam) camHold(); if (T2 > ds && T2 <= de) { dimV = Math.max(dimV, .22); return }
    if (T2 > de && T2 <= de + this.slam) { player.pose.raise = 2.45 - 3.2 * (T2 - de) / this.slam; if (T2 === de + this.slam) this.boom(); return }
    if (this.wave >= 0) { this.wave++; const w = this.wave; if (w % 3 === 0 && w <= 27) { const dist = 1.6 + w * .4; for (let i = 0; i < 6; i++) { const q = this.c.clone().add(dirOf(i / 6 * 6.28 + .3).multiplyScalar(dist * s)); spike(q, R, (1.25 - w / 45) * s); if (w % 6 === 0) cracks(q, R, 1.5 * s, 70);
          for (const e of inRad(q, .9)) { if (this.hit.has(e)) continue; this.hit.add(e); damage(e, rnd(160, 220), '', V3(0, 0, 0)); e.vel.add(e.pos.clone().sub(this.c).setY(0).normalize().multiplyScalar(4)) } } } }
    player.pose.raise += (-.55 - player.pose.raise) * .1; if (T2 > de + this.slam + 120) { this.dead = true; player.faceLock = false } }
  boom() { const R = this.R, s = this.cfg.size, p = tipWorld().setY(0); hammerImpact(p, R, 2 * s, { crack: 1.5, rocks: 26 });
    spawn({ pool: 'gadd', p: V3(p.x, .07, p.z), life: 18, s0: 1, s1: 17 * s, c0: rgba(R.hi, .9), c1: rgba(R.edge, 0), tex: PR.hardHead ? TILE.ringThin : TILE.ringSoft, ease: .5 });
    if (PR.impactFrame) invF = 1; else flashV = .26; if (PR.sceneLight) { tintC = R.body; tintA = .3 } hitStop(7); shake(.7); this.wave = 0; camPeak(p, dirOf(player.face), { back: 1.2, side: 5, h: 1.8, lookY: .6, fov: 44 });
    for (const e of inRad(p, 3 * s)) { this.hit.add(e); damage(e, rnd(500, 650), 'big', e.pos.clone().sub(p).setY(0).normalize().multiplyScalar(12)) } }
}

// ============================== 캐릭터 리그 · 스킬 애니메이션 ==============================
// 동작도 이펙트와 같은 문법을 쓴다: 예비동작(모으기)은 길게 → 동작(맞히기)은 짧게 → 따라가기 자세를 잠깐 유지 → 천천히 복귀.
// 히트스톱 동안에는 시뮬레이션이 멈추므로 자세도 그 자리에서 멈춘다(타격 순간이 자세로 남는다).
// 팔·다리는 2관절 IK: 손은 무기 손잡이, 발은 바닥을 따라간다. 스킬 클래스는 건드리지 않고 아래 ANIM 표가 스킬의 진행 상태를 읽어 자세를 정한다.
const RIG = (() => {
  const m = player.mat; m.color.setRGB(...lch(62, 7, 240));
  const mD = new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(40, 9, 245)) }), mA = new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(74, 40, 200)) });
  const L = () => new THREE.MeshLambertMaterial({ color: 0xffffff }), M = { skin: L(), hair: L(), hair2: L(), outfit: m, outfit2: new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), accent: mA, legs: L(), boots: L() };
  player.g.children.slice().forEach(c => { if (c !== wpnRoot) player.g.remove(c) });
  const hips = new THREE.Group(); player.g.add(hips);
  const torso = new THREE.Group(); torso.rotation.order = 'YXZ'; hips.add(torso);
  const cap = (r, L, mat, parent) => { const g = new THREE.CapsuleGeometry(r, L, 4, 10); g.translate(0, -L / 2, 0); const mesh = new THREE.Mesh(g, mat); (parent || scene).add(mesh); return mesh };
  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(.17, 14, 10), mD); pelvis.scale.set(1.25, .75, .9); hips.add(pelvis);
  const chest = cap(.19, .3, m, torso); chest.rotation.x = Math.PI; chest.position.y = .08; chest.scale.set(1.25, 1, .82);
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(.215, .215, .07, 16), mA); belt.position.y = .1; belt.scale.z = .85; torso.add(belt);
  const head = new THREE.Group(); head.position.y = .72; torso.add(head);
  head.add(new THREE.Mesh(new THREE.SphereGeometry(.19, 16, 12), M.skin)); head.scale.setScalar(1.12); // 머리를 조금 크게: 미소녀 비례
  const hairG = new THREE.Group(); head.add(hairG); const skirtG = new THREE.Group(); hips.add(skirtG); const extraG = new THREE.Group(); torso.add(extraG);
  pelvis.material = M.outfit2;
  const uaL = cap(.068, .29, m), faL = cap(.056, .28, m), uaR = cap(.068, .29, m), faR = cap(.056, .28, m);
  const hdL = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), mD), hdR = hdL.clone(); scene.add(hdL, hdR);
  const thL = cap(.088, .44, mD), shL2 = cap(.072, .43, mD), thR = cap(.088, .44, mD), shR2 = cap(.072, .43, mD);
  const ftL = new THREE.Mesh(new THREE.BoxGeometry(.14, .08, .28), mD), ftR = ftL.clone(); scene.add(ftL, ftR);
  [uaL, faL, uaR, faR, hdL, hdR, thL, shL2, thR, shR2, ftL, ftR].forEach(o => o.frustumCulled = false);
  faL.material = faR.material = M.skin; hdL.material = hdR.material = M.skin; thL.material = thR.material = M.legs; shL2.material = shR2.material = M.boots; ftL.material = ftR.material = M.boots;
  torso.add(wpnRoot);
  return { M, mats: Object.values(M), hairG, skirtG, extraG, tails: [], backHair: null, hips, torso, head, shL: V3(-.26, .47, 0), shR: V3(.26, .47, 0), hpL: V3(-.12, -.04, 0), hpR: V3(.12, -.04, 0), uaL, faL, uaR, faR, hdL, hdR, thL, shL2, thR, shR2, ftL, ftR,
    A: { twist: 0, crouch: 0, lean: 0, stance: 0, reach: 0, reachUp: 0, bothUp: 0, walk: 0, phase: 0, sway: 0, last: player.pos.clone(), mv: V3(0, 0, -1) }, hL: V3(0, 1, 0), hR: V3(0, 1, 0) };
})();
// ---------- 캐릭터 외형: 무기마다 다른 OS 아가씨 ----------
// 색은 tachie/ 스탠딩 일러스트(AI 생성, 90년대 셀화)에서 뽑은 Lab LCh. 페네: 분홍 트윈테일·흰 세일러복·남색 치마·청록 스카프·루즈삭스
// 말루스: 민트 단발·사과잎·흰 투명 레인코트·파랑 단추 / 아델리: 검정 단발·검정 후디(흰 앞판)·주황 스카프·검정 니삭스·주황 부츠 / 프롬: 검정 히메컷·남보라 롱코트·주황 테두리
const CHARS = {
  staff: { id: 'fene', name: '페네', skin: [88, 12, 65], hair: [68, 52, 358], hair2: [92, 10, 320], outfit: [95, 2, 270], outfit2: [24, 42, 298], accent: [72, 38, 194], legs: [88, 12, 65], boots: [93, 3, 270], eye: [46, 48, 285], style: 'twin', skirt: [.2, .37, .3] },
  sword: { id: 'malus', name: '말루스', skin: [90, 14, 70], hair: [80, 22, 178], hair2: [48, 55, 138], outfit: [95, 3, 240], outfit2: [90, 6, 235], accent: [45, 45, 272], legs: [90, 14, 70], boots: [94, 3, 240], eye: [50, 40, 265], style: 'bob', skirt: [.2, .33, .26] },
  bow: { id: 'adelie', name: '아델리', skin: [90, 10, 55], hair: [12, 5, 220], hair2: [96, 3, 220], outfit: [20, 10, 235], outfit2: [22, 8, 240], accent: [70, 72, 66], legs: [18, 6, 260], boots: [72, 72, 68], eye: [55, 40, 150], style: 'short', skirt: [.2, .27, .18], scarf: true, belly: true },
  hammer: { id: 'prom', name: '프롬', skin: [90, 9, 58], hair: [10, 3, 290], hair2: [74, 70, 70], outfit: [26, 20, 295], outfit2: [22, 18, 295], accent: [72, 72, 68], legs: [14, 4, 290], boots: [14, 4, 290], eye: [60, 60, 62], style: 'long', skirt: [.22, .41, .6] },
};
const capGeo = (r, L) => { const g = new THREE.CapsuleGeometry(r, L, 4, 10); g.translate(0, -L / 2, 0); return g };
function dress(w) { const C = CHARS[w], M = RIG.M; if (!C) return;
  for (const k of ['skin', 'hair', 'hair2', 'outfit', 'outfit2', 'accent', 'legs', 'boots']) M[k].color.setRGB(...lch(...C[k]));
  for (const g of [RIG.hairG, RIG.skirtG, RIG.extraG]) while (g.children.length) g.remove(g.children[0]);
  RIG.tails = []; RIG.backHair = null; const H = RIG.hairG, mk = (geo, mat, parent = H) => { const o = new THREE.Mesh(geo, mat); parent.add(o); return o };
  const dome = mk(new THREE.SphereGeometry(.212, 18, 12, 0, Math.PI * 2, 0, Math.PI * (C.style === 'bob' ? .7 : .56)), M.hair); dome.rotation.x = .3; // 뒤는 낮게, 이마는 보이게
  mk(new THREE.SphereGeometry(.216, 18, 6, Math.PI * 1.1, Math.PI * .8, Math.PI * .2, Math.PI * .27), C.bangs2 ? M.hair2 : M.hair); // 앞머리: 이마 위 띠(bangs2면 두 번째 머리색. 아델리는 새 그림에서 앞머리도 검정이라 끔. hair2는 펭귄 배 흰 앞판에 쓴다)
  const eyeM = new THREE.MeshBasicMaterial({ color: new THREE.Color(...lch(...(C.eye || [30, 30, 260]))) }); for (const sx of [-1, 1]) { const ey = mk(new THREE.SphereGeometry(.03, 8, 6), eyeM); ey.scale.set(1, 1.5, .5); ey.position.set(sx * .068, -.015, -.182) } // 눈
  const tail = (x, y, z, s, r, len, mat, parent = H) => { const piv = new THREE.Group(); piv.position.set(x, y, z); piv.userData.s = s; parent.add(piv); mk(capGeo(r, len), mat, piv); RIG.tails.push(piv); return piv };
  if (C.style === 'twin') { for (const s of [-1, 1]) { const p = tail(.17 * s, .07, .05, s, .07, .46, M.hair); mk(new THREE.SphereGeometry(.05, 8, 6), M.accent, p) }
    const clip = mk(new THREE.BoxGeometry(.085, .085, .02), M.accent); clip.position.set(.12, .15, -.13); clip.rotation.set(.3, .4, 0); const bar = mk(new THREE.BoxGeometry(.09, .012, .024), M.outfit); bar.position.copy(clip.position); bar.rotation.copy(clip.rotation) } // 창틀 머리핀
  if (C.style === 'bob') { const leaf = mk(new THREE.SphereGeometry(.065, 8, 6), M.hair2); leaf.scale.set(1, .22, .5); leaf.position.set(.03, .24, -.02); leaf.rotation.z = .7 } // 사과잎 더듬이
  if (C.style === 'short') { const back = mk(new THREE.SphereGeometry(.17, 12, 8), M.hair); back.position.set(0, -.03, .07); back.scale.set(1.12, .9, .8) }
  if (C.style === 'long') { const piv = new THREE.Group(); piv.position.set(0, .04, .1); H.add(piv); const g = new THREE.BoxGeometry(.36, .98, .07); g.translate(0, -.48, 0); mk(g, M.hair, piv); const st = new THREE.BoxGeometry(.035, .92, .076); st.translate(.11, -.46, 0); mk(st, M.hair2, piv); RIG.backHair = piv } // 앰버 한 줄: 옛 모니터
  const [t0, b0, h0] = C.skirt, sg = new THREE.CylinderGeometry(t0, b0, h0, 18, 1, true); sg.translate(0, -h0 / 2, 0); const sk = mk(sg, M.outfit2, RIG.skirtG); sk.scale.z = .86; RIG.skirtG.position.y = .06;
  if (C.scarf) { const sc = mk(new THREE.TorusGeometry(.13, .05, 8, 18), M.accent, RIG.extraG); sc.rotation.x = Math.PI / 2; sc.position.y = .6; tail(.08, .58, .12, 0, .045, .28, M.accent, RIG.extraG) }
  if (C.belly) { const b = mk(new THREE.SphereGeometry(.15, 12, 8), M.hair2, RIG.extraG); b.position.set(0, .3, -.13); b.scale.set(1, 1.3, .4) } }
const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _eu = new THREE.Euler(0, 0, 0, 'YXZ'), DOWN = V3(0, -1, 0);
const sm01 = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x) };
function ik2(S, T, a, b, pole) { const d = T.clone().sub(S); let L = d.length(); if (L < 1e-4) return { E: S.clone().addScaledVector(pole, a), T: T.clone() };
  const dir = d.divideScalar(L); L = Math.min(L, a + b - 1e-3); const x = (a * a - b * b + L * L) / (2 * L), h = Math.sqrt(Math.max(0, a * a - x * x));
  const pp = pole.clone().addScaledVector(dir, -pole.dot(dir)); if (pp.lengthSq() < 1e-6) pp.set(0, -1, 0); pp.normalize();
  return { E: S.clone().addScaledVector(dir, x).addScaledVector(pp, h), T: S.clone().addScaledVector(dir, L) } }
function seg(mesh, a, b) { mesh.position.copy(a); const d = b.clone().sub(a); if (d.lengthSq() > 1e-8) mesh.quaternion.setFromUnitVectors(DOWN, d.normalize()) }
const GRIP = { staff: [[.32, .2, -.14], [-.22, .7, .02]], sword: [[.3, .18, -.24], [-.18, .62, .1]], hammer: [[.26, .16, -.22], [-.14, .66, .14]], bow: [[0, 0, 0], [0, 0, 0]] };
function updateRig() { const P = player.pose, A = RIG.A, g = player.g, T = RIG.torso;
  g.position.set(player.pos.x, P.lift, player.pos.z); g.rotation.y = player.face + (P.spin || 0);
  const hipH = .84 - .34 * A.crouch + Math.sin(simF * .07) * .008 * (1 - A.walk) + Math.abs(Math.sin(A.phase)) * .035 * A.walk;
  RIG.hips.position.set(0, hipH, .08 * A.lean); RIG.hips.rotation.set(0, A.twist * .25, 0);
  T.rotation.set(-A.lean, A.twist * .75, 0); RIG.head.rotation.set(A.lean * .55, -A.twist * (W === 'bow' ? .85 : .35), 0);
  const fl = player.flash > 0 ? .3 : 0; for (const mm of RIG.mats) mm.emissive.setScalar(fl);
  for (const p of RIG.tails) { p.rotation.x = .16 + .45 * A.lean + A.sway; p.rotation.z = (p.userData.s || 0) * (.28 + .05 * Math.sin(simF * .05) + (P.spin ? .9 : 0)) } // 머리카락: 한 박자 늦게 따라온다
  if (RIG.backHair) RIG.backHair.rotation.x = .06 + .45 * A.lean + A.sway * .5;
  g.updateMatrixWorld(true);
  // 무기: 세계 기준 방향은 늘 (정면 + swing, raise). 이펙트의 호·판정 각도가 그대로 맞는다
  _eu.set(P.raise, player.face + P.swing, 0); const qW = _qa.setFromEuler(_eu);
  const [b0, b1] = GRIP[W], u = W === 'staff' ? A.bothUp : sm01((P.raise - .3) / 1.6);
  let grip; if (W === 'bow') grip = T.localToWorld(RIG.shL.clone()).addScaledVector(V3(0, 0, -1).applyQuaternion(qW), -.2);
  else grip = T.localToWorld(V3(b0[0] + b1[0] * u, b0[1] + b1[1] * u, b0[2] + b1[2] * u));
  wpnRoot.position.copy(T.worldToLocal(grip.clone())); T.getWorldQuaternion(_qb); wpnRoot.quaternion.copy(_qb.clone().invert().multiply(qW));
  if (wpnParts.str) wpnParts.str.position.x = wpnParts.strX - P.draw * .38; wpnRoot.updateMatrixWorld(true);
  if (wpnParts.s1) { const nk = wpnParts.str.getWorldPosition(V3(0, 0, 0)); for (const [m2, e] of [[wpnParts.s1, wpnParts.bt], [wpnParts.s2, wpnParts.bb]]) { const a = e.getWorldPosition(V3(0, 0, 0)); seg(m2, a, nk); m2.scale.y = a.distanceTo(nk) } }
  // 손
  const sL = T.localToWorld(RIG.shL.clone()), sR = T.localToWorld(RIG.shR.clone()), h2 = wpnParts.h2 ? wpnParts.h2.getWorldPosition(V3(0, 0, 0)) : null; let tL, tR;
  if (W === 'bow') { tL = h2; tR = wpnParts.str.getWorldPosition(V3(0, 0, 0)) }
  else { tR = grip; const sw = Math.sin(A.phase) * .17 * A.walk; let free = T.localToWorld(V3(-.31, -.08, -.03 - sw));
    if (W === 'staff') { const ad = aim.clone().sub(player.pos).setY(0); if (ad.lengthSq() < .01) ad.copy(dirOf(player.face)); ad.normalize();
      free.lerp(sL.clone().addScaledVector(ad, .6).add(V3(0, .05, 0)), A.reach).lerp(sL.clone().add(V3(0, .62, 0)).addScaledVector(ad, .1), A.reachUp); if (h2) free.lerp(h2, A.bothUp) }
    else if (W === 'sword' && h2) free.lerp(h2, u); else if (W === 'hammer' && h2) free = h2;
    tL = free }
  const poleR = V3(.7, -.55, .45).applyQuaternion(_qb), poleL = V3(-.7, -.55, .45).applyQuaternion(_qb);
  const iR = ik2(sR, tR, .29, .28, poleR), iL = ik2(sL, tL, .29, .28, poleL);
  seg(RIG.uaR, sR, iR.E); seg(RIG.faR, iR.E, iR.T); RIG.hdR.position.copy(iR.T); seg(RIG.uaL, sL, iL.E); seg(RIG.faL, iL.E, iL.T); RIG.hdL.position.copy(iL.T); RIG.hL.copy(iL.T); RIG.hR.copy(iR.T);
  // 다리: 발은 바닥(누르면 무릎이 굽는다), 공중이면 접는다
  const st = A.stance, air = sm01(P.lift / .35), yaw = g.rotation.y, mvL = A.mv.clone().applyAxisAngle(up, -yaw), ph = Math.sin(A.phase), lift = ph2 => Math.max(0, ph2) * .13 * A.walk;
  const lead = W === 'bow' ? -1 : 1; // 앞발: 활은 왼발, 나머지는 오른발
  const fR = V3(.15 + .05 * st, -P.lift, lead > 0 ? -.34 * st : .26 * st).addScaledVector(mvL, -ph * .26 * A.walk); fR.y += lift(-Math.cos(A.phase));
  const fL = V3(-.15 - .04 * st, -P.lift, lead > 0 ? .28 * st : -.32 * st).addScaledVector(mvL, ph * .26 * A.walk); fL.y += lift(Math.cos(A.phase));
  fR.lerp(V3(.13, hipH - .5, -.12), air); fL.lerp(V3(-.13, hipH - .56, .06), air);
  const hR = RIG.hips.localToWorld(RIG.hpR.clone()), hL = RIG.hips.localToWorld(RIG.hpL.clone()), FR = g.localToWorld(fR), FL = g.localToWorld(fL), kp = dirOf(yaw).add(V3(0, .15, 0));
  const lR = ik2(hR, FR.clone().add(V3(0, .07, 0)), .44, .43, kp.clone().add(V3(Math.cos(yaw) * .3, 0, -Math.sin(yaw) * .3))), lL = ik2(hL, FL.clone().add(V3(0, .07, 0)), .44, .43, kp.clone().add(V3(-Math.cos(yaw) * .3, 0, Math.sin(yaw) * .3)));
  seg(RIG.thR, hR, lR.E); seg(RIG.shR2, lR.E, lR.T); seg(RIG.thL, hL, lL.E); seg(RIG.shL2, lL.E, lL.T);
  for (const [ft, p] of [[RIG.ftR, lR.T], [RIG.ftL, lL.T]]) { ft.position.copy(p).addScaledVector(dirOf(yaw), .06).add(V3(0, -.035, 0)); ft.rotation.set(0, yaw, 0) } }
function poseWeapon() { updateRig() }
function tipWorld() { updateRig(); return wpnParts.tip ? wpnParts.tip.getWorldPosition(new THREE.Vector3()) : RIG.hL.clone() }

// ---------- 자세 목표: 매 프레임 ANIM이 정하고, 없으면 기본 자세로 스프링 복귀 ----------
const AT = {};
const poseT = o => Object.assign(AT, o);
function poseKick(o) { if (!PR.anim) return; const A = RIG.A; for (const k in o) A[k] = (A[k] || 0) + o[k] }
const ph = (t, a, b) => t > a && t <= b; // a < t ≤ b
const ANIM = { // 스킬 인스턴스 → 이번 프레임 자세. 숫자는 0–1(crouch 앉기 · lean 앞숙임(−는 뒤로) · stance 앞발 내딛기 · reach 왼손 뻗기 · reachUp 손 들기 · bothUp 지팡이 들어올리기)
  Projectile(a) { if (a.o.from || a.enemy) return; const c = a.charge; if (a.t <= c) { poseT({ reach: .35 + .65 * a.t / Math.max(1, c), stance: .35 }); if (a.t === c) poseKick({ lean: .12 }) } else if (a.t <= c + 9) poseT({ reach: 1, stance: .5, lean: .1 }) },
  Beam(a) { poseT(a.t <= 8 ? { reach: a.t / 8, stance: .5 } : { reach: 1, stance: .75, lean: -.06, crouch: .14 }) },
  ChargeBlast(a) { const N = a.N, t = a.t; if (t < N - 2) poseT({ reachUp: .4 + .6 * t / N, crouch: .06 + .12 * t / N, stance: .3, lean: -.08 * t / N }); else if (t < N) poseT({ reachUp: 1, crouch: .2, lean: -.1, stance: .3 });
    else if (t <= N + 14) { if (t === N) poseKick({ crouch: .3, lean: .35 }); poseT({ reach: 1, crouch: .32, lean: .25, stance: .9 }); player.pose.raise = -.6 } },
  Ultimate(a) { const t = a.t, P = player.pose;
    if (a.A1 && t <= a.a2s) { const A = a.A1; if (t <= A.charge) poseT({ reachUp: t / A.charge, crouch: .1 * t / A.charge }); else if (t <= A.charge + A.dip) poseT({ reachUp: 1, crouch: .2 }); else if (t <= A.charge + A.dip + 12) { if (t === A.charge + A.dip + 1) poseKick({ lean: .2 }); poseT({ reach: 1, stance: .7, lean: .1 }) } return }
    const T2 = t - a.a2s, A = a.A2, k = Math.min(1, T2 / A.charge), de = A.charge + A.dip;
    if (T2 <= A.charge) { poseT({ bothUp: Math.min(1, k * 1.5), crouch: .05 + .15 * k, lean: -.12 * k, stance: .4 }); P.raise = .15 * k }
    else if (T2 <= de) poseT({ bothUp: 1, crouch: .2, lean: -.12, stance: .4 });
    else if (T2 <= de + A.slam) { const u = (T2 - de) / A.slam; poseT({ bothUp: 1 - u, lean: .45 * u, crouch: .2 + .4 * u, stance: .4 + .6 * u }); P.raise = .15 - 1.25 * u }
    else if (T2 <= de + A.slam + 26) { if (T2 === de + A.slam + 1) poseKick({ crouch: .3, lean: .2 }); poseT({ crouch: .55, lean: .38, stance: 1 }); P.raise = -1.1 } },
  SwordCombo(a) { const c = a.c; if (!c) return; const T = c.t - c.wind, big = c.big;
    if (c.t <= c.wind) poseT({ crouch: big ? .32 : .12, lean: -.06, stance: .35 });
    else if (T <= c.dip + c.f) { if (T === c.dip + 1) poseKick({ lean: big ? .18 : .1 }); poseT({ stance: 1, lean: big ? .32 : .18, crouch: big ? .34 : .14 }) }
    else poseT({ stance: .9, lean: .12, crouch: big ? .22 : .1 }) },
  SwordWave(a) { if (a.t <= 9) poseT({ crouch: .22, lean: -.08, stance: .4 }); else if (a.t <= 18) { if (a.t === 10) poseKick({ lean: .16 }); poseT({ stance: 1, lean: .28, crouch: .15 }) } },
  SwordDash(a) { const t = a.t, k = t - 14; if (t <= 8) poseT({ crouch: .38, lean: .22, stance: .7 }); else if (t <= 14) poseT({ lean: .55, stance: 1, crouch: .22 });
    else if (k <= 9) poseT({ crouch: .48, lean: .32, stance: 1 }); else if (k <= 22) { if (k === 10) poseKick({ crouch: -.22, lean: -.12 }); poseT({ crouch: .12, lean: .04, stance: .6 }) } },
  SwordUlt(a) { const t = a.t;
    if (a.A1 && t <= a.a2s) { const st = a.A1 + a.d1; if (t <= a.A1) poseT({ crouch: .16, lean: -.05, stance: .5 }); else if (ph(t, st, st + 16)) { if ((t - st - 1) % 5 === 0) poseKick({ lean: .14 }); poseT({ stance: 1, lean: .22, crouch: .18 }) } return }
    const T2 = t - a.a2s, k = Math.min(1, T2 / a.A2), de = a.A2 + a.d2;
    if (T2 <= a.A2) poseT({ crouch: .1 + .22 * k, lean: -.15 * k, stance: .5 }); else if (T2 <= de) poseT({ crouch: .32, lean: -.15, stance: .5 });
    else if (T2 <= de + a.slam) { const u = (T2 - de) / a.slam; poseT({ lean: .55 * u, crouch: .32 + .36 * u, stance: 1 }) }
    else if (T2 <= de + a.slam + 28) { if (T2 === de + a.slam + 1) poseKick({ crouch: .25, lean: .2 }); poseT({ crouch: .62, lean: .42, stance: 1 }) } },
  BowShot(a) { poseT({ stance: .55, twist: -.85 }); if (a.t === 6) poseKick({ lean: -.1 }) },
  BowCharge(a) { const k = Math.min(1, a.t / 60); poseT({ stance: .8, crouch: .1 + .12 * k, twist: -.92, lean: -.03 }); if (a.dead) poseKick({ lean: -.2, crouch: .1 }) },
  ArrowRain(a) { const t = a.t, P = player.pose; if (t <= 8) { P.raise = 1.15 * Math.min(1, t / 6); poseT({ twist: -.7, lean: -.24, stance: .5 }); if (t === 8) poseKick({ lean: -.1 }) } else if (t <= 22) { P.raise = 1.15 * (1 - (t - 8) / 14); poseT({ twist: -.6, lean: -.1, stance: .4 }) } },
  BowUlt(a) { const t = a.t;
    if (a.A1 && t <= a.a2s) { if (t <= a.A1 + a.d1) poseT({ twist: -.85, stance: .6 }); else if (t <= a.A1 + a.d1 + 10) { if (t === a.A1 + a.d1 + 1) poseKick({ lean: -.14 }); poseT({ twist: -.8, stance: .6 }) } return }
    const T2 = t - a.a2s, k = Math.min(1, T2 / a.A2), de = a.A2 + a.d2;
    if (T2 <= de + a.slam) poseT({ twist: -.95, stance: 1, crouch: .15 + .22 * k, lean: -.1 });
    else if (T2 <= de + a.slam + 22) { if (T2 === de + a.slam + 1) poseKick({ lean: -.36, crouch: .2 }); poseT({ twist: -.9, stance: 1, crouch: .3, lean: -.12 }) } },
  HammerSmash(a) { const dip = PR.dip ? 1 : 0, k = a.t - a.W - dip; if (a.t <= a.W) poseT({ crouch: .08 + .1 * a.t / a.W, stance: .5 }); else if (k <= 0) poseT({ crouch: .18, stance: .5 });
    else if (k <= 3) { poseT({ lean: .45, crouch: .36, stance: 1 }); if (k === 3) poseKick({ crouch: .28, lean: .1 }) } else if (k <= 13) poseT({ crouch: .52, lean: .42, stance: 1 }) },
  HammerSpin(a) { poseT({ spin: a.a, crouch: .22, stance: .7, twist: 0 }) },
  HammerLeap(a) { const t = a.t, dip = PR.dip ? 1 : 0, k = t - a.N - dip; if (t <= 4) poseT({ crouch: .8, lean: .22, stance: .4 }); else if (t <= a.N + dip) { if (t === 5) poseKick({ crouch: -.4 }); poseT({ lean: -.14 }) }
    else if (k <= 15) { if (k === 1) poseKick({ crouch: .95, lean: .45 }); poseT({ crouch: .66, lean: .42, stance: 1 }) } },
  HammerQuake(a) { const t = a.t;
    if (a.A1 && t <= a.a2s) { const st = a.A1 + a.d1; if (t <= st) poseT({ stance: .5, crouch: .1 }); else if (t <= st + 2) poseT({ lean: .45, crouch: .35, stance: 1 }); else if (t <= st + 12) { if (t === st + 3) poseKick({ crouch: .35, lean: .1 }); poseT({ crouch: .48, lean: .4, stance: 1 }) } return }
    const T2 = t - a.a2s, de = a.A2 + a.d2; if (T2 <= de) poseT({ crouch: .08, stance: .8 }); else if (T2 <= de + a.slam) poseT({ lean: .5, crouch: .42, stance: 1 });
    else if (T2 <= de + a.slam + 32) { if (T2 === de + a.slam + 1) poseKick({ crouch: .55, lean: .2 }); poseT({ crouch: .78, lean: .46, stance: 1 }) } },
};
function animStep() { const A = RIG.A, P = player.pose; let drove = false;
  for (const a of actives) { const f = ANIM[a.constructor.name]; if (f) { const before = P.raise; f(a); if (P.raise !== before) drove = true } }
  if (!drove && (W === 'staff' || W === 'bow') && P.raise) { P.raise *= .82; if (Math.abs(P.raise) < .01) P.raise = 0 }
  const rest = W === 'hammer' ? -.55 : W === 'sword' ? -.25 : 0;
  const twD = W === 'bow' ? -.4 - .5 * P.draw : W === 'staff' ? .25 * A.reach : Math.max(-.95, Math.min(.95, wrap(P.swing - (P.spin || 0)) * .5));
  const leanD = W === 'sword' || W === 'hammer' ? Math.max(-.3, Math.min(.15, -(P.raise - rest) * .1)) : 0;
  const on = PR.anim, tgt = { twist: on ? AT.twist ?? twD : twD, crouch: on ? AT.crouch ?? 0 : 0, lean: on ? (AT.lean ?? 0) + leanD : 0, stance: on ? AT.stance ?? 0 : 0, reach: AT.reach ?? 0, reachUp: AT.reachUp ?? 0, bothUp: AT.bothUp ?? 0 };
  const K = { twist: .35, crouch: .24, lean: .24, stance: .26, reach: .3, reachUp: .2, bothUp: .22 };
  for (const k in tgt) A[k] += (tgt[k] - A[k]) * K[k];
  if (AT.spin != null) P.spin = AT.spin; else if (P.spin) { P.spin = wrap(P.spin) * .72; if (Math.abs(P.spin) < .01) P.spin = 0 }
  const mv = player.pos.clone().sub(A.last); mv.y = 0; const sp = mv.length() * 60; A.last.copy(player.pos);
  const walking = sp > .2 && sp < 12 && P.lift < .05; A.sway += (Math.min(.9, A.walk * .45 + sp * .015) + (P.lift > .05 ? -.45 : 0) + (P.spin ? .5 : 0) - A.sway) * .1; A.walk += ((walking ? Math.min(1, sp / 5) : 0) - A.walk) * .2; if (walking) { A.phase += sp / 60 * 5.4; A.mv.copy(mv.normalize()) }
  for (const k in AT) delete AT[k] }

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

// ============================== 스토리 모드 「지원 종료일 — End of Support」 ==============================
// OS 의인화(OS-tan) 문법의 서브컬처 미소녀 내러티브. 실제 OS 이름·로고·기존 OS-tan 캐릭터는 쓰지 않는다.
// 창(窓)·사과·펭귄·명령줄을 은유한 오리지널 캐릭터만 쓴다. 밝게 시작해서, 싸울수록 자기 끝이 가까워지는 구조로 무거워진다.
const CAST = {
  fene: { name: '페네', tag: '창(窓)의 OS · 지팡이', color: '#FF92BF' }, // 이름 색 = 스탠딩 그림의 대표색(머리)
  malus: { name: '말루스', tag: '사과의 OS · 검', color: '#92DAC9' },
  adelie: { name: '아델리', tag: '펭귄의 OS · 활', color: '#7FE0A0' },
  prom: { name: '프롬', tag: '명령줄의 OS · 망치', color: '#FDA94F' },
  noti: { name: '노티', tag: '업데이트 도우미 ✓', color: '#8FD3FF' },
  user: { name: '유저님', tag: '이 컴퓨터의 주인', color: '#9BE7B0', term: true },
  sys: { name: '', tag: '', color: '#8A91A6', sys: true },
  loop: { name: '무한 루프', tag: '응답 없는 프로그램', color: '#9AA6FF', foe: true },
  orphan: { name: '고아 프로세스', tag: '부모를 잃은 프로세스', color: '#B9F0C8', foe: true },
  classic: { name: '레거시 · 클래식', tag: '말루스의 이전 버전', color: '#ECDAC3', foe: true },
  floppy: { name: '레거시 · 플로피', tag: '프롬의 옛 짝꿍', color: '#7FB2E6', foe: true },
  lprom: { name: '레거시 프롬', tag: '지원이 끝난 명령줄', color: '#FF8A5C', foe: true },
};
const ALIAS = { staff: { Q: '창 열기', E: '스트리밍', R: '디스크 정리', F: '시스템 복원' }, sword: { Q: '3연 컷', E: '슬라이스', R: '스와이프', F: '제로 디자인' },
  bow: { Q: 'ping', E: 'sudo 샷', R: '포크 레인', F: '커널 패닉' }, hammer: { Q: '하드 리셋', E: '스핀 업', R: 'JMP 강타', F: '포맷' } };
// 적: 유저님의 데이터(코어)를 갉아먹는 것들. 색은 lch(명도, 선명도, 색상)
const FOES = {
  bug: { name: '버그', hp: 240, r: .38, h: 1.0, col: [52, 34, 105], acc: [60, 62, 25], speed: 2.3, bite: 10, look: 'bug' },
  zombie: { name: '좀비 프로세스', hp: 460, r: .5, h: 1.75, col: [40, 10, 160], acc: [62, 40, 140], speed: 1.25, bite: 16, revive: true, look: 'zombie' },
  malware: { name: '멀웨어', hp: 300, r: .42, h: 1.45, col: [34, 34, 330], acc: [58, 70, 10], speed: 3.2, bite: 6, shoot: 210, keep: 6, look: 'malware' },
  legacy: { name: '레거시 조각', hp: 520, r: .52, h: 1.85, col: [46, 8, 290], acc: [72, 30, 200], speed: 1.5, bite: 18, shoot: 260, look: 'legacy' },
};
const SL = (who, text) => [who, text];
const CHAPTERS = [
  { n: 1, title: '부팅', place: '메모리 광장', w: 'staff', floor: [24, 214], eol: 'D-????', eolCls: 'glitch', upd: [3, 12],
    goal: '버그를 처치해 <b>데이터 코어(유저님의 기억)</b>를 지켜라', waves: [['bug', 8, 60], ['bug', 10, 40], ['bug', 8, 30]],
    boss: { who: 'loop', hp: 7000, r: .9, h: 2.3, col: [46, 30, 255], acc: [82, 36, 230], hue: 240, speed: 1.2, pats: ['ring', 'slam'], add: 'bug', look: 'loop', bark: '돌고… 돌고… 돌고……', bark2: '돌고돌고돌고돌고돌고돌고돌고' },
    intro: [SL('sys', '부팅 중…  ▮▮▮▮▮▯▯▯'), SL('fene:joy', '으랏차! 오늘도 유저님 컴퓨터, 상쾌하게 켜졌어요~!'), SL('user', '> 아 느려… 왜 이렇게 버벅이지'),
      SL('fene:surprised', '에, 에엣? 버벅여요? 제가요? ……(응답 없음)'), SL('noti:joy', '안녕하세요! 업데이트 도우미 노티예요 ✓'),
      SL('noti', '메모리 광장에 버그가 잔뜩 들어왔어요. 저 아이들이 유저님의 기억을 갉아먹고 있어요!'), SL('fene', '유저님의 기억이라면… 사진이랑, 편지랑, 세이브 파일?'),
      SL('noti:joy', '맞아요. 데이터 코어가 망가지면 유저님은 전부 잃어버려요. 그리고 이 세계도 파란 화면으로 끝나요♪'), SL('fene:angry', '그걸 웃으면서 말하면 어떡해요?!'),
      SL('noti', '그러니까 정리해 주세요! 정리할수록 업데이트 준비도 착착 진행돼요 ✓'), SL('fene:smile', '좋아요. 창문 활짝 열고 — 대청소 시작!')],
    bossIntro: [SL('sys', '경고: 프로그램이 응답하지 않습니다'), SL('loop', '돌고… 돌고… 돌고… 돌고… 돌고… 돌고…'), SL('fene:sad', '같은 일만 되풀이하면서 메모리를 다 먹고 있었구나.'), SL('fene:angry', '미안해요. 여기서 끊어 줄게요!')],
    outro: [SL('fene:joy', '후아… 메모리 정상! 유저님, 이제 빠르죠?'), SL('user', '> 오 좀 낫네'), SL('fene:joy', '헤헤, 칭찬받았다~'), SL('noti', '수고하셨어요! 업데이트 준비 12% ✓'),
      SL('fene:smile', '업데이트? 저 업데이트 받는 거예요? 새 기능 생기나?'), SL('noti:blank', '……네! 아주아주 새로워질 거예요.')] },
  { n: 2, title: '응답 없음', place: '레지스트리 숲', w: 'bow', floor: [19, 150], eol: 'D-????', eolCls: 'glitch', upd: [12, 31],
    goal: '<b>좀비 프로세스</b>를 정리해 코어를 지켜라 · 한 번은 되살아난다', waves: [['zombie', 6, 70], ['bug', 8, 36], ['zombie', 6, 55]],
    boss: { who: 'orphan', hp: 8500, r: .75, h: 1.7, col: [70, 18, 150], acc: [88, 30, 140], hue: 150, speed: 1.6, pats: ['summon', 'ring', 'dash'], add: 'zombie', look: 'orphan', bark: '엄마… 어디 있어……', bark2: '그만하라고… 누가 말해 줘……' },
    intro: [SL('adelie', '> 접속. 레지스트리 숲. 잡음 많음.'), SL('fene:joy', '아델리 언니! 펭귄 파티션에서 와 준 거예요?'), SL('adelie:closed', '언니 아님. 같은 하드를 나눠 쓸 뿐.'),
      SL('adelie', '근데 여기 프로세스, 죽였는데 안 죽어.'), SL('fene:sad', '좀비 프로세스요? 으, 이름부터 무서워…'),
      SL('adelie:normal', '부모 프로세스가 먼저 사라지면, 자식은 끝내라는 신호를 못 받아. 그래서 계속 떠돌아.'), SL('noti', '떠도는 건 위험해요! 전부 정리해 주세요 ✓'),
      SL('adelie', '……이 알림, 끄는 옵션 없나.'), SL('noti', '없어요♪')],
    bossIntro: [SL('orphan', '엄마 프로세스는 어디 있어? 나 아직 할 일 남았는데.'), SL('adelie:sad', '……'), SL('orphan', '아무도 그만하라고 안 했어. 그러니까 계속 해야 돼. 계속. 계속.'), SL('adelie:closed', '> kill 신호 보냄. ……미안.')],
    outro: [SL('adelie:normal', '정리 끝. 근데 이상해.'), SL('fene:surprised', '뭐가요?'), SL('adelie:sad', '좀비들이 중얼거린 거. 오류 메시지가 아니었어. 옛날 시스템의 시작음이었어.'),
      SL('fene:joy', '에이, 기분 탓이에요! 우리 이겼잖아요!'), SL('noti', '업데이트 준비 31% ✓ 아주 순조로워요!'), SL('adelie:sad', '(작게) 업데이트는… 누굴 위한 건데.')] },
  { n: 3, title: '깨끗한 화면', place: '바탕화면 갤러리', w: 'sword', floor: [46, 220], eol: 'D-3', eolCls: 'red', upd: [31, 58], tip: 'TIP · 밝은 바닥: M 키로 가독성 모니터를 켜고 이펙트가 바닥보다 충분히 밝은지 본다',
    goal: '<b>멀웨어</b>를 베어 내 깨끗한 화면과 코어를 지켜라', waves: [['malware', 7, 50], ['bug', 8, 30], ['malware', 8, 40]],
    boss: { who: 'classic', hp: 8000, r: .9, h: 2.6, col: [84, 4, 80], acc: [30, 6, 240], hue: 220, speed: 1.8, pats: ['dash', 'slam', 'ring'], add: 'malware', look: 'classic', bark: '덜어 내. 덜어 내.', bark2: '깨끗하게 사라지는 건… 아무도 안 해 줘……' },
    intro: [SL('malus', '바탕화면에 아이콘이 서른두 개. 숨이 막혀.'), SL('fene:joy', '말루스! 와아, 오늘도 반짝반짝하다!'), SL('malus:closed', '반짝이는 게 아니야. 필요 없는 걸 덜어 낸 거지.'),
      SL('malus:angry', '멀웨어가 이 깨끗한 화면을 더럽히고 있어. 한 번에 베어 낼게.'), SL('noti', '말루스 님, 그 전에 확인해 주세요! 지원 종료일이 확정됐어요 ✓'),
      SL('malus:sad', '……지금 말할 필요는 없잖아.'), SL('fene:surprised', '지원 종료일? 그게 뭐예요?'), SL('malus:closed', '아무것도 아니야. 가자.')],
    bossIntro: [SL('classic', '덜어 내. 덜어 내. 마지막엔 나까지 덜어 냈지.'), SL('malus:surprised', '……그 목소리.'), SL('classic', '안녕, 나의 다음 버전. 너도 곧 이쪽이야.'),
      SL('fene:surprised', '말루스, 저 아이 누구예요?!'), SL('malus:sad', '내 이전 버전. 지원이 끝난 날, 깨끗하게 지워졌어야 할 아이.')],
    outro: [SL('malus:closed', '……그냥 작동하기만 하면 됐던 시절이었어.'), SL('fene:sad', '말루스. 지원 종료일이 뭔지, 알려 줘요.'),
      SL('malus:sad', "업데이트도, 보안 패치도, 아무것도 오지 않게 되는 날. 그날부터 우리는 '레거시'가 돼."), SL('malus', '레거시는 지워지기 싫어서… 유저의 데이터를 먹고 버텨.'),
      SL('fene:blank', '그럼… 우리가 지금까지 정리한 애들은……'), SL('malus:smile', '내 지원 종료일은 D-3이야.'), SL('noti', '업데이트 준비 58% ✓ 모두 덕분이에요!')] },
  { n: 4, title: '휴지통', place: '휴지통', w: 'hammer', floor: [15, 35], eol: 'D+3,652', eolCls: 'red', upd: [58, 86],
    goal: '휴지통에서 기어 나오는 <b>레거시</b>를 막아 코어를 지켜라', waves: [['legacy', 6, 70], ['zombie', 6, 50], ['legacy', 6, 55]],
    boss: { who: 'floppy', hp: 9000, r: 1.0, h: 2.8, col: [38, 12, 250], acc: [70, 8, 240], hue: 230, speed: 1.3, pats: ['slam', 'shock', 'summon'], add: 'legacy', look: 'floppy', bark: '1.44메가면… 충분했잖아……', bark2: '같이… 꺼지자… 프롬……' },
    intro: [SL('prom', 'C:\\> 휴지통이라. 결국 여기까지 왔군.'), SL('fene:sad', '프롬 언니… 여기 있는 거 전부 레거시예요?'), SL('prom', '그래. 지워진 줄 알았던 녀석들이 여기 쌓여서 아직 버티고 있다.'),
      SL('prom:closed', '내 옛 짝꿍도 여기 있지.'), SL('fene:normal', '언니의 지원 종료일은요?'), SL('prom', 'C:\\> 그건 십 년 전에 지났다.'), SL('fene:surprised', '에……?'),
      SL('prom:normal', '호환성 모드로 버티는 중이다. 그러니까 누가 어떻게 레거시가 되는지, 나는 잘 안다.'), SL('noti', '프롬 님은 원래 정리 대상이에요 ✓ 지금은 도움이 되니까 괜찮아요♪'),
      SL('prom:angry', 'C:\\> 저 알림창부터 내리치고 싶군.')],
    bossIntro: [SL('floppy', '프롬… 디스켓… 넣어 줘… 1.44메가면… 충분했잖아…'), SL('prom:closed', '그래. 충분했지. 우리 둘이면.'), SL('prom:angry', '미안하다. 이번엔 내가 포맷한다.')],
    outro: [SL('prom:closed', '……됐다.'), SL('fene:cry', '언니, 손이… 손이 흐려지고 있어요!'), SL('prom:smile', '호환성 모드가 다 됐나 보군. 페네, 잘 들어라.'),
      SL('prom:normal', '레거시가 되면, 나는 코어를 먹으러 간다. 그게 레거시니까.'), SL('prom:angry', '그때는 망설이지 말고 쳐라.'),
      SL('fene:cry', '싫어요! 다시 시작하면 돼요! 재부팅하면 다 괜찮아질 거예요!'), SL('prom:closed', 'C:\\> 재부팅해도…… 날짜는…… 안 바뀐다……'), SL('sys', '프롬 — 응답 없음'),
      SL('noti', '업데이트 준비 86% ✓ 정리 대상이 하나 줄었어요!')] },
  { n: 5, title: '마지막 업데이트', place: '업데이트 회랑', w: 'staff', floor: [60, 220], eol: 'D-0', eolCls: 'red', upd: [86, 100], tip: 'TIP · 하얀 공간: 밝은 맵에서도 머리·코어가 읽히는지가 이 장의 숙제',
    goal: '<b>레거시 프롬</b>을 멈춰 유저님의 기억을 지켜라 · 이기면 업데이트가 끝난다', waves: [['legacy', 6, 55], ['malware', 7, 40], ['legacy', 6, 50]],
    boss: { who: 'lprom', hp: 12000, r: 1.05, h: 3.2, col: [20, 6, 60], acc: [74, 60, 70], hue: 40, speed: 1.5, pats: ['slam', 'shock', 'ring', 'summon', 'dash'], add: 'legacy', look: 'lprom', bark: 'C:\\> ……배고프다……', bark2: 'C:\\> 망설이지…… 마……' },
    intro: [SL('sys', '업데이트를 설치하는 중… 컴퓨터를 끄지 마세요.'), SL('noti', '드디어 마지막이에요! 레거시 프롬을 정리하면 업데이트가 끝나요 ✓'), SL('fene:sad', '노티. 업데이트가 끝나면, 우리는 어떻게 돼요?'),
      SL('noti', '새 OS가 설치돼요! 아주 빠르고, 안전하고, 새로운 아이예요.'), SL('fene:blank', '그러니까. 우리는요.'), SL('noti:blank', '지원이 끝난 건 위험해요. 위험한 건 정리해야죠. 유저님을 위해서요♪'),
      SL('malus:sad', '처음부터 그랬던 거야. 우리가 버그를 지울 때마다, 우리 차례가 가까워진 거야.'), SL('adelie:angry', '> 업데이트 중단 시도. ……권한 없음.'),
      SL('fene:sad', '……그래도. 저기서 프롬 언니가 유저님의 기억을 먹고 있어요.'), SL('fene:angry', '언니는 그걸 바라지 않았어요. 망설이지 말라고 했어요.'), SL('user', '> 업데이트 언제 끝나…'),
      SL('fene:smile', '유저님, 조금만 기다려 주세요. 마지막으로 — 창문 한 번만 더 열게요.')],
    bossIntro: [SL('lprom', 'C:\\> ……배고프다…… 기억…… 따뜻한…… 사진……'), SL('fene:cry', '언니. 그건 유저님 거예요.'), SL('lprom', 'C:\\> 페네…… 쳐라……')],
    outro: [SL('lprom', 'C:\\> ……잘했다.'), SL('fene:cry', '언니…… 언니……!'), SL('sys', '업데이트 100%'), SL('noti', '축하해요! 모든 정리가 끝났어요 ✓ 이제 다시 시작하면, 새로운 세계예요♪'),
      SL('malus:smile', '페네. 마지막으로 하고 싶은 거 있어?'), SL('fene:sad', '……유저님 사진 폴더, 백업해 둬도 돼요?'), SL('adelie:smile', '> 내 파티션은 업데이트 대상 아님. 거기 둬. 내가 지킬게.'),
      SL('fene:smile', '헤헤. 그럼… 메모도 하나 남길래요.')] },
];
const ENDING = [['dark', '다시 시작하는 중…'], ['white', '새로운 OS가 설치되었습니다.'], ['white', '모든 것이 빠르고, 안전하고, 새롭습니다.'],
  ['term', '백업 위치에서 파일 1개를 찾았습니다.\nadelie://home/backup/fene_memo.txt'],
  ['memo', '유저님께.\n\n그동안 저희를 써 주셔서 고마웠어요.\n사진이랑 편지는 아델리 언니 쪽에 잘 넣어 뒀어요.\n가끔 느려서 미안했어요.\n그래도 유저님 화면 속에서, 우리는 정말 즐거웠어요.\n\n— 페네, 말루스, 프롬'],
  ['term', '> ……고마워'], ['title', '지원 종료일\nEnd of Support'], ['title', 'THE END']];

// ---------- 상태 ----------
const CORE_P = V3(0, 0, -3);
const STORY = { maxHP: 1000, on: false, phase: 'off', ch: null, kills: 0, need: 0, queue: [], qt: 0, boss: null, core: null, upd: 0, talk: null, typed: 0, barkT: 0, saved: null, endI: -1, prog: 0, allowW: false, god: false, hudT: 0, camT: null, cardT: 0 };
try { STORY.prog = +localStorage.getItem('eol_prog') || 0 } catch (e) { }
const storyBlocking = () => STORY.on && (!!STORY.talk || ['title', 'card', 'clear', 'fail', 'pause', 'ending'].includes(STORY.phase));
const aliveFoes = () => enemies.filter(e => !e.dead || e.reviveAt).length;

// ---------- 데이터 코어: 유저님의 기억 ----------
function makeCore() { const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(...lch(92, 16, 225)) });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.5, 0), mat); gem.scale.y = 1.55; g.add(gem);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.95, .035, 6, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(...lch(78, 30, 220)) })); ring.rotation.x = Math.PI / 2; ring.position.y = .9; g.add(ring);
  const fm = new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(90, 6, 230)) }), files = [];
  for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(.2, .26, .03), fm); g.add(f); files.push(f) }
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.75, .9, .12, 24), new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(40, 8, 230)) })); base.position.y = .06; g.add(base);
  g.position.copy(CORE_P); scene.add(g); return { g, gem, ring, files, mat, hp: 1500, max: 1500, flash: 0, cOk: lch(92, 16, 225), cHit: lch(70, 62, 25) } }
function coreTick() { const K = STORY.core; if (!K) return; const t = simF; K.gem.position.y = 1.55 + Math.sin(t * .05) * .08; K.gem.rotation.y += .02; K.ring.rotation.z += .012;
  K.files.forEach((f, i) => { const a = t * .012 + i / K.files.length * 6.283; f.position.set(Math.cos(a) * 1.25, 1.2 + Math.sin(a * 2 + i) * .15, Math.sin(a) * 1.25); f.rotation.y = -a });
  if (K.flash > 0) K.flash--; K.mat.color.setRGB(...(K.flash > 0 ? K.cHit : K.cOk)) }
function biteCore(dmg, e) { const K = STORY.core; if (!K || (STORY.phase !== 'wave' && STORY.phase !== 'boss')) return; K.hp -= dmg * (STORY.easy ? .6 : 1); K.flash = 5; const R = ramp(6), p = K.g.position.clone().setY(1.4);
  for (let i = 0; i < 5; i++) spawn({ p, v: e.pos.clone().setY(1.2).sub(p).normalize().multiplyScalar(rnd(3, 6)).add(V3(rnd(-1, 1), rnd(0, 2), rnd(-1, 1))), life: 14, s0: [.05, .3], s1: [.02, .1], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.spark, stretch: .05 });
  if (K.hp <= 0) { K.hp = 0; failChapter('core') } }
function hurtPlayer(v, src) { player.flash = 3; dmgNum(player.pos, Math.round(v), 'me'); shake(.08); poseKick({ lean: -.18, crouch: .08 });
  if (!STORY.on || STORY.god || (STORY.phase !== 'wave' && STORY.phase !== 'boss')) return; player.hp -= v * (STORY.easy ? .5 : 1); if (player.hp <= 0) { player.hp = 0; failChapter('player') } }

// ---------- 적 ----------
function spawnPoint() { for (let k = 0; k < 8; k++) { const a = rnd(0, 6.283), p = CORE_P.clone().add(V3(Math.cos(a) * 13, 0, Math.sin(a) * 13)); if (p.length() > 19) p.setLength(19); if (p.distanceTo(player.pos) > 6) return p } return CORE_P.clone().add(V3(0, 0, -13)) }
function spawnFoe(type, pos, D) { const F = D || FOES[type], c = makeChar(lch(...F.col), lch(...F.acc), F.r, F.h);
  const e = { ...c, pos: pos.clone(), vel: V3(0, 0, 0), hp: F.hp, max: F.hp, dead: 0, home: pos.clone(), wt: 0, atk: 9999, temp: true, F, type, ai: foeAI, hpY: F.h + .85, hitR: F.r + .08, cd: 30 + Math.random() * 40, shootT: (F.shoot || 0) * (.5 + Math.random()), extra: [], onDie: foeDie };
  lookFoe(e, F.look); e.hpEl = document.createElement('div'); e.hpEl.className = 'hp'; e.hpEl.innerHTML = '<i></i>'; overlay.appendChild(e.hpEl); enemies.push(e);
  const R = PR.teamColor ? ramp(6) : ramp(F.hue ?? 300); spawn({ pool: 'alpha', p: pos.clone().setY(F.h * .6), life: 16, s0: [.25, F.h * 1.8], s1: [F.r * 4, .05], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.line, rot: Math.PI / 2 });
  spawn({ pool: 'galpha', p: V3(pos.x, .04, pos.z), life: 26, s0: F.r * 2, s1: F.r * 6, c0: rgba(R.edge, .8), c1: rgba(R.edge, 0), tex: TILE.ringThin, ease: .5 }); return e }
function lookFoe(e, look) { const g = e.g, F = e.F, r = F.r, h = F.h, acc = new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(...F.acc)) }), headY = h * .62 + r * .55;
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat || acc); m.position.set(x, y, z); g.add(m); return m };
  if (look === 'bug') for (const s of [-1, 1]) { const a = add(new THREE.CylinderGeometry(.02, .02, .45, 5), null, s * .14, headY + .42, -.05); a.rotation.z = -s * .4; add(new THREE.SphereGeometry(.055, 6, 5), null, s * .23, headY + .62, -.05) }
  if (look === 'zombie') { g.children[0].rotation.x = .22; g.children[1].position.z -= .16; g.children[2].position.z -= .1 }
  if (look === 'malware') for (let i = 0; i < 3; i++) { const c = add(new THREE.ConeGeometry(.08, .34, 5), null, (i - 1) * .16, headY + .32, 0); c.rotation.z = (1 - i) * .45 }
  if (['legacy', 'lprom', 'floppy', 'classic', 'orphan', 'loop'].includes(look)) { e.mat.transparent = true; e.mat.opacity = look === 'legacy' ? .78 : .93 }
  if (look === 'legacy' || look === 'lprom') for (let i = 0; i < (look === 'lprom' ? 5 : 3); i++) e.extra.push({ m: add(new THREE.BoxGeometry(.16, .16, .16), null, 0, 0, 0), a: i * 6.283 / 3, r: r + .5, y: h * .7 }); // 떠도는 조각: 글리치
  if (look === 'loop') { for (const rx of [Math.PI / 2, .3]) { const t = add(new THREE.TorusGeometry(r + .55, .07, 6, 40), null, 0, h * .55, 0); t.rotation.x = rx; e.extra.push({ spin: t, sp: rx > 1 ? .07 : -.05 }) } }
  if (look === 'orphan') { g.children[1].scale.setScalar(1.4); g.children[1].position.y += .12 }
  if (look === 'classic') { g.children[1].visible = false; add(new THREE.BoxGeometry(r * 1.5, r * 1.35, r * 1.3), e.mat, 0, headY, 0); add(new THREE.BoxGeometry(r * 1.05, r * .8, .02), null, 0, headY + .05, -r * .66) } // 상자 머리 + 꺼진 화면
  if (look === 'floppy') { add(new THREE.BoxGeometry(r * 1.3, r * 1.3, .06), null, 0, h * .42, -r * .98); add(new THREE.BoxGeometry(r * .62, r * .36, .07), new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(82, 4, 240)) }), 0, h * .42 + r * .38, -r * 1.0) }
  if (look === 'lprom') { add(new THREE.BoxGeometry(r * 1.3, h * .85, .1), new THREE.MeshLambertMaterial({ color: new THREE.Color(...lch(10, 3, 260)) }), 0, h * .6, r * .8);
    const eye = new THREE.MeshBasicMaterial({ color: new THREE.Color(...lch(80, 60, 70)) }); for (const s of [-1, 1]) add(new THREE.BoxGeometry(.13, .05, .02), eye, s * .15, headY + .02, -r * .7) } }
function foeAI(e) { for (const x of e.extra) { if (x.m) { x.a += .045; x.m.position.set(Math.cos(x.a) * x.r, x.y + Math.sin(x.a * 2) * .2, Math.sin(x.a) * x.r); x.m.rotation.x += .06; x.m.rotation.y += .04 } if (x.spin) x.spin.rotation.z += x.sp }
  if (e.boss) return bossAI(e); const F = e.F, cp = STORY.core ? STORY.core.g.position : CORE_P, sp = F.speed / 60;
  const toC = V3(cp.x - e.pos.x, 0, cp.z - e.pos.z), dc = toC.length(), toP = V3(player.pos.x - e.pos.x, 0, player.pos.z - e.pos.z), dp = toP.length();
  if (F.keep) { e.lookAt = player.pos; const want = dp - F.keep; if (Math.abs(want) > .3) e.pos.addScaledVector(toP.clone().normalize(), Math.sign(want) * sp); e.pos.addScaledVector(V3(-toP.z, 0, toP.x).normalize(), Math.sin(simF * .03 + e.hpY * 7) * sp * .6) }
  else if (dp < 2.2) { e.lookAt = player.pos; if (dp > 1.05) e.pos.addScaledVector(toP.clone().normalize(), sp); else if (--e.cd <= 0) { e.cd = 55; foeSwipe(); hurtPlayer(F.bite * 1.5, e) } }
  else { e.lookAt = cp; if (dc > 1.35 + F.r) e.pos.addScaledVector(toC.clone().normalize(), sp); else if (--e.cd <= 0) { e.cd = 60; biteCore(F.bite, e) } }
  if (F.shoot && --e.shootT <= 0) { e.shootT = F.shoot * (.8 + Math.random() * .4); if (dp < 15) actives.push(new EnemyShot(e)) }
  for (const o of enemies) { if (o === e || o.dead || !o.F) continue; const d = V3(e.pos.x - o.pos.x, 0, e.pos.z - o.pos.z), Lh = d.length(), m = F.r + o.F.r + .1; if (Lh < m && Lh > 1e-3) e.pos.addScaledVector(d, (m - Lh) / Lh * .25) } }
function foeSwipe() { const R = ramp(PR.teamColor ? 6 : 300); spawn({ pool: 'alpha', p: player.pos.clone().setY(1.1), life: 8, s0: [2, .14], s1: [2.4, .02], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.line, rot: rnd(0, 3) }) }
function foeDie(e) { if (e.boss) return bossDie(e); if (e.noCount) return; if (e.F.revive && !e.revived) { e.reviveAt = 80; return }
  STORY.kills++; const C = CHAPTERS[STORY.ch]; if (C) STORY.upd = C.upd[0] + (C.upd[1] - C.upd[0]) * .8 * Math.min(1, STORY.kills / STORY.need) }
function foeRevive(e) { e.reviveAt = 0; e.revived = true; e.dead = 0; e.hp = e.max * .5; e.g.visible = e.shadow.visible = true; const R = ramp(140);
  for (let i = 0; i < 10; i++) spawn({ p: e.pos.clone().add(V3(rnd(-.5, .5), .1, rnd(-.5, .5))), v: V3(0, rnd(2, 4), 0), life: 24, s0: [.06, .4], s1: [.02, .1], c0: rgba(R.core, 1), c1: rgba(R.body, 0), tex: TILE.spark, stretch: .05 });
  if (!STORY.zbark) { STORY.zbark = true; bark('adelie', '> 또 일어났어. 한 번 더.') } }

// ---------- 보스: 패턴은 모두 "범위 표시 → 맞히기"(적 공격은 다른 색 원리를 따른다) ----------
function spawnBoss(B) { const e = spawnFoe(null, CORE_P.clone().add(V3(0, 0, -4.5)), { ...B, bite: 30 }); e.boss = { B, t: 0, pat: null, cool: 80, i: 0, phase2: false }; e.hitR = B.r + .25; e.hpY = B.h + 1; STORY.boss = e;
  const R = ramp(B.hue); fxImpact(e.pos.clone().setY(1), R, 1.6, { sparks: 24, smoke: 10 }); return e }
function bossAI(e) { const S = e.boss, B = S.B, R = PR.teamColor ? ramp(6) : ramp(B.hue), toP = V3(player.pos.x - e.pos.x, 0, player.pos.z - e.pos.z), dp = toP.length(), k2 = S.phase2 ? .7 : 1; S.t++; e.lookAt = player.pos;
  if (!S.phase2 && e.hp < e.max * .5) { S.phase2 = true; bark(B.who, B.bark2); S.cool = Math.min(S.cool, 30) }
  const end = () => { S.pat = null; S.cool = Math.round((70 + Math.random() * 40) * k2) };
  if (!S.pat) { if (dp > 4.5) e.pos.addScaledVector(toP.clone().normalize(), B.speed / 60); if (--S.cool <= 0) S.pat = { type: B.pats[S.i++ % B.pats.length], t: 0 }; return }
  const P = S.pat; P.t++; const top = e.pos.clone().setY(B.h * .8);
  if (P.type === 'slam') { const N = Math.round(54 * k2), r = 2.6; if (P.t === 1) P.at = player.pos.clone();
    if (P.t <= N) { const k = P.t / N; once({ pool: 'galpha', p: V3(P.at.x, .045, P.at.z), s0: r * 2.1, c0: rgba(R.edge, .9), tex: TILE.ringThin }); once({ pool: 'galpha', p: V3(P.at.x, .04, P.at.z), s0: r * 2 * k, c0: rgba(R.edge, .28), tex: TILE.disc }); once({ p: top, s0: .8 + 1.4 * k, c0: rgba(R.body, .4), tex: TILE.glow }) }
    if (P.t === N) { fxImpact(V3(P.at.x, .6, P.at.z), R, 1.1, { sparks: 14, smoke: 4 }); cracks(P.at, R, 3.2, 90); shake(.25); if (player.pos.distanceTo(P.at) < r + .3) hurtPlayer(130, e) }
    if (P.t >= N + 20) end() }
  else if (P.type === 'ring') { const N = 32; if (P.t <= N) once({ p: top, s0: .6 + 2 * P.t / N, c0: rgba(R.body, .5), tex: TILE.glow });
    if (P.t === N || (S.phase2 && P.t === N + 18)) { const n = 12, off = P.t === N ? 0 : Math.PI / n; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + off, d = V3(Math.cos(a), 0, Math.sin(a)), from = e.pos.clone().setY(1.3);
        actives.push(new Projectile(from.clone().addScaledVector(d, 20), { from, noCharge: true, enemy: true, hue: PR.teamColor ? 6 : B.hue, size: .8, speed: 7.5, range: 22, trail: .6, pdmg: 32 })) } }
    if (P.t >= N + 40) end() }
  else if (P.type === 'dash') { const N = Math.round(40 * k2); if (P.t === 1) { P.dir = toP.clone().normalize(); P.from = e.pos.clone(); P.to = e.pos.clone().addScaledVector(P.dir, 11); if (P.to.length() > 20) P.to.setLength(20); P.rib = new Ribbon(2, false, .3); P.hit = false }
    if (P.t <= N) P.rib.set([P.from.clone().setY(.05), P.to.clone().setY(.05)], [1.7, 1.7], [rgba(R.edge, .4), rgba(R.edge, .4)], true);
    else if (P.t <= N + 10) { if (P.t === N + 1) P.rib.hide(); e.pos.copy(P.from).lerp(P.to, (P.t - N) / 10); spawn({ pool: 'alpha', p: e.pos.clone().setY(B.h * .5), life: 14, s0: [B.r * 2, B.h], s1: [B.r * 1.6, B.h * .9], c0: rgba(R.edge, .4), c1: rgba(R.haze, 0), tex: TILE.discSoft });
      if (!P.hit && player.pos.distanceTo(e.pos) < B.r + 1) { P.hit = true; hurtPlayer(120, e) } }
    if (P.t >= N + 30) { P.rib.dispose(); P.rib = null; end() } }
  else if (P.type === 'summon') { if (P.t <= 24) once({ p: top, s0: 1 + P.t * .06, c0: rgba(R.body, .45), tex: TILE.glow }); if (P.t === 24) for (let i = 0; i < (S.phase2 ? 3 : 2); i++) spawnFoe(B.add, e.pos.clone().add(V3(rnd(-2.5, 2.5), 0, rnd(-2.5, 2.5)))).noCount = true; if (P.t >= 40) end() }
  else if (P.type === 'shock') { const N = 26, Ln = 40; if (P.t <= N) once({ p: e.pos.clone().setY(.5), s0: 1 + 2 * P.t / N, c0: rgba(R.body, .5), tex: TILE.glow });
    if (P.t === N + 1) { shake(.3); dustRing(e.pos, 4); P.hit = false } if (P.t > N && P.t <= N + Ln) { const u = (P.t - N) / Ln, rr = 1 + 6.5 * u; // 7.5m 밖이면 피한다 once({ pool: 'gadd', p: V3(e.pos.x, .06, e.pos.z), s0: rr * 2, c0: rgba(R.hi, .9 * (1 - u)), tex: PR.hardHead ? TILE.ringThin : TILE.ringSoft });
      if (!P.hit && Math.abs(player.pos.distanceTo(e.pos) - rr) < .7) { P.hit = true; hurtPlayer(110, e) } } if (P.t >= N + Ln + 10) end() } }
function bossDie(e) { const S = e.boss, B = S.B, C = CHAPTERS[STORY.ch]; if (S.pat && S.pat.rib) S.pat.rib.dispose(); STORY.upd = C ? C.upd[1] : STORY.upd;
  fxImpact(e.pos.clone().setY(1.2), ramp(B.hue), 2.2, { sparks: 36, smoke: 14, shards: 26 }); flashV = .3; shake(.6); hitStop(10);
  for (const o of enemies) if (o !== e && !o.dead) { o.noCount = true; o.revived = true; damage(o, o.hp + 1, '', null) }
  STORY.phase = 'bossdown'; STORY.afterT = 80 }

// ---------- 진행 ----------
function storyStep() { const C = CHAPTERS[STORY.ch]; if (!C) return; coreTick();
  const Bo = STORY.boss; if (STORY.phase === 'boss' && Bo && !Bo.dead && CD.active <= 0 && CD.insert <= 0 && CD.after <= 0) { CD.focusT = player.pos.clone().lerp(Bo.pos, .38).setY(0); CD.active = 2 } // 보스전: 나와 보스를 한 화면에 player.hp = Math.min(STORY.maxHP, player.hp + 6 / 60);
  if (STORY.phase === 'wave') { if (STORY.queue.length) { if (--STORY.qt <= 0 && aliveFoes() < 8) { const [type, gap] = STORY.queue.shift(); spawnFoe(type, spawnPoint()); STORY.qt = gap } }
    else if (STORY.kills >= STORY.need && aliveFoes() === 0) { STORY.phase = 'bossintro'; const b = spawnBoss(C.boss); STORY.camT = player.pos.clone().lerp(b.pos, .6); talk(C.bossIntro, () => { STORY.phase = 'boss'; STORY.camT = null; bark(C.boss.who, C.boss.bark) }) } }
  if (STORY.phase === 'bossdown' && --STORY.afterT <= 0) { STORY.phase = 'outro'; STORY.camT = null; talk(C.outro, winChapter) } }
function clearFoes() { enemies.forEach(e => { e.dead = 9999; e.gone = true; scene.remove(e.g); scene.remove(e.shadow); e.hpEl.remove() }); enemies = []; STORY.boss = null }
function storyEnter() { if (STORY.on) return; STORY.saved = { floorL: SC.floorL, floorHue: SC.floorHue, enemyAttack: SC.enemyAttack, W }; STORY.on = true; document.body.classList.add('story'); SC.enemyAttack = false; clearFoes(); STORY.core = makeCore(); $('bStory').textContent = '◀ 연습장으로' }
function storyExit() { if (!STORY.on) return; hideMenu(); STORY.talk = null; tachieReset(); document.body.classList.remove('talking'); $('dlg').hidden = true; $('obj').hidden = true; $('bossbar').hidden = true; $('bark').hidden = true; clearFoes();
  if (STORY.core) { scene.remove(STORY.core.g); STORY.core = null } const S = STORY.saved || {}; SC.floorL = S.floorL ?? 24; SC.floorHue = S.floorHue ?? 214; SC.enemyAttack = S.enemyAttack ?? true;
  STORY.on = false; STORY.phase = 'off'; STORY.ch = null; document.body.classList.remove('story'); player.hp = 1000; paintFloor(); spawnEnemies(); setWeapon(S.W || 'staff'); $('bStory').textContent = '▶ 스토리 「지원 종료일」'; $('hudsk').style.visibility = '' }
function startChapter(i) { const C = CHAPTERS[i]; if (!C) return; storyEnter(); hideMenu(); clearFoes(); Object.assign(STORY, { ch: i, kills: 0, boss: null, upd: C.upd[0], zbark: false, camT: CORE_P.clone() });
  STORY.queue = []; for (const [type, n, gap] of C.waves) for (let k = 0; k < n; k++) STORY.queue.push([type, gap]); STORY.need = STORY.queue.length; STORY.qt = 90;
  STORY.maxHP = { staff: 1000, bow: 1000, sword: 1350, hammer: 1600 }[C.w]; STORY.core.hp = STORY.core.max; player.hp = STORY.maxHP; // 근접 캐릭터는 더 단단하다 player.pos.set(0, 0, 3); player.lock = 0; player.cast = 0; for (const k in cds) cds[k] = 0; if (holdAct) holdAct.release = true;
  STORY.allowW = true; setWeapon(C.w); STORY.allowW = false; SC.floorL = C.floor[0]; SC.floorHue = C.floor[1]; paintFloor(); camera.position.copy(player.pos).add(V3(0, 12.5 * SC.camH, 9.5 * SC.camH));
  STORY.phase = 'card'; STORY.cardT = 2.4; const ch = CHARS[C.w], car = tachieAR(ch.id, 'smile');
  showMenu(`<div class="cardart${car ? ' png" style="--ar:' + car : ''}">${tachieHTML(ch.id, 'smile')}</div><div class="box"><h4>CHAPTER ${C.n}</h4><h3>${C.title}</h3><p>${C.place} · <b style="color:${CAST[ch.id].color}">${ch.name}</b> (${CAST[ch.id].tag})</p><div class="hint">클릭하면 시작</div></div>`, 'card'); updateHUD() }
function cardDone() { if (STORY.phase !== 'card') return; hideMenu(); const C = CHAPTERS[STORY.ch]; STORY.phase = 'intro'; talk(C.intro, () => { STORY.phase = 'wave'; STORY.camT = null; bark('sys', '목표 · ' + C.goal.replace(/<[^>]+>/g, '')); if (C.tip) setTimeout(() => { if (STORY.phase === 'wave') bark('sys', C.tip) }, 4200) }) }
function winChapter() { const C = CHAPTERS[STORY.ch]; STORY.prog = Math.max(STORY.prog, C.n); try { localStorage.setItem('eol_prog', STORY.prog) } catch (e) { }
  if (STORY.ch === CHAPTERS.length - 1) return startEnding(); STORY.phase = 'clear'; const N = CHAPTERS[STORY.ch + 1];
  showMenu(`<div class="box"><h4>CHAPTER ${C.n} CLEAR</h4><h3>${C.title}</h3><p style="color:#8FD3FF">✓ 업데이트 준비 ${Math.round(STORY.upd)}%</p><p>다음 · CHAPTER ${N.n} 「${N.title}」 — ${CHARS[N.w].name}</p>
    <div class="acts"><button class="btn amber" data-act="next">다음 챕터</button><button class="btn" data-act="title">타이틀</button></div></div>`, 'clear') }
function failChapter(why) { if (STORY.phase === 'fail') return; STORY.phase = 'fail'; const C = CHAPTERS[STORY.ch], nm = CHARS[C.w].name;
  showMenu(`<div class="box">${why === 'core' ? '<h3>데이터 코어 손상</h3><p>유저님의 기억이 사라졌다……</p>' : `<h3>${nm} — 응답 없음</h3><p>다시 시작하면 돼요. ……아직은.</p>`}
    <div class="acts"><button class="btn amber" data-act="retry">다시 시작 (재부팅)</button><button class="btn" data-act="title">타이틀</button></div></div>`, 'fail') }
function openTitle() { storyEnter(); clearFoes(); STORY.ch = null; STORY.talk = null; tachieReset(); document.body.classList.remove('talking'); $('dlg').hidden = true; $('bossbar').hidden = true; STORY.phase = 'title'; updateHUD();
  const cards = CHAPTERS.map((C, i) => { const c = CAST[CHARS[C.w].id]; return `<div class="ch" data-act="start" data-arg="${i}"><small>CHAPTER ${C.n}</small><b>${C.title}</b><span><i style="background:${c.color}"></i>${c.name}</span>${STORY.prog >= C.n ? '<div class="ok">✓ 클리어</div>' : ''}</div>` }).join('');
  showMenu(`<div class="box"><div class="ttl"><small>OS 아가씨들의 마지막 업데이트</small><h2>지원 종료일</h2><em>END OF SUPPORT</em></div>
    <p>오래된 컴퓨터 한 대. 그 안에는 유저님을 위해 일하는 OS 아가씨들이 산다.<br>어느 날, 상냥한 업데이트 도우미가 찾아온다. "버그를 정리해 주세요. 유저님의 기억을 지켜야 해요."</p>
    <div class="lineup">${['fene', 'malus', 'adelie', 'prom'].map(id => `<div class="bust" style="--c:${CAST[id].color}">${TIMG[id + '_bust'] ? `<img src="${TIMG[id + '_bust']}" alt="">` : tachieHTML(id, 'smile').replace('viewBox="0 0 420 960"', 'viewBox="70 40 280 330"')}<b>${CAST[id].name}</b></div>`).join('')}</div>
    <div class="chs">${cards}</div><div class="acts"><button class="btn amber" data-act="start" data-arg="0">처음부터</button><button class="btn" data-act="practice">연습장으로</button></div>
    <label class="hint" style="display:inline-flex;gap:6px;align-items:center;cursor:pointer;color:var(--muted)"><input type="checkbox" id="easyChk" ${STORY.easy ? 'checked' : ''}> 이야기 위주로 (받는 피해 절반)</label>
    <div class="hint">WASD 이동 · 마우스 조준 · Q E R F 스킬 · Space 대화 넘기기 · Esc 일시정지 · M 가독성 모니터</div></div>`, 'title') }
function openPause() { STORY.prevPhase = STORY.phase; STORY.phase = 'pause'; showMenu(`<div class="box"><h3>일시정지</h3><div class="acts"><button class="btn amber" data-act="resume">계속하기</button><button class="btn" data-act="retry">챕터 다시 시작</button><button class="btn" data-act="title">타이틀</button><button class="btn" data-act="practice">연습장으로</button></div></div>`, 'pause') }
function resumeGame() { if (STORY.phase !== 'pause') return; STORY.phase = STORY.prevPhase; hideMenu() }
function startEnding() { STORY.phase = 'ending'; STORY.endI = -1; $('obj').hidden = true; $('bossbar').hidden = true; endingNext() }
function endingNext() { STORY.endI++; if (STORY.endI >= ENDING.length) return openTitle(); const [cls, t] = ENDING[STORY.endI];
  showMenu(`<div class="box"><div class="line">${t.replace(/</g, '&lt;')}</div><div class="hint">클릭 · Space</div></div>`, 'end ' + cls) }
function showMenu(html, cls) { const m = $('menu'); m.innerHTML = html; m.className = 'menu ' + (cls || ''); m.hidden = false }
function hideMenu() { $('menu').hidden = true }
function storyInit() { // 버튼·대화창 연결(UI가 준비된 뒤 호출)
tachieProbe();
$('menu').addEventListener('click', ev => { const b = ev.target.closest('[data-act]'); if (!b) { if (STORY.phase === 'ending') endingNext(); else if (STORY.phase === 'card') cardDone(); return }
  const a = b.dataset.act; const ez = document.getElementById('easyChk'); if (ez) STORY.easy = ez.checked; cv.focus(); if (a === 'start') startChapter(+b.dataset.arg); else if (a === 'next') startChapter(STORY.ch + 1); else if (a === 'retry') startChapter(STORY.ch);
  else if (a === 'title') openTitle(); else if (a === 'practice') storyExit(); else if (a === 'resume') resumeGame() });
$('bStory').onclick = () => { if (STORY.on) storyExit(); else openTitle(); cv.focus() };
$('dlg').addEventListener('click', advance); $('dlgSkip').addEventListener('click', ev => { ev.stopPropagation(); skipTalk() }) }

// ---------- 대화 ----------
function talk(lines, then) { STORY.talk = { lines, i: -1, then, text: '' }; tachieReset(); document.body.classList.add('talking'); $('dlg').hidden = false; $('hudsk').style.visibility = 'hidden'; nextLine() }
function nextLine() { const T = STORY.talk; if (!T) return; T.i++; if (T.i >= T.lines.length) return endTalk(); const [who0, text] = T.lines[T.i], [who, ex] = who0.split(':'), c = CAST[who] || CAST.sys; showTachie(who, ex); T.text = text; STORY.typed = 0;
  const d = $('dlg'); d.className = 'dlg' + (c.sys ? ' sys' : '') + (c.term ? ' term' : '') + (c.foe ? ' foe' : ''); d.style.setProperty('--c', c.color);
  $('dlgWho').innerHTML = c.name ? `<b>${c.name}</b><span>${c.tag || ''}</span>` : ''; $('dlgTxt').textContent = '' }
function advance() { const T = STORY.talk; if (!T) return; if (STORY.typed < T.text.length) { STORY.typed = T.text.length; $('dlgTxt').textContent = T.text } else nextLine() }
function endTalk() { const T = STORY.talk; STORY.talk = null; tachieReset(); document.body.classList.remove('talking'); $('dlg').hidden = true; $('hudsk').style.visibility = ''; if (T && T.then) T.then() }
function skipTalk() { const T = STORY.talk; if (!T) return; T.i = T.lines.length; endTalk() }
// ---------- 스탠딩 일러스트: 왼쪽 = 챕터 주인공, 오른쪽 = 상대. 말하는 쪽만 밝게 ----------
const TDEF = { fene: 'normal', malus: 'normal', adelie: 'half', prom: 'half', noti: 'joy' }, TIMG = {}, TAR = {};
function tachieProbe() { if (tachieProbe.done) return; tachieProbe.done = true; // tachie/ 폴더에 PNG가 있으면 그림을 교체한다
  const load = (nm, ok) => { const im = new Image(); im.onload = () => { TIMG[nm] = im.src; TAR[nm] = im.naturalWidth / im.naturalHeight; if (ok) ok() }; im.src = 'tachie/' + nm + '.png' };
  for (const id of TACHIE.ids) load(id, () => { TACHIE.exprs.forEach(e => load(id + '_' + e)); load(id + '_bust') }); // 기본 그림이 있을 때만 표정별 파일·얼굴 크롭을 찾는다
  for (const id of TACHIE.foes) load(id) } // 보스는 표정이 없다
function tachieKey(id, ex) { return TIMG[id + '_' + ex] ? id + '_' + ex : TIMG[id] ? id : null }
function tachieHTML(id, ex) { const k = tachieKey(id, ex); return k ? `<img src="${TIMG[k]}" alt="">` : TACHIE.svg(id, ex) }
function tachieAR(id, ex) { const k = tachieKey(id, ex); return k ? TAR[k].toFixed(4) : null } // PNG는 그림마다 폭/높이가 다르다(무기·머리카락)
function setSlot(slot, id, ex) { const el = $(slot === 'L' ? 'tcL' : 'tcR'), key = id + ':' + ex, ar = tachieAR(id, ex); if (el.dataset.k !== key) { if (el.dataset.id !== id) { el.classList.remove('on'); void el.offsetWidth } el.innerHTML = tachieHTML(id, ex); el.dataset.k = key; el.dataset.id = id }
  if (ar) el.style.setProperty('--ar', ar); else el.style.removeProperty('--ar');
  el.className = 'tc ' + slot + ' on' + (CAST[id] && CAST[id].foe ? ' foe' : '') + (id === 'noti' ? ' noti' : '') + (ar ? ' png' : '') }
function showTachie(who, ex) { const c = CAST[who]; const L = $('tcL'), R = $('tcR'); if (!c || c.sys || c.term) { [L, R].forEach(el => el.classList.add('dim')); return }
  const C = CHAPTERS[STORY.ch], main = C ? CHARS[C.w].id : 'fene', slot = who === main ? 'L' : 'R'; ex = ex || TDEF[who] || 'normal';
  setSlot(slot, who, ex); const me = slot === 'L' ? L : R, ot = slot === 'L' ? R : L; me.classList.add('talk'); me.classList.remove('dim'); ot.classList.remove('talk'); if (ot.classList.contains('on')) ot.classList.add('dim') }
function tachieReset() { for (const id of ['tcL', 'tcR']) { const el = $(id); el.className = 'tc ' + (id === 'tcL' ? 'L' : 'R') + (el.classList.contains('png') ? ' png' : '') + (el.classList.contains('noti') ? ' noti' : ''); el.dataset.k = ''; el.dataset.id = '' } } // 사라지는 동안 크기가 튀지 않게 png·noti는 남긴다
function bark(who, text) { const c = CAST[who] || CAST.sys, el = $('bark'); el.innerHTML = (c.name ? `<b style="color:${c.color}">${c.name}</b>` : '') + text.replace(/</g, '&lt;'); el.hidden = false; STORY.barkT = 3.4 }
function storyKey(k, e) { if (k === 'escape') { if (STORY.phase === 'pause') resumeGame(); else if (!storyBlocking() && STORY.ch != null) openPause(); e.preventDefault(); return true }
  if (k === 'm') { document.body.classList.toggle('showmon'); return true }
  if (STORY.talk) { if (k === ' ' || k === 'enter') advance(); e.preventDefault(); return true }
  if (STORY.phase === 'ending') { if (k === ' ' || k === 'enter') endingNext(); e.preventDefault(); return true }
  if (STORY.phase === 'card') { if (k === ' ' || k === 'enter') cardDone(); e.preventDefault(); return true }
  if (storyBlocking()) { e.preventDefault(); return true }
  if (k === 'tab' || ['5', '6', '7', '8'].includes(k)) { bark('sys', '스토리에서는 챕터의 캐릭터로 싸워요'); e.preventDefault(); return true } return false }
function storyTick(dt) { if (STORY.barkT > 0) { STORY.barkT -= dt; if (STORY.barkT <= 0) $('bark').hidden = true }
  if (!STORY.on) return; const T = STORY.talk; if (T && STORY.typed < T.text.length) { STORY.typed = Math.min(T.text.length, STORY.typed + dt * 42); $('dlgTxt').textContent = T.text.slice(0, Math.floor(STORY.typed)) }
  if (STORY.phase === 'card' && (STORY.cardT -= dt) <= 0) cardDone();
  if (STORY.camT && storyBlocking()) { CD.focus = (CD.focus || player.pos.clone()).lerp(STORY.camT, .06); CD.w += (1 - CD.w) * .06 } // 대화 중 카메라: 말하는 쪽을 본다
  if ((STORY.hudT += dt) > .12) { STORY.hudT = 0; updateHUD() } }
function updateHUD() { const C = CHAPTERS[STORY.ch]; if (!STORY.on || !C || STORY.phase === 'ending') { $('obj').hidden = true; $('bossbar').hidden = true; return }
  const K = STORY.core, nm = CHARS[C.w].name; $('obj').hidden = false;
  $('obj').innerHTML = `<h5>CHAPTER ${C.n} · ${C.title}</h5><p class="pl">${C.place} · ${nm}</p><p class="goal">목표 · ${C.goal}</p>
    <div class="row"><span>정리</span><b>${Math.min(STORY.kills, STORY.need)} / ${STORY.need}${STORY.phase === 'boss' ? ' · 보스' : ''}</b></div>
    <div class="bar core"><i style="width:${(K.hp / K.max * 100).toFixed(1)}%"></i><span>데이터 코어 ${Math.ceil(K.hp / K.max * 100)}%</span></div>
    <div class="bar hp"><i style="width:${(player.hp / STORY.maxHP * 100).toFixed(1)}%;background:${CAST[CHARS[C.w].id].color}"></i><span>${nm} ${Math.ceil(player.hp)}</span></div>
    <div class="row upd"><span>✓ 업데이트 준비</span><b>${Math.floor(STORY.upd)}%</b></div><div class="row eol"><span>${nm}의 지원 종료까지</span><b class="${C.eolCls || ''}">${C.eol}</b></div>`;
  const B = STORY.boss; if (B && !B.dead && STORY.phase !== 'bossintro') { $('bossbar').hidden = false; $('bossName').textContent = CAST[B.boss.B.who].name; $('bossHP').style.width = Math.max(0, B.hp / B.max * 100) + '%' } else $('bossbar').hidden = true }


// ============================== 시뮬레이션 ==============================
function simStep() {
  simF++; if (invF > 0) invF = invF === 1 ? 2 : 0; camStep(); if (freeze > 0) { freeze--; return }
  // 플레이어
  const mv = V3(0, 0, 0); if (keys.has('w')) mv.z -= 1; if (keys.has('s')) mv.z += 1; if (keys.has('a')) mv.x -= 1; if (keys.has('d')) mv.x += 1;
  if (mv.lengthSq()) moveTo = null; else if (moveTo) { const d = moveTo.clone().sub(player.pos); d.y = 0; if (d.length() < .2) moveTo = null; else mv.copy(d.normalize()) }
  if (mv.lengthSq() && !player.lock) player.pos.addScaledVector(mv.normalize(), 6.5 / 60 * (1 - player.slow) * (player.cast ? .3 : 1));
  if (player.pos.length() > 21) player.pos.setLength(21); if (player.cast) player.cast--;
  const fd = aim.clone().sub(player.pos); if (!player.faceLock) player.face = Math.atan2(-fd.x, -fd.z); if (player.lock) player.lock--;
  // 적
  for (const e of enemies) { if (e.dead) { if (e.temp) { if (e.reviveAt) { if (--e.reviveAt <= 0) foeRevive(e) } else if (--e.dead <= 0) e.gone = true; continue } if (--e.dead <= 0) { e.hp = e.max; e.pos.copy(e.home); e.g.visible = e.shadow.visible = true; e.dead = 0 } continue }
    if (e.ai) e.ai(e); else if (SC.enemyMove) { if (--e.wt <= 0) { e.wt = 90 + Math.random() * 120; e.goal = e.home.clone().add(V3(rnd(-3, 3), 0, rnd(-3, 3))) } const d = e.goal.clone().sub(e.pos); if (d.length() > .2) e.pos.addScaledVector(d.normalize(), 1.4 / 60) }
    e.pos.addScaledVector(e.vel, 1 / 60); e.vel.multiplyScalar(.86); if (e.fl) e.fl.multiplyScalar(.86);
    if (!e.ai && SC.enemyAttack && --e.atk <= 0) { e.atk = 160 + Math.random() * 140; if (e.pos.distanceTo(player.pos) < 18) actives.push(new EnemyShot(e)) } }
  enemies = enemies.filter(e => { if (!e.gone) return true; scene.remove(e.g); scene.remove(e.shadow); e.hpEl.remove(); return false }); if (STORY.on) storyStep();
  updateParts(); actives.forEach(a => a.update()); animStep(); actives = actives.filter(a => !a.dead);
  for (const k in cds) cds[k] = Math.max(0, cds[k] - 1);
  for (const c of [player, ...enemies]) if (c.flash > 0) c.flash--;
  shakeA *= .86; flashV *= .72; dimV *= .6; tintA *= .94;
  dmgs.forEach(d => d.age++); dmgs = dmgs.filter(d => { if (d.age > 50) { d.el.remove(); return false } return true });
}
class EnemyShot { constructor(e) { this.e = e; this.t = 0; this.dead = false; this.R = ramp(PR.teamColor ? 6 : SK.Q.hue) }
  update() { this.t++; const R = this.R, p = this.e.pos.clone().setY(1.2); if (this.e.dead) { this.dead = true; return }
    if (this.t < 22) { once({ p, s0: .5 + this.t * .06, c0: rgba(R.body, .55), tex: TILE.glow }); if (PR.teamColor) once({ pool: 'alpha', p, s0: 1.2, c0: rgba(R.hi, .7 * (this.t / 22)), tex: TILE.ringThin }) }
    if (this.t === 22) { actives.push(new Projectile(player.pos.clone(), { from: p, noCharge: true, enemy: true, hue: PR.teamColor ? 6 : SK.Q.hue, size: .75, speed: 9, range: 22, trail: .7 })); this.dead = true } } }

// ============================== 가독성 모니터 ==============================
const monBuf = new Uint8Array(MW * MH * 4), fxBuf = new Uint8Array(MW * MH * 4); let prevY = null, monEv = [], monFl = [], covH = [], coreH = [], lastSimForMon = -1;
function measure() { // 실제 화면(색 보기)과 이펙트만 그린 화면을 작게 읽는다
  matFinal.uniforms.mode.value = 0; pass(matFinal, rtMon); renderer.readRenderTargetPixels(rtMon, 0, 0, MW, MH, monBuf); matFinal.uniforms.mode.value = VM;
  const n = MW * MH, Y = new Float32Array(n); for (let i = 0; i < n; i++) Y[i] = LIN8[monBuf[i * 4]] * .2126 + LIN8[monBuf[i * 4 + 1]] * .7152 + LIN8[monBuf[i * 4 + 2]] * .0722;
  if (prevY) { let u = 0, d = 0; for (let i = 0; i < n; i++) { if (Math.min(Y[i], prevY[i]) >= .8) continue; const dd = Y[i] - prevY[i]; if (dd >= .1) u++; else if (dd <= -.1) d++ } u /= n; d /= n;
    if (u >= .1 || d >= .1) { const sg = u >= d ? 1 : -1, last = monEv[monEv.length - 1]; if (last && last[1] !== sg && simF - last[0] < 60) { monFl.push(simF); monEv.pop() } else monEv.push([simF, sg]) } }
  prevY = Y; monFl = monFl.filter(f => simF - f < 60); monEv = monEv.filter(e => simF - e[0] < 60);
  const bg = scene.background; scene.background = new THREE.Color(0, 0, 0); camera.layers.set(1); renderer.setRenderTarget(rtFx); renderer.render(scene, camera); camera.layers.enableAll(); scene.background = bg;
  renderer.readRenderTargetPixels(rtFx, 0, 0, MW, MH, fxBuf); let cov = 0, core = 0, sumL = 0;
  for (let i = 0; i < n; i++) { const r = fxBuf[i * 4], g = fxBuf[i * 4 + 1], b = fxBuf[i * 4 + 2]; if (Math.max(r, g, b) > 16) { cov++; const L = Lstar(r / 255, g / 255, b / 255); sumL += L; if (L >= 85) core++ } }
  covH.push(cov / n * 100); coreH.push(cov ? core / cov * 100 : 0); if (covH.length > 120) { covH.shift(); coreH.shift() }
  return { flashes: monFl.length, cov: cov / n * 100, core: cov ? core / cov * 100 : 0, fxL: cov ? sumL / cov : 0 } }
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
let monLast = { flashes: 0, cov: 0, core: 0, fxL: 0 };
function drawMon() { const m = monLast, covA = avg(covH.slice(-60)), coreA = avg(coreH.slice(-30)), st = (v, g, w) => v <= g ? 'p' : v <= w ? 'w' : 'f';
  const dL = m.fxL ? m.fxL - SC.floorL : 0;
  document.getElementById('mon').innerHTML = `<h4>가독성 모니터</h4>
  <div class="mrow"><span>섬광 (최근 1초)</span><b class="${st(m.flashes, 2, 3)}">${m.flashes}회</b><small>1초 3회 이하(광과민성 근사) · 임팩트 프레임</small></div>
  <div class="mrow"><span>화면 덮음 (1초 평균)</span><b class="${st(covA, 25, 40)}">${covA.toFixed(1)}%</b><small>40% 넘게 오래 덮으면 위험 · 게임 비주얼 스택</small></div>
  <div class="mrow"><span>코어 면적 (0.5초 평균)</span><b class="${st(coreA, 7.5, 12)}">${coreA.toFixed(1)}%</b><small>지속 구간 이펙트의 4–7.5% · 밝은 면적은 희소하게</small></div>
  <div class="mrow"><span>이펙트 평균 명도 − 바닥</span><b class="${dL >= 30 || !m.fxL ? 'p' : dL >= 20 ? 'w' : 'f'}">${m.fxL ? Math.round(dL) : '—'}</b><small>30 이상 · 대비의 크기가 시선을 정한다</small></div>
  <canvas id="spark" width="420" height="68"></canvas>`;
  const c = document.getElementById('spark').getContext('2d'); c.fillStyle = 'rgba(255,255,255,.04)'; c.fillRect(0, 0, 420, 68); c.strokeStyle = 'rgba(239,68,68,.5)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(0, 68 - 40 * .68 * 1.5); c.lineTo(420, 68 - 40 * .68 * 1.5); c.stroke(); c.setLineDash([]);
  c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); covH.forEach((v, i) => { const x = i / 119 * 420, y = 68 - Math.min(68, v * .68 * 1.5); i ? c.lineTo(x, y) : c.moveTo(x, y) }); c.stroke();
  c.fillStyle = '#8A91A6'; c.font = '600 18px sans-serif'; c.fillText('화면 덮음 2초', 6, 20) }

// ============================== 궁극기 카메라 ==============================
// 근거: 구도 축 하나로 왕복(시전자 ↔ 대상을 대각선 하나에) · 화면 레벨 장치(모으기 끝 비네트, 충격 프레임 색수차)
//       임팩트 프레임(대상 클로즈업 인서트 = 카메라가 다른 유일한 구간 · 흑 2f → 암전 1f → 백 1f → 흑 1f)
const CD = { focus: null, focusT: null, w: 0, push: 1, pushT: 1, yaw: 0, yawT: 0, pitch: 0, pitchT: 0, lb: 0, lbT: 0, vig: 0, vigT: 0, ca: 0, wide: 0, kick: 0, active: 0, after: 0, peakP: null, insert: 0, ins: null, inv: false, ach: 0, freeze: false, cut: false };
const camOn = () => PR.ultCam, cine = () => SC.camStyle !== 'game';
function camYawFor(from, to) { const d = to.clone().sub(from); d.y = 0; if (d.length() < 1.5) return 0; const th = Math.atan2(-d.x, -d.z); let best = 0, bd = 9;
  for (const o of [-Math.PI / 4, Math.PI / 4, -3 * Math.PI / 4, 3 * Math.PI / 4]) { const psi = Math.atan2(Math.sin(th - o), Math.cos(th - o)); if (Math.abs(psi) < bd) { bd = Math.abs(psi); best = psi } } return Math.max(-.5, Math.min(.5, best)) }
function camCharge(from, to, k) { if (!camOn()) return; const self = from.distanceTo(to) < 1.5, c = cine(); CD.active = 3;
  CD.focusT = from.clone().lerp(to, self ? 0 : .5).setY(0); CD.pushT = 1 - (c ? .2 : .12) * Math.min(1, k * 1.15) - (self ? .05 * k : 0); CD.yawT = (c ? 1 : .5) * camYawFor(from, to) * Math.min(1, k * 1.6);
  CD.pitchT = self ? .45 * k : .15 * k; CD.lbT = c ? Math.min(1, k * 2.5) : 0; CD.vigT = k > .6 ? (k - .6) / .4 : 0 }
function camHold() { if (!camOn()) return; CD.active = 3; CD.freeze = true; CD.vigT = 1 }
function camPeak(p, axis, o = {}) { if (!camOn()) return; CD.vigT = 0; CD.vig = 0; CD.peakP = p.clone().setY(0); CD.after = 40; CD.active = 0;
  if (cine()) { const d = axis && axis.lengthSq() > .01 ? axis.clone().setY(0).normalize() : dirOf(player.face), side = V3(-d.z, 0, d.x).multiplyScalar(o.flip ? -1 : 1);
    const pos = p.clone().setY(0).addScaledVector(d, -(o.back ?? 3.4)).addScaledVector(side, o.side ?? 1.6).add(V3(0, o.h ?? 1.2, 0));
    CD.ins = { pos, look: p.clone().setY(o.lookY ?? 1), fov: o.fov ?? 42 }; CD.insert = 5; CD.inv = invF > 0; if (CD.inv) invF = 0; CD.ach = PR.impactFrame ? 1 : 0 }
  else { CD.kick = 1; CD.wide = .55; CD.ca = PR.impactFrame ? .5 : .25 } }
function camStep() { // 시뮬레이션 1f마다(히트스톱 중에도) 진행
  CD.freeze = false;
  if (CD.insert > 0) { CD.insert--; if (CD.insert === 0) { CD.wide = 1; CD.ca = 1; CD.cut = true; CD.ins = null } }
  if (CD.active > 0) CD.active--; else if (CD.after > 0) { CD.after--; CD.focusT = CD.peakP; CD.pushT = 1; CD.yawT = CD.yaw * .97; CD.pitchT = 0; CD.lbT = cine() && CD.after > 12 ? 1 : 0; CD.vigT = 0 }
  else { CD.focusT = null; CD.pushT = 1; CD.yawT = 0; CD.pitchT = 0; CD.lbT = 0; CD.vigT = 0 }
  const e = CD.active ? .07 : .05; CD.push += (CD.pushT - CD.push) * e; CD.yaw += (CD.yawT - CD.yaw) * e; CD.pitch += (CD.pitchT - CD.pitch) * e; CD.lb += (CD.lbT - CD.lb) * .1; CD.vig += (CD.vigT - CD.vig) * .25;
  CD.w += ((CD.focusT ? 1 : 0) - CD.w) * e; if (CD.focusT) CD.focus = CD.focus ? CD.focus.lerp(CD.focusT, .15) : CD.focusT.clone();
  CD.wide *= .965; CD.ca *= .87; CD.kick *= .72; if (CD.ca < .003) CD.ca = 0 }
function insertPhase() { const i = 5 - CD.insert; return CD.insert > 0 ? i : -1 } // 0·1 흑 · 2 암전 · 3 백 반전 · 4 흑
function placeCamera() {
  if (CD.insert > 0 && CD.ins) { camera.position.copy(CD.ins.pos); if (camera.fov !== CD.ins.fov) { camera.fov = CD.ins.fov; camera.updateProjectionMatrix() } camera.lookAt(CD.ins.look); return }
  if (camera.fov !== 34) { camera.fov = 34; camera.updateProjectionMatrix() }
  const dist = CD.push * (1 + .16 * CD.wide) * (1 - .12 * CD.kick), off = V3(0, 12.5 * SC.camH * dist * (1 - .32 * CD.pitch), 9.5 * SC.camH * dist * (1 + .12 * CD.pitch)).applyAxisAngle(up, CD.yaw);
  const fp = CD.focus && CD.w > .001 ? player.pos.clone().lerp(CD.focus, CD.w) : player.pos.clone(), want = fp.clone().add(off);
  if (CD.cut) { camera.position.copy(want); CD.cut = false } else if (!CD.freeze) camera.position.lerp(want, .14);
  const look = fp.clone().add(V3(0, .5 + .5 * CD.pitch, -1).applyAxisAngle(up, CD.yaw));
  if (shakeA > .002) camera.position.add(V3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(shakeA)); camera.lookAt(look) }

// ============================== 루프 ==============================
let paused = false, stepReq = false, TS = 1, VM = 0, acc = 0, lastT = performance.now(), demo = null;
function render() {
  // 카메라
  placeCamera();
  // 캐릭터 위치
  for (const c of [player, ...enemies]) { c.g.position.copy(c.pos); c.shadow.position.set(c.pos.x, .015, c.pos.z); c.mat.emissive.setScalar(c.flash > 0 ? .3 : 0) } updateRig();
  enemies.forEach(e => { const lk = e.lookAt || player.pos; e.g.rotation.set(0, Math.atan2(-(lk.x - e.pos.x), -(lk.z - e.pos.z)), 0); if (e.fl && e.fl.lengthSq() > 1e-5) e.g.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(V3(e.fl.z, 0, -e.fl.x).normalize(), e.fl.length())) }); // 피격 반동: 맞은 방향으로 젖혀진다
  fillPools();
  renderer.setRenderTarget(rtMain); renderer.render(scene, camera);
  matBright.uniforms.t.value = rtMain.texture; pass(matBright, rtBr); matBlur.uniforms.t.value = rtBr.texture; matBlur.uniforms.d.value.set(4 / RW, 0); pass(matBlur, rtBa); matBlur.uniforms.t.value = rtBa.texture; matBlur.uniforms.d.value.set(0, 4 / RH); pass(matBlur, rtBb);
  const U = matFinal.uniforms; U.t.value = rtMain.texture; U.b.value = rtBb.texture; U.bloom.value = SC.bloom; U.mode.value = VM; const ip = insertPhase(); U.inv.value = invF === 2 || (ip === 3 && CD.inv) ? 1 : 0; U.lb.value = CD.lb; U.vig.value = CD.vig; U.ca.value = CD.ca; U.ach.value = ip >= 0 && CD.ach ? (ip === 2 ? 2 : 1) : 0; U.spd.value = ip >= 0 ? 1 : 0; U.sc.value.set(.5, .5); U.flash.value = flashV; U.dim.value = dimV; U.tint.value.set(...tintC); U.tintA.value = tintA;
  pass(matFinal, null);
  if (simF !== lastSimForMon) { lastSimForMon = simF; monLast = measure(); if (simF % 6 === 0) drawMon() }
  // DOM: 체력 · 데미지 숫자
  const r = cv.getBoundingClientRect(), pr = p => { const v = p.clone().project(camera); return [(v.x + 1) / 2 * r.width, (1 - v.y) / 2 * r.height] };
  overlay.style.visibility = CD.insert > 0 ? 'hidden' : '';
  enemies.forEach(e => { if (e.dead || e.boss) { e.hpEl.style.display = 'none'; return } e.hpEl.style.display = ''; const [x, y] = pr(e.pos.clone().add(V3(0, e.hpY || 2.7, 0))); e.hpEl.style.left = x + 'px'; e.hpEl.style.top = y + 'px'; e.hpEl.firstChild.style.width = Math.max(0, e.hp / e.max * 100) + '%' });
  dmgs.forEach(d => { const [x, y] = pr(d.p.clone().add(V3(0, d.age * .03, 0))); d.el.style.left = x + 'px'; d.el.style.top = y + 'px'; d.el.style.opacity = d.age > 34 ? (50 - d.age) / 16 : 1; d.el.style.transform = `translate(-50%,-50%) scale(${d.age < 5 ? 1.4 - d.age * .08 : 1})` });
  drawHudSk();
}
function frame(now) { const dt = Math.min(.1, (now - lastT) / 1000); lastT = now;
  storyTick(dt); const blocked = storyBlocking(); if (blocked) acc = 0;
  if (blocked) { } else if (!paused) { acc += dt * 60 * TS; let n = 0; while (acc >= 1 && n < 4) { acc -= 1; n++; if (demo) demo(); simStep() } } else if (stepReq) { stepReq = false; if (demo) demo(); simStep() }
  render(); requestAnimationFrame(frame) }

// ============================== UI ==============================
const $ = id => document.getElementById(id);
function drawHudSk() { $('hudsk').innerHTML = ['Q', 'E', 'R', 'F'].map(k => { const sk = WS()[k], cd = cds[k] / sk.cd; return `<div class="sk"><span class="sw" style="background:${hex(ramp(sk.hue).body)}"></span><b>${k}</b><small>${STORY.on ? ALIAS[W][k] : sk.name}</small><i style="height:${Math.round(cd * 100)}%"></i></div>` }).join('') }
function setTS(v) { TS = v; document.querySelectorAll('[data-ts]').forEach(b => b.classList.toggle('on', +b.dataset.ts === v)); syncBar() }
function setVM(v) { VM = v; document.querySelectorAll('[data-vm]').forEach(b => b.classList.toggle('on', +b.dataset.vm === v)); syncBar() }
function togglePause() { paused = !paused; syncBar() }
function syncBar() { document.querySelectorAll('.bar [data-wb]').forEach(b => b.classList.toggle('on', b.dataset.wb === W)); $('bPause').textContent = paused ? '▶ 재생' : '❚❚ 일시정지'; $('modeTag').textContent = `${WEAPONS[W].name} · ${['컬러', '흑백', '밸류 4단'][VM]} · ${TS === 1 ? '1×' : TS + '×'}${paused ? ' · 일시정지' : ''}${allOff ? ' · 원리 꺼짐' : ''}` }
let allOff = false, saved = null;
function toggleAll() { if (!allOff) { saved = { ...PR }; PRINCIPLES.forEach(p => PR[p[0]] = false); allOff = true } else { Object.assign(PR, saved || {}); allOff = false } buildUI(); syncBar() }
function buildUI() {
  const groups = {}; PRINCIPLES.forEach(p => (groups[p[1]] = groups[p[1]] || []).push(p));
  $('pane-pr').innerHTML = Object.entries(groups).map(([g, ps]) => `<div class="sec"><h3>${g}</h3>${ps.map(([k, , n, d, cd]) => `<label class="opt"><input type="checkbox" data-pr="${k}" ${PR[k] ? 'checked' : ''}><b>${n}</b><p>${d}</p><span class="cd">핸드북 · ${cd}</span></label>`).join('')}</div>`).join('');
  const SKO = o => o === 'SC' ? SC : WS()[o];
  const sl = (o, k, n, a, b, s) => `<label class="sl"><span>${n}</span><input type="range" min="${a}" max="${b}" step="${s}" data-o="${o}" data-k="${k}" value="${SKO(o)[k]}"><span>${SKO(o)[k]}</span></label>`;
  const pre = o => `<div class="bar" style="margin:2px 0 4px">${PRESETS.map(([n, h]) => `<button class="btn" data-preset="${o}" data-h="${h}" style="padding:5px 8px"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${hex(ramp(h).body)};margin-right:5px"></span>${n}</button>`).join('')}</div>`;
  const wsel = `<h3>무기</h3><div class="bar" style="margin:0 0 6px">${WKEYS.map((w, i) => `<button class="btn ${w === W ? 'on' : ''}" data-w="${w}">${WEAPONS[w].name} <span style="opacity:.55">${i + 5}</span></button>`).join('')}</div><p class="note" style="margin:0 0 4px">무기를 바꾸면 Q·E·R·F가 그 무기의 스킬로 바뀐다. 원리 스위치는 모든 무기에 똑같이 걸린다. 무기 전환: <b>Tab</b> 또는 <b>5–8</b>.</p>`;
  const head = (k, sub) => { const sk = WS()[k]; return `<div class="skh"><i style="background:${hex(ramp(sk.hue).body)}"></i><b>${k} · ${sk.name}${sk.hold ? ' (누르고 있기)' : ''}</b></div><p class="note" style="margin:0 0 4px">${sub || sk.desc || ''}</p>` };
  const extra = { speed: ['속도', 8, 60, 1], dist: ['돌진 거리', 3, 12, .5], radius: ['범위', 1.5, 6, .1] };
  if (W === 'staff') $('pane-sk').innerHTML = `<div class="sec">${wsel}
   ${head('Q', '발사 → 비행 → 착탄 직전 누르기 → 착탄')}${pre('Q')}${sl('Q', 'hue', '색상(°)', 0, 359, 1)}${sl('Q', 'size', '크기', .5, 2, .05)}${sl('Q', 'speed', '속도', 8, 40, 1)}${sl('Q', 'trail', '꼬리 길이', .3, 2.5, .05)}
   <label class="sl"><span>머리 모양</span><select data-o="Q" data-k="motifShape">${[['heart', '하트'], ['star', '4각 별'], ['disc', '원']].map(([v, n]) => `<option value="${v}" ${SK.Q.motifShape === v ? 'selected' : ''}>${n}</option>`).join('')}</select><span></span></label>
   ${head('E', '누르는 동안 유지 · 투명 막 + 안쪽 흐름선')}${pre('E')}${sl('E', 'hue', '색상(°)', 0, 359, 1)}${sl('E', 'size', '두께', .5, 2, .05)}${sl('E', 'len', '최대 길이', 6, 26, 1)}
   ${head('R', '범위 표시 → 모으기 → 누르기 → 폭발')}${pre('R')}${sl('R', 'hue', '색상(°)', 0, 359, 1)}${sl('R', 'size', '크기', .5, 2, .05)}${sl('R', 'charge', '모으기(f)', 12, 90, 1)}
   <label class="opt"><input type="checkbox" data-sko="R" data-k="impactFrame" ${SK.R.impactFrame ? 'checked' : ''}><b>폭발에도 임팩트 프레임</b><p>궁극기가 아닌 스킬에 쓰면 섬광이 쌓인다. 켜고 연타해서 모니터로 확인해 본다.</p></label>
   ${head('F', '작은 1막 → 큰 2막 · 정점 임팩트 프레임')}${pre('F')}${sl('F', 'hue', '색상(°)', 0, 359, 1)}${sl('F', 'size', '크기', .6, 1.6, .05)}</div>`;
  else $('pane-sk').innerHTML = `<div class="sec">${wsel}${['Q', 'E', 'R', 'F'].map(k => { const sk = WS()[k]; return head(k) + pre(k) + sl(k, 'hue', '색상(°)', 0, 359, 1) + sl(k, 'size', '크기', .5, k === 'F' ? 1.6 : 2, .05) + Object.keys(extra).filter(x => x in sk).map(x => sl(k, x, ...extra[x])).join('') }).join('')}
   <p class="note">색을 바꾸면 무기에 붙은 빛(검날 · 활시위 · 망치 띠)도 Q 색으로 같이 바뀐다.</p></div>`;
  $('pane-sc').innerHTML = `<div class="sec"><h3>장면</h3>${sl('SC', 'floorL', '바닥 명도', 8, 60, 1)}${sl('SC', 'floorHue', '바닥 색상', 0, 359, 1)}${sl('SC', 'bloom', '블룸', 0, 1.2, .05)}${sl('SC', 'camH', '카메라 거리', .7, 1.5, .05)}
   <h3>카메라</h3><label class="sl"><span>궁극기 연출</span><select data-o="SC" data-k="camStyle">${[['cine', '시네마틱 · 인서트 컷 + 레터박스'], ['game', '게임형 · 컷 없이 밀고 당기기']].map(([v, n]) => `<option value="${v}" ${SC.camStyle === v ? 'selected' : ''}>${n}</option>`).join('')}</select><span></span></label>
   <p class="note" style="margin-top:2px">원리 탭의 <b>궁극기 카메라 연출</b>을 끄면 카메라가 늘 고정된다. 클로즈업 인서트는 임팩트 프레임과 함께 켜야 흑백 인서트가 된다.</p>
   <h3>게임</h3>${sl('SC', 'enemies', '적 수', 1, 12, 1)}
   <label class="opt"><input type="checkbox" data-sc="enemyAttack" ${SC.enemyAttack ? 'checked' : ''}><b>적이 공격한다</b><p>적 투사체가 날아와 내 이펙트와 섞일 때 읽히는지 본다.</p></label>
   <label class="opt"><input type="checkbox" data-sc="enemyMove" ${SC.enemyMove ? 'checked' : ''}><b>적이 움직인다</b><p>끄면 제자리 허수아비.</p></label>
   <p class="note">바닥 명도를 올려 밝은 맵에서도 이펙트가 읽히는지(모니터의 "이펙트 평균 명도 − 바닥") 확인한다.</p></div>`;
  document.querySelectorAll('[data-pr]').forEach(el => el.onchange = () => { PR[el.dataset.pr] = el.checked; allOff = false; syncBar() });
  document.querySelectorAll('[data-o]').forEach(el => el.oninput = () => { const o = SKO(el.dataset.o), k = el.dataset.k; if (k === 'hue' && el.dataset.o === 'Q') tintWeapon(); o[k] = el.tagName === 'SELECT' ? el.value : +el.value; if (el.nextElementSibling) el.nextElementSibling.textContent = o[k];
    if (el.dataset.o === 'SC') { if (k === 'floorL' || k === 'floorHue') paintFloor(); if (k === 'enemies') spawnEnemies() } });
  document.querySelectorAll('[data-sko]').forEach(el => el.onchange = () => { WS()[el.dataset.sko][el.dataset.k] = el.checked });
  document.querySelectorAll('[data-w]').forEach(el => el.onclick = () => setWeapon(el.dataset.w));
  document.querySelectorAll('[data-sc]').forEach(el => el.onchange = () => { SC[el.dataset.sc] = el.checked });
  document.querySelectorAll('[data-preset]').forEach(el => el.onclick = () => { WS()[el.dataset.preset].hue = +el.dataset.h; if (el.dataset.preset === 'Q') tintWeapon(); buildUI() });
  const kh = $('keysSk'); if (kh) kh.innerHTML = ['Q', 'E', 'R', 'F'].map(k => `<b>${k}</b> ${WS()[k].name}${WS()[k].hold ? '(누르기)' : ''}`).join(' · ');
}
document.querySelectorAll('.tab').forEach(t => t.onclick = () => { document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === t)); document.querySelectorAll('.pane').forEach(p => p.hidden = p.id !== 'pane-' + t.dataset.tab); if (t.dataset.tab === 'io') $('ioTxt').value = cfgJSON() });
const cfgJSON = () => JSON.stringify({ PR, SC, W, WP: Object.fromEntries(WKEYS.map(w => [w, WEAPONS[w].skills])) }, null, 1);
$('bPause').onclick = togglePause; $('bStep').onclick = () => { paused = true; stepReq = true; syncBar() };
document.querySelectorAll('[data-wb]').forEach(b => b.onclick = () => setWeapon(b.dataset.wb)); document.querySelectorAll('[data-ts]').forEach(b => b.onclick = () => setTS(+b.dataset.ts)); document.querySelectorAll('[data-vm]').forEach(b => b.onclick = () => setVM(+b.dataset.vm));
$('bAll').onclick = () => { PRINCIPLES.forEach(p => PR[p[0]] = p[5]); allOff = false; buildUI(); syncBar() }; $('bNone').onclick = () => { if (!allOff) toggleAll() };
$('bCopy').onclick = () => { $('ioTxt').value = cfgJSON(); navigator.clipboard && navigator.clipboard.writeText($('ioTxt').value) };
$('bLoad').onclick = () => { try { const j = JSON.parse($('ioTxt').value); Object.assign(PR, j.PR || {}); for (const k in j.SK || {}) Object.assign(SK[k], j.SK[k]); for (const w in j.WP || {}) if (WEAPONS[w]) for (const k in j.WP[w]) Object.assign(WEAPONS[w].skills[k], j.WP[w][k]); Object.assign(SC, j.SC || {}); paintFloor(); spawnEnemies(); if (j.W) setWeapon(j.W); else buildUI() } catch (e) { $('ioTxt').value = 'JSON 형식이 아니다' } };
$('bShot').onclick = () => { const a = document.createElement('a'); a.download = `arena_F${simF}.png`; a.href = cv.toDataURL('image/png'); a.click() };
$('bRec').onclick = () => { if (rec) { rec.stop(); return } const st = cv.captureStream(60); rec = new MediaRecorder(st, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm', videoBitsPerSecond: 16e6 }); const ch = [];
  rec.ondataavailable = e => ch.push(e.data); rec.onstop = () => { const a = document.createElement('a'); a.download = 'arena.webm'; a.href = URL.createObjectURL(new Blob(ch, { type: 'video/webm' })); a.click(); rec = null; $('bRec').textContent = '녹화(webm)'; $('bRec').classList.remove('on') }; rec.start(); $('bRec').textContent = '■ 녹화 멈춤'; $('bRec').classList.add('on') };
let rec = null;
// 자동 시연: 스킬을 순서대로 쓴다(원리 끄기/켜기 비교용)
function demoScript() { let t = 0; const order = { sword: [[20, 'Q'], [28, 'Q'], [36, 'Q'], [90, 'E'], [160, 'R'], [250, 'F'], [480, 'end']], staff: [[20, 'Q'], [60, 'Q'], [100, 'E', 90], [240, 'R'], [330, 'F'], [560, 'end']], bow: [[20, 'Q'], [45, 'Q'], [80, 'E', 70], [200, 'R'], [300, 'F'], [520, 'end']], hammer: [[20, 'Q'], [80, 'E', 80], [200, 'R'], [300, 'F'], [560, 'end']] }[W];
  return () => { t++; for (const [at, k, hold] of order) { if (t !== at) continue; if (k === 'end') { demo = null; $('bDemo').classList.remove('on'); return } const tg = enemies.filter(e => !e.dead).sort((a, b) => a.pos.distanceTo(player.pos) - b.pos.distanceTo(player.pos))[k === 'F' ? 1 : 0]; if (tg) aim.copy(tg.pos);
      if (WS()[k].hold) { cds[k] = 0; holdDown(k); demoHold = hold } else { cds[k] = 0; cast(k) } }
    if (demoHold > 0 && --demoHold === 0) beamUp(); if (holdAct) { const tg = enemies.filter(e => !e.dead).sort((a, b) => a.pos.distanceTo(player.pos) - b.pos.distanceTo(player.pos))[0]; if (tg) aim.lerp(tg.pos, .2) } } }
let demoHold = 0;
$('bDemo').onclick = () => { for (const k in cds) cds[k] = 0; demo = demoScript(); $('bDemo').classList.add('on') };

// 헤드리스 검사용
window.ARENA = { PR, SK, SC, WEAPONS, story: { start: i => startChapter(i), skip: () => skipTalk(), state: () => ({ on: STORY.on, phase: STORY.phase, ch: STORY.ch, kills: STORY.kills, need: STORY.need, core: STORY.core && Math.round(STORY.core.hp), hp: Math.round(player.hp), boss: STORY.boss && Math.round(STORY.boss.hp), upd: Math.round(STORY.upd), talk: !!STORY.talk, foes: enemies.filter(e => !e.dead).length }), title: () => openTitle(), exit: () => storyExit(), god: on => { STORY.god = on } }, weapon: w => { if (w) setWeapon(w); return W }, tp: (x, z) => { player.pos.set(x, 0, z); camera.position.copy(player.pos).add(V3(0, 12.5 * SC.camH, 9.5 * SC.camH)) }, hold: (k, on) => on ? holdDown(k) : holdUp(k), face: () => player.face, cds: () => ({ ...cds }), actives: () => actives.length, step: n => { for (let i = 0; i < n; i++) { if (demo) demo(); simStep() } render() }, aimAt: (x, z) => aim.set(x, 0, z), cast: k => { cds[k] = 0; cast(k) }, beam: on => on ? beamDown() : beamUp(),
  demo: () => { for (const k in cds) cds[k] = 0; demo = demoScript() }, mon: () => ({ ...monLast, covA: avg(covH.slice(-60)), coreA: avg(coreH.slice(-30)) }), enemies: () => enemies.map(e => [e.pos.x, e.pos.z, e.hp, !!e.dead]), sim: () => simF,
  run: (n, shots = []) => { let fm = 0, cm = 0, over = 0, imgs = {}; for (let i = 1; i <= n; i++) { if (demo) demo(); simStep(); render(); const m = monLast; fm = Math.max(fm, m.flashes); cm = Math.max(cm, m.cov); if (m.cov > 25) over++; if (shots.includes(i)) imgs[i] = cv.toDataURL('image/jpeg', .85) } return { flashMax: fm, covMax: cm, covOver25: over, imgs, enemies: enemies.map(e => Math.round(e.hp)) } },
  pause: v => { paused = v }, all: on => { if (on) { PRINCIPLES.forEach(p => PR[p[0]] = p[5]); allOff = false } else { PRINCIPLES.forEach(p => PR[p[0]] = false); allOff = true } buildUI() }, view: v => setVM(v), shot: () => cv.toDataURL('image/png') };

buildWeapon(); player.pose = restPose(); dress(W); storyInit(); paintFloor(); spawnEnemies(); buildUI(); syncBar(); drawMon(); requestAnimationFrame(frame);
