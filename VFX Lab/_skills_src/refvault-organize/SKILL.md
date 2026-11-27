---
name: refvault-organize
description: >-
  Hyorin의 RefVault 이펙트 레퍼런스 라이브러리(yoring_nest.library)를 정해진 규칙으로 정리하는 스킬. RefVault는 Eagle을 대신해 직접 만든 레퍼런스 관리 프로그램이다. 새로 들어온 영상·GIF를 찾아 프레임을 직접 보고, 폴더(01_Reference/TFT·Studio·Etc, 02_My_Work) 배치, `출처_시즌_종류_이름` 이름 변경, 출처·속성·형태 태그 부여를 변경안으로 보여준 뒤 승인받아 백업과 함께 적용한다. 사용자가 "새로 추가했어", "RefVault 정리해줘", "이글 정리해줘", "새 영상 정리", "레퍼런스 정리", "태그 달아줘", "이름 정리", "라이브러리 정리" 등을 말하거나 RefVault(또는 예전 Eagle)에 레퍼런스를 올렸다고 하면 반드시 이 스킬을 쓴다. 정리를 되돌려 달라는 요청에도 쓴다. 영상의 타이밍·컬러·밸류 분석 요청은 vfx-breakdown 스킬을 쓴다.
---

# RefVault 레퍼런스 정리

Hyorin(VFX 아티스트)이 RefVault에 모은 이펙트 영상을 일관된 기준으로 정리한다. 분류 기준(폴더, 이름 규칙, 태그 목록, 판정 팁)은 `references/taxonomy.md`에 있으니 **시작할 때 반드시 읽는다.** 라이브러리 파일 구조는 `references/refvault_format.md`.

RefVault 라이브러리는 그냥 폴더라서 직접 고칠 수 있다. 다만 RefVault가 켜져 있으면 프로그램이 가진 상태로 내 수정을 덮어쓰거나, 동시에 쓰다가 JSON이 깨질 수 있다. 그래서 "읽기는 자유롭게, 쓰기는 승인 + RefVault 종료 + 백업 후에만"이 원칙이다.

예전 Eagle 라이브러리(`yoring_vfx_nest.library`)는 더 쓰지 않는다. 사용자가 "이글 정리"라고 말해도 RefVault 라이브러리를 정리한다.

## 1. 라이브러리 연결과 새 항목 찾기

- 기본 경로: `C:\Users\yoringvfx\OneDrive - KRAFTON\새 폴더\yoring_nest.library`. 연결이 안 돼 있으면 `request_cowork_directory`로 요청한다. 경로가 바뀌었을 수 있으니 실패하면 사용자에게 묻는다.
- 작업 파일(items.json, plan.json, 시트)은 outputs 폴더 안의 `_rv/`에 둔다. `/tmp`는 이전 세션 파일이 남아 쓰기가 막힐 때가 있다.
- 셸에서 목록을 뽑는다:
  ```bash
  python <skill>/scripts/inventory.py "<lib>" <outputs>/_rv/items.json        # 새 항목만 (폴더·태그 없음, 휴지통 제외)
  python <skill>/scripts/inventory.py "<lib>" <outputs>/_rv/all.json --all    # 전체 (재정리할 때)
  ```
- "새 항목" = 폴더도 태그도 없는 항목. 사용자가 RefVault에서 직접 고친 기존 항목은 건드리지 않는다. 사용자가 특정 항목 재정리를 요청할 때만 대상에 넣는다.
- 확인할 것: `library.json`이 없음(다른 폴더를 연결함), 라이브러리 안에 `.library`가 또 있음, 비어 있음, 예상보다 적은 개수, "파일 없음" 출력(OneDrive 온라인 전용 → "이 장치에 항상 유지" 안내). 이상하면 수정 전에 사용자에게 알린다.

## 2. 프레임 보고 판정

```bash
python <skill>/scripts/contact_sheets.py <outputs>/_rv/items.json <outputs>/_rv_sheets
```
- 항목마다 움직임이 큰 8프레임을 뽑는다. `pages/pNN.jpg`(5개씩)를 Read로 **전부 직접 보고** 판정한다. 파일 이름만 보고 태그를 추측하지 않는다. 이름에 속성 정보가 없는 경우가 많기 때문이다 (Love Love Beam, Justice Beam 등).
- 판정하는 것: 출처(화면 UI·워터마크·로고), 속성, 형태, 내용 요약(랜덤 이름일 때 새 이름용).
- 워터마크가 원작자가 아니라 모음 사이트(CGWOLD 등)면 출처 태그를 새로 만들지 사용자에게 묻는다. 이전 결정: CGWOLD는 출처로 쓰지 않고 `Etc_`로 정리.
- 이펙트가 화면에서 너무 작은 쇼케이스 영상(TFT LL, Chibi 기본)은 `low: true`로 표시하고 대략적으로 태그한다.

