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
