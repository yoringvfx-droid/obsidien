---
title: "개념 추출 — Lecture"
date: 2026-10-07
type: working
tags:
  - vfx-handbook
---

> [!note] Lecture 이론 노트 13개에서 추출한 개념 원문 표 (L01–L211). [[01 개념 지도]]의 카드가 이 ID를 참조한다.

# concepts_L — VFX 이론 노트 개념 추출 (Lecture/MOC + Color + Shape)

- 작업 범위: `Lecture/VFX Art Theory MOC.md`, `Lecture/Color/*.md`(7개), `Lecture/Shape/*.md`(5개) 총 13개 파일. 볼트 파일은 수정하지 않음.
- 출처 열은 파일명(.md 생략) + § 섹션 제목. 표 안 `/` `·` `→` 는 구분 기호이며 표 열 구분자와 무관.
- 장 분류 값: 형태 / 밸류 / 컬러 / 빛 / 타이밍 / 구성 / 소재별 / 워크플로·검수 / 기타

## 개념 표

| ID | 개념 | 영문 용어 | 장 | 핵심 주장 | 구체 규칙·수치 | 출처 |
|---|---|---|---|---|---|---|
| L01 | 이론 노트 5분류 체계 | VFX Art Theory taxonomy | 기타 | 이펙트 기초아트 이론은 Shape/Form, Color, Value, Timing, 확장 주제(구성·모션·레이어·리듬·스케일)의 다섯 갈래로 정리된다. | Value(4주제)·Timing(4주제)·확장(5주제)은 pending. Value Contrast LIT는 Value가 아니라 Color 섹션에 분류됨. | VFX Art Theory MOC § 전체 구조 |
| L02 | LIT 작성 규약 | Literature Note convention | 기타 | Literature Note는 영어로 작성하고 서브토픽 단위로 누적한다고 MOC가 명시한다. | 실제로 Shape 5개 LIT는 한국어 본문(충돌 메모 참조). | VFX Art Theory MOC § 서두 |
| L03 | 색 이론 노트 보관 규칙 | Color Theory folder rule | 기타 | 색채 이론·색 운용 원칙·색-빛 관계 같은 도메인 횡단 이론은 Theory/Color에 두고, 특정 셰이더·이펙트 구현 종속 문서는 Shaders/Effects 폴더에 둔다. | Dataview 경로가 `07 Theory/Color`로 적혀 있음(현재 폴더 구조 `Lecture/Color`와 다름). | Color Theory Index § 정리 메모 |
| L04 | 색 언어 | Color language | 컬러 | 색상·채도·온도로 감정·서사 상태·게임 정보를 말 없이 전달하는 체계이며, 심미/감정 층위와 기능/소통 층위를 동시에 말해야 한다. | 두 층위: aesthetic/emotional(분위기·톤) + functional/communicative(위험·치유·진영·상태). | LIT — Color Language & Emotion in VFX § Definition |
| L05 | 인지 이전의 색 반응 | Color speaks before cognition | 컬러 | 플레이어가 디테일을 의식적으로 처리하기 전에 색이 이미 감정 반응을 만든다. | — | LIT — Color Language & Emotion in VFX § Definition / Summary of Core Principles |
| L06 | 따뜻함-차가움 온도 축 | Temperature: warm vs cool | 컬러 | 색 감정의 가장 근본 축은 온도이며 따뜻한 색은 에너지·긴박, 차가운 색은 차분·거리·신비를 전한다. | 따뜻: 빨강·주황·노랑(불·폭발·버프·치명타). 차가움: 파랑·청록·초록·보라(얼음·실드·치유·마법). | LIT — Color Language & Emotion in VFX § Two Axes: 1. Temperature |
| L07 | 온도는 이분법이 아닌 다이얼 | Temperature as a dial | 컬러 | 다른 요소를 고정한 채 이펙트를 따뜻한 쪽에서 차가운 쪽으로 옮기기만 해도 감정 레지스터가 근본적으로 바뀐다. | — | LIT — Color Language & Emotion in VFX § Two Axes: 1. Temperature |
| L08 | 채도 = 감정 신호 강도 | Saturation as signal strength | 컬러 | 채도는 색이 전하는 감정 메시지의 세기를 조절한다. | 고채도=긴박·강렬·카툰/스타일화, 중채도=읽힘·현존, 저채도=침울·낡음·비강조, 무채색 근접=공포 위험·배경 중립·퇴색/소멸. | LIT — Color Language & Emotion in VFX § Two Axes: 2. Saturation |
| L09 | 탈채도로 피해·죽음 표현 | Desaturation for damage/death | 컬러 | 색상은 유지하고 채도만 빼면 이펙트의 형태를 바꾸지 않고도 손상이나 죽음을 전달할 수 있다. | — | LIT — Color Language & Emotion in VFX § Two Axes: 2. Saturation |
| L10 | 색상별 감정 연상 | Hue emotional associations | 컬러 | 각 색상은 학습된 감정 어휘를 갖는다. | 빨강=위험·열정(불·피·어그로), 주황=에너지·모험(폭발·버프), 노랑=기쁨·주의(번개·성스러운 빛·파워업), 초록=성장·안전·치유·독, 파랑=차분·신뢰·냉기·정밀(얼음·물·실드·SF), 보라=신비·럭셔리·초자연·타락(저주·엘리트), 흰색=순수·신성·정화, 검정=힘·공허·죽음. | LIT — Color Language & Emotion in VFX § Hue-Specific Emotional Associations |
| L11 | 색 연상의 문화 차이 | Cultural context of color | 컬러 | 위 표는 서구/글로벌 시장 관습이며 문화권마다 다르다. | 빨강=동아시아에서 행운(서구는 위험), 흰색=일부 아시아에서 애도(서구는 순수), 보라=서구 왕족이나 전 세계적 일관성은 낮음. | LIT — Color Language & Emotion in VFX § Cultural Context |
| L12 | 색 단독 의존 금지·중복 신호 | Redundant signaling | 컬러 | 글로벌 출시에서는 위험 신호를 색에만 의존하면 오독 위험이 있으므로 형태·움직임·소리로 보강한다. | — | LIT — Color Language & Emotion in VFX § Cultural Context |
| L13 | 색=의미 계약 | "Color = Meaning" contract | 컬러 | 같은 색이 같은 의미를 일관되게 가리키면 플레이어는 읽지 않고 느끼게 되며, 계약이 깨지면 마찰과 혼란이 생긴다. | 예: 파란 포털=포털, 적의 빨간 외곽선=위험, 금빛 반짝임=보상. | LIT — Color Language & Emotion in VFX § Color as a Design Language System |
| L14 | 감정에서 색으로(설계 순서) | Start with emotion, not color | 워크플로·검수 | 색을 고르기 전에 플레이어가 느낄 감정부터 정의하고 온도→색상→채도→맥락 테스트 순으로 좁힌다. | 4단계: 감정 목표 → 온도 후 색상 → 채도 수준 → 배경에서 테스트. | LIT — Color Language & Emotion in VFX § Start With Emotion, Not Color |
| L15 | 관계적 색(맥락이 색을 바꾼다) | Relational color | 컬러 | 색 인식은 주변색에 따라 변하며 색 언어는 절대적이 아니라 상대적이다. | 빨간 이펙트가 빨갛게 틴트된 배경에서는 중립으로 읽히고 파란 배경에서는 긴박하게 읽힌다. 이펙트 색상을 배경과 맞추는 것이 가독성 실패의 가장 흔한 원인 중 하나. | LIT — Color Language & Emotion in VFX § Relational Color |
| L16 | 온도 대비 = 주의 스파이크 | Temperature contrast as attention | 컬러 | 명도 대비가 시선 위치를 정하듯 색온도 대비는 시선이 가장 먼저 무엇을 느끼는지 정한다. | 차가운 환경 속 따뜻한 이펙트(또는 반대)는 확실한 주의 스파이크. | LIT — Color Language & Emotion in VFX § Practical Rule: Emotional Contrast = Attention |
| L17 | 상태 전달 색 표 | State communication colors | 소재별 | 색은 게임 상태 변화를 가장 빠르게 알리는 수단이다. | 버프=따뜻한 글로우·금·밝은 흰색, 디버프=탈채도·보라·황록, 치유=초록·소프트 화이트·따뜻한 금, 독/타락=병든 초록·보라·어두움, 화염=적주황~붉은 불씨~흰색, 빙결=청백·탈채도 차가움, 죽음/소멸=기존 색의 탈채도·암화, 치명타=흰색 또는 순색으로 플래시. | LIT — Color Language & Emotion in VFX § State Communication Through Color |
| L18 | 이펙트 내부의 감정 호 | Emotional arc within an effect | 타이밍 | 한 이펙트의 색 변화가 긴장→해소→안정이라는 감정 흐름을 만든다. | 임팩트 프레임=순수 고채도 최대 강도, 중간 감쇠=더 차갑고 어두운 톤, 소산=저채도. | LIT — Color Language & Emotion in VFX § Emotional Arc Within a Single Effect |
| L19 | 색각 이상 접근성 | Color-vision accessibility | 워크플로·검수 | 색만으로 핵심 정보를 구분하면 색각 이상 플레이어에게 실패한다. | 남성 플레이어 약 8%. 색 외에 형태·움직임·밝기 대비·텍스처 병용, 적록색약(deuteranopia/protanopia) 시뮬레이션으로 검수. | LIT — Color Language & Emotion in VFX § Accessibility Considerations |
| L20 | 게임별 색 언어 사례 | Color language in games | 컬러 | 제한된 팔레트가 테마를 이펙트·UI 전체에 인코딩하고 색 변화가 서사를 예고한다. | Persona 5=빨강·검정·흰색 고대비 반항/연극성. BioShock Infinite=따뜻한 톤 → 차갑고 탈채도된 톤으로 서사 암전. Portal=파랑·회색·흰색 냉정한 분석 분위기, 긴장 순간에도 차가운 팔레트 유지. | LIT — Color Language & Emotion in VFX § Color Language in Context: Games as Examples |
| L21 | 이펙트 팔레트 정의 | Effect color palette | 컬러 | VFX 팔레트는 예뻐 보이는 색 고르기가 아니라 색상·채도·명도를 제한된 집합으로 두고 시각 요소에 역할을 배정하는 체계적 작업이다. | 조화(harmony)와 위계(주조/보조/강조)의 지배를 받는다. | LIT — Color Palette Design for Effects § Definition |
| L22 | 경쟁 상황의 가독성 | Readability under competition | 컬러 | 내부 구조 없는 팔레트는 시각 노이즈가 되므로 하나가 이끌고 나머지가 받치는 우선순위를 만들어야 한다. | 정보량을 줄이면 신호가 선명해진다(Mad VFX 인용). | LIT — Color Palette Design for Effects § Why Palette Design Matters: 1. Readability Under Competition |
| L23 | 팔레트의 의미 전달 | Semantic communication | 컬러 | 색은 형태·텍스트·애니메이션보다 빨리 해독되며 이펙트 종류·진영·결과·위력을 즉시 알린다. | 얼음=파랑·흰색, 불=빨강·주황. 관습 위반은 인지 마찰. | LIT — Color Palette Design for Effects § Why Palette Design Matters: 2. Semantic Communication |
| L24 | 팔레트 성격-감정 정렬 | Palette character vs emotion | 컬러 | 팔레트의 전체 성격(온도·채도)이 이펙트의 정서를 정하므로 의도한 톤과 맞춰야 한다. | 치유 주문이 빨강·주황이면 위협으로 읽히고 프로스트 노바가 밝은 노랑이면 에너제틱으로 읽힘. 따뜻+고채도=에너지·공격, 차가움+저채도=차분·깊이, 전 구간 고채도=흥분·마법·스타일화, 저채도=분위기·부패·섬세, 따뜻한 코어/차가운 가장자리=마법 에너지·초자연적 열. | LIT — Color Palette Design for Effects § Why Palette Design Matters: 3. Emotional and Atmospheric Alignment |
| L25 | 주조·보조·강조 색 역할 비율 | Dominant / secondary / accent roles | 컬러 | 모든 색에 값이 아닌 역할을 주며, 주조색이 정체성, 보조색이 깊이, 강조색이 결정적 순간의 최대 시각 무게를 맡는다. | 주조 약 60–70%, 보조 약 20–30%, 강조 약 5–10%. 요약부는 "60/30/10 또는 70/20/10 구조"로 서술. 강조색 예: 임팩트 플래시·코어 중심·투사체 끝. | LIT — Color Palette Design for Effects § Palette Structure: Color Roles |
| L26 | 가장 밝고 채도 높은 색 = 핵심 요소 | Main color = brightest and most saturated | 컬러 | 핵심 요소는 가장 밝고 채도 높은 주색으로, 보조 요소는 더 절제된 보조색으로 구분한다. | Mad VFX 인용. | LIT — Color Palette Design for Effects § Palette Structure: Color Roles |
| L27 | 유사색 조화 | Analogous harmony | 컬러 | 색상환에서 인접한 색(예: 파랑→청록→시안)은 단일 온도의 응집·연속감을 만든다. | 내부 대비 낮음. 앰비언트·지속형 이펙트에 적합. | LIT — Color Palette Design for Effects § Harmony Types: Analogous |
| L28 | 보색 조화 | Complementary harmony | 컬러 | 색상환 반대편 색(파랑/주황, 빨강/초록, 보라/노랑)은 최대 색상 대비를 만들고 반대색이 낮은 불투명도·작은 크기에서도 튄다. | 임팩트 순간·코어 하이라이트·초점 강조에 적합. | LIT — Color Palette Design for Effects § Harmony Types: Complementary |
| L29 | 분할보색 조화 | Split-complementary harmony | 컬러 | 주색 하나와 그 보색 양옆의 두 색을 써서 보색 대비를 얻되 거칠지 않고 변화는 더 줄 수 있다. | 예: 파랑 주색 + 주황빨강·주황노랑. 마법·특수능력 이펙트에 널리 쓰임. | LIT — Color Palette Design for Effects § Harmony Types: Split-Complementary |
| L30 | 삼각 조화와 권장 조합 | Triadic / analogous+triadic | 컬러 | 삼색 균등(예: 빨강/노랑/파랑)은 엄격한 명도 통제 없이는 압도적이 되므로 유사+삼각 변형 정도로 제한한다. | David Hall 인용: 유사·삼각 변형으로 제한. 색을 더 늘리면 과대비·노이즈 위험. | LIT — Color Palette Design for Effects § Harmony Types |
| L31 | 제약이 기능이다(색상 수 제한) | Constraint is a feature | 컬러 | 이펙트를 풍부하게 만들려고 색을 더하면 내부 경쟁만 늘어 가독성이 떨어지며, 적은 색상과 큰 명도 변화가 효과적이다. | Shahrabi 인용: 가장 효과적인 장면은 색상 1–3개, 최대 5개. 본 노트 요약은 "총 색상 2–3개 이내". 구축 워크플로도 "총 2–3색 이내". | LIT — Color Palette Design for Effects § Key Design Principles: Constraint is a Feature / Summary |
| L32 | 채도의 집합적 관리 | Staggered saturation | 컬러 | 모든 색을 최대 채도로 올리면 위계가 무너지므로 채도를 계단식으로 차등해야 한다. | 코어: 최고 채도·최고 명도. 보조 몸체: 채도 감소·중간 명도. 배경/외곽 소산: 추가 탈채도. | LIT — Color Palette Design for Effects § Key Design Principles: Saturation Must Be Managed Collectively |
| L33 | 명도+색상의 방향성 있는 주의 유도 | Value + hue = directional attention | 밸류 | 휘도는 초점에 집중하고 낮은 휘도는 물러나며, 단색 팔레트에서도 명도 변화만으로 시선이 유도된다. | 코어의 보색 강조와 결합하면 더 강한 초점. Matt Schwartz 사례: 중앙 차징 포인트·임팩트 존은 높은 값, 보조 영역은 낮은 값. | LIT — Color Palette Design for Effects § Key Design Principles: Value + Hue = Directional Attention |
| L34 | 게임 비주얼 스택 속 팔레트 | Visual stack integration | 구성 | 이펙트 팔레트는 환경·캐릭터·UI 색 체계의 제약 안에서 설계된다. | 환경=중간 명도·낮은 채도, 캐릭터=가독하되 비지배, VFX=더 넓은 명도 폭·높은 채도(단 UI를 넘지 않음), UI=최우선·항상 VFX 위에서 판독. | LIT — Color Palette Design for Effects § Key Design Principles: Palette Must Integrate with Game Tone |
| L35 | UI와 색상 영역 분리 | Reserved hues per layer | 구성 | 이펙트 팔레트가 UI와 같은 색상 범위를 쓰면 정보 위계가 혼동되므로 스튜디오 스타일 가이드가 레이어별 예약 색상을 정한다. | — | LIT — Color Palette Design for Effects § Key Design Principles: Palette Must Integrate with Game Tone |
| L36 | 따뜻한 코어·차가운 외곽 | Warm core / cool edge | 컬러 | 한 팔레트 안에서 온도를 섞으면 조화를 깨지 않고 내부 대비가 생기며, 따뜻한 코어와 차가운 외곽은 중심 열기→확산·냉각 서사를 강화한다. | 따뜻한 조명 환경에서는 차가운 외곽이, 차가운 조명 환경에서는 따뜻한 코어가 대비를 제공해 양쪽 배경에서 모두 판독. | LIT — Color Palette Design for Effects § Key Design Principles: Temperature Contrast as a Design Tool |
| L37 | 팔레트 구축 7단계 | Palette construction workflow | 워크플로·검수 | 의미 역할 → 주색 → 조화 유형 → 보조·강조 → 레이어별 채도 → 온도 논리 → 환경 테스트 순으로 만든다. | 보조·강조 포함 총 2–3색 이내. 유사=응집, 보색=임팩트, 분할보색=풍부함. 코어에서 가장 밝고 바깥으로 갈수록 감쇠. 레벨 대표 배경과 주색 대비 확인. | LIT — Color Palette Design for Effects § Practical Palette Construction Workflow |
| L38 | HDR과 블룸의 구분 | HDR vs Bloom | 빛 | HDR은 0–1을 넘는 광량 범위 저장이고 블룸은 임계값 이상 픽셀을 추출해 블러 후 되가산하는 포스트 효과로, 서로 다른 도구다. | HDR이 어떤 요소가 블룸할지 정밀 지정을 가능하게 하고 블룸이 복사 광휘의 착시를 준다. | LIT — HDR & Bloom — Art Perspective § Definition |
| L39 | 블룸은 발광 설득의 다리 | Bloom as emissive bridge | 빛 | 블룸이 없으면 발광 요소는 밝은 평면 물체로 읽히고, 제어된 블룸이 있으면 장면으로 에너지를 밀어내는 광원으로 읽힌다. | 불은 뜨겁게, 마법 코어는 방사하게, 임팩트 플래시는 폭발적으로 느껴져야 함. | LIT — HDR & Bloom — Art Perspective § Why This Matters for VFX |
| L40 | 블룸 동작 원리 5단계 | How bloom works | 빛 | HDR 프레임 캡처 → 임계 패스 → 블러 → 가산 합성 → 톤매핑 순으로 처리된다. | 블러 방식: Gaussian·dual-pass·컨볼루션 커널. | LIT — HDR & Bloom — Art Perspective § How Bloom Works |
| L41 | 임계값과 이미시브 배율 | Bloom threshold / emissive multiplier | 빛 | 임계값이 무엇이 블룸할 자격이 있는지 정하는 핵심 예술적 제어이며 이미시브는 이를 넘도록 HDR 강도로 작성한다. | 이미시브 배율 예 3–10×. | LIT — HDR & Bloom — Art Perspective § How Bloom Works |
| L42 | 블룸의 절제 | Bloom restraint | 빛 | 과한 블룸은 대비와 가독성을 파괴하므로 블룸은 광원 인식을 강화할 뿐 광원 디자인을 대체하지 못한다. | 확산 시: 명도 대비 씻김, 인접 요소로 번져 색 분리 흐려짐, 주의 분산, 노이즈화. | LIT — HDR & Bloom — Art Perspective § The Core Art Principle: Restraint |
| L43 | 용도별 블룸 강도 3단계 | Bloom intensity by intent | 빛 | 블룸은 미묘(사실)·중간(분위기·서사)·강함(스타일·표현)으로 의도에 맞춰 쓴다. | 미묘=유리·금속이 자연스럽게 빛 받음, 정밀 공간 읽기 필요한 슈터·플랫포머. 중간=불 주변 온기·포털 신비 광채. 강함=애니메 인접·마법·SF 네온, 코어·에너지 블라스트 고배율 의도적. | LIT — HDR & Bloom — Art Perspective § Artistic Use Cases by Intention |
| L44 | 아트 스타일별 블룸 역할 | Bloom role by art style | 빛 | 같은 블룸 강도도 아트 스타일에 따라 다르게 읽힌다. | 사실/PBR=물리 동기, 스타일 카툰=부드러운 글로우로 마법·온기·매력, 다크/거친=좁고 거친 블룸으로 긴장·위험, SF 네온=고대비 블룸으로 합성·사이버펑크, 판타지=넓고 부드러운 블룸으로 이질감·경이. | LIT — HDR & Bloom — Art Perspective § Artistic Intent as Context |
| L45 | 의도된 블룸 vs 습관적 블룸 | Intentional bloom | 빛 | 문제는 블룸 양이 아니라 기본값으로 쓰는 무사유이며 의도된 과블룸은 서사 결정이 될 수 있다. | 사례: Ico(2001)의 "햇살에 씻긴" 룩. | LIT — HDR & Bloom — Art Perspective § Artistic Intent as Context |
| L46 | 블룸은 대비를 죽인다 | Bloom as contrast killer | 밸류 | 블룸은 초점에서 휘도를 바깥으로 퍼뜨려 코어의 날카로운 엣지와 밝음/어두움 차이를 평평하게 만들어 "어디서나 보이지만 어디서도 지배하지 못하는" 이펙트가 된다. | 인접한 어두운 영역이 산란광으로 채워져 대비 감소. | LIT — HDR & Bloom — Art Perspective § Bloom as Contrast Killer — The Core Risk |
| L47 | 좁은 반경 고강도 블룸 | Narrow high-intensity bloom | 빛 | 초점에 작은 반경·높은 강도로 블룸을 쓰고 넓은 영역의 부드러운 확산은 피해 값 대비의 펀치를 보존한다. | 블룸은 부드러운 대기 헤일로이지 대비 파괴자가 아니어야 함. | LIT — HDR & Bloom — Art Perspective § Bloom as Contrast Killer — The Core Risk |
| L48 | 임계값 대비 방출량 설계 | Emit above threshold deliberately | 빛 | 임계값 바로 위로 방출하면 부드러운 미세 글로우, 훨씬 위로 방출하면 하드하고 강한 버스트가 된다. | 이미시브 배율은 씬의 블룸 임계값을 염두에 두고 설정. | LIT — HDR & Bloom — Art Perspective § Emissive Design for Bloom: 1 |
| L49 | 이미시브 텍스처 내 휘도 위계 | Luminance gradient in emissive texture | 빛 | 이미시브 텍스처 자체에 밝기 위계를 심어 코어가 가장 밝고 바깥은 임계값 쪽으로 페더되게 하면 이펙트 형태에 맞는 블룸 강도 구배가 생긴다. | 균일한 밝기는 균일한 블룸=초점·펀치 없음. | LIT — HDR & Bloom — Art Perspective § Emissive Design for Bloom: 2 / Common Mistakes |
| L50 | 색은 블룸 속에 살아남는다 | Color survives into bloom | 빛 | 색이 있는 이미시브는 같은 색으로 물든 블룸 헤일로를 만들어 이펙트 정체성을 강화한다. | 붉은 파이어볼 코어는 붉게, 파란 마법 오브는 파랗게 블룸. | LIT — HDR & Bloom — Art Perspective § Emissive Design for Bloom: 3 |
| L51 | 화이트아웃 회피 | Avoid white-out | 빛 | 이미시브 값이 너무 극단적이면 블룸 영역이 흰색으로 포화되어 색 정보와 색 디자인이 사라지므로 상한을 통제한다. | — | LIT — HDR & Bloom — Art Perspective § Emissive Design for Bloom: 4 |
| L52 | 연기와 글로우 분리 | Separate smoke from glow | 소재별 | 불 이펙트에서 밝은 불꽃 코어만 블룸하고 가산 렌더링되는 연기 파티클은 블룸하지 않도록 이미시브 맵으로 분리한다. | — | LIT — HDR & Bloom — Art Perspective § Emissive Design for Bloom: 5 |
| L53 | 노출·눈 적응과의 상호작용 | Eye adaptation / exposure | 빛 | 자동 노출 환경에서는 이미시브 블룸이 예측 불가하게 변해 어두운 복도에서 괜찮던 이펙트가 밝은 야외에서 날아갈 수 있다. | 오픈월드에서 특히 중요. | LIT — HDR & Bloom — Art Perspective § Environment Interaction: Eye Adaptation and Exposure |
| L54 | 노출 대응 해법 | Exposure compensation techniques | 워크플로·검수 | 머티리얼에서 이미시브를 Eye Adaptation 값으로 나눠 체감 밝기를 정규화하고, 문맥별 HDR 배율과 영역별 포스트 프로세스 볼륨 "VFX Multiplier" 파라미터를 둔다. | 문맥 예: 낮/밤, 실내/실외. | LIT — HDR & Bloom — Art Perspective § Environment Interaction: Eye Adaptation and Exposure |
| L55 | 다른 포스트 효과와의 강도 관계 | Bloom vs other post effects | 빛 | 블룸은 단독이 아니라 다른 후처리와의 관계 속에서 보정해야 한다. | 렌즈 플레어=중간(초점 블룸과 경쟁 금지), 글레어/스타버스트=중간(방사 블룸의 방향성 보완), DoF=낮음(깊이 평면이 다름), 컬러 그레이딩=블룸 틴트는 그레이드 존중. | LIT — HDR & Bloom — Art Perspective § Bloom in Relation to Other Effects |
| L56 | 톤매핑 곡선과 블룸 | Tone mapping curve | 빛 | 톤매핑 곡선이 HDR 극값의 압축 방식을 정하므로 같은 이미시브 값이 ACES·Filmic·Reinhard에 따라 전혀 다른 블룸으로 보인다. | 프로젝트 파이프라인 문맥에서 보정. | LIT — HDR & Bloom — Art Perspective § Bloom in Relation to Other Effects |
| L57 | 블룸 흔한 실수 5가지 | Common bloom mistakes | 워크플로·검수 | 임계값 과저·반경 과대·이미시브에 휘도 위계 없음·노출 상호작용 무시·약한 VFX 설계를 블룸으로 보상하려는 것이 대표 실수다. | 임계값이 낮으면 흰 벽·눈·옷까지 빛남. 반경이 크면 모든 곳의 대비 감소. | LIT — HDR & Bloom — Art Perspective § Common Mistakes |
| L58 | 블룸으로 약한 디자인 못 살림 | Bloom cannot rescue weak VFX | 기타 | 블룸은 잘 설계된 이펙트를 강화할 뿐 약한 이펙트를 구제하지 못한다. | — | LIT — HDR & Bloom — Art Perspective § Common Mistakes |
| L59 | 블룸 위에서 UI·게임플레이 요소 판독 | UI legible above bloom | 구성 | 강한 블룸 스타일에서도 UI와 게임플레이 핵심 요소는 블룸 위에서 판독 가능해야 한다. | — | LIT — HDR & Bloom — Art Perspective § Artistic Use Cases by Intention: Strong |
| L60 | 명도와 명도 대비 | Value / value contrast | 밸류 | 명도는 색의 밝고 어두움이고 명도 대비는 가장 밝은 톤과 가장 어두운 톤의 차이이며, 형태·깊이 지각은 이 대비에 의존한다. | VFX에서는 주의·가독성·시각 위계의 1차 제어 수단. | LIT — Value Contrast in VFX § Definition |
| L61 | 눈은 대비의 크기를 따른다 | Attention follows contrast magnitude | 밸류 | 시선은 대비가 가장 큰 곳으로 가며 밝은-어두움 방향(어두운 배경의 밝은 요소/밝은 배경의 어두운 요소)이 아니라 차이의 크기가 주의를 정한다. | 밝은 폭발 on 어두운 배경도, 밝은 하늘 위 어두운 투사체도 똑같이 즉시 읽힘. 눈은 색이 아니라 대비를 따른다. | LIT — Value Contrast in VFX § Why Value Contrast Matters: 1 / Summary |
| L62 | 레이어별 값 범위 위계 | Layer value hierarchy | 구성 | 환경·캐릭터·VFX·UI는 값 범위로 우선순위 스택을 만든다. | 환경=낮은 채도·제한된 중간 명도, 캐릭터=중간 범위(읽히되 비지배), VFX=더 높게·넓은 값 폭, UI=가장 높게(VFX보다 우선). VFX와 UI는 더 넓은 범위를 허용받아 "대비 전쟁"에서 이긴다(VFX Apprentice 인용). | LIT — Value Contrast in VFX § Why Value Contrast Matters: 2. Visual Hierarchy Between Layers |
| L63 | 대비로 게임 정보 전달 | Contrast as gameplay information | 밸류 | 고대비 이펙트는 위험 구역·버프/디버프·팀 소유·치명타·스킬 발동 피드백을 알리며 시야 주변에서도 전달될 만큼 강해야 한다. | — | LIT — Value Contrast in VFX § Why Value Contrast Matters: 3 |
| L64 | 대비는 직설적 진술 | Contrast as bald statement | 밸류 | 색이 암시라면 대비는 정보 그 자체이며, 미묘하면서 효과적일 수 없다. | Game Developer 인용. | LIT — Value Contrast in VFX § Key Design Principles: Contrast as Bald Statement |
| L65 | 그라디언트 크런칭 | Gradient crunching | 밸류 | 부드러운 값 이행 대신 특정 구역에 값 변화를 집중시켜 중간톤 탁함을 없애고 날카로운 하이라이트 존과 디테일 있는 어두운 영역을 만든다. | 초점의 체감 강도 증폭. | LIT — Value Contrast in VFX § Key Design Principles: Gradient Crunching |
| L66 | 값 예산 | Value budget | 밸류 | 이펙트는 게임 전체 시각 스타일이 정한 값 예산 안에 존재하며 최대 밝기에서 작동하면 그라디언트 선택지가 줄어든다. | — | LIT — Value Contrast in VFX § Key Design Principles: The Value Budget |
| L67 | 값 노이즈 회피 | Avoiding value noise | 밸류 | 높은 대비를 너무 넓은 면적에 퍼뜨리면 눈이 앉을 곳이 없어지므로 절제가 필요하다. | 채도·값을 너무 올리거나 색을 너무 많이 쓰면 과대비 위험(Mad VFX 인용). | LIT — Value Contrast in VFX § Key Design Principles: Avoiding Value Noise |
| L68 | 전경·중경·배경 대비 분리 | Foreground / background separation | 구성 | 깊이에 따라 대비를 관리해 이펙트의 공간 판독을 유지하고 균일 대비로 인한 평면화를 막는다. | 전경/초점 이펙트=최고 대비, 중경=중간 대비, 배경=최저 대비로 물러남. | LIT — Value Contrast in VFX § Key Design Principles: Foreground / Background Separation |
| L69 | 대비 수준의 감정·톤 | Emotional tone of contrast | 밸류 | 대비 수준은 색상과 무관하게 감정 무게를 가진다. | 높음(강함)=긴장·드라마·위험·긴박, 중간=역동·판독·몰입, 낮음(부드러움)=고요·평화·앰비언트·소멸, 빠른 진동=불안정·혼돈·초자연. | LIT — Value Contrast in VFX § Emotional and Tonal Dimensions |
| L70 | 시간에 따른 대비 감쇠 | Temporal contrast decay | 타이밍 | 임팩트 프레임에서 최대 대비를 쓰고 이펙트가 흩어지며 낮은 대비로 풀어주면 감쇠 호를 시각·감정 양면에서 강화한다. | — | LIT — Value Contrast in VFX § Emotional and Tonal Dimensions |
| L71 | 키-필 비율 사고 | Key-to-fill ratio | 밸류 | 영화 촬영의 키-필 비율로 이펙트 코어와 외곽 앰비언트 간 휘도 분리량을 가늠한다. | 2:1=약한 앰비언트 글로우, 4:1=뚜렷한 드라마틱 존재감, 7:1 이상=강렬하고 긴박한 시각 우선순위. | LIT — Value Contrast in VFX § Practical Application in VFX: Key-Fill Thinking |
| L72 | 대비 전쟁 | The "contrast war" | 밸류 | 화면에 동시에 있는 이펙트들은 대비를 두고 경쟁하며 이긴 쪽이 먼저 처리되므로 그것은 게임플레이 핵심 이펙트여야 한다. | 동시에 화면에 있을 다른 이펙트를 고려해 설계. | LIT — Value Contrast in VFX § Practical Application in VFX: The "Contrast War" |
| L73 | HDR이 가능케 하는 극대비와 블룸 위험 | HDR contrast vs bloom | 빛 | HDR은 0–1을 넘는 극대비를 가능하게 하지만 블룸이 인접 영역으로 빛을 퍼뜨려 대비를 죽일 수 있으므로 초점의 날카로운 대비를 보존하고 블룸은 부드러운 후광으로만 쓴다. | — | LIT — Value Contrast in VFX § Practical Application in VFX: HDR and Bloom Implications |
| L74 | 값 위계는 시스템 수준 설계 | System-level value hierarchy | 구성 | 값 위계는 이펙트별 개별 설계가 아니라 게임 시스템 전체 수준에서 설계되어야 하고 모든 것을 과대비하면 노이즈가 된다. | 요약 7원칙 중 3·6·7번. | LIT — Value Contrast in VFX § Summary of Core Principles |
| L75 | 관계에 따라 달라 보이는 같은 색 | Context-dependent perception (V1) | 컬러 | 같은 색도 주변 명도·채도가 바뀌면 다르게 읽히며 중앙 색은 동일하게 두고 배경만 바꾼 3패널 도해로 시각화한다. | 어두운 배경+저채도 주변=떠오름, 중간 회색+유사 채도=존재감 감소, 밝은 노랑+고채도 주변=눌림. 캡션: 같은 파랑도 주변 명도와 채도에 따라 떠오르거나 가라앉는다. | 색의 구조 시각 자료 브리프 § V1. 관계에 따라 달라지는 같은 색 |
| L76 | HSB 값과 지각명도의 차이 | HSB vs perceived lightness (V2) | 밸류 | 같은 Brightness 값이라도 노랑·연두는 뜨고 보라·남색은 가라앉으므로 HSB 숫자는 지각명도와 다르다. | 위 줄=동일 B값 칩, 아래 줄=흑백 변환 대응. 칩: 노랑·연두·빨강·파랑·보라. | 색의 구조 시각 자료 브리프 § V2. HSB 값과 지각명도의 차이 |
| L77 | 색 비율 도해(75/20/5) | Color ratio layout (V3) | 컬러 | 같은 색 조합도 면적 배분이 다르면 질서가 달라지며 색의 질서는 선택보다 배분에서 나온다. | 안정 구성: 주조 75%·보조 20%·강조 5%. 불안정 구성: 강조 비율이 지나치게 커져 시선이 분산. | 색의 구조 시각 자료 브리프 § V3. 주조색, 보조색, 강조색의 비율 |
| L78 | 흑백 전환 검산 도해 | Grayscale check (V4) | 워크플로·검수 | 컬러가 그럴듯해도 흑백에서 무너지면 명도 구조가 먼저 흔들린 것이며 흑백 전환은 명도 구조 검산 도구다. | 좋은 예=흑백에서도 초점과 전경·배경 분리 유지, 나쁜 예=모든 영역이 비슷한 회색으로 뭉개짐. | 색의 구조 시각 자료 브리프 § V4. 흑백 전환으로 보는 명도 구조 |
| L79 | 그라데이션 경로 도해 | Gradient path (V5) | 컬러 | 보색을 직선으로 이으면 중간이 죽은 회색이 되므로 경유색을 설계해야 한다. | 주황→파랑 직선 보간=탁한 회갈색 중간, 노랑 또는 청록 경유=더 선명하고 자연스러움. 색상환 경로선+실제 그라데이션 바를 위아래로 배치. | 색의 구조 시각 자료 브리프 § V5. 죽은 회색을 피하는 그라데이션 경로 |
| L80 | 빛 표현 네 층위 도해 | Light layers (V6) | 빛 | 빛은 발광체 자체보다 주변 반응으로 설득되며 네 단계로 분해한다. | 4패널: emission만 → +glow → +bloom → +scene lighting influence(벽·바닥·주변 물체의 파란 반사광과 림라이트). 공통 소재: 어두운 공간 속 파란 발광체. | 색의 구조 시각 자료 브리프 § V6. 빛 표현의 네 층위 |
| L81 | 시각 자료 제작 가이드 | Visual brief production guide | 기타 | 이론 설명용 도해는 과장된 예시가 더 읽히기 쉽고 라벨은 최소화한다. | 가로형 SVG, 폭 1400–1800px, 배경 투명 또는 옅은 중성 회색. 삽입 위치: 1장 뒤(V1)·2장 뒤(V2)·4장 뒤(V3)·5장 뒤(V4)·8장 뒤(V5)·9장 뒤(V6). | 색의 구조 시각 자료 브리프 § 제작 가이드 (info callout) / 표 |
| L82 | 색은 관계로 세운다 | Color as relationship | 컬러 | 색은 단독으로 존재하지 않으며 주변색과의 관계 속에서 지각되므로 색을 하나씩 고르지 말고 관계를 먼저 설계해야 한다. | 어떤 색이 돋보이게 하려면 그 색보다 주변을 바꾸는 편이 빠를 때가 많다. 놓일 자리의 명도·채도·면적을 먼저 읽는다. | 색이란 이론 칼럼 초안 § 1. 색은 고르는 것이 아니라 관계를 세우는 것이다 |
| L83 | 명도는 지각된 밝기 위계 | Value as perceived hierarchy | 밸류 | 이 칼럼의 명도는 슬라이더 값이 아니라 화면에서 눈이 실제로 느끼는 밝기 위계를 뜻한다. | — | 색이란 이론 칼럼 초안 § 리드 |
| L84 | 명도·채도 이웃 관계 | Value/saturation neighbor effects | 밸류 | 명도가 비슷한 색은 나란히 놓이면 경계가 흐려지고 명도 차이가 크면 서로를 밀어내며, 채도 높은 색은 주변이 조용할 때 빛나고 주변도 높으면 서로 힘을 깎는다. | — | 색이란 이론 칼럼 초안 § 1. 색은 고르는 것이 아니라 관계를 세우는 것이다 |
| L85 | HSB 값 ≠ 지각명도 | Perceived lightness vs HSB | 밸류 | 같은 B값이어도 사람이 느끼는 밝기가 다르며 노랑·연두는 B가 낮아도 밝게, 보라·남색은 B가 높아도 무겁게 느껴진다. | 같은 B값의 노랑과 보라를 나란히 놓으면 노랑은 튀어나오고 보라는 가라앉아 의도하지 않은 깊이감이 생김. | 색이란 이론 칼럼 초안 § 2. HSB의 숫자와 눈이 느끼는 밝기는 다르다 |
| L86 | 지각명도로 화면 무게중심 이동 | Shifting visual weight with perceived lightness | 밸류 | 색상을 바꾸지 않고도 밝게 느껴지는 색상을 시선이 가야 할 곳에, 어둡게 느껴지는 색상을 배경·그림자에 배치하면 초점이 잡힌다. | — | 색이란 이론 칼럼 초안 § 2. HSB의 숫자와 눈이 느끼는 밝기는 다르다 |
| L87 | 숫자를 믿되 눈을 더 믿는다 | Trust eyes over sliders | 워크플로·검수 | HSB 슬라이더 조정 후에는 반드시 흑백으로 전환해 실제 명암 구조를 확인하는 습관이 필요하다. | — | 색이란 이론 칼럼 초안 § 2. HSB의 숫자와 눈이 느끼는 밝기는 다르다 |
| L88 | 색상환은 출발점일 뿐 | Color wheel as starting point | 컬러 | 보색·유사색·삼각·사각 배색 공식은 후보를 좁히는 도구일 뿐이며 얼마나·어디에·어떤 명도·채도로 쓸지는 공식 밖의 판단이다. | 보색(파랑/주황)을 50:50으로 나누면 대비가 아니라 시각적 소란, 유사색 세 개를 균등하게 쓰면 조화가 아니라 밋밋함. 최종 판단은 화면 위 관계에서. | 색이란 이론 칼럼 초안 § 3. 색상환은 출발점일 뿐이다 |
| L89 | 주조·보조·강조색의 역할 | Dominant / secondary / accent | 컬러 | 주조색은 가장 넓은 면적으로 분위기를 정하고 보조색은 주조를 받치며 변화를 만들고 강조색은 가장 적은 면적으로 시선을 모은다. | 비율 수치 없이 서술(강조색은 한 자릿수 비율, 경우에 따라 그보다 적게). 같은 칼럼의 V3 도해는 75/20/5. | 색이란 이론 칼럼 초안 § 4. 주조색, 보조색, 강조색: 비율이 색의 질서를 만든다 |
| L90 | 강조색은 희소해야 한다 | Accent scarcity | 컬러 | 강조색이 힘을 가지려면 희소해야 하며 면적이 커지면 또 하나의 주조색이 되어 초점을 흩뜨린다. | 대개 화면 전체의 한 자릿수 비율. | 색이란 이론 칼럼 초안 § 4. 주조색, 보조색, 강조색: 비율이 색의 질서를 만든다 |
| L91 | 색의 배분이 선택보다 먼저 | Allocation before selection | 컬러 | 지배 톤과 시선이 가야 할 곳을 먼저 정하면 어떤 색을 어디에 얼마나 쓸지가 자연스럽게 따라오며 색의 선택보다 배분이 완성도를 좌우한다. | — | 색이란 이론 칼럼 초안 § 4. 주조색, 보조색, 강조색: 비율이 색의 질서를 만든다 |
| L92 | 흑백 전환은 색 디버깅 도구 | Grayscale as debugging | 워크플로·검수 | 명암 구조가 무너지면 어떤 색을 올려도 해결되지 않으므로 흑백으로 초점·전경/배경 분리·시선 흐름을 확인한다. | 모든 영역이 비슷한 회색으로 뭉개지면 색이 아니라 명도 설계 문제. 색을 올리기 전과 후에 한 번씩 확인. | 색이란 이론 칼럼 초안 § 5. 흑백으로 보면 색의 실패가 보인다 |
| L93 | 흑백 확인이 특히 필요한 장면 | When grayscale matters most | 워크플로·검수 | 이펙트가 겹치는 화면·여러 광원이 교차하는 장면·캐릭터와 배경 색조가 비슷한 장면에서는 색상 차이만으로는 분리가 어렵고 명도 위계가 정리해야 한다. | — | 색이란 이론 칼럼 초안 § 5. 흑백으로 보면 색의 실패가 보인다 |
| L94 | 채도 대비의 설계 | Saturation contrast design | 컬러 | "채도를 낮추면 고급스럽다"는 반만 맞고, 채도 대비가 설계되어 있을 때 화면이 정돈된다. | 대부분이 저채도로 가라앉은 가운데 한 점의 순색이 화면 전체의 무게를 끌어당김. 비슷한 채도 색이 가득하면 서로 상쇄. | 색이란 이론 칼럼 초안 § 6. 채도와 회색: 탁함은 어디서 오는가 |
| L95 | 탁함은 대비 부재에서 온다 | Muddiness = lack of contrast | 컬러 | 탁한 화면은 채도가 낮아서가 아니라 모든 영역의 채도·명도가 비슷한 범위에 몰려 색에 방향이 없기 때문이며 원인은 회색의 양이 아니라 대비의 부재다. | — | 색이란 이론 칼럼 초안 § 6. 채도와 회색: 탁함은 어디서 오는가 |
| L96 | 기운 회색 | Tinted grays | 컬러 | 회색과 저채도는 순색을 빛나게 하는 바탕이며, 완전 무채색보다 약간 따뜻하거나 차가운 쪽으로 기운 회색이 깊이를 만든다. | 그 바탕 안에서도 미세한 색상 방향·명도 변화 유지. | 색이란 이론 칼럼 초안 § 6. 채도와 회색: 탁함은 어디서 오는가 |
| L97 | 숨은색 | Hidden color | 컬러 | 한 영역 안에 미세하게 다른 색상을 섞어(그림자의 보라, 하이라이트 가장자리의 노랑, 중간톤의 초록기) 풍부하지만 튀지 않게 만드는 기술이다. | — | 색이란 이론 칼럼 초안 § 7. 숨은색: 풍부하지만 튀지 않는 색의 기술 |
| L98 | 숨은색의 조건: 흑백 구조 유지 | Hidden color constraint | 워크플로·검수 | 흑백 전환 시 명암 질서가 그대로 유지되고 색상만 달라져야 하며 명도까지 흔들리면 노이즈다. | 변주 폭이 넓을수록 명도 질서가 흔들릴 위험이 커지므로 항상 흑백 전환으로 검산. | 색이란 이론 칼럼 초안 § 7. 숨은색: 풍부하지만 튀지 않는 색의 기술 |
| L99 | 숨은색 활용 장면 | Hidden color use cases | 컬러 | 넓은 단색 영역이 밋밋할 때 같은 명도 안에서 색상을 미세하게 흔들고, 그림자가 죽어 보일 때 어둠 속에 차가운 보라·깊은 남색을 숨겨 공기감을 준다. | — | 색이란 이론 칼럼 초안 § 7. 숨은색: 풍부하지만 튀지 않는 색의 기술 |
| L100 | 죽은 회색과 그라데이션 경로 | Dead gray / gradient path | 컬러 | 색상환 반대편 색을 직선 보간하면 중간에서 채도가 급락해 탁하고 방향 없는 죽은 회색이 생기므로 경로를 설계해야 한다. | 주황→파랑 직선은 탁한 회갈색, 노랑·초록 쪽 경유 시 채도 유지. | 색이란 이론 칼럼 초안 § 8. 그라데이션: 죽은 회색을 피하는 색의 경로 |
| L101 | 시간에 따른 색 경로 | Color path over time | 타이밍 | 이펙트의 시간별 색 변화도 공간 그라데이션과 같은 원리로 중간 경로를 의식적으로 설계해야 하며 중간이 탁해지면 설득력이 떨어진다. | 불꽃: 중심의 밝은 노랑 → 가장자리의 어두운 빨강 → 연기의 검은 회색. | 색이란 이론 칼럼 초안 § 8. 그라데이션: 죽은 회색을 피하는 색의 경로 |
| L102 | 빛은 주변을 바꾸는 것 | Light changes surroundings | 빛 | 밝은 색을 칠한다고 빛나 보이지 않으며 물체만 밝아서는 안 되고 주변이 함께 반응해야 한다. | 4층위: 발광·글로우·블룸·장면에 남는 빛. | 색이란 이론 칼럼 초안 § 9. 빛나는 색: 발광, 글로우, 블룸, 그리고 장면에 남는 빛 |
| L103 | 발광(Emission) | Emission | 빛 | 광원 자체의 색과 밝기이며 광량이 충분히 높으면 색온도와 무관하게 중심부가 희게 지각되고 고유 색은 중심 바깥에서 더 잘 읽힌다. | 중심에서 멀어질수록 색상이 드러나고 채도 상승·밝기 하락. 불꽃 중심부가 희게 읽히는 경우와 유사. | 색이란 이론 칼럼 초안 § 9. 빛나는 색 |
| L104 | 글로우(Glow) | Glow | 빛 | 발광 가장자리가 공기 중으로 퍼지는 영역이며 크기와 감쇄 곡선이 빛의 성격을 정한다. | 날카로운 빛=글로우 좁음, 부드러운 빛=글로우 넓음. 글로우 색은 발광 가장자리 색을 따르되 약간 채도가 떨어지는 것이 자연스러움. | 색이란 이론 칼럼 초안 § 9. 빛나는 색 |
| L105 | 블룸의 역할 한계 | Bloom as camera simulation | 빛 | 블룸은 렌즈 번짐을 흉내 낸 카메라 시뮬레이션이라 장면 분위기는 좌우하지만 빛 자체의 설득력은 만들지 못하며 글로우·블룸만으로는 뿌옇게 번질 뿐이다. | — | 색이란 이론 칼럼 초안 § 9. 빛나는 색 |
| L106 | 장면에 남는 빛 | Scene lighting influence | 빛 | 빛나는 물체가 주변 바닥·벽·인물 피부·공기 중 먼지에 색을 남겨야 관객이 빛으로 받아들이며 이 층위가 빠지면 발광체는 화면 위의 스티커처럼 보인다. | 파란 발광체 → 벽의 파란 반사광, 바닥의 파란 빛, 인물 윤곽의 파란 림라이트. 빛 표현의 마지막이자 가장 결정적인 단계. | 색이란 이론 칼럼 초안 § 9. 빛나는 색 |
| L107 | 색을 점검하는 네 가지 질문 | Four diagnostic questions | 워크플로·검수 | 흑백에서 초점·깊이가 읽히는가 → 각 색의 방향(따뜻/차가움·밝음/어두움) → 가장 선명한 색이 가장 중요한 곳에 있는가 → 빛이 주변에 영향을 주는가 순서로 점검한다. | 순서가 중요: 명도 구조가 무너진 채 채도나 광원을 조정해도 해결되지 않음. | 색이란 이론 칼럼 초안 § 10. 색을 점검하는 네 가지 질문 |
| L108 | 색 실무 체크리스트 5항목 | Color checklist | 워크플로·검수 | 흑백 전환·색상 방향 확인·채도 분리·광원 영향 검산·시간 변화 경로 점검의 다섯 항목을 체크한다. | 시간 변화 경로 항목: 이펙트 색이 시간에 따라 변할 때 중간 구간에 죽은 회색이 없는지. 채도 분리: 가장 선명한 색이 시선이 가야 할 곳에 집중. | 색이란 이론 칼럼 초안 § 실무 체크리스트 |
| L109 | 좋은 색은 취향보다 구조 | Color as structure | 기타 | 색이 작동하는가는 취향이 아니라 명도 위계·채도 대비·색 비율·빛 영향이 맞물린 구조의 문제다. | — | 색이란 이론 칼럼 초안 § 결론: 좋은 색은 취향보다 구조에 가깝다 |
| L110 | 실루엣 | Silhouette | 형태 | 색·텍스처·조명이 모두 사라졌을 때 이펙트가 남기는 순수한 형태이며 플레이어의 첫 번째 언어다. | — | LIT — Silhouette & Readability in VFX § 핵심 정의 |
| L111 | 가독성 | Readability | 형태 | 플레이어가 게임 거리·움직임·혼란한 화면 속에서도 1초 이내에 무슨 일이 일어나는지 알아볼 수 있는가이다. | 1초 미만. | LIT — Silhouette & Readability in VFX § 핵심 정의 |
| L112 | 가독성은 기능 요구사항 | Readability as functional requirement | 형태 | 게임 VFX에서 가독성은 미적 취향이 아니며 실루엣으로 읽히지 않으면 게임 상태 전달이라는 핵심 임무를 실패한 것이다. | — | LIT — Silhouette & Readability in VFX § 핵심 정의 |
| L113 | 게임 조건이 가독성을 무너뜨린다 | Gameplay conditions vs studio viewport | 형태 | 에디터에서 선명한 VFX도 거리·모든 각도·움직임·경쟁 요소·속도라는 실제 조건을 견뎌야 하며 실루엣이 이 조건을 통과할 가능성이 가장 높은 레이어다. | 거리: 카메라에서 10m 이상. 카메라는 플레이어가 조작. 실루엣은 매 프레임 바뀜. 적 이펙트·HUD·피격 반응·환경 FX 아래에 묻힘. | LIT — Silhouette & Readability in VFX § 왜 게임 상황은 스튜디오에서의 가독성을 무너뜨리는가 |
| L114 | 실루엣 테스트 | Silhouette test | 워크플로·검수 | 모든 조명을 끄고 단색 검정 머티리얼로 내부 선·그라디언트·텍스처·색을 모두 제거한 뒤 검은 형태만 보고 무엇이며 무엇을 의미하는지 알 수 있는지 묻는다. | — | LIT — Silhouette & Readability in VFX § 실루엣 테스트 |
| L115 | 실루엣 테스트 소프트웨어별 구현 | Silhouette test tooling | 워크플로·검수 | 툴별로 라이팅을 끄고 검정으로 오버라이드해 실루엣 뷰를 만든다. | Maya=Lighting OFF+Black Material Override. Blender=Solid mode+Flat shading+Black matcap. MotionBuilder=Lights off+Black shader. Photoshop/Concept=단색 검정으로 채워 그레이스케일에서 확인. | LIT — Silhouette & Readability in VFX § 실루엣 테스트 |
| L116 | 분할 뷰포트 작업 | Split viewport | 워크플로·검수 | 왼쪽은 일반 뷰, 오른쪽은 순수 검정 실루엣 뷰로 두고 제작 중 계속 오가며 10m 밖에서 살아남지 못할 디테일에 정을 주지 않는다. | — | LIT — Silhouette & Readability in VFX § 실루엣 테스트(프로덕션 팁) |
| L117 | 무맥락 제3자 검증 | Blind read test | 워크플로·검수 | 검은 실루엣 스크린샷을 맥락 없는 사람에게 보내 "무슨 일이 일어나고 있나요?"만 묻고 즉시 답이 나오면 통과, 망설이면 더 다듬는다. | — | LIT — Silhouette & Readability in VFX § 실루엣 테스트(검증 테스트) |
| L118 | 맥락별 가독성 요구 수준 | Readability tiers by context | 형태 | 행동의 게임플레이 중요도가 실루엣이 얼마나 강하게 작동해야 하는지를 정한다. | 공격/피해 VFX=즉시·타협 불가, 움직임 속 15m에서도 전달. 피격 반응=절대적 명확성, 몇 프레임 안에 방향 판독. 범위 이펙트 표시=명확·모호하지 않음. 앰비언트 루프=미묘해도 됨. 분위기/환경 효과=부드러워도 됨. | LIT — Silhouette & Readability in VFX § 가독성은 맥락에 따라 달라진다 |
| L119 | VFX의 네 가지 목표(Riot) | League of Legends VFX goals | 기타 | 모든 이펙트는 게임플레이를 위한 시각적 명확성·시각적 혼잡 최소화·챔피언 테마 강화·놀라움과 즐거움을 만족해야 하며 1번 명확성이 항상 우선이다. | 4목표는 동등하지 않음. 즐겁지만 헷갈리는 이펙트는 실패. 시각적 임팩트는 게임플레이 임팩트를 반영해야 함. | LIT — Silhouette & Readability in VFX § VFX의 네 가지 목표: League of Legends 프레임워크 |
| L120 | Gameplay-Value-Color-Shape-Timing 프레임워크 | GVCST framework | 기타 | 목표 달성 프레임워크는 Gameplay → Value → Color → Shape → Timing이며 형태(특히 실루엣)가 그 위에 모든 것이 쌓이는 기반이다. | — | LIT — Silhouette & Readability in VFX § VFX의 네 가지 목표 |
| L121 | 단순함이 복잡함을 이긴다 | Simplicity wins | 형태 | 단순한 형태는 즉시 인식되고 복잡한 형태는 해석이 필요하므로 복잡성은 2·3차 레이어에 두고 1차 실루엣 경계에는 두지 않는다. | — | LIT — Silhouette & Readability in VFX § 핵심 실루엣 원칙: 1 |
| L122 | 디테일은 필요한 곳에 | Detail where it matters | 구성 | 모든 곳의 디테일은 디테일 없음과 같으며 눈은 위계를 위해 고밀도 영역과 저밀도 휴식 영역을 모두 필요로 한다. | 고밀도=충돌 지점·초점 중심, 저밀도=초점을 감싸는 휴식 지점. 작은 디테일은 큰 실루엣 읽기를 왜곡하지 않고 흥미를 더해야 함(Riot Teguh, 80.lv). | LIT — Silhouette & Readability in VFX § 핵심 실루엣 원칙: 2 |
| L123 | 네거티브 스페이스 | Negative space | 형태 | 파티클 덩어리·코어와 오라·이펙트와 배경 사이의 빈 공간이 읽히는 형태의 경계를 정의하며 이것이 없으면 이펙트가 읽히지 않는 덩어리로 무너진다. | 검은 실루엣의 빈틈을 세어 본다. 틈이 없으면 너무 조밀함. 팔다리·레이어가 붙어 한 덩어리가 되는 것이 흔한 함정. | LIT — Silhouette & Readability in VFX § 핵심 실루엣 원칙: 3 |
| L124 | 액션 라인 | Line of action | 형태 | 읽히는 모든 이펙트에는 에너지 흐름과 의도를 요약하는 하나의 지배적 곡선·방향이 있다. | 빠른 테스트: 본질을 단 하나의 선으로 그린다면? 세 개의 선이 필요하면 디자인이 혼란. | LIT — Silhouette & Readability in VFX § 핵심 실루엣 원칙: 4 |
| L125 | 선 방향의 감정 | Line direction and emotion | 형태 | 액션 라인 방향이 감정 읽기를 정한다. | 강한 대각선=움직임·공격성·액션, 깨끗한 수평선=안정·고요·확산, 수직 상승=높이·힘·상승, 부서진/파편화된 선=혼돈·피해·불안정. | LIT — Silhouette & Readability in VFX § 핵심 실루엣 원칙: 4 |
| L126 | 리딩 요소의 실루엣 우선권 | Leading element priority | 구성 | 투사체 끝·충돌 폭발 코어·공격 방향 표시자처럼 기본 행동을 전달하는 요소는 다른 요소를 희생해서라도 실루엣으로 선명해야 하며 보조 요소는 그 주변에 배치한다. | 애니메이션에서는 무기가 액션 라인을 이끈다: 무기 포즈 먼저, 몸은 그 주변. | LIT — Silhouette & Readability in VFX § 핵심 실루엣 원칙: 5 |
| L127 | 검증할 키 포즈 4개 | Gameplay key poses | 타이밍 | 모든 프레임이 아니라 행동 가독성을 담당하는 키 포즈만 실루엣 테스트를 통과하면 되고 그 사이 전환은 부드러워도 된다. | 4개: 최대 예비 동작(압축·와인드업), 돌이킬 수 없는 지점(릴리즈 직전), 임팩트/클라이맥스(완전 확장·최대 대비), 팔로스루. | LIT — Silhouette & Readability in VFX § 게임플레이 실루엣: 중요한 순간 |
| L128 | 키 포즈는 홀드하고 전환은 빠르게 | Hold keys, fast transitions | 타이밍 | 키 포즈는 읽힐 만큼 홀드하고 전환은 빠르게 처리해 어정쩡한 인비트윈 형태가 쌓이지 않게 한다. | 사례: God of War의 공격 리듬 변화. | LIT — Silhouette & Readability in VFX § 게임플레이 실루엣: 리듬 |
| L129 | 360도 문제와 핵심 카메라 각도 | 360° problem | 형태 | 이펙트는 어떤 각도에서도 읽혀야 하므로 게임 유형별 핵심 카메라 각도 2–3개에서 반드시 빛나게 하고 나머지 각도에서는 완벽하지 않아도 작동하게 한다. | 예: TPS 후방 시점·사이드 스크롤 프로필·탑다운. | LIT — Silhouette & Readability in VFX § 실루엣과 360도 문제 |
| L130 | 대각선 질량 분리 | Diagonal mass separation | 형태 | 팔다리나 이펙트 레이어를 완전히 수직/수평으로 정렬하지 않고 대각선으로 분리해 실루엣에서 합쳐지는 것을 막는다. | 깊이를 다루지 않으면 포즈가 무너짐(Animotionx). | LIT — Silhouette & Readability in VFX § 실루엣과 360도 문제 |
| L131 | 실루엣 실패 유형과 수정 | Silhouette failure modes | 워크플로·검수 | 흔한 6가지 실패와 원인·수정이 정리되어 있다. | 형태 없는 덩어리=모두 같은 명도 → 코어/중간/외곽 명도 범위 분리. 지저분한 경계=경계 파티클 과다 → 줄이고 리딩 엣지 선명. 배경에서 안 보임=환경 명도 대비 부족 → 코어 밝기↑·림/외곽선 레이어. 유형 구분 불가=일반적 형태 → 유형별 특징 형태 과장. 거리에서 읽히나 움직임에서 안 읽힘=내부 텍스처 의존 → 실루엣 먼저·텍스처는 보너스. 두 요소 합쳐짐 → 네거티브 스페이스·대각선·명도 대비. | LIT — Silhouette & Readability in VFX § VFX에서 흔한 실루엣 실패 |
| L132 | 사실성보다 가독성 | Readability over realism | 형태 | 사실적 스타일 게임도 카메라 거리와 액션 속도 때문에 과장이 필요하며 해부학·사실성과 가독성이 충돌하면 항상 가독성을 택한다. | 사례: The Last of Us·Ghost of Tsushima·God of War의 과장된 포즈. 클로즈업에서 사실적인 것은 10m 밖에서 안 보임. | LIT — Silhouette & Readability in VFX § 사실성 vs. 가독성 |
| L133 | 형태 언어 | Shape language | 형태 | 색·디테일·애니메이션이 처리되기 전에 기하·유기 형태로 감정·의도·게임플레이 의미를 전달하는 방식이며 뇌는 텍스처보다 먼저, 때로는 애니메이션보다 먼저 형태를 읽는다. | 모든 파티클 경계·폭발 윤곽·트레일 호가 신호. 이펙트 제작은 사용할 기본 형태를 정의하는 것에서 시작. 감정 매핑 출처: Molly Bang, Andrew Loomis(Game Developer 종합). | LIT — Shape Language in VFX § 형태 언어란 무엇인가? / 형태의 심리학 |
| L134 | 수평·평평한 형태 | Horizontal shapes | 형태 | 수평 형태는 쓰러질 일이 없어 안정·휴식·고요·평화·안전으로 읽힌다. | 넓게 수평으로 퍼지는 지면 강타·충격파는 강력하지만 덜 위협적. 수평으로 확장되는 치유 오라는 안정·안전. | LIT — Shape Language in VFX § 형태의 심리학: 수평 / 평평한 형태 |
| L135 | 수직 형태 | Vertical shapes | 형태 | 수직 형태는 위엄·힘·영속성·경외·상승 지향으로 읽히며 세우는 데 에너지가 필요해 긴장을 암시한다. | 부활·성장·상승 빔·수직 임팩트 기둥은 강력하고 고양되며 결단력 있게 읽힘. | LIT — Shape Language in VFX § 형태의 심리학: 수직 형태 |
| L136 | 대각선은 움직임의 형태 | Diagonal shapes | 형태 | 대각선·각도는 동요·행동·충돌·불안정·긴장으로 읽히며 움직임을 전달한다. | 투사체 트레일·방향성 폭발·차지 표시는 대각선. 완전히 수직/수평인 트레일은 정적으로 읽히고 대각선으로 기울이면 움직임으로 읽힘. 주인공 쪽으로 기울면 전진 방해, 멀어지는 쪽이면 공간을 열고 이끎. | LIT — Shape Language in VFX § 형태의 심리학: 대각선 / 각도 |
| L137 | 원·곡선 | Circle / curve | 형태 | 원과 곡선은 날카로운 모서리·방향성 위협이 없어 뇌가 의식적 분석 전에 안전한 것으로 읽고 감싸고 보호하는 느낌을 준다. | 원=광대함·영원성·움직임·평등·해방, 곡선=우아함·매력·부드러움·편안함·안전. 치유/지원 오라·실드/배리어(공간을 감쌈)·버프(부드러운 타원·완만히 상승하는 원)·안전 구역 표시(안쪽은 안전). 사례: Overwatch Mercy의 원형 형태 언어. | LIT — Shape Language in VFX § 형태의 심리학: 원 / 곡선 |
| L138 | 역할별 기본 형태(힐러·탱커·딜러) | Role-based shape coding | 형태 | Blizzard 디자인 시스템은 역할을 형태로 구분한다. | 힐러=원, 탱커=사각형, 딜러=삼각형. | LIT — Shape Language in VFX § 형태의 심리학: 원 / 곡선(게임 예시) |
| L139 | 사각형·직사각형 | Square / rectangle | 형태 | 직사각형은 설계되고 의도적이며 믿을 수 있어 안정·힘·통합·접지감·움직이지 않음으로 읽힌다. | 탱커 능력·중갑 활성화=무게·영속, 요새화/방어 배리어(상자형)=구조·의도적 방어, 지면 기반 플랫폼=넓고 낮은 직사각형=접지감·힘. | LIT — Shape Language in VFX § 형태의 심리학: 사각형 / 직사각형 |
| L140 | 삼각형·각진·날카로운 형태 | Triangle / sharp shapes | 형태 | 날카로운 끝은 자연에서 위협의 시각적 서명(발톱·송곳니·가시·칼날)이므로 위험·공격성·에너지·속도·악의로 읽히며 더 날카로울수록 더 험악하다. | 뒤집힌 삼각형은 특히 불안정. 피해 주문·공격 능력=바깥으로 뻗는 뾰족한 폭발, 빌런/어두운 능력=삼각 실루엣, 투사체 방향=각진 스파크 트레일, 임팩트 경계=날카롭고 들쭉날쭉한 림. | LIT — Shape Language in VFX § 형태의 심리학: 삼각형 / 각진 형태 / 날카로운 형태 |
| L141 | 각짐의 정도 조절 | Degrees of angularity | 형태 | 각짐의 강도에 따라 읽히는 의미가 달라진다. | 약간 각짐(길게 늘어난 형태)=속도·방향, 강하게 각짐(여러 가시)=공격성·위협, 극도로 불규칙한 가시=타락·어둠의 마법·혼돈. | LIT — Shape Language in VFX § 형태의 심리학: 삼각형 / 각진 형태 / 날카로운 형태 |
| L142 | 선 | Line | 형태 | 선은 면적 없이 방향만 가진 순수한 궤적이며 VFX에서 어떤 형태보다 효율적으로 움직임을 표현한다. | 읽기: 속도·방향성·정밀함·집중·취약함·움직임. 투사체 트레일/레이저/화살=방향, 차지업 수렴선=에너지 집중, 속도 효과·모션 블러=이동 축과 평행, 테더=관계·연결. | LIT — Shape Language in VFX § 형태의 심리학: 선 |
| L143 | 선 굵기 조절 | Line weight | 형태 | 선의 굵기로 감정과 리듬을 조절한다. | 얇음=속도·정밀·취약·빠름, 두꺼움=힘·물리력·무게·느리지만 강함, 굵음→가늠(테이퍼)=가속·유기적 움직임·살아 있는 리듬, 한 이펙트 안의 굵기 변화=시각적 리듬·생동·호흡. 두꺼운 선과 얇은 선을 함께 써라(VFX Staples). | LIT — Shape Language in VFX § 형태의 심리학: 선 / 적용 워크플로 6단계 |
| L144 | 불규칙·유기적 형태 | Irregular / organic shapes | 형태 | 유기적 형태는 비기하·자유로운 흐름·비대칭으로 자라난 듯 보이며 혼돈·무질서·예측 불가·어둠의 마법·타락·자연·미지로 읽힌다. | 무질서는 마음에 부담을 주어 감정을 불편·불안·두려움 쪽으로 기울임(Game Developer). 어둠/공허/타락=불규칙(반자연), 독·부패·강령술=유기적 방울·촉수·비대칭, 불·연기·물=자연적 유기성, 환경 앰비언트=낮은 혼돈도. | LIT — Shape Language in VFX § 형태의 심리학: 불규칙 / 유기적 형태 |
| L145 | 유기성 vs 노이즈 | Organic vs noise | 형태 | 유기성은 목적 있는 의도된 불규칙성으로 매크로 실루엣이 읽히고, 노이즈는 읽히는 큰 형태 없이 무작위라 아무것도 전달하지 않는다. | 유기적 이펙트도 실루엣 테스트를 통과해야 함. 내부 디테일이 복잡해도 전체 윤곽은 분명해야 함. | LIT — Shape Language in VFX § 중요한 구분: 유기성 vs. 노이즈 |
| L146 | 질서 vs 혼돈 축 | Order vs chaos axis | 형태 | 이펙트 전체 구성의 질서·혼돈 정도 자체가 신호다. | 질서=이해·기억·매핑이 쉽고 통제·안정·의도 전달(구조화된 능력·UI 효과·스킬샷에 적합). 혼돈=에너지를 요구하고 불안 생성, 무질서·타락·엔트로피 전달(어둠의 마법·광역 타락 구역·환경 위험에 적합). | LIT — Shape Language in VFX § 질서 vs. 혼돈: VFX 디자인 축 |
| L147 | 질서 코어+혼돈 외곽 | Ordered core, chaotic boundary | 형태 | 혼돈이 너무 많으면 정적으로 보이고 100% 불규칙은 위협이 아니라 노이즈로 읽히므로 가장 임팩트 있는 어둠/타락 이펙트는 질서 있는 내부 코어와 혼돈스러운 외곽 경계를 대비시킨다. | 질서가 있어야 혼돈이 비교로 읽힌다. | LIT — Shape Language in VFX § 질서 vs. 혼돈: VFX 디자인 축 |
| L148 | 하드 엣지 vs 소프트 엣지 | Hard vs soft edge | 형태 | 엣지 축은 모든 형태 범주를 가로지르며 스타일화 VFX의 가장 직접적인 제어 수단이다. | 하드(선명)=스타일화·통제·공격성(피해·공격 능력·셀 셰이딩). 소프트(깃털처럼 번짐)=온기·자연스러움·앰비언트(치유·연기·분위기·환경). | LIT — Shape Language in VFX § 하드 엣지 vs. 소프트 엣지 |
| L149 | 하드·소프트 전략적 혼용 | Mixing edge types | 형태 | 한 이펙트 안에서 리딩·활성 경계는 하드 엣지, 대기감·소멸 레이어(페이드·트레일·연기)는 소프트 엣지로 섞는다. | VFX 텍스처는 부드러운 형태와 단단한 형태의 혼합이 필요(Jevremovic, 80.lv). 형태는 대담하고 엣지는 선명하게 유지하되 이펙트가 부드럽게 지나가게 할 순간에는 부드럽게. | LIT — Shape Language in VFX § 하드 엣지 vs. 소프트 엣지 |
| L150 | 형태 언어는 기능적 게임 메커닉 | Shape language as gameplay mechanic | 형태 | 경쟁·액션 게임에서 플레이어는 형태로 주문 유형을 먼저 식별하며 형태는 클래스 정체성을 인코딩하고 일관된 형태 문법이 신뢰를 만든다. | 일관성 없는 이펙트 하나가 시스템 전체를 흔든다. 서포트 챔피언과 캐리의 능력은 형태-실루엣 수준에서 달라 보여야 함. LoL에서는 형태·색·크기·속도로 받을 투사체/피해 유형을 즉시 이해. | LIT — Shape Language in VFX § 게임플레이 커뮤니케이션으로서의 형태 언어 |
| L151 | 정착된 VFX 형태 관습 | Established shape conventions | 소재별 | 이펙트 유형마다 굳어진 형태 관습이 있다. | 치유=원·플러스 기호·위로 올라가는 곡선, 피해/공격=가시·날카로운 폭발·각진 방향 표시, 구역 차단=날카로운 경계 엣지·붉은색/경고 기하, 실드/배리어=반구·돔·닫힌 원, 투사체 방향=동심으로 수렴하는 선·진행 방향에 수직인 각진 스파크. | LIT — Shape Language in VFX § 정착된 VFX 형태 관습 |
| L152 | 형태 언어 적용 워크플로 6단계 | Shape language workflow | 워크플로·검수 | 게임플레이 역할 정의 → 1차 형태 범주 선택 → 엣지 유형 → 매크로 형태 먼저(큰 붓질) → 색·사운드 없이 형태-의미 계약 검증 → 선 굵기 변화 적용 순서로 진행한다. | 이후 추가되는 모든 레이어는 1차 형태를 섬겨야 함. | LIT — Shape Language in VFX § 형태 언어 적용 워크플로 |
| L153 | 이펙트 유형별 형태 언어 표 | Shape language by effect type | 소재별 | 이펙트 유형별 지배 형태·엣지 유형이 정리되어 있다. | 치유/버프=원·부드러운 타원·소프트. 직접 피해=각진·뾰족 폭발·하드(바깥으로 터짐, 안쪽 압축). 투사체=선·길게 늘어난 삼각형·하드 리딩/소프트 트레일. 폭발=방사형 원+들쭉날쭉한 림·하드 코어/소프트 연기(충격파=질서, 연기=혼돈). 독/저주=유기적 방울·비대칭·소프트(아래로 흐름). 실드=원/반구·하드 림+소프트 내부 광. 어둠/공허=불규칙 각진+유기 혼합·하드 균열/소프트 공허. 불=유기적 혀 모양+위쪽 테이퍼·하드 끝/소프트 연기. 얼음=각진 결정·하드·기하(구조·차가운 정밀). 번개=들쭉날쭉한 불규칙 선·하드·즉각적(직선 아님). 성스러움=원+수직 기둥·하드 림/소프트 내부. | LIT — Shape Language in VFX § 이펙트 유형별 형태 언어 |
| L154 | 형태 위계 | Form hierarchy | 구성 | 형태 위계는 서로 다른 스케일의 형태들을 시각적 중요도 단계로 의도적으로 조직해 눈이 노력 없이 올바른 순서로 읽게 하는 커뮤니케이션 구조이며 플레이어는 1차 형태를 먼저 읽어야 한다. | 큰(1차)·중간(2차)·작은(3차) 형태가 잘 분포하면 눈이 즐겁다(Neil Blevins). 정의: 모든 시각 효과는 서로 다른 스케일의 여러 형태로 구성. | LIT — Leading Shape & Form Hierarchy in VFX § 핵심 원칙 / 세 단계 모델 |
| L155 | 1차 형태(리딩 셰이프) | Primary / leading shape | 구성 | 이펙트에서 가장 크고 지배적인 형태로 실눈을 뜨고 봤을 때 끝까지 남으며 핵심 게임플레이 메시지(공격·방어·상태·범위)를 2차의 도움 없이 전달한다. | 가장 큰 매크로 실루엣이자 눈의 진입점. | LIT — Leading Shape & Form Hierarchy in VFX § 세 단계 모델: 1차 형태 |
| L156 | 2차 형태 | Secondary shape | 구성 | 1차 위에 놓이거나 그 안에 있는 중간 스케일 형태로 디테일과 맥락을 더하되 1차 읽기를 강화할 뿐 모순시키지 않는다. | 눈이 1차에 자리 잡은 이후 읽힘. VFX 타이밍에서 1차보다 약간 늦게 나타나거나 피크. 색·채도는 1차보다 절제. | LIT — Leading Shape & Form Hierarchy in VFX § 세 단계 모델: 2차 형태 |
| L157 | 3차 형태 | Tertiary shape | 구성 | 스파크·경계 노이즈·마이크로 파티클·텍스처 디테일 같은 미세 스케일로 1·2차와 경쟁하지 않으면서 풍부함과 살아 있음을 더하고 이펙트가 납작하거나 지나치게 기하학적으로 느껴지지 않게 한다. | 게임플레이 거리에서는 개별 판독이 어렵고 텍스처처럼 읽힘. 다른 두 단계보다 훨씬 적은 시각적 면적. | LIT — Leading Shape & Form Hierarchy in VFX § 세 단계 모델: 3차 형태 |
| L158 | 파이어볼 위계 예시 | Fireball hierarchy example | 소재별 | 파이어볼은 헤드(1차)·꼬리/리본(2차)·터지는 스파크(3차)로 나뉘며 눈은 순서대로 따라가므로 최상위 1차를 시각적으로 매력 있게 만든다. | 1차=빛나는 코어 카드(방향·스케일·의도), 2차=불꽃 꼬리/리본(방향 확인·궤적), 3차=스파크(에너지·생동·열감). | LIT — Leading Shape & Form Hierarchy in VFX § 실전 예시: 파이어볼 |
| L159 | 시각적 무게와 지배성 | Dominance / visual weight | 구성 | 리딩 셰이프는 크기만이 아니라 여러 특성의 차이가 결합된 시각적 무게로 주의를 이긴다. | 지배성 요인: 크기·형태·색·명도·깊이·텍스처·밀도·채도·방향·주변의 빈 공간·본질적 흥미·지각된 물리적 무게(Smashing Magazine). VFX 핵심 레버: 크기·명도 대비·채도·위치/고립. | LIT — Leading Shape & Form Hierarchy in VFX § 지배성: 리딩 셰이프는 어떻게 주의를 이기는가 |
| L160 | 명도 대비 지배 | Value-contrast dominance | 밸류 | 어두운 배경 위의 밝은 형태(또는 밝은 영역 위의 어두운 형태)는 같은 명도의 큰 형태보다 먼저 눈을 이긴다. | 대비와 빛을 더하면 높은 명도 계열 효과가 초점에 주의를 끌어들임(LoL VFX Style Guide via VFX Apprentice). | LIT — Leading Shape & Form Hierarchy in VFX § 지배성(명도 대비) |
| L161 | 채도로 중요도 표시 | Saturation as importance | 컬러 | 높은 채도는 중요도를 알리고 낮은 채도는 차분하고 긴급하지 않음을 뜻하므로 리딩 셰이프가 이펙트에서 가장 채도 높은 요소여야 한다. | Stepico 인용. | LIT — Leading Shape & Form Hierarchy in VFX § 지배성(채도) |
| L162 | 위치와 고립 | Isolation | 구성 | 빈 공간으로 둘러싸인 형태는 경쟁 형태에 둘러싸인 같은 형태보다 훨씬 강하게 읽힌다. | — | LIT — Leading Shape & Form Hierarchy in VFX § 지배성(위치와 고립) |
| L163 | 3단계 위계의 색·타이밍 매핑 | Hierarchy domain mapping | 구성 | 1차·2차·3차는 시각 특징·색/명도·타이밍 역할이 각기 대응된다. | 1차=가장 크고 대비 최고·가장 밝고 채도 높음·먼저 나타나 임팩트에서 피크. 2차=중간 스케일·절제된 보조색·1차 이후 나타나 지속. 3차=미세 디테일·낮은 채도·빈틈을 채우고 가장 늦게 소멸. | LIT — Leading Shape & Form Hierarchy in VFX § VFX 안의 세 단계 위계: 도메인 매핑 |
| L164 | 2차 분배의 70/30 규칙 | 70/30 rule | 구성 | 1차 형태를 2차로 나눌 때 50/50보다 70%·30% 불균등 분할이 눈에 더 즐겁고 리듬을 만든다. | 같은 크기의 불꽃 혀 두 개보다 서로 다른 크기가 낫고, 같은 크기의 연기 덩어리 둘보다 큰 덩어리+작은 잔류 연기가 나음. 균등 클러스터는 정적 대칭. Neil Blevins. | LIT — Leading Shape & Form Hierarchy in VFX § 2차 형태 분배의 70/30 규칙 |
| L165 | 2차 형태 밀도 변화 | Density variation | 구성 | 1차 안에서 2차 형태의 밀도를 변화시켜 디테일이 많은 영역과 적은 영역이 함께 있어야 휴식과 리듬이 생긴다. | — | LIT — Leading Shape & Form Hierarchy in VFX § 2차 형태 분배의 70/30 규칙 |
| L166 | 시간적 위계 | Temporal hierarchy | 타이밍 | 위계는 시간에도 존재하며 예비 동작(리딩 셰이프 세움·대비 구축)→임팩트(최대 대비·최대 채도, 1차 완전 지배)→소멸(2차·3차 유지, 1차 희미) 순서다. | 클라이맥스=요소 수 최대·대비 최대·채도 높음, 소멸=대비 낮음·불투명도 낮음(Jevremovic, 80.lv). | LIT — Leading Shape & Form Hierarchy in VFX § 시간적 위계: 시간 속의 형태 순서 |
| L167 | 임팩트 최대 지배, 2차 선행 피크 금지 | Peak at impact | 타이밍 | 리딩 셰이프는 임팩트 프레임에서 최대 지배성에 도달한 뒤 소멸하며 역할을 2차에 넘겨야 하고 2차가 1차보다 먼저 피크를 찍으면 읽기 순서가 뒤집혀 혼란스럽다. | — | LIT — Leading Shape & Form Hierarchy in VFX § 시간적 위계: 시간 속의 형태 순서 |
| L168 | 위계 실패: 동일 무게 형태 | Failure: equal-weight shapes | 구성 | 둘 이상의 형태가 같은 시각적 무게로 경쟁하면 눈이 오가고 이펙트가 해결되지 않은 느낌을 준다. | 하나가 돋보이려면 다른 요소가 배경으로 기능해야 함(Smashing Magazine). | LIT — Leading Shape & Form Hierarchy in VFX § 위계 실패 모드 |
| L169 | 위계 실패: 1차 형태 부재 | Failure: no primary shape | 구성 | 명확한 리딩 셰이프 없이 중간 스케일 형태만 쌓으면 바빠 보이지만 아무것도 전달하지 않으며 매크로 읽기를 생략한 파티클 위주 이펙트에서 흔하다. | — | LIT — Leading Shape & Form Hierarchy in VFX § 위계 실패 모드 |
| L170 | 위계 실패: 3차 과부하 | Failure: tertiary overload | 구성 | 미세 디테일이 지나치면 2·3차 구분이 사라지고 위계가 노이즈로 평평해진다. | 큰 형태 없이 모든 것이 극도로 디테일하면 큰 형태를 추가할 때(Blevins). | LIT — Leading Shape & Form Hierarchy in VFX § 위계 실패 모드 |
| L171 | 위계 실패: 2차가 1차를 모순 | Failure: contradictory secondary | 구성 | 원형으로 읽히는 1차(안전·치유)에 뾰족한 2차(공격성)를 붙이면 혼란스러우므로 2차는 1차의 의미를 확장·강화해야 한다. | — | LIT — Leading Shape & Form Hierarchy in VFX § 위계 실패 모드 |
| L172 | 위계 실패: 게임플레이 무게와 스케일 불일치 | Failure: scale vs gameplay weight | 구성 | 위계는 게임플레이 중요도도 반영해야 하며 약한 공격이 궁극기와 시각적으로 같아 보여서는 안 된다. | 약한 공격은 궁극기보다 작은 1차 형태. VFX Apprentice(LoL Design Tips) 인용. | LIT — Leading Shape & Form Hierarchy in VFX § 위계 실패 모드 |
| L173 | 형태 위계 구축 워크플로 7단계 | Hierarchy construction workflow | 워크플로·검수 | 리딩 셰이프 정의 → 독립 검증 → 2차 추가(70/30) → 3차 추가(저채도·작게) → 색/명도 위계 매핑 → 타이밍 검증 → 실눈 테스트 순서다. | 가장 채도 높고 밝은 것=1차, 2·3차는 단계적으로 낮춤. 1차는 임팩트에서 피크, 2차 지속, 3차 소멸. | LIT — Leading Shape & Form Hierarchy in VFX § 형태 위계 구축 워크플로 |
| L174 | 실눈 테스트 | Squint test | 워크플로·검수 | 이펙트를 팔 길이만큼 떨어뜨리거나 썸네일 크기로 줄였을 때 1차 형태만 보여야 하며 2차 형태가 살아남으면 1차와 경쟁하는 것이다. | — | LIT — Leading Shape & Form Hierarchy in VFX § 형태 위계 구축 워크플로 (7단계) |
| L175 | 과장 | Exaggeration | 형태 | 형태의 특징적 성질을 의도적으로 증폭해 게임플레이 거리와 속도에서도 의도가 즉시 감정적으로 읽히게 하는 것이다. | 더 크고 대담하고 극단적으로. | LIT — Exaggeration & Stylization in Form § 핵심 정의 |
| L176 | 스타일라이제이션 | Stylization | 형태 | 알아볼 수 있음을 유지하면서 시각 특징을 의도적으로 단순화·각색해 표현력과 고유성을 높이는 것이며 과장 위에서 살아난다. | Matt Schwartz(80.lv): 스타일라이즈드 이펙트는 과장·단순화된 형태·움직임·색으로 이야기를 전달. | LIT — Exaggeration & Stylization in Form § 핵심 정의 |
| L177 | 과장=메커니즘, 스타일=의도 | Exaggeration as mechanism | 형태 | 두 개념은 분리 불가이며 스타일화하기 위해 과장하고 현실을 넘어 밀어붙여 현실보다 더 명확하고 감정적이며 기억에 남게 전달한다. | — | LIT — Exaggeration & Stylization in Form § 핵심 정의 |
| L178 | 형태 과장이 필요한 이유 | Why exaggerate | 형태 | 현실은 느리고 모호하며 노이즈로 가득하므로 스타일라이즈드 VFX는 현실보다 더 빠르게 전달되어야 하고 과장이 노이즈를 걷어 신호를 증폭한다. | 이유 4가지: 게임플레이 속도(1초 미만 처리), 카메라 거리(10m 이상이면 사실적 디테일 붕괴), 시각적 경쟁(대담한 형태가 이김), 감정적 명확성(들쭉날쭉=폭력성·둥근=무해·확장 폭발=힘). | LIT — Exaggeration & Stylization in Form § 게임 VFX에서 형태 과장이 필요한 이유 |
| L179 | 사실~스타일 스펙트럼 | Realism–stylization spectrum | 형태 | 과장은 카툰 전용이 아니라 스펙트럼으로 작동하며 스타일별로 형태 접근과 과장 수준이 다르다. | 포토리얼=물리 정확·없음/숨김, 세미 리얼=명확성 위해 밀어붙임·낮음~중간, 스타일라이즈드 리얼=중간, 완전 스타일라이즈드=대담한 형태 언어·높음, 셀 셰이딩/애니메=2D 기반·플립북 중심·매우 높음, 카툰=단순 프리미티브·squash & stretch·극단적. 과한 스타일화는 큰 디테일·형태·실루엣을 다루는 놀이(80.lv). | LIT — Exaggeration & Stylization in Form § 스펙트럼: 사실적 형태 vs. 스타일라이즈드 형태 |
| L180 | 포토리얼도 과장한다 | Even photoreal uses exaggeration | 형태 | 차이는 과장을 하느냐가 아니라 얼마나 하느냐이며 카메라 거리와 액션 속도가 미묘한 디테일을 무너뜨리기 때문에 포토리얼 게임도 가독성을 위해 과장된 형태를 쓴다. | 사례: God of War·The Last of Us·Ghost of Tsushima. | LIT — Exaggeration & Stylization in Form § 스펙트럼: 사실적 형태 vs. 스타일라이즈드 형태 |
| L181 | 단순화한 뒤 증폭 | Simplify then amplify | 형태 | 먼저 이펙트를 본질적 특징 형태로 줄이고(불=위로 가늘어지는 형태, 폭발=바깥으로 확장되는 구, 베기=빠른 호) 그 형태가 더 자기 자신답게 보이도록 현실 너머로 밀어붙인다. | 증폭 방향: 더 크고·빠르고·공격적이고·휘고·들쭉날쭉하게. 맥락 없이도 의도가 전달될 때까지. | LIT — Exaggeration & Stylization in Form § 핵심 원칙 1. 단순화한 뒤 증폭한다 |
| L182 | 마이크로 디테일 절제 | Reduce micro detail | 형태 | 텍스처·형태의 마이크로 디테일을 줄이면 불필요한 노이즈 없이 명확하고 빠르게 읽히고 과장된 1차 형태가 지배하게 되며 복잡성은 과장의 적이다. | Matt Schwartz(80.lv) 인용. | LIT — Exaggeration & Stylization in Form § 핵심 원칙 1. 단순화한 뒤 증폭한다 |
| L183 | 형태 언어별 과장 방향 | Exaggeration direction by shape type | 형태 | 과장은 무작위 증폭이 아니라 형태 언어가 방향을 정한다. | 원/둥근=전체 부피↑·모든 엣지 부드럽게. 날카로운/들쭉날쭉=경계 뾰족·코어 좁힘·표면 파편화. 흐르는 곡선=길게 늘이고 루프·중심에서 멀리 리본처럼. 각진/대각선=움직임 벡터 쪽으로 강하게 기울이고 이동 방향으로 늘림. 확장 방사형=경계 레이어를 코어보다 불균형하게 멀리 밀어냄. | LIT — Exaggeration & Stylization in Form § 핵심 원칙 2. 형태 언어가 감정적 과장을 이끈다 |
| L184 | 아트 디렉션에 맞춘 과장 보정 | Calibrate to art direction | 기타 | 과장은 게임의 시각적 정체성에 맞게 보정되어야 하며 VFX 아티스트는 먼저 아트 디렉션을 내면화한 뒤 그 안에서 과장 범위를 정한다. | 셀 셰이딩 애니메=일러스트 참조 2D형, 카툰풍 모바일=squash & stretch 프리미티브, Hades류=자연 참조+드라마 위한 과장, 세미 리얼 액션=임팩트 명확성 위해 과장하되 물리 개연성 유지. | LIT — Exaggeration & Stylization in Form § 핵심 원칙 3. 과장은 아트 디렉션과 맞아야 한다 |
| L185 | 과장의 균형(몰입 경계) | Exaggeration balance | 형태 | 과장은 전달될 만큼 충분히, 몰입을 깰 만큼은 아니게 해야 하며 정답은 플레이어의 몰입이 유지되는 경계 바로 안쪽이다. | 중력·탄성·마찰은 장르에 따라 조정 가능하나 선이 있다(Woo Kim, 80.lv). | LIT — Exaggeration & Stylization in Form § 핵심 원칙 4. 균형 원칙 |
| L186 | 과장 부족/과함 신호 | Under- / over-exaggeration signs | 워크플로·검수 | 부족하면 거리에서 약하거나 불명확하고 개성 없이 섞이며, 과하면 시각 언어에서 이탈하고 산만하며 형태 정체성을 잃는다. | 부족: 게임플레이 거리에서 약함, 의도 오독/노이즈 무시, 환경에 섞임. 과함: 게임 시각 언어에서 벗어남, 정보보다 산만, 의미적 연결 상실. | LIT — Exaggeration & Stylization in Form § 핵심 원칙 4. 균형 원칙 |
| L187 | 스케일 과장 | Scale exaggeration | 형태 | 스타일라이즈드 이펙트는 현실적 대응물보다 훨씬 큰 경우가 많다. | 현실 크기의 검 베기는 스타일라이즈드에서 2–3배 크기여야 할 수 있음. | LIT — Exaggeration & Stylization in Form § 핵심 원칙 5 |
| L188 | 비율 과장 | Proportion exaggeration | 형태 | 어떤 차원은 압축하고 다른 차원은 늘려 형태 특성을 강화한다. | 파이어볼을 이동 방향으로 늘이고 수직 방향은 압축해 속도 강화. | LIT — Exaggeration & Stylization in Form § 핵심 원칙 5 |
| L189 | 속도 과장(스냅감) | Speed exaggeration | 타이밍 | 형태가 물리적으로 사실적인 것보다 더 빠르게 나타나고 사라지게 하면 스냅감 있는 등장·퇴장이 이펙트의 펀치를 강화한다. | — | LIT — Exaggeration & Stylization in Form § 핵심 원칙 5 |
| L190 | 지속 시간 과장(피크 홀드) | Duration exaggeration | 타이밍 | 일부 스타일라이즈드 이펙트는 플레이어가 읽을 시간을 주기 위해 피크 형태를 현실보다 오래 붙잡으며 이는 형태뿐 아니라 시간을 과장하는 것이다. | — | LIT — Exaggeration & Stylization in Form § 핵심 원칙 5 |
| L191 | 현실 참고부터 | Study reality first | 워크플로·검수 | 완전한 스타일라이즈드에서도 과장 전에 실제 대상을 연구해야 어떤 부분을 증폭할지 정할 수 있다. | 셰이딩 언어 자체를 연구(Woo Kim). | LIT — Exaggeration & Stylization in Form § 실전 적용: 시작점 |
| L192 | 프리미티브 블로킹으로 과장 테스트 | Primitive blocking | 워크플로·검수 | 디테일·텍스처 전에 단순 프리미티브로 과장된 형태를 블로킹해 의도가 전달되면 방향이 맞고 모호하면 더 과장한다. | 불기둥=원기둥, 폭발=임팩트에서 찌그러진 구, 베기=절단선을 훨씬 넘어 뻗는 리본. | LIT — Exaggeration & Stylization in Form § 실전 적용: 프리미티브 블로킹 |
| L193 | 레이어별 과장 우선순위 | Exaggeration priority by layer | 구성 | 이펙트 각 레이어는 서로 다른 과장 우선순위를 가지며 잘못된 레이어(예: 연기)를 과장하면 코어보다 드라마틱해져 읽히지 않는다. | 코어/임팩트 중심=최대, 1차 이미터 형태=높음(특징적 실루엣), 2차 디테일 파티클=중간(1차와 경쟁 금지), 배경 대기감=낮음/없음. 질문: 이 요소는 얼마나 중요한가? 1차 초점인가?(Jevremovic). | LIT — Exaggeration & Stylization in Form § 실전 적용: 이펙트를 레이어로 분해한다 |
| L194 | 스타일라이제이션 실패 모드 | Stylization failure modes | 워크플로·검수 | 형태 언어 미정의·아트 디렉션 불일치·과도한 추상화·디테일 과강조·유형 차별화 부재가 대표 실패다. | 무작위처럼 느껴짐→특징 형태를 일관되게 증폭. 동떨어짐→게임 시각 언어 연구. 정체성 상실→현실 참조 "접지" 형태 하나 유지. 약하게 읽힘→2차 덜어내고 코어 지배. 모두 비슷함→디테일 전에 유형별 고유 특징 형태 부여. | LIT — Exaggeration & Stylization in Form § 형태 스타일라이제이션의 흔한 실패 모드 |
| L195 | 형태 체계의 세 층위 | Shape system: language / silhouette / hierarchy | 형태 | 형태 노트들은 하나의 설계 체계를 세 층위로 설명한다: shape language는 무엇을 먼저 말하는지, silhouette/readability는 실제 플레이에서 읽히는지, leading shape/form hierarchy는 어떤 순서와 비중으로 눈에 들어올지를 정한다. | 노트 역할: Shape Language=형태 사전, Silhouette=검증 기준, Leading Shape=구성 원리. | LIT — Shape Synthesis for Game VFX § 종합 요약 / 문서 간 보완 관계 |
| L196 | 큰 형태 먼저, 읽힘 보장, 위계 따라 디테일 | Big shape first | 형태 | 좋은 VFX는 예쁜 디테일을 많이 넣는 작업이 아니라 의미 있는 큰 형태를 먼저 세우고 멀리서도 읽히게 보장한 뒤 위계를 따라 보조 정보와 텍스처를 추가하는 작업이다. | 요약 문장: 적절한 shape를 고르고 멀리서도 읽히는 silhouette로 만들고 hierarchy로 읽는 순서를 통제. | LIT — Shape Synthesis for Game VFX § 종합 요약 / 문서 간 보완 관계 |
| L197 | 형태 계열 5종(종합표) | Shape families table | 형태 | 형태 계열별 기본 정서·게임플레이 읽기·대표 사용처가 정리된다. | Circle/curve=안전·보호·회복·수용(heal·shield·buff·sanctuary). Square/block=안정·무게·방어·구조(tank·fortify·barrier). Line/diagonal=속도·방향·집중·정밀(projectile·beam·slash trail·tether). Triangle/sharp=위험·공격성·통증·속도(damage·impact·warning·hostile cast). Irregular/organic=혼돈·부패·자연성(poison·void·decay·fire·smoke). | LIT — Shape Synthesis for Game VFX § 세 문서의 통합 프레임: 1. 의미를 먼저 정한다 |
| L198 | 형태는 게임플레이 약속 | Gameplay contract | 형태 | 형태의 상징 자체보다 형태가 게임플레이 약속을 만든다는 점이 핵심이며, 힐이 둥글어야 하는 이유는 예뻐서가 아니라 플레이어가 안전한 것으로 즉시 분류해야 하기 때문이다. | Shape는 장식이 아니라 공격·방어·회복·위험 구역·방향을 전달하는 시각 문법. | LIT — Shape Synthesis for Game VFX § 1. 의미를 먼저 정한다 / 핵심 원리 1 |
| L199 | 읽기를 방해하는 실제 플레이 조건 | Real play conditions | 형태 | 실제 플레이에서는 거리·카메라 각도 변화·프레임 단위 빠른 움직임·다른 이펙트/UI와의 경쟁·매우 짧은 판단 시간 때문에 많은 디테일이 사라진다. | — | LIT — Shape Synthesis for Game VFX § 2. 그 형태가 실제로 읽히는지 본다 |
| L200 | 핵심 검증 질문 | Core verification question | 워크플로·검수 | 색·텍스처·발광을 모두 제거해도 이 효과가 무엇을 하는지 바로 알 수 있는가를 묻고 그렇지 않으면 shape를 단순화한다. | 검은 덩어리 테스트. | LIT — Shape Synthesis for Game VFX § 2. 그 형태가 실제로 읽히는지 본다 / 통합 체크리스트 |
| L201 | 실루엣 실무 원칙 5가지 | Silhouette practice rules | 형태 | 단순한 큰 형태가 복잡한 큰 형태보다 빠르고, 디테일은 중심부·포인트에 몰고, 빈 공간은 형태를 분리하는 구조이며, line of action이 하나로 설명되고, 가장 중요한 행동 요소가 silhouette 우선권을 갖는다. | — | LIT — Shape Synthesis for Game VFX § 2. 그 형태가 실제로 읽히는지 본다 |
| L202 | Primary/Secondary/Tertiary 역할 표 | Primary / secondary / tertiary roles | 구성 | Primary=가장 큰 실루엣·핵심 기능 메시지(가장 먼저·가장 크고 높은 대비), Secondary=방향·힘의 흐름·성격 보강(그 다음·primary와 경쟁 금지), Tertiary=질감·스파크·생동감(마지막·가까이서만 읽히는 미세 정보)이다. | — | LIT — Shape Synthesis for Game VFX § 3. 읽히는 순서를 만든다 |
| L203 | 위계의 시간 적용 | Hierarchy in time | 타이밍 | 계층은 공간뿐 아니라 시간에도 적용되어 anticipation에서 primary 준비, impact에서 primary 최대 위세, dissipation에서 secondary·tertiary가 여운을 만든다. | — | LIT — Shape Synthesis for Game VFX § 3. 읽히는 순서를 만든다 |
| L204 | 중요한 순간에 중요한 형태가 지배 | Right shape at right moment | 타이밍 | 좋은 이펙트는 항상 모든 것이 동시에 강한 상태가 아니라 가장 중요한 순간에 가장 중요한 형태가 최대로 명료하게 지배하는 구조다. | 타이밍에서 anticipation·impact·dissipation의 강약 순서가 거꾸로 되지 않게 조절. | LIT — Shape Synthesis for Game VFX § 3. 읽히는 순서를 만든다 / 통합 체크리스트 6 |
| L205 | 질서-혼돈 비율(종합) | Order/chaos ratio | 형태 | 유기적·불규칙 shape는 어둠·부패·자연성을 전달하지만 100% chaos는 읽기를 망가뜨리므로 읽을 수 있는 중심 질서+불안정한 외곽 혼돈의 대비를 가진다. | — | LIT — Shape Synthesis for Game VFX § 핵심 원리 3 |
| L206 | 네거티브 스페이스 적극 설계 | Active negative space | 형태 | 네거티브 스페이스는 단순 미니멀리즘이 아니라 실루엣과 위계를 동시에 살리는 장치이며 형태 사이 틈이 있어야 덩어리가 분리되고 분리되어야 읽기가 생긴다. | — | LIT — Shape Synthesis for Game VFX § 핵심 원리 4 |
| L207 | 현실감보다 가독성(종합) | Readability over realism | 형태 | 현실적으로 맞지만 게임에서 읽히지 않는 형태보다 조금 과장되어도 즉시 읽히는 형태가 낫다. | 큰 shape가 먼저 읽히지 않으면 미세 파티클·노이즈·텍스처는 방해물("detail everywhere is detail nowhere"). | LIT — Shape Synthesis for Game VFX § 핵심 원리 2·5 |
| L208 | 형태 통합 체크리스트 7단계 | Integrated checklist | 워크플로·검수 | 기능 정의 → primary shape 선택(circle/square/line/triangle/irregular) → 실루엣 테스트 → secondary가 primary를 보강하는지 → tertiary가 위계를 무너뜨리지 않는지 → 타이밍에서 primary가 정점에 도달하는지 → 실제 플레이 거리·배경에서 읽히는지 순서로 점검한다. | 줌아웃·다양한 각도·다른 FX와 함께 놓고 확인. secondary 검증 시 보조 shape가 의미를 강화하는지 흐리게 하는지 확인. | LIT — Shape Synthesis for Game VFX § 실무용 통합 체크리스트 |
| L209 | 유형별 primary shape·위계 팁(종합) | Application by effect type | 소재별 | 이펙트 유형별 추천 primary shape·실루엣 포인트·위계 팁이 정리된다. | Heal/support=Circle·soft oval·닫힌 안전 구역(중심 광량 약간↑, 가장자리 부드럽게). Projectile=Line·elongated wedge(머리=primary, trail=secondary). Impact/damage=Sharp burst·triangle(중심 타격부 크게, 파편 작게). Shield/barrier=Dome·circle·block(rim 선명, 내부는 보조). Poison/corruption=Irregular organic mass(완전 노이즈 대신 큰 덩어리 유지). Fire/lightning=Tapered organic 또는 jagged line(tip·strike path가 먼저 읽히게). | LIT — Shape Synthesis for Game VFX § 이펙트 유형별 간단 적용법 |
| L210 | 세 형태 노트의 보완 관계 | Complementary notes | 기타 | Shape Language는 형태 사전, Silhouette & Readability는 검증 기준, Leading Shape & Form Hierarchy는 구성 원리를 제공하며 서로 중복이 아니라 보완이다. | 종합 노트의 source_notes에는 Exaggeration & Stylization 노트가 포함되지 않음. | LIT — Shape Synthesis for Game VFX § 문서 간 보완 관계 / frontmatter |
| L211 | 형태 시작 루틴 6단계 | Starter routine | 워크플로·검수 | 흑백 썸네일 3개 → 각각 primary shape 하나만 명료하게 → gameplay meaning이 가장 빠른 안 선택 → secondary를 2개 이하 보조 덩어리로 추가 → tertiary는 마지막 20% 단계에서만 → 줌아웃·흑백·실제 배경에서 재확인한다. | secondary 2개 이하, tertiary는 마지막 20% 단계. | LIT — Shape Synthesis for Game VFX § 바로 적용 가능한 시작 루틴 |

