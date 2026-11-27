# Hyorin VFX 레퍼런스 분류 기준

## 라이브러리
- 기본 위치: `C:\Users\yoringvfx\OneDrive - KRAFTON\새 폴더\yoring_nest.library` (RefVault). 구조는 `refvault_format.md`.
- 예전 Eagle 라이브러리 `yoring_vfx_nest.library`는 더 쓰지 않는다(2026-10-12 이전).
- OneDrive 동기화 폴더. 영상이 "온라인 전용"이면 셸에서 못 읽으니 "이 장치에 항상 유지"를 안내.
- 원본 보관소는 Frame.io Drive(Z:). Z:는 가상 드라이브라 셸 분석이 안 되고 목록 확인만 가능.

## 폴더 구조
```
01_Reference
├─ TFT
│  └─ Set7.5 / Set8 / Set8.5 / Set9 / Set9.5 ...   (새 시즌은 같은 형식으로 추가)
├─ Studio      외부 스튜디오·아티스트 포트폴리오 (octopo, dardo 등)
└─ Etc         출처가 하나뿐이거나 불분명한 것, 다른 게임 단발 레퍼런스
02_My_Work     본인 작업물 (4G9, Dynamite Blue 등 프로젝트별 하위 폴더)
```
- 같은 출처가 Etc에 5개 이상 쌓이면 `01_Reference/<출처>` 폴더 분리를 제안 (승인 후).
- 피드백 영상(feedback list)과 강의(Lecture)는 Eagle에 넣지 않기로 함. 들어오면 사용자에게 확인.

## 이름 규칙: `출처_시즌_종류_이름`
- 단어 구분은 `_`, 원본의 공백도 `_`로. 특수문자 `! ' ‘ ,` 와 접미사 `VFX` 제거.
- 시즌·종류가 없는 출처는 생략: `octopo_Misfitz_Enemy01_Attack`, `dardo_Roadie_SonicBomb`
- 출처 불명: `Etc_` 접두 + 내용 요약 (`Etc_ATBN_Dark_Slash_Flash`). 워터마크가 보이면 그걸 출처로 (`放晴_Heart_Projectile_Burst`).
- 단, 워터마크가 원작자가 아니라 모음·재배포 사이트(CGWOLD.COM 등)면 출처로 쓰지 않고 `Etc_`로 (`Etc_Water_Dragon_Beam`, 2026-10-12 결정).
- 랜덤 해시 이름은 프레임을 보고 내용으로 새로 짓는다.
- 원어(한국어·중국어) 제목은 의미가 있으면 유지 (`Etc_격투_빠른템포`).

### TFT 규칙
- 원본 예: `Set8 5 LL Mech Pilot Shisa`, `Set 7 5 LL BP KoiStarmaw VFX`, `Set9 Chibi DRX Aatrox Finisher`
- 시즌: `Set8 5`, `Set 7 5`, `Set7.5` → `Set8.5`, `Set7.5`
- 종류: Finisher > Boom > LL > Chibi 순으로 판정. 배틀패스 `BP`가 있으면 종류 뒤에 붙임 (`BoomBP`, `LLBP`).
  - `Chibi Boom X` → `Boom_Chibi_X`, `Chibi X Finisher`/`Finisher Chibi X` → `Finisher_X`
  - `Base`는 종류 바로 뒤로: `Chibi_Base_Ashe`, `LL_Base_Bungo`
- 오타 수정: Drangomancer→Dragonmancer, LeesSin→LeeSin, Uitra→Ultra, LittleDevil→Little_Devil, SoulFighter→Soul_Fighter, Kai'sa→Kaisa
- 예: `TFT_Set8_BoomBP_Justice_Beam`, `TFT_Set7.5_Finisher_Dragonmancer_LeeSin`, `TFT_Set8.5_LL_Mech_Pilot_Shisa`

## 태그 (RefVault 태그 그룹)
파일당 2~5개. 너무 상세하게 달지 않는다 (사용자 요청). 시즌·종류는 폴더/이름에 있으니 태그로 안 붙임.

| 그룹 | 태그 | 기준 |
|---|---|---|
| 출처 | TFT, LoL, octopo, dardo, EpicSeven, 放晴 … | 알 수 있을 때만 1개. 새 출처는 그룹에 추가 |
| 속성 | Fire, Thunder, Water, Ice, Wind, Earth, Light, Dark, Poison, Magic | 무엇으로 만든 이펙트인가. 1~2개 |
| 형태 | Explosion, Slash, Beam, Projectile, Hit, Aura, Shield, Spawn, Death, Smoke | 어떻게 움직이나. 1~3개 |
| 기타 | 2D, Tech | 2D=손그림 작화, Tech=툴/에디터 화면 |

판정 팁
- Magic: 특정 원소가 아닌 마법 에너지·별가루·하트 등 (핑크/보라/청록 에너지 대부분).
- Dark: 보라·검정 계열의 어둠/공허/그림자. 보라라도 밝고 반짝이면 Magic.
- Light: 흰색·금색 섬광, 성스러운 빛. Thunder: 지그재그 번개 형태가 보일 때만.
- Beam: 시작점과 끝점이 이어진 지속 광선. Projectile: 날아가는 물체.
- Aura: 캐릭터 주변 상시/버프 이펙트. LL·Chibi 쇼케이스는 대부분 Aura + 확신도 낮음.
- Spawn: 등장/소환/생성. Death: 사망·소멸 연출.
- 제목만 보고 판단하지 말 것 (예: Love Love Beam의 속성은 영상을 봐야 앎).

## 새 태그나 폴더가 필요할 때
기준에 없는 태그·폴더는 바로 만들지 말고 변경안에 "새로 추가" 표시를 해서 승인받는다.
