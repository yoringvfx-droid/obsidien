# Screen Monochrome Effect Shader - 프로퍼티 설명서

## _GrabPassTransparent
- 역할: 화면 샘플 원본
- 영향 위치: 그룹 1
- 이식 팁: 프로젝트의 화면 텍스처 소스로 대체 필요

## Color Source
- 역할: `RGB` 또는 `Grecy` 선택
- 영향 위치: 그룹 1
- 메모: `Grecy` 는 표기 오타처럼 보이지만 실제 엔트리명 기준으로 문서화

## Contrast
- 타입: `Vector2`
- 의미: `min/max` 범위
- 영향 위치: 그룹 2
- 핵심: 일반적인 명암 강도값이 아니라 `Inverse Lerp` 입력 범위

## Invert
- 역할: 명암 반전 여부
- 영향 위치: 그룹 3

## Emission Intensity
- 역할: 최종 색 출력 배율
- 영향 위치: 그룹 7

## Change to Pattern
- 역할: 패턴 치환 결과를 실제로 사용할지 결정
- 영향 위치: 그룹 6

## Test textrue
- 역할: 패턴 소스 텍스처
- 영향 위치: 그룹 4, 6
- 메모: 이름 오타까지 포함해 원본 그대로 기록

## Pattern UV Mode
- 역할: 패턴 샘플 좌표계 선택
- 영향 위치: 그룹 4
- 엔트리: `View`, `ScreenSize`

## Pattern Scale
- 역할: 패턴 스케일 오프셋
- 영향 위치: 그룹 4, 6

## Pattern Range
- 역할: 패턴 적용 범위 조절
- 영향 위치: 그룹 6

## Use Distortion?
- 역할: 라인 왜곡 사용 여부
- 영향 위치: 그룹 5

## Use Custom Dada?
- 역할: 추가 입력 채널 선택
- 영향 위치: 그룹 5
- 엔트리: `None`, `Custom1 x`, `Custom1 y`, `Custom1 z`, `Custom1 w`
- 메모: 이름상 오타/임시명 가능성이 높음

## Center
- 역할: 왜곡/패턴 중심점
- 영향 위치: 그룹 5

## Distortion Intensity
- 역할: 왜곡 강도
- 영향 위치: 그룹 5

## Distortion Range
- 역할: 왜곡 영향 범위
- 영향 위치: 그룹 5

## Line Count
- 역할: 라인 패턴 개수 또는 간격 제어
- 영향 위치: 그룹 5

## Line Mask Random
- 역할: 라인 마스크 랜덤성
- 영향 위치: 그룹 5

## Mask Texture
- 역할: 알파 제어용 마스크
- 영향 위치: 그룹 7

## Mssk Ins
- 역할: 마스크 영향도
- 영향 위치: 그룹 7
- 메모: `Mask Ins` 의 오타 가능성이 높음