---

## 충돌 메모

수치·주장이 출처 간에 어긋나거나 긴장 관계에 있는 항목이다. 판정은 하지 않고 관련 ID만 연결한다.

### A. 수치 불일치

1. **색 비율(주조/보조/강조)** — L25 (Color Palette Design): 주조 약 60–70% / 보조 약 20–30% / 강조 약 5–10%, 요약 문장은 "60/30/10 또는 70/20/10". L77 (시각 자료 브리프 V3): 안정 구성을 75/20/5로 지정. L89·L90 (칼럼 본문): 수치 없이 "강조색은 한 자릿수 비율, 경우에 따라 그보다 적게". 75/20/5의 주조 75%는 L25 범위(60–70%)를 벗어나고 강조 5%는 L25 범위의 하한이다. 또한 L25 안에서도 보조색이 20%(70/20/10)와 30%(60/30/10)로 갈린다. 주의: L164의 "70/30 규칙"은 2차 형태 크기 분할이라 색 비율과 다른 도메인이다(숫자만 겹침).
2. **팔레트 색상 수** — L31: 본문 인용(Shahrabi)은 "1–3개, 최대 5개"인데 같은 노트의 핵심 정리·L37 워크플로는 "총 2–3개 이내". L30은 유사/삼각 변형까지만 허용하며 이는 3색 이내와 합치한다.
3. **가독성 거리 기준** — L113·L178·L132: 기준 거리 10m 이상. L118: 공격/피해 VFX는 움직임 속 15m에서도 전달. 같은 노트(L113·L118)에서 10m와 15m가 병존하며 출처 간 통일 안 됨.
4. **형태 감정 읽기 차이(원)** — L137 (Shape Language): 원=광대함·영원성·움직임·평등·해방, 곡선=우아함·안전, 비위협적. L183·L178 (Exaggeration): 원/둥근 형태 = "안전, 힘, 완결성", 둥근 형태=무해함. "힘"과 "무해함"이 한 노트 안에 병존.

