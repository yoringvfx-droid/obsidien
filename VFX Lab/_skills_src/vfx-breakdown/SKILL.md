---
name: vfx-breakdown
description: >-
  게임 이펙트(VFX) 레퍼런스 영상을 프레임 단위로 측정·분해해서, 고정 양식의 인터랙티브 분석 HTML을 만들고, 옵시디언 볼트의 Effect Breakdown에 정리한 뒤, VFX Handbook v2 카드에 근거를 추가하는 파이프라인. 사용자가 "이 영상을 스킬로 분석 진행해줘", "이펙트 분석해줘", "이 레퍼런스 분해해서 핸드북에 넣어줘", "영상 타이밍/컬러/밸류 분석", "breakdown" 등을 말하거나, 이펙트·스킬 영상(mp4, mov, gif)을 올리고 분석을 원하면 반드시 이 스킬을 쓴다. 영상 분석·분석 페이지·핸드북 반영 중 일부만 요청해도(예를 들어 "분석 페이지만 다시 만들어줘", "이 분석을 핸드북에 반영해줘") 이 스킬을 쓴다.
---

# VFX 영상 분해 파이프라인

영상 → **측정** → **분석 페이지(고정 양식 HTML, 평가 포함)** → **옵시디언 분석 노트** → **핸드북 반영(확인 후)**.

이 파이프라인은 「星光啊，闪爆他」 분석에서 만들어졌다. 그 결과물이 기준이다.
- 분석 페이지 예시: 볼트 `Effect Breakdown/星光啊 闪爆他/星光啊_이펙트분해.html`, 그 config는 `references/example_config.json`
- 분석 노트 예시: `Effect Breakdown/星光啊 闪爆他/星光啊 闪爆他 - Index.md`
- 핸드북: `VFX Handbook v2/` (카드 52장 + 코어 이론 8 + `10 유형/` 유형 노트)

사용자(게임 이펙트 디자이너)는 **글보다 그림**을 원한다. 페이지·노트 모두 카드 하나에 원리 하나, 제목 + 한 줄 + 도식. 긴 문단을 쓰지 않는다. 숫자는 측정한 것만 쓴다.

## 시작 전에: 작업 목록

여러 시간 걸리는 작업이다. TaskCreate로 아래 5단계를 먼저 만들고 하나씩 완료 처리한다.
0 준비 · 1 측정 · 2 분석 페이지 · 3 옵시디언 정리 · 4 핸드북 반영안(확인 → 적용, 유형 노트 포함)

## 0. 준비

