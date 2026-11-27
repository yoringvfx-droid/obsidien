# config.json 작성법 (분석 페이지 고정 양식)

분석 페이지는 `assets/breakdown_template.html` 하나로 그린다. 레이아웃·색·글꼴·인터랙션(플레이어, 4행 타임라인, 흑백/밸류 4단 보기, 미니 플레이어, 구간 반복)은 템플릿이 고정으로 가지고 있다. **영상마다 바뀌는 내용만 config.json에 쓴다.** 템플릿 HTML을 영상마다 손으로 고치지 않는다. 양식이 매번 같아야 사례끼리 비교가 되기 때문이다.

완성된 예시: `references/example_config.json` (星光啊，闪爆他). 새 config는 이 파일을 복사해서 고친다.

## 목차
1. 최상위 필드
2. sections와 카드
3. 그림 유형별 필드
4. 글 쓰는 규칙
5. 좌표 규칙

---

## 1. 최상위 필드

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `title` | ○ | 작품 이름 그대로(원어). 한자는 세리프 굵은 글꼴로 나온다. 라틴 문자 제목이면 `"title_latin": true` |
| `page_title` | | 브라우저 탭 이름. 기본 "<title> 이펙트 분해" |
| `one` | ○ | 한 줄 요약. `<b>`(파랑 강조), `<i>`(핑크 강조) 사용 가능 |
| `chips` | ○ | 길이, 프레임·fps, 카메라, 장면 배치 등 4개 안팎 |
| `start_frame` | | 처음 열었을 때 보여줄 프레임. 영상의 성격이 가장 잘 보이는 프레임 |
| `impact_range` | | 카메라가 다른 인서트·무채색 프레임 `[a,b]`. 색상 표시에서 제외 |
| `focus_labels` | | ROI A/B 이름 `["시전체","대상"]`. ROI를 안 쟀으면 생략(주목 표시가 숨겨짐) |
| `peak_marks` | ○ | 타임라인 강도 막대 위에 번호를 찍을 피크 `[[f],[f],…]` |
| `energy_cap` | | 강도 막대 상한. 비우면 영상 강도 상위 2% × 1.15로 자동. 넘는 프레임은 "f↑"로 표시 |
| `acts` | ○ | `{a,b,name,c}` — c는 막 색 `rgba(…,.4)`. 막 색은 그 막의 주조색으로 |
| `beats` | ○ | `[a,b,이름,한 줄]`. 모든 프레임이 정확히 한 비트에 들어가야 한다 |
| `index` | ○ | 상단 요약 카드 6개 `[#카드id, 제목, 한 줄, 아이콘]`. 아이콘: ladder conv dip bars cross lines light shape |
| `sections` | ○ | 아래 |
| `method` | ○ | 측정 방법 문단(예시 문장을 영상에 맞게 고친다) |
| `frames`·`fps`·`sprite` | | 비워 두면 meta.json에서 채운다 |
| `key_hues` | | 맨 위 "읽는 법" 색상환에 찍을 주요 색상 `[[각도, 이름]]` 2–4개. 예: `[[215,"1막 파랑"],[296,"3막 핑크"]]` |
| `card_names` | | 비워 두면 build_page.py가 핸드북 카드 이름표를 넣는다(`--handbook` 또는 references/handbook_cards.json) |

## 2. sections와 카드

```json
{"id":"timing","no":"01 TIMING","title":"타이밍","lede":"한 줄","cards":[ {카드}, … ]}
```
섹션 순서는 고정: `timing`(01) → `value`(02) → `color`(03) → `shape`(04) → `projectile`(05, 투사체가 있을 때만) → `review`(평가) → `apply`. 번호(`no`)는 빠진 섹션 없이 이어서 붙인다(투사체가 없으면 05 REVIEW · 06 APPLY). review는 항상 넣는다. 영상에 해당 내용이 없으면 카드를 빼되 섹션 순서는 바꾸지 않는다. 카드가 하나도 없으면 섹션째 뺀다.