### B. 주장·원리의 긴장·충돌

5. **코어의 채도와 백색화** — L32·L26·L161·L47: 코어가 가장 밝고 가장 채도가 높아야 한다(최고 채도·최고 명도, 리딩 셰이프 최고 채도). L103 (칼럼): 광량이 충분히 높은 광원 중심은 희게 지각되고 고유 색은 중심 바깥에서 더 잘 읽히며 중심에서 멀수록 채도가 오른다. L51: 이미시브가 과하면 흰색으로 포화해 색 정보를 잃으므로 상한을 통제. L17·L18: 치명타/임팩트는 "흰색 쪽 플래시 또는 순색"으로 양쪽 모두 허용. 코어를 순색으로 두는지 흰색으로 날리는지에 대한 기준이 노트마다 다름.
6. **블룸의 역할 평가** — L39: 블룸이 있어야 발광 요소가 평면이 아니라 광원으로 읽힌다("블룸=발광 설득의 다리"). L105·L106·L80 (칼럼·브리프): 블룸은 카메라 시뮬레이션이라 빛 자체의 설득력을 만들지 못하고 장면에 남는 빛(반사광·림라이트)이 결정적. 또 L105는 블룸이 "화면 전체의 분위기를 좌우"한다고 하나 L42·L47은 좁은 반경·초점 한정을 요구. 관련 L73·L46.
7. **감쇠 시 색 방향** — L18 (Color Language): 감쇠 구간은 "더 차갑고 어두운 톤"으로 이동, L36 (Palette): 따뜻한 코어에서 차가운 외곽으로 냉각. L101 (칼럼): 불꽃은 밝은 노랑 → 어두운 빨강 → 검은 회색 연기로 따뜻한 계열 안에서 어두워지고 무채색화. 온도가 차가워지는 경로와 따뜻한 채로 어두워지는 경로가 병존(소재별 차이 가능성).
8. **디테일 배치 원칙** — L122·L201 (Silhouette·Synthesis): 디테일은 충돌 지점·초점 중심(중심부)에 몰아야 한다. L157·L182·L170 (Hierarchy·Exaggeration): 3차 디테일은 가장 작은 면적·저채도로 1차와 경쟁하지 않아야 하고 마이크로 디테일은 줄여 1차 형태가 지배해야 한다. 초점에 디테일을 모으는 쪽과 초점 형태를 단순하게 두는 쪽이 긴장.
9. **주의를 끄는 변수의 우선순위** — L61·L64 (Value Contrast): 눈은 색이 아니라 대비를 따르며 대비는 색과 무관한 직설적 진술. L16 (Color Language): 온도 대비가 "확실한 주의 스파이크". L159: 지배성 레버에 색·채도 포함. 명도 대비 단독 우위 vs 색(온도·채도) 대비 병용의 서열이 노트마다 다름.
10. **치유의 색 온도** — L06은 치유를 차가운 색(초록·청록)의 용도로 분류. L17은 치유를 "초록, 부드러운 흰색, 따뜻한 금"으로 서술. L153은 치유/버프에 "따뜻한 내부 광". L24는 빨강·주황 치유 주문을 위협으로 읽힌다고 경고. 초록은 L10에서 치유와 독을 모두 의미해 같은 색 안의 중복 의미(구분 수단은 채도·형태: L153 독=유기적 방울/치유=원)도 있음.
11. **보색 사용과 그라데이션 경로** — L28·L36은 보색·온도 대비(따뜻한 코어/차가운 외곽)를 임팩트·깊이 도구로 권장하지만 L88은 보색 50:50은 소란, L100은 보색을 직선 보간하면 죽은 회색이 된다고 경고. 모순은 아니나 보색/온도 반전 팔레트를 쓸 때 경유 색 설계가 필요하다는 제약이 노트 간에 분리되어 있음.

