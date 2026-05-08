# Screen Monochrome Effect Shader

## 개요
- 원본 파일: `Assets/Cosmos/_Dev/IronJade/ResourcesAddressable/Shader/Effect Shader/Distort Effect Shader/Screen Monochrome Effect Shader.shadergraph`
- 성격: 화면 샘플 기반 모노크롬/패턴화 셰이더
- 핵심 구조: `GrabPass 샘플 -> RGB/Greyscale 선택 -> Contrast 범위 재매핑 -> Invert/Pattern 분기 -> BaseColor/Alpha 출력`

## 빠른 이동
- [[Screen Monochrome Effect Shader - 전체 구조]]
- [[Screen Monochrome Effect Shader - 그룹별 분석]]
- [[Screen Monochrome Effect Shader - 이식 가능한 기능 조각]]
- [[Screen Monochrome Effect Shader - 프로퍼티 설명서]]
- [[Screen Monochrome Effect Shader - 어트리뷰트 프로퍼티 정리]]
- [[Screen Monochrome Effect Shader - Pseudocode]]
- [[Screen Monochrome Effect Shader - 적용 체크리스트]]

## 가장 중요한 기억 포인트
- `_Contrast` 는 단일 float 명암 배율이 아니다.
- `_Contrast` 는 `Vector2(min, max)` 이고, `[Remap]` 어트리뷰트로 머티리얼 인스펙터에서 `MinMaxSlider` 처럼 보이는 범위 프로퍼티다.
- 그래프에서는 `Split -> Inverse Lerp` 로 연결되어, 입력 명암값을 다시 `0~1` 로 재배치하는 기준 범위로 사용된다.
- 즉 `_Contrast` 는 “대비 강도”보다 “그레이스케일 입력 범위 재정의”에 더 가깝다.

## 카테고리 요약
- 기본 카테고리: `_GrabPassTransparent`, `Color Source`, `Invert`, `Emission Intensity`, `Contrast`
- `Pattern`: `Change to Pattern`, `Test textrue`, `Pattern UV Mode`, `Pattern Scale`, `Pattern Range`
- `Line Distortion`: `Use Distortion?`, `Use Custom Dada?`, `Center`, `Distortion Intensity`, `Distortion Range`, `Line Count`, `Line Mask Random`
- `Mask`: `Mask Texture`, `Mssk Ins`
