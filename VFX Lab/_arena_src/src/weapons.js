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