### C. 용어·구조·메타 불일치

12. **명도 용어 혼재** — L60·L83·L85: Value(명도), HSB의 Brightness(B값), Perceived Lightness(지각명도)가 구분되며 L83은 이 칼럼의 "명도"를 지각된 밝기 위계로 정의. 반면 L33·L49·L73 등은 luminosity/luminance(휘도)·HDR 값과 섞어 쓰며 L66은 "value budget"을 최대 밝기와 연결. 용어 통일 필요.
13. **LIT 언어 규약** — L02: MOC는 LIT를 영어로 작성한다고 적었으나 Shape LIT 5개(L110–L211)는 한국어 본문·제목이고 Color LIT 4개(L04–L74)는 영어.
14. **MOC 누락** — L01: MOC의 Shape/Form 목록은 4개 노트뿐이고 Shape 폴더에 있는 `LIT — Shape Synthesis for Game VFX`(L195–L211)는 MOC에 없음. 이 종합 노트의 source_notes에도 Exaggeration & Stylization 노트가 빠져 있음(L210).
15. **MOC 분류와 pending 주제 겹침** — Value Contrast LIT(L60–L74)는 MOC에서 Color 아래 분류되지만 Value(아트적 관점) 섹션의 pending 4주제(명도 스케일·초점 제어·값 그루핑·무드)와 내용이 부분 겹침. Timing·확장 pending 주제도 L18·L70·L127·L128·L166–L167·L189–L190·L203–L204(타이밍), L154–L174·L68·L172·L187(구성·레이어·스케일)에서 부분적으로 이미 다뤄짐.
16. **경로 표기** — L03·L81: Color Theory Index의 Dataview `FROM "07 Theory/Color"`와 칼럼의 이미지 경로 `07 Theory/Color/Assets/`는 현재 볼트의 `Lecture/Color/`와 다름.