카드 공통 필드: `type`, `id`(내보내기 파일명에 쓰인다: t1 t2… v1… c1… s1…), `span`(12칸 그리드에서 차지할 칸: 12, 7+5, 6+6, 8+4), `tag`, `tagClass`(good / bad / amb), `title`, `cap`(카드 아래 한 줄) 또는 `capInline`(제목 옆 한 줄).

한 줄에 놓이는 카드는 span 합이 12가 되게 짝을 맞춘다.

## 3. 그림 유형별 필드

| type | 용도 | 필드 | 값을 얻는 곳 |
| --- | --- | --- | --- |
| `grammar` | 막별 동작 문법 비교(같은 문법 두 번) | `rows:[{name,sub,color,segs:[[이름,f,색 또는 "dip"]]}]`, `brackets:[{row,from,to,text,color}]`, `chips:[[큰 글자,작은 글자,색]]`, `k`(px/f, 생략 가능) | 비트 경계 |
| `dips` | 피크 앞 밝기 누르기 | `panels:[{a,b,k,lo,hi,dip:[f…],pk:[f…],t,m,n}]` — k는 data 열 번호(0 화면 L*, 1 이펙트 상위5%, 2 ROI A, 3 ROI B, 12 강도), lo·hi는 세로축 범위(기본 0–100, 강도는 예: lo 0 hi 2.5) | `peaks` |
| `peaks` | 피크 간격 | `frames:[f…]`, `hot`(이 이하 간격 강조, 기본 7) | `peaks` |
| `beats` | 비트 X-시트 | 없음(beats에서 자동) | |
| `ladder` | 색은 바꾸고 밸류는 고정 | `left/right:{frame,crop,label,sub}`, `rampA/rampB:[[단계,L*,hex]]`, `labelA/B`, `colorA/B` | `palette`, `lstats` |
| `share` | 밝기 단계 면적 | `rows:[{name,range,vals:[코어,바디,엣지,헤이즈 %],cols:[hex×4]}]` | `palette` |
| `focus` | 주목의 이동(ROI A/B) | `range:[a,b]`, `zones:[[a,b,글,색]]`, `note:{f1,v1,f2,v2,text}`, `relative`(true면 프레임마다 그 구간 기준 프레임(plate_map) 대비 상승량, `base`로 고정 가능, 세로축 `lo`–`hi` 기본 0–50) | `focus --relative` |
| `impact` | 임팩트·반전 프레임 줄 | `frames:[[f,이름]]` (최대 8) | data 0열 |
| `post` | 화면 레벨 장치 | `items:[[f,이름,한 줄]]` (5개 권장) | 직접 관찰 + data |
| `ramps` | 팔레트 램프 | `ramps:[{name,sub,nodes:[[단계,hex,H°,L*]]×4}]` | `palette` |
| `hueL` | 색상×밝기 좌표, 배경 수렴 (bg 값은 `measure.py WORK bg`) | `xr:[h0,h1]`, `ticks`, `bg:{hue,L,label}`, `series:[{label,color,pts:[[H,L*,hex]]}]`, `notes:[[H,L,글]]`. 빨강 근처(0°/360°)를 걸치면 `xr:[300,420]`처럼 360을 넘겨 쓴다(0–60°는 360–420으로 그려진다) | `palette`, plate 색 |
| `numbers` | HSV S vs 선명도 | `items:[{label,hex,s,c}]` 2개 (s = HSV S, c = 선명도) | `chroma` |
| `transition` | 색 전환 경로·층별 속도 | `thumbs:[f…]`(8), `crop`, `wheel:{a:[H,글,hex],m,b,dir(1 시계/-1 반시계),center:[줄1,줄2]}`, `gantt:{f0,f1,rows:[[층,a,b,글]],startHex,endHex}` | `hue a-b` |
| `white` | 코어 백색 비교 | `items:[[hex,이름,부제]]`, `divider`(구분선 위치 인덱스), `divider_label` | `palette`, `chroma` |
| `ret` | 장면 색 복귀 | `f0,f1`, `box:[a,b,글]`, `marks:[[f,위 글,아래 글,색]]`, `arrow:[a,b,글]` | `scene` |
| `flow` | 형태 언어 흐름 | `groups:[[분류,색,[[글리프,이름,f]]]]`, `axis:[왼,가운데,오른]` | 관찰 |
| `compo` | 구도 축 위의 경로 | `frame`, `paths:[{kind:curve/wave/line,from,to,c1,c2,offset,amp,n,color,w,dash,label,lx,ly}]` | 관찰(좌표는 스프라이트 셀) |
| `order` | 질서 → 혼돈 비교 | `a/b:{frame,crop,label}`, `rows:[[항목,a,b]]` | 관찰 |
| `motifs` | 반복 모티프 | `rows:[{title,items:[[f,"x,y,w",이름]]×5}]` (높이는 자동) | 관찰 |
| `thumbs` | 일반 썸네일 줄(위에 맞는 유형이 없을 때) | `items:[[f,제목,설명,crop]]` | |
| `swatches` | 색 역할 비교 등 일반 스와치 줄 | `items:[[hex,이름,부제]]` | `palette` |
| `projectile` | **투사체 해부** (05 PROJECTILE) | `items:[{name, sub, path:[[f,x,y]], path_frame, thumbs:[[f,crop,라벨]], profile:[[hex,명도,선명도,색상°]]×8, profile_frame, time:[[f,hex,명도,선명도,색상°]]×2, form, texture, color, shape, flight, link}]` — 렌즈 필드는 `{ev:[["라벨","값"]], text}`. 경로는 `path_frame` 프레임 위에 점선으로 그려진다 | `projectile.py` (analysis_guide 7절) |
| `verdict` | **평가 총평** (05 REVIEW 첫 카드) | `line`(한두 문장), `copy`/`adapt`/`avoid`:`[[글, "카드 · 항목번호"]]`. 평가 지도(막 띠 위 항목 위치)와 종류별 개수는 review 카드에서 자동 | analysis_guide 6.4 |
| `review` | **평가 항목** | `side`: `"good"`(good·counter) / `"bad"`(weak·risk) / 생략(둘 다). `items:[{kind, title, card, frames, what, why, ev, take, fix, check, thumbs, spark, at}]` 아래 표 | analysis_guide 6.3 |
| `checks` / `exercises` / `warn` | apply 섹션 | `items:[[아이콘,글]]` / `items:[[제목,글]]` / `text` | 핸드북 카드 체크 |

