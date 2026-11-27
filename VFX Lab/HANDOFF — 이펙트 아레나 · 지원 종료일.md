---
title: "HANDOFF — 이펙트 아레나 · 지원 종료일"
date: 2026-10-13
tags:
  - vfx-lab
  - handoff
---

# HANDOFF — 이펙트 아레나 · 「지원 종료일」

다른 에이전트에게 넘기는 작업 인계서다. 위에서부터 읽으면 된다. **지금 진행 중인 일은 4장**이다.

---

## 0. 사용자와 작업 규칙

- **사용자** · Hyorin Ji (게임 이펙트 디자이너). 한국어로 대화한다.
- **결과물 스타일** · 글보다 그림을 선호한다. 짧은 문단, 표, 도식을 쓴다.
- **용어** (분석·핸드북 문서)
  - 밝기 누르기 · 명도(L\*) · 선명도(C\*) · HSV S(색 선택기 채도) · 사면체 결정
  - 본문에 카드 ID만 덩그러니 쓰지 않는다. 이름이나 `[[링크]]`로 쓴다.
  - 프레임은 `F123`, `F40–46`으로 쓴다. 색상 각도는 HSV 색상환 기준이다.
- **반드시 승인 받기**
  - 핸드북(`VFX Handbook v2`)은 반영안 표를 보여 주고 승인받은 뒤에만 고친다. `Core`는 원리 자체가 바뀔 때만 고친다.
  - RefVault 라이브러리에 쓰려면 세 가지가 모두 필요하다: 사용자 승인, RefVault 프로그램 완전 종료, 백업(`apply_plan.py`). 파일 시스템으로 직접 삭제·이동하지 않는다.