### D. 충돌은 아니지만 통합 시 중복되는 항목(참고)

- 실루엣/검증: L114 ↔ L200 ↔ L208 ↔ L211(검은 덩어리·흑백 테스트), 흑백 검산 L78 ↔ L87 ↔ L92 ↔ L108.
- 가독성>사실성: L132 ↔ L180 ↔ L207. 네거티브 스페이스: L123 ↔ L206. 질서 코어+혼돈 외곽: L147 ↔ L205.
- 값 위계 스택(환경/캐릭터/VFX/UI): L34 ↔ L62. 위계의 시간 대응: L166 ↔ L167 ↔ L203 ↔ L204.
- 빛 4층위: L80 ↔ L102–L106. 블룸·대비 충돌: L46 ↔ L73.

---

## 파일별 커버리지

| 파일 | ID 범위 | 개수 |
|---|---|---|
| Lecture/VFX Art Theory MOC.md | L01–L02 | 2 |
| Lecture/Color/Color Theory Index.md | L03 | 1 |
| Lecture/Color/LIT — Color Language & Emotion in VFX.md | L04–L20 | 17 |
| Lecture/Color/LIT — Color Palette Design for Effects.md | L21–L37 | 17 |
| Lecture/Color/LIT — HDR & Bloom — Art Perspective.md | L38–L59 | 22 |
| Lecture/Color/LIT — Value Contrast in VFX.md | L60–L74 | 15 |
| Lecture/Color/색의 구조 시각 자료 브리프.md | L75–L81 | 7 |
| Lecture/Color/색이란 이론 칼럼 초안.md | L82–L109 | 28 |
| Lecture/Shape/LIT — Silhouette & Readability in VFX.md | L110–L132 | 23 |
| Lecture/Shape/LIT — Shape Language in VFX.md | L133–L153 | 21 |
| Lecture/Shape/LIT — Leading Shape & Form Hierarchy in VFX.md | L154–L174 | 21 |
| Lecture/Shape/LIT — Exaggeration & Stylization in Form.md | L175–L194 | 20 |
| Lecture/Shape/LIT — Shape Synthesis for Game VFX.md | L195–L211 | 17 |
| **합계(13개 파일)** | L01–L211 | **211** |