## 3. 변경안 만들고 승인받기

`<outputs>/_rv/plan.json` 작성:
```json
{"items":[{"id":"MV4P8IO33C4B4A68","new":"TFT_Set8_BoomBP_Justice_Beam","folder":"01_Reference/TFT/Set8","tags":["TFT","Light","Beam"],"low":false}],
 "tag_groups":{"출처":["TFT"],"속성":["Light"],"형태":["Beam"]}}
```
- `id`는 RefVault 항목 id(`items/` 아래 폴더 이름, 16자). Eagle 시절 id(`eagleId`)가 아니다.
- `tag_groups`에는 이번에 쓴 태그를 그룹별로 적는다 (기존 그룹에 없는 것만 추가된다).
- 이름 중복이 없게 한다.
- `annotation`(메모)은 선택. vfx-breakdown으로 분석한 영상이면 메모에 분석 노트를 적을 수 있다: `"분석: Effect Breakdown/<작품 폴더>/<작품> - Index.md (vfx-breakdown, 날짜)"`. 메모만 바꿀 때는 `new`에 현재 이름, `folder`·`tags` 키는 뺀다.
- 미리보기 HTML을 만들어 `present_files`로 보여준다:
  ```bash
  python <skill>/scripts/preview.py <outputs>/_rv/plan.json <outputs>/_rv/items.json <outputs>/_rv_sheets/sheets <outputs>/refvault_변경안.html
  ```
- 2~3개뿐이면 HTML 없이 채팅에 표(현재 이름 / 내용 / 새 이름 / 폴더 / 태그)로 보여줘도 된다.
- 새 폴더·새 태그·확신도 낮은 항목은 따로 짚어 준다.
- `AskUserQuestion`으로 두 가지를 확인한다: ① 적용할지(전부 / 폴더·이름만 / 수정), ② **RefVault를 완전히 종료했는지**(창을 닫아도 트레이에 남는 구조면 트레이에서도 종료). 둘 다 예일 때만 다음 단계로 간다.

## 4. 백업과 적용

```bash
python <skill>/scripts/apply_plan.py "<lib>" <outputs>/_rv/plan.json <outputs>/_refvault_backup_<YYYYMMDD_HHMM>
```
- 스크립트가 백업(`library.json`, 대상 항목 `metadata.json`, 이름 변경 기록, `restore.py`)을 먼저 만든다. 그다음 `library.json`에 폴더를 만들고(parentId 방식), 영상 파일 이름과 `metadata.json`의 `name`·`fileName`을 바꾸고, 태그를 넣고, 마지막에 파일 경로와 폴더 id를 검증한다.
- 썸네일은 `thumb.webp` 고정이라 이름을 바꾸지 않는다. `eagleId`·`palette` 등 다른 필드는 그대로 둔다.
- "폴더·이름만" 승인이면 plan의 items에서 `tags` 키를 빼고 실행한다.
- 출력의 `problems: none`을 확인한다. 문제가 있으면 숨기지 말고 알린다.
- 끝나면 임시 시트 폴더(`_rv_sheets`)는 지운다. 백업 폴더는 남긴다.

## 5. 마무리 보고

짧게 알린다: 몇 개를 어디에 정리했는지, 새로 만든 폴더·태그, 확신도 낮아서 RefVault에서 확인이 필요한 항목, 빠진 파일이 있다면 그 목록, 그리고 RefVault를 다시 열어서 확인해 달라는 부탁. 되돌리고 싶으면 말해 달라고 한 줄 덧붙인다.

## 되돌리기

RefVault 종료를 확인한 뒤:
```bash
python <outputs>/_refvault_backup_<...>/restore.py "<lib>"
```
여러 번 적용했다면 최근 백업부터 거꾸로 되돌린다. 예전 Eagle 백업(`_eagle_backup_*`)은 Eagle 라이브러리용이라 RefVault에 쓰지 않는다.

## 하지 않는 것

- RefVault가 켜져 있을 수 있는 상태에서 쓰기 작업.
- `items/<id>` 폴더 이름 바꾸기, 항목 폴더 옮기기·지우기. 항목 삭제는 RefVault 앱에서 하도록 안내한다(앱은 `deletedAt`으로 휴지통 처리).
- `library.json`을 통째로 새로 쓰기. 스크립트처럼 읽어서 필요한 부분만 바꾼다.
- 사용자가 직접 정리한 기존 항목을 기준에 맞춘다며 일괄 수정하기 (요청이 있을 때만).
- Frame.io(Z:) 같은 원본 보관소의 파일 수정.
