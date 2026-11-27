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
