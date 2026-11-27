# RefVault 라이브러리 구조

2026-10-12에 Eagle에서 옮긴 `yoring_nest.library`를 보고 정리했다. RefVault가 업데이트돼 구조가 바뀌면 이 문서와 스크립트를 같이 고친다(먼저 `library.json`과 항목 하나의 `metadata.json`을 열어 확인).

```
yoring_nest.library/
├─ library.json              라이브러리 정보 · 폴더 목록 · 태그 그룹
└─ items/
   └─ <id>/                  id 16자, 예: MV4P8IO33C4B4A68
      ├─ <fileName>          원본 영상·GIF (예: TFT_Set9_BoomBP_Praise_the_Sun_Disc.mp4)
      ├─ metadata.json
      └─ thumb.webp          썸네일 (이름 고정)
```

## library.json

```json
{"version":1, "name":"yoring_nest", "createdAt":…,
 "folders":[{"id":"MV4P8INT90A8AC89","name":"01_Reference","parentId":null,"createdAt":…,"expanded":true,"order":0}, …],
 "tagGroups":[{"id":"…","name":"출처","color":"#f04f4f","tags":["TFT",…],"collapsed":false}, …]}
```
- 폴더는 **평평한 목록 + parentId**다(Eagle은 children 중첩이었다). 경로는 parentId를 따라 올라가서 만든다.
- `order`는 같은 부모 안의 순서. 새 폴더는 형제 중 최대값 + 1.
- 태그 그룹 색은 hex 문자열.

## items/<id>/metadata.json

| 필드 | 뜻 | 정리할 때 |
| --- | --- | --- |
| id | 항목 id(폴더 이름과 같음) | 바꾸지 않음 |
| name | 표시 이름(확장자 없음) | 새 이름 |
| ext, type | mp4·gif / video·image | 바꾸지 않음 |
| fileName | 실제 파일 이름 = name + "." + ext | 새 이름에 맞춰 바꾸고 파일도 같이 rename |
| tags | 태그 목록 | 승인된 태그 |
| folders | 폴더 id 목록 | 승인된 폴더 1개 |
| modifiedAt | 수정 시각(ms) | 현재 시각 |
| deletedAt | 휴지통에 넣은 시각, 아니면 null | 휴지통 항목은 정리 대상에서 뺌 |
| size, width, height, duration, palette, rating, annotation, url, importedAt, processed, hasThumb, thumbVersion | 앱이 관리 | 건드리지 않음 |
| eagleId | Eagle 시절 id(이전 기록 추적용) | 건드리지 않음 |

## Eagle과 다른 점 (스크립트가 바뀐 이유)

| | Eagle | RefVault |
| --- | --- | --- |
| 라이브러리 정보 | metadata.json + tags.json + mtime.json | library.json 하나 |
| 항목 폴더 | images/<id>.info | items/<id> |
| 원본 파일 이름 | name + ext로 추정 | fileName 필드 |
| 썸네일 | <name>_thumbnail.png (이름 따라 바뀜) | thumb.webp (고정) |
| 폴더 트리 | children 중첩 | parentId 평평한 목록 |
| 삭제 | isDeleted | deletedAt |
| 수정 시각 | modificationTime, lastModified | modifiedAt |
