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

/*WEAPONS*/
/*RIG*/
/*STORY*/

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