**review 항목 필드**

| 필드 | 형식 | 설명 |
| --- | --- | --- |
| `kind` | good / counter / weak / risk | good·counter는 잘된 점(G1…), weak·risk는 아쉬운 점(W1…). 번호는 순서대로 자동 |
| `title` | 글 | 판단 한 줄 |
| `card` · `frames` | `"VA07"` · `"141–222"` 또는 `"40–46 · 218 · 225"` | 제목 아래 줄. card는 "핸드북 원리: 대비 전쟁과 주목 양보"처럼 이름으로 보이고, frames는 눌러서 볼 수 있는 링크가 된다. 평가 지도 구간(마우스를 올리면 표시)에도 쓴다 |
| `what` | 글(`<b>` 가능) | 관찰. 측정 수치만. 예전 필드 `text`도 받는다 |
| `why` | 글 | 왜 작동하나 / 왜 약한가 / 왜 위험한가(라벨은 kind에 따라 자동) |
| `ev` | `[["라벨","값"]]` 2–4개 | 근거 칩 |
| `take` | 글 | good·counter의 "내 작업에 가져오기" |
| `fix` | 글 | weak "개선안" / risk "게임에서는". 필수 |
| `check` | 글 | 확인 방법(측정 명령 → 목표). weak 필수 |
| `thumbs` | `[[f, crop 또는 null, 라벨]]` 1–4개 | 왼쪽 그림. 없으면 `f`·`crop` 한 장 |
| `spark` | `{k, pts, a, b, lo, hi, label, names, mark:[f], win:[a,b], rel, cols}` | 미니 그래프. `k`는 data 열 번호 또는 배열(여러 선, 둘째부터 점선). `"c14"`/`"l14"`는 14열(바디색) hex의 Lab C\*/L\*(13 코어, 15 엣지도 가능). `rel:true`는 기준 프레임 값을 뺀다. data에 없는 값(`cover`, `cpath` 출력)은 `pts:[[f,v],…]`로 직접 넣는다(k 다음 선으로 그려진다, k 생략 가능) |
| `at` | f | 평가 지도에서 번호를 찍을 프레임. 기본은 thumbs 첫 프레임 |