**영상 찾기.** 레퍼런스 영상은 RefVault 라이브러리(`C:\Users\yoringvfx\OneDrive - KRAFTON\새 폴더\yoring_nest.library`)에 모여 있다. 예전 Eagle 라이브러리는 쓰지 않는다. 우선순위: 채팅에 올린 파일(uploads 폴더) → **RefVault에서 이름·태그로 찾기** → 사용자가 말한 경로.
- RefVault가 연결돼 있지 않으면 `request_cowork_directory`로 요청한다. 찾기(읽기 전용): `python3 $SK/scripts/refvault.py find "<RefVault 셸 경로>" <검색어>` → 나온 `path`를 그대로 `cp`. 파일이 없다고 나오면 OneDrive "이 장치에 항상 유지"를 안내한다.
- 올린 파일로 분석해도 같은 영상이 RefVault에 있으면 찾아서 Index에 RefVault id를 적는다(3단계).
- RefVault 쪽 파일은 읽기만 한다. 이름·태그·폴더를 바꾸거나 메모를 남기는 일은 refvault-organize 스킬로만 한다(승인 · RefVault 종료 · 백업). `Z:\` 같은 네트워크 드라이브는 셸에 연결되지 않는 경우가 많다. 셸에서 영상을 못 열면 "채팅에 영상을 끌어다 놓아 달라"고 한 번 요청한다. 파일 도구로 바이너리를 복사하려고 애쓰지 않는다.

**볼트 찾기.** 기본 `D:\Obsidien\obsidien`. 시스템 프롬프트의 Shell access 목록에서 이 폴더의 셸 경로를 찾는다. 연결돼 있지 않으면 `request_cowork_directory`로 `D:\Obsidien`을 요청한다.

**작업 폴더와 도구.** 작업 폴더는 반드시 **outputs 폴더 안**에 둔다. Read 도구는 셸 전용 경로(`/tmp` 등)를 열 수 없어서, 컨택트 시트와 스크린샷을 직접 보려면 파일이 outputs에 있어야 한다. Read로 열 때는 시스템 프롬프트의 경로 대응표로 셸 경로를 Windows 경로로 바꾼다.
```bash
SK=<이 스킬 폴더의 셸 경로>; WORK=<outputs 셸 경로>/vfxwork/<짧은영문이름>; mkdir -p $WORK
bash $SK/scripts/setup.sh /tmp/vfxtools      # 마지막 줄의 export NODE_PATH=… 를 기억해 둔다
cp "<영상>" $WORK/src.mp4
```
크롬 설치가 실패하면 스크린샷 검수 없이 진행하고, 최종 보고에 "렌더 검수 못 함"이라고 적는다.

## 1. 측정

```bash
python3 $SK/scripts/extract.py $WORK/src.mp4 $WORK               # 먼저 ROI 없이
```
1. `contact_*.jpg`를 **전부** Read로 본다. 줄거리, 시전체/대상 위치, 카메라 변화, 이펙트가 없는 기준 프레임을 확인한다.
2. 두 주체(시전체·대상 등)가 있으면 화면 비율 좌표로 ROI를 정해 다시 돌린다:
   `extract.py … --roi-a 0.06,0.55,0.44,0.95 --roi-b 0.56,0.05,0.94,0.61` (프레임 추출은 재사용된다)
   대상이 쓰러지거나 배경이 바뀌는 영상은 구간별 기준 프레임을 준다: `--plate 1:1-149,270:150-284,1:285-291`
3. 흐름: `measure.py $WORK summary`, `measure.py $WORK peaks`, `measure.py $WORK dupes`(녹화 드롭 프레임)
4. 1프레임 사건과 비트 경계는 원본으로 확인: `measure.py $WORK strip 38,39,40,46,47 $WORK/k1.jpg` → Read
5. 색·주목: `palette`, `hue`, `lstats`, `scene`, `focus`, `chroma` (사용법은 `measure.py` 상단 설명)
7. 투사체가 있으면: `measure.py grid`로 머리 위치를 읽고 `projectile.py WORK a-b --follow "f:x,y;..."`로 한 발씩 잰다. `mask_*.jpg`로 잡힌 영역을 꼭 확인한다(analysis_guide 7절).
6. 평가용 검사: `flash`(섬광), `cover`(대상 가림), `col K a-b --over X`(화면 덮음·코어 면적 구간), `cpath`(색 전환 경로의 명도·선명도)

무엇을 볼지, 측정값의 뜻, 해석 규칙은 **`references/analysis_guide.md`** 를 읽고 따른다. 핸드북 카드가 곧 질문지다.

## 2. 분석 페이지 (고정 양식)

양식이 고정인 이유: 사례끼리 같은 자리에 같은 그림이 있어야 비교가 된다. 그래서 **템플릿 HTML은 고치지 않고 config.json만 쓴다.**

1. `references/example_config.json`을 `$WORK/config.json`으로 복사하고 이 영상 내용으로 바꾼다. 필드와 그림 유형은 **`references/config_schema.md`**.
   - 섹션 순서 고정: 타이밍 → 밸류 → 컬러 → 형태 → (투사체) → 평가 → 내 작업에 가져가기. 투사체가 있으면 05 PROJECTILE을 넣는다.
   - 영상에 없는 현상(색 전환, 임팩트 프레임 등)의 카드는 뺀다. 억지로 채우지 않는다.
   - 위 6개 요약 카드(index)는 이 영상에서 가장 배울 만한 원리 6개.
   - **평가 섹션(05 REVIEW)** 은 페이지에서 비중이 가장 큰 섹션이다. 카드 3장: 총평(`verdict`) → 잘된 점(`review` side good, 3–5개) → 아쉬운 점(`review` side bad, 3–5개).
     - 먼저 analysis_guide.md **6.2 검사표**를 전부 돌린다(`flash`, `cover`, `col`, `focus` 원값·relative, `cpath` 등). 걸린 것은 프레임을 Read로 보고 판단한다.
     - 항목마다 관찰(측정 수치) → 왜 → 근거 칩 → 가져오기(good·counter) 또는 목표 수치가 있는 개선안 + 확인 방법(weak·risk). 그림 1–4장과 미니 그래프.
     - 원리와 다른데 잘 작동한 것은 아쉬운 점이 아니라 `counter`(반례). 측정끼리 어긋나면(HSV S vs 선명도) 눈에 가까운 값을 믿는다.
     - 총평의 모든 줄은 아래 항목 번호(G1, W2…)와 연결한다.
     - 평가에서 다시 잰 값이 앞 섹션 카드와 어긋나면 그 카드도 같이 고친다.
   - 색 숫자는 명도·선명도·HSV S·색상(색 이름 + 각도)으로 쓴다. L\*·C\*·Lab은 글에 쓰지 않는다. 주요 색상은 `key_hues`로 준다.
   - 글 속에 카드 ID(VA07 등)를 쓰지 않고 원리를 풀어 쓴다. 프레임은 `F154`, `F40–46`으로 써서 페이지에서 눌러 볼 수 있게 한다.
2. 빌드:
   ```bash
   python3 $SK/scripts/build_page.py $WORK/config.json $WORK $WORK/page.html --handbook "<볼트>/VFX Handbook v2"
   ```
3. 검수(필수). 데스크톱과 모바일 폭을 찍어서 **Read로 직접 본다**:
   ```bash
   export NODE_PATH=/tmp/vfxtools/node_modules
   node $SK/scripts/shoot.js review $WORK/page.html $WORK/rev 1280
   node $SK/scripts/shoot.js review $WORK/page.html $WORK/rev 420
   ```
   출력 JSON의 `overflow`·`figErr`·`errors`·`idInProse`(글 속 카드 ID)가 비어야 한다. `scrollClipped`는 좁은 폭에서 가로 스크롤되는 카드로 오류는 아니지만, 그 카드의 핵심 강조가 첫 화면(왼쪽)에 보이는지 420 스크린샷으로 확인한다. 화면에서 글자 겹침, 잘린 라벨, 그림과 수치 불일치를 찾아 config를 고치고 다시 빌드한다. 문제가 없어질 때까지 반복한다(보통 2–3회).
   템플릿 그림 유형으로 표현할 수 없는 게 있으면 비슷한 유형을 빌려 쓰고, 최종 보고에 "템플릿에 필요한 유형"으로 적는다(템플릿을 직접 고치지 않는다).

## 3. 옵시디언 정리

**`references/obsidian_output.md`** 의 폴더 구조, 근거 코드 규칙, Index.md 양식을 따른다.
- `Effect Breakdown/<작품 폴더명>/`에 HTML, assets(카드별 그림), Index.md.
- 그림은 `shoot.js export`로 카드 id별로 뽑아 JPG로 바꾼다. 평가는 r0·r1·r2 세 장.
- Index의 평가는 총평 + 항목별 관찰·왜·근거·가져오기/개선안을 그대로 옮긴다(페이지와 같은 내용).
- Index.md의 **근거 코드 표**가 다음 단계의 재료다. 수치는 measure.py 출력 그대로.
- 이 폴더는 새로 만드는 것이라 바로 써도 된다. 기존 사례 폴더는 건드리지 않는다.
- Index frontmatter에 RefVault 항목을 적는다: `refvault_id`, `refvault_name`(RefVault에 없으면 `refvault_id: ""`).
- 끝나면 "RefVault 항목 메모에 분석 노트 링크를 남길까요?"를 한 줄로 묻는다. 원하면 refvault-organize 절차로 `annotation`만 바꾼다(태그·이름은 그대로).

## 4. 핸드북 반영 (확인 후 적용)

**`references/handbook_integration.md`** 를 읽는다.
1. 볼트의 카드 목록을 실제로 읽는다(각 카드의 원리 줄).
2. 근거 코드와 평가 항목마다 가장 맞는 카드와 유형(보강 / 반례 / 실패 / 주의 / 신규 / 사례 / 정정)을 정해 **반영안 표**를 만든다. 코어 이론에 영향이 있으면 표 아래에 제안을 한 줄 적는다(바뀔 때만).
3. 표를 사용자에게 보여주고 **승인을 기다린다.** 승인 전에는 핸드북 파일을 쓰지 않는다.
4. 승인된 행만 적용한다. 장 노트, 목차, 체크리스트, 사례 카드까지 같이 고친다.
5. 반영 전에 `validate_handbook.py <볼트> --save-baseline $WORK/before.txt`, 반영 후 `validate_handbook.py <볼트> --baseline $WORK/before.txt` → 새 문제 0건까지.

## 최종 보고

짧게:
- 분석 페이지와 Index 노트 위치(present_files로 HTML 카드 띄우기)
- 핵심 원리 3–6개를 한 줄씩(수치 포함)
- 평가: 총평 한 줄, 그대로 가져올 것·바꿀 것·쓰지 않을 것 각 1–2개(항목 번호와 수치)
- 핸드북에 반영한 것(카드 ID와 유형), 검사 결과 한 줄
- 못 한 것·불확실한 것(렌더 검수 못 함, 번역 불확실, 카메라 이동 구간 등)