- **하지 않기**
  - Frame.io 폴더(`Z:\`)는 수정하지 않는다.
  - 다음 자료는 이론 출처로 쓰지 않는다: DucVu, 언리얼 강의 자막, 미호요 자막.
  - 테스트 산출물을 실제 볼트에 쓰지 않는다. 사용자가 요청한 결과물만 쓴다.
- **스토리 IP 원칙**
  - 실제 OS 이름·로고·상표, 기존 OS-tan 캐릭터(XP-tan, ME-tan 등)를 쓰지 않는다. 창·사과·펭귄·명령줄 같은 **은유만** 쓴다.
  - 이미지 생성 프롬프트에 특정 애니메이션 제목이나 작가 이름을 넣지 않는다. 시대 화풍 태그(`retro artstyle, 1990s (style)` 등)로 대신한다.

---

## 1. 파일 지도

| 무엇 | 위치 |
| --- | --- |
| 볼트 | `D:\Obsidien\obsidien` |
| 게임(완성본, 이 파일을 연다) | `VFX Lab\이펙트 아레나.html` (단일 HTML, 약 840KB) |
| 게임 소스 | `VFX Lab\_arena_src\` (`src\*.js`, `shell.html`, `build.py`, `tests\`) |
| 설정집 | `VFX Lab\지원 종료일 — 설정집.md` |
| 스탠딩 일러스트 폴더 | `VFX Lab\tachie\` (여기에 PNG를 넣으면 게임이 쓴다) · `읽어 주세요.md` · `_원본 SVG\`(55개) · `_캐릭터 시트.png` |
| AI 생성 결과(예정) | `VFX Lab\tachie\_gen\` |
| 투사체 실험실 | `VFX Lab\투사체 실험실.html` |
| 스킬 소스 사본 | `VFX Lab\_skills_src\` (`vfx-breakdown`, `refvault-organize`, `.skill` 패키지) |
| 핸드북 | `VFX Handbook v2\` (카드 53장, `Core`, `10 유형\`: 투사체·빔 유형 노트, 물 속성 노트) |
| 이펙트 분석 | `Effect Breakdown\星光啊 闪爆他\`, `放晴 Heart Projectile Burst\`, `Etc Water Dragon Beam\` (Index.md + 분석 HTML + assets) |
| RefVault 라이브러리 | `C:\Users\yoringvfx\OneDrive - KRAFTON\새 폴더\yoring_nest.library` |
| 이미지 생성 프로젝트 | `C:\Users\yoringvfx\Desktop\Opus_test\mv_project` |
| 생성 Python | `mv_project\.venv\Scripts\python.exe` (Python 3.14 · torch 2.11 cu128 · diffusers 0.40 · rembg 2.0.85) |
| 생성 모델 | Animagine XL 4.0 (`cagliostrolab/animagine-xl-4.0`, HF 캐시에 있음) · GPU RTX 5080 16GB |

> [!warning] 이전 세션의 작업 폴더(Cowork outputs)는 세션이 끝나면 지워진다
> 필요한 소스는 위 `_arena_src`, `_skills_src`로 옮겨 두었다. 거기를 기준으로 작업한다.

---

## 2. 이펙트 아레나 — 구조

### 빌드

```
cd "D:\Obsidien\obsidien\VFX Lab\_arena_src"
python build.py src\three.min.js        → _arena_src\이펙트_아레나.html (+ src\_bundle.js)
copy 이펙트_아레나.html "..\이펙트 아레나.html"   ← 볼트의 게임 파일(띄어쓰기 이름)
node --check src\_bundle.js             ← 문법 검사
```

`build.py`가 하는 일:
- `game.js` 안의 표시 `/*WEAPONS*/`, `/*RIG*/`, `/*STORY*/` 자리에 각각 `weapons.js`, `rig.js`, `tachie.js` + `story.js`를 끼운다.
- 그 결과를 `shell.html`의 `<script>/*THREE*/</script>`, `<script>/*GAME*/</script>` 자리에 넣는다.

### 소스 파일

| 파일 | 내용 |
| --- | --- |
| `game.js` | 색 변환(lch · labH: HSV 색상 → Lab 색상), 원리 스위치 `PRINCIPLES`/`PR`, 지팡이 스킬 `SK`, 장면 설정 `SC`, `ramp(hue)`(코어·바디·엣지·헤이즈·연기 색), 렌더러·블룸·최종 셰이더, 아틀라스(4×6 타일), 파티클 풀, 리본, 월드·적, 입력, 지팡이 스킬 4종, `simStep`, 가독성 모니터, 궁극기 카메라 `CD`, 렌더 루프, UI, `window.ARENA` |
| `weapons.js` | `WEAPONS`(staff·sword·bow·hammer × Q E R F), `cast`·`holdDown`·`holdUp`·`setWeapon`, 무기 모델, 검·활·망치 스킬 클래스 |
| `rig.js` | 캐릭터 리그(2관절 IK 팔·다리), `CHARS`(3D 외형), `dress(w)`, `updateRig()`, 스킬별 자세표 `ANIM`, `animStep()` |
| `tachie.js` | SVG 스탠딩(기본 그림). `TACHIE.svg(id, 표정)`. 캐릭터 5명 + 보스 실루엣 5종 |
| `story.js` | 스토리 모드 전부: `CAST`, `ALIAS`, `FOES`, `CHAPTERS`(5장), `ENDING`, 코어, 적 AI, 보스 패턴, 진행·메뉴·대화·스탠딩·HUD |
| `shell.html` | 레이아웃과 CSS. 무대 위 레이어: `#obj` `#bossbar` `#bark` `.tachi(#tcL #tcR)` `#dlg` `#menu` |

### 핵심 사실

**렌더링**
- Three.js r149 UMD를 쓴다. `LinearEncoding`에 sRGB 값을 그대로 쓴다.
- 처리 순서: MSAA 메인 → 밝은 부분 블룸 → 최종 셰이더.
- 최종 셰이더가 하는 일: 보기 모드(컬러·흑백·밸류 4단), 반전 1f, 섬광, 어둡게, 틴트, 비네트, 색수차, 레터박스, 무채색 인서트, 집중선.

**파티클 풀**
- 빌보드 풀은 `add`·`alpha`, 바닥 풀은 `gadd`·`galpha`다.
- 바닥 풀의 정점 셰이더는 `vec3(p.x,0.,-p.y)`를 쓴다. 이렇게 해야 면이 위를 본다. 예전에는 면이 뒤집혀서 바닥 효과가 전혀 안 보이는 버그가 있었다.

**시뮬레이션 (60Hz 고정 `simStep`)**
- 매 프레임 순서:
  1. 반전 프레임 진행
  2. `camStep()` — 히트스톱 중에도 돈다
  3. `freeze`(히트스톱)이면 여기서 끝
  4. 플레이어
  5. 적 루프
  6. `storyStep()`
  7. `updateParts`
  8. `actives.forEach(update)`
  9. `animStep()`
  10. `actives` 정리
- 히트스톱 동안에는 캐릭터 자세도 멈춘다.

**원리 스위치 (`PRINCIPLES`, 19개)**
- 램프·꼬리·색상 이동·코어·환경색·하드 머리·투명 빔·큰 착탄·모티프·밝기 누르기·같은 문법 두 번·임팩트 프레임·장면 빛·히트스톱·흔들림
- **몸이 이펙트와 같은 박자로**(`anim`), 범위 표시, **궁극기 카메라 연출**(`ultCam`), 적 공격 다른 색
- **B** 키를 누르면 전부 끄거나 켠다.

**궁극기 카메라**
- 함수 `camCharge(from, to, k)` · `camHold()` · `camPeak(p, axis, o)`.
- 동작: 모으기 동안 대각선 구도로 밀어 들어가고, 정점에 클로즈업 인서트 5f(흑·흑·암전·백 반전·흑), 그다음 넓게 빠졌다가 색수차를 남기며 복귀한다.
- `SC.camStyle`: `'cine'`(인서트 + 레터박스) 또는 `'game'`.

**캐릭터 리그**
- 손은 무기 손잡이를, 발은 바닥을 IK로 따라간다. 머리카락은 한 박자 늦게 흔들린다.
- 자세 채널: `twist`, `crouch`, `lean`, `stance`, `reach`, `reachUp`, `bothUp`, `spin`. 스킬 클래스의 진행 상태를 `ANIM[클래스명]`이 읽어서 정한다.

**검증용 API**
- `window.ARENA` 제공 함수: `step` `run(n, shots)` `cast` `hold` `weapon` `tp` `aimAt` `demo` `all` `mon` `enemies` `view` `shot` `pause`
- 스토리용: `story.{start(i), skip(), state(), title(), exit(), god(on)}`

---

## 3. 스토리 모드 「지원 종료일 — End of Support」

자세한 세계관·인물·줄거리는 `지원 종료일 — 설정집.md`에 있다. 여기는 구현 요약이다.

### 구성

| 항목 | 내용 |
| --- | --- |
| 진행 단계 | `title` → `card` → `intro`(대화) → `wave` → `bossintro`(대화) → `boss` → `bossdown` → `outro`(대화) → `clear`. 그 밖에 `fail` `pause` `ending` |
| 멈추는 단계 | 대화 중이거나 title·card·clear·fail·pause·ending이면 시뮬레이션이 멈춘다(`storyBlocking()`) |
| 목표 | 적이 **데이터 코어**(`CORE_P = (0,0,-3)`, HP 1500)로 몰려와 갉아먹는다. 웨이브 정리 → 보스. 코어 HP 0 또는 플레이어 HP 0이면 실패 |
| 절망 장치 | ✓ 업데이트 준비 %는 정리할수록 오른다. 끝까지 가면 주인공들이 지워진다. HUD의 "지원 종료까지 D-????"는 3장부터 실제 날짜가 된다 |
| 챕터 | 1장 부팅(페네·지팡이) · 2장 응답 없음(아델리·활) · 3장 깨끗한 화면(말루스·검, 밝은 바닥) · 4장 휴지통(프롬·망치) · 5장 마지막 업데이트(페네, 하얀 공간) |
| 적 | 버그 · 좀비 프로세스(한 번 되살아남) · 멀웨어(거리 두고 사격) · 레거시 조각 |
| 보스 | 무한 루프 · 고아 프로세스 · 레거시·클래식 · 레거시·플로피 · 레거시 프롬. 체력 7000·8500·8000·9000·12000 |
| 보스 패턴 | 내려찍기 · 탄막(12발, 2막엔 두 번) · 돌진 · 소환 · 충격파(7.5m) — 모두 "범위 표시 → 맞히기" |
| 보스 2막 | 체력이 절반 아래로 떨어지면 시작한다. 대사가 바뀌고, 다음 공격까지 간격이 0.7배로 줄어든다 |
| 체력 | 지팡이·활 1000, 검 1350, 망치 1600. 초당 6 회복. 타이틀의 "이야기 위주로"를 켜면 받는 피해가 절반, 코어가 받는 피해가 0.6배다 |
| 저장 | `localStorage 'eol_prog'`(클리어한 챕터) |
| 밸런스 검증 | 자동 플레이 봇(`tests/bot.js`)으로만 확인했다. 챕터 하나에 40–70초. 사람이 직접 플레이해 본 적은 없다 |

### 대사와 표정

- **대사 형식** · `SL('who:표정', '문장')`. 예: `SL('fene:joy', …)`.
- **화자 id** · `fene` `malus` `adelie` `prom` `noti` `user`(입력창 문장 `> …`) `sys`(시스템 문장) `loop` `orphan` `classic` `floppy` `lprom`
- **표정** · `normal` `smile` `joy` `sad` `cry` `surprised` `angry` `closed` `half` `blank`
- **표정 표시가 없을 때** · `TDEF` 값을 쓴다: 페네·말루스 `normal`, 아델리·프롬 `half`, 노티 `joy`.

### 스탠딩 배치

- **슬롯** · 왼쪽 슬롯(`#tcL`)은 그 챕터의 주인공, 오른쪽 슬롯(`#tcR`)은 대화 상대다. 말하는 쪽만 밝고, `sys`·`user` 문장이 나오면 둘 다 어두워진다.
- **노티** · 작게 떠서 둥실거린다.
- **보스** · 붉은 빛과 글리치 흔들림이 붙는다.
- **대화 중 화면** · `body.talking`이면 목표 패널(`.obj`)과 한마디 알림(`.bark`)을 숨긴다.

### PNG 교체

- `tachieProbe()`가 `tachie/<id>.png`를 먼저 찾는다. 있으면 `tachie/<id>_<표정>.png`도 찾는다.
- 없으면 SVG를 쓴다.
- 규격: 투명 배경, 발끝을 아래에 맞춘다, 몸 중심을 가운데에. 폭은 자유(게임이 폭/높이를 읽는다. 4장 완료 기록 참고). 타이틀 얼굴 줄은 `tachie/<id>_bust.png`.

---

## 4. ✓ 완료(2026-10-13): AI로 스탠딩 일러스트 다시 뽑기

> [!done] 결과 요약 — 아래 "만들어 둔 것" 이후 내용은 작업 전 계획이다. 실제로 바뀐 점은 이 상자가 기준이다
> - **고른 시드** · 페네 44 · 말루스 44 · 아델리 66 · 프롬 55 · 노티 55 · 무한 루프 33 · 고아 프로세스 44 · 클래식 11 · 플로피 22 · 레거시 프롬 33 (json의 `"pick"`). `tachie\`에 56개 PNG 복사됨. 사용법은 `tachie\읽어 주세요.md`.
> - **진행 방식 변경** · ① `--no-expr`로 기본 그림 후보만(주인공 6시드 · 보스 4시드) → ② 고른 시드에만 `--picks --skip-existing`로 표정. 192장 전부 뽑지 않는다.
> - **생성 스크립트 수정**(`eol_tachie.py`) · `from_pipe()`가 VRAM을 +6.5GB 잡아 공유 메모리로 넘쳐 멈췄다 → 구성 요소를 직접 넘김. `HF_HUB_OFFLINE=1`. 얼굴 찾기는 `lbpcascade_animeface`(OpenCV 4.x, `tools\`에 xml) 우선, 살색은 대체. 눈 감는 표정은 얼굴 프롬프트에서 눈 색·`looking at viewer`를 빼야 감긴다(strength 0.8–0.9). 아델리·프롬은 기본 그림 자체를 `half`로 뽑고 `normal`을 인페인팅. 시드별 `meta.json`(캔버스 기준 얼굴 상자)을 남긴다.
> - **새 도구** · `tools\eol_apply.py`(게임 이름으로 복사 + `<id>_bust.png` 얼굴 크롭) · `tools\eol_sheet.py`(`_캐릭터 시트.png`). 옛 SVG 시트는 `_원본 SVG\_캐릭터 시트 (SVG).png`.
> - **PNG 규격 변경** · 7:16 고정을 버렸다(머리카락·무기 때문에 폭/높이 0.44–0.82). 몸 중심이 가운데, 높이 = 그림 × 1.03 / `scale`. 게임이 비율을 읽는다: `TAR`, `tachieAR()`, `.tc.png{aspect-ratio:var(--ar)}`, `.tachi{container-type:size}`로 몸 중심을 SVG 상자 중심에 맞춤. 노티 PNG는 `height:66%; bottom:28%`. 챕터 카드는 `translate`로 같은 보정. 타이틀 얼굴 줄은 `<id>_bust.png`.
> - **색 맞춤** · `rig.js` `CHARS` 4명 색을 그림에서 뽑은 Lab LCh로 교체(페네 남색 치마·루즈삭스, 말루스 민트 머리, 프롬 남보라 코트). 아델리 앞머리는 `bangs2`가 없으면 `hair` 색. `CAST.color` 페네·말루스·프롬·클래식·플로피 갱신.
> - **설정과 다른 점(사용자 확인 필요)** · 말루스 머리가 은색이 아니라 민트, 아델리에 흰 앞머리가 없음, 페네 치마가 라벤더가 아니라 남색. 설정집은 고치지 않았다.
> - **검증** · Windows Chrome 헤드리스(puppeteer-core는 `mv_project\node_modules`)로 타이틀·카드·대화 10장면 확인, 페이지 오류 0. 사람이 직접 본 적은 아직 없다.

### 사용자 요청

- 설치된 Animagine XL 4.0으로 일러스트를 다시 뽑는다.
- 캐릭터를 **1990년대 말–2000년대 초 OS-tan 감성**으로 바꾼다.
- 그림체는 90년대 말 TV 애니메이션 풍으로 한다. 사용자가 예로 든 작품: 카드캡터 체리, 그 남자 그 여자의 사정, You're Under Arrest. 단, 프롬프트에는 이 제목들을 넣지 않고 시대 화풍 태그로 대신한다.

### 바뀐 캐릭터 디자인 (설정집에 반영됨)

| id | 이름 | 시대 소품 | 프롬프트 요점 |
| --- | --- | --- | --- |
| fene | 페네(창의 OS) | 회색 입체 버튼 · 청록 바탕화면 · 모래시계 | pink twintails, teal ribbon, ahoge, blue eyes, square hair ornament, white serafuku, navy sailor collar, grey sweater vest, lavender pleated skirt, loose socks, loafers, staff, hourglass |
| malus | 말루스(사과의 OS) | 반투명 캔디 컬러 | silver bob, blunt bangs, leaf hair ornament, see-through cyan raincoat, white dress, high collar, white boots, sword |
| adelie | 아델리(펭귄의 OS) | 오픈소스 해커 | black short hair + white bangs, green eyes, goggles on head, penguin hood hoodie, orange scarf, orange boots, bow |
| prom | 프롬(명령줄의 OS) | 앰버 흑백 모니터 · 플로피 | very long black hime cut, orange eyes, tall mature female, black long coat with orange trim, sledgehammer |
| noti | 노티(업데이트 도우미) | 노란 풍선 도움말 | fairy, light blue bob, pale yellow capelet, white dress, closed-eye smile |
| 보스 | loop · orphan · classic(tv head) · floppy · lprom | 글리치 · 어두운 기운 | 시드 4개, 표정 없음 |

### 만들어 둔 것 (실행은 아직 안 함)

- `mv_project\tools\eol_tachie.py` — Python 문법 검사(`py_compile`)만 통과했다. 실제로 실행해 본 적은 없다.
  1. 기본 전신(832×1216, 30 steps, cfg 5.5, Euler A)을 시드마다 뽑는다.
  2. `face_box()`로 얼굴을 찾는다. 그림 위 36% 안에서 가장 큰 살색 덩어리를 얼굴로 본다.
  3. 얼굴 주변을 정사각형으로 잘라 1024로 키운다. `StableDiffusionXLInpaintPipeline.from_pipe(pipe)`로 타원 마스크 안만 인페인팅해서 표정을 만든다(strength 0.58–0.7, 36 steps).
  4. 원래 크기로 줄여서 원본에 다시 붙인다.
  5. 기본 그림 한 장에서만 알파를 구한다. 방법은 기존 `cutout.py`와 같다(rembg isnet-anime + 테두리 배경 채우기). 이 알파를 모든 표정에 같이 쓴다.
  6. 같은 상자로 잘라 7:16 캔버스에 발끝을 맞춰 세운다.
- `mv_project\jobs\eol_tachie.json` — 캐릭터·프롬프트·시드 `[11, 22, 33, 44]`·표정별 태그와 strength. 출력 경로는 `"out": "D:/Obsidien/obsidien/VFX Lab/tachie/_gen"`.
  - 공통 스타일: `retro artstyle, 1990s (style), anime coloring, cel shading, flat color, clean lineart, thin outlines, official art, character design, white background, simple background, safe`
  - 공통 네거티브 추가: `newest, modern, glossy, gradient, soft shading, thick outlines, bold lineart, multiple views, sketch, monochrome, logo`
  - 노티는 `base_expr: "joy"`다. 기본 그림을 joy로 저장하고, 표정은 `normal`·`blank` 두 개만 만든다.
- `mv_project\run_eol_tachie.bat` — 더블클릭하면 실행된다. 특정 캐릭터만 돌리려면 인자를 준다: `run_eol_tachie.bat fene,malus`.
- 총 192장이다. 생성 시간은 약 15–25분으로 어림한 값이다.

### 출력 형태

```
tachie\_gen\<id>\base_<seed>.png          원본(배경 있음)
tachie\_gen\<id>\s<seed>\<표정>.png        잘라 낸 RGBA, 7:16
tachie\_gen\<id>\sheet_s<seed>.jpg        표정 한 장 보기
tachie\_gen\<id>\face_s<seed>.jpg         얼굴 찾기 확인(빨강 = 살색 상자, 파랑 = 인페인팅 범위)
tachie\_gen\_bases.jpg                    모든 기본 그림
```

### 다음 할 일

1. 사용자가 bat을 실행했는지 확인한다. 아직이면 실행을 부탁한다. Windows 셸이 있는 에이전트라면 직접 실행해도 된다. 로그에서 `face=None`이 찍힌 시드를 확인한다.
2. `_bases.jpg`와 캐릭터별 `sheet_s*.jpg`를 보고 캐릭터마다 시드 하나를 고른다. 기준은 시대 화풍, 손과 해부 구조, 표정 사이의 일관성, 배경 제거 품질이다. 고른 결과는 사용자에게 보여 준다.
3. 고른 시드를 게임 파일 이름으로 복사한다.
   - `_gen\<id>\s<seed>\normal.png` → `tachie\<id>.png`, 그리고 `tachie\<id>_normal.png`
   - 나머지 표정: `_gen\<id>\s<seed>\<표정>.png` → `tachie\<id>_<표정>.png`
   - 노티: `joy.png` → `tachie\noti.png`와 `tachie\noti_joy.png`. 나머지는 `noti_normal.png`, `noti_blank.png`.
   - 보스: `_gen\<boss>\s<seed>\normal.png` → `tachie\<boss>.png`
4. 게임(`VFX Lab\이펙트 아레나.html`)을 열어 대화창에서 확인한다.
   - 잘라 낸 그림 위에 3% 여백이 있어서 SVG보다 조금 작게 보일 수 있다.
   - 크기가 어긋나면 `shell.html`의 `.tc` 값을 조정한다(지금 `height:132%; bottom:-38%`).
   - 챕터 카드(`.cardart`)와 타이틀 얼굴 줄(`.bust`, viewBox로 자르는 SVG 전용)도 확인한다. PNG면 `<img>`로 나오고 `object-position:top`이다.
5. 마무리
   - 그림 색에 맞춰 3D `CHARS` 색(`rig.js`)과 `CAST.color`(`story.js`)를 맞춘다.
   - `tachie\읽어 주세요.md`와 `_캐릭터 시트.png`를 갱신한다.
   - 다시 빌드한 뒤 볼트의 게임 파일에 복사한다.

### 알려진 위험

- **얼굴 찾기** · 살색 휴리스틱이라 실패할 수 있다. 아델리처럼 후드가 얼굴을 가리거나, 노티처럼 피부가 아주 희거나, 팔·손이 얼굴 높이에 올라오면 빗나간다. 빗나가면 해당 시드에 얼굴 상자를 직접 지정하는 옵션을 추가한다. `face_box`를 json의 `"face_box": [x0,y0,x1,y1]`로 덮어쓰게 하면 된다.
- **흰 옷** · 흰 배경 + 흰 옷(말루스, 노티, 페네의 세일러복)은 외곽선이 끊긴 곳에서 테두리 배경 채우기가 옷 안으로 번질 수 있다. 시트에서 옷 가장자리가 투명해졌는지 확인한다. 문제가 있으면 배경을 연회색으로 뽑는다(`light grey background`). 또는 `cut_alpha()`의 배경 거리 기준(`dist < 22`)을 낮춘다.
- **인페인팅 경계** · 머리 경계에서 이음새가 보일 수 있다. 그러면 마스크 블러(18)나 strength를 조정한다.
- **화풍** · 90년대 화풍 태그가 약하게 먹으면 `anime screenshot`, `1980s (style)`를 섞는다. 또는 `cfg`를 6–7로 올려 시험한다.

---

## 5. 이전 결과물 요약

- **vfx-breakdown 스킬**(설치됨)
  - 흐름: 영상 → 측정(`measure.py`·`projectile.py`) → 고정 양식 분석 HTML(`build_page.py`, 검수는 `shoot.js`) → Obsidian Index → 핸드북 반영안(승인 뒤 적용).
  - RefVault는 읽기 전용이다(`refvault.py`).
  - 소스 사본은 `_skills_src\vfx-breakdown`.
- **refvault-organize 스킬**(설치됨)
  - RefVault 정리: 폴더 `01_Reference/TFT·Studio·Etc`, `02_My_Work` · 이름 형식 `출처_시즌_종류_이름` · 출처·속성·형태 태그.
  - 쓰기는 `apply_plan.py`로만, 백업은 함께 만든다.
- **핸드북 v2** · 카드 53장 + 코어 이론 8개 + 유형 노트. 사례: 星光啊(근거 코드 BD), 放晴 Heart(HEART), Water Dragon(WDB).
- **투사체 실험실** · Canvas2D. 원리 스위치 11개, 체크 9개.

## 6. 남은 일 · 알려진 문제

| 항목 | 내용 |
| --- | --- |
| 궁극기 화면 덮음 | 카메라가 다가가서 1초 안팎 동안 화면의 40–50%를 덮는다. 모니터에 경고 색이 뜰 수 있다 |
| 망치 균열 | 바닥 균열이 잔가지처럼 보인다 |
| 대화 연출 | 챕터 사이 일상 장면이 없다. 노티는 3D 모델이 없다 |
| 난이도 | 사람이 직접 플레이해 본 적이 없다 |
| PNG 찾기 | 파일이 없으면 브라우저 콘솔에 404가 찍힌다. 동작에는 문제없다 |
| 헤드리스 모니터 | swiftshader에서는 `measure()`의 readPixels가 느리다(약 87ms/프레임) |

## 7. 테스트 방법

`_arena_src\tests\`에 있는 스크립트는 puppeteer-core + @sparticuz/chromium(리눅스 샌드박스) 기준이다. WebGL 인자는 `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`다.

- **리눅스 샌드박스** · `vfx-breakdown/scripts/setup.sh /tmp/vfx`로 설치한다. 실행할 때 `NODE_PATH=/tmp/vfx/node_modules`를 붙인다.
- **Windows** · `npm i puppeteer`를 설치하고, 스크립트의 `executablePath`와 `chromium.args` 부분을 바꾼다.

| 스크립트 | 쓰임 |
| --- | --- |
| `wpn.js <html> <out> '<JSON spec>'` | 무기별 자동 시연 · 섬광·덮음 수치 · 스크린샷 |
| `cam.js <html> <out> sword,staff [cine\|game]` | 궁극기 카메라 프레임 시퀀스 |
| `anim.js <html> <out> '<spec>'` | 캐릭터 동작 클로즈업 |
| `story.js <html> <out> t,0,1` | 챕터 진행 스크린샷 |
| `story2.js <html> <out>` | 실시간 진행(카드·대화·일시정지·실패·엔딩) |
| `bot.js <html> 0,2,4` | 자동 플레이 봇 · 밸런스 |
| `tach.js <html> <out>` | 대화 스탠딩 배치 |
| `png.js <html> <shot>` | PNG 교체 확인 |
| `gal.js <tachie.js> <out.png> cast\|faces [id]` | SVG 스탠딩 갤러리 |
| `export_svg.js <tachie.js> <dir>` | SVG 내보내기 |
| `sheet.py <dir> '<glob>' <out> [cols] [w]` | 이미지 시트 합치기 |
| `dbg.js <html> "<JS>" [img]` | 페이지 안에서 JS 실행 |