05 REVIEW 섹션은 카드 3장으로 쓴다: `verdict`(r0) → `review` side good(r1) → `review` side bad(r2). 모두 span 12.

글리프(flow): crescent ring hook burst tri tetra wave ribbon hline beam inv glass decal circle square spiral dots smoke shockwave pillar zigzag heart star shrink chain.
checks 아이콘: ladder conv white dip cross path shape time.

## 4. 글 쓰는 규칙

- 카드 하나 = 원리 하나. 제목은 원리 문장(예: "피크 앞 밝기 누르기"), cap은 한 줄. **본문 문단을 넣지 않는다.** 설명은 그림이 한다.
- 제목 앞에 수치를 넣으면 한눈에 읽힌다: "같은 문법, 두 번 · 모으기 ×2.6 길게, 맞히기 ×4.4 빠르게".
- 그림 안 글자는 짧게(한 칸 12자 안팎). 길면 겹친다.
- 단정형("~다"), 이모지·감탄 없음. 핸드북 용어 사용.
- **06 APPLY의 연습은 처음 읽는 사람이 그대로 따라 할 수 있게 쓴다.** 숫자가 무엇의 값인지(예: "코어·바디·엣지·헤이즈 4단계 색의 명도"), 무엇을 몇 개 만드는지, 성공 기준을 적는다. 이 페이지에만 있는 말(막 비율, X-시트 등)은 풀어서 쓰거나 괄호로 설명한다.
- **색 숫자는 쉬운 이름으로 쓴다.** 명도(L\*), 선명도(C\*), HSV S(채도), 색상(°). 글에는 L\*·C\*·Lab을 쓰지 않는다(analysis_guide 1절 표). 그림 라벨도 같다("화면 평균 명도", "결정 최대 명도").
- **색상 각도에는 색 이름을 붙인다**: "파랑(215°) → 보라(256°) → 핑크(296°)". 페이지가 각도 앞에 색 점을 붙인다. 차이 각도는 "81° 회전"처럼 쓴다.
- **글 속에 카드 ID(VA07, CO08 등)를 쓰지 않는다.** 읽는 사람은 ID만 보고 무슨 원리인지 모른다. 원리를 풀어 쓴다: "VA07은 …라고 한다"가 아니라 "화면에 오래 남는 요소가 먼저 밝기를 낮춰야 시선이 넘어간다". 카드를 꼭 가리켜야 하면 「대비 전쟁과 주목 양보」처럼 이름으로 쓴다. ID는 `card` 필드와 총평 참조 줄에만 쓰고, 페이지가 이름으로 바꿔 보여준다. `shoot.js review`의 `idInProse`가 0건이어야 한다.
- **프레임은 `F154`, `F40–46` 형식으로 쓴다.** 페이지에서 글 속 프레임이 링크가 되어 누르면 그 프레임으로 가고(구간은 반복 재생) 미니 플레이어에 뜬다. `F223·F228`처럼 나열할 때도 숫자마다 F를 붙인다. F 없는 숫자("150")는 링크가 안 된다. `frames` 필드는 "112 · 150"처럼 써도 된다(템플릿이 F를 붙인다).

## 5. 좌표 규칙

- `crop`은 **스프라이트 셀 좌표**(가로 512, 세로는 meta.json의 sprite.h)로 `"x,y,w,h"`. 원본 해상도가 아니다. 원본 픽셀 × 512 / 원본 가로. measure.py의 `--crop`(strip, lstats)도 같은 좌표라서 그대로 옮겨 쓰면 된다.
- `compo`의 from/to/c1/c2/lx/ly도 같은 셀 좌표.
- 위치를 모를 때는 `measure.py strip`으로 원본을 보고 비율로 환산한다.