장별 개수: 형태 51 / 컬러 41 / 워크플로·검수 27 / 구성 24 / 빛 23 / 밸류 18 / 타이밍 11 / 기타 10 / 소재별 6 (합 211).

범위 외 처리: `Color/SATH/` 아래 mp4·mp3·srt·jpg·png, `Color/Assets/*.svg`, `Shape/assets/*.svg`는 .md가 아니므로 읽지 않음. `Lecture/DucVu`, `Lecture/Mihoyo`, `Lecture/중국 언리얼 강의` 폴더는 범위 밖이라 열람하지 않음. 브리프 파일의 이미지 생성 프롬프트 문단(V1–V6)은 도해 제작용 지시문으로, 개념은 L75–L80에만 반영했고 따르지 않음. 파일 안에서 수행을 요구하는 이상한 지시문은 발견되지 않음.

---

## MOC pending 주제

`VFX Art Theory MOC.md`에서 *pending*으로 표시된 주제(원문 그대로):

**Value (아트적 관점)**
- Value Scale & Tonal Range in VFX — *pending*
- Light vs Dark — Focal Point Control — *pending*
- Value Grouping for Readability — *pending*
- Value and Mood Expression in Effects — *pending*

**Timing**
- 12 Principles of Animation applied to VFX — *pending*
- Anticipation & Impact Frame Design — *pending*
- Effect Lifetime & Decay Design — *pending*
- Snappy vs Lingering — Timing Feel — *pending*

**확장 주제**
- Composition & Focal Point in VFX — *pending*
- Motion & Flow Direction — *pending*
- Layering & Depth in Effects — *pending*
- Visual Rhythm & Repetition — *pending*
- Scale & Weight Expression — *pending*

(pending 합계 13개. 완료(✅) 표시는 Shape 4개·Color 4개 총 8개.)

참고: 위 pending 주제와 이미 부분적으로 겹치는 추출 ID는 충돌 메모 15번에 정리함.
