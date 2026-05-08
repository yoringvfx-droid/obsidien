# Screen Monochrome Effect Shader - 전체 구조

## 한 줄 요약
화면을 샘플링한 뒤 흑백화와 대비 재매핑을 수행하고, 필요 시 패턴 텍스처로 치환하거나 라인 왜곡을 섞어 출력하는 셰이더다.

## 최상위 흐름
1. `_GrabPassTransparent` 를 화면 좌표로 샘플링한다.
2. `Color Source` 키워드로 `RGB` 또는 `Grecy` 를 선택한다.
3. 선택된 값을 `Saturate` 로 정리한다.
4. `_Contrast` 의 `x/y` 를 `Inverse Lerp` 의 `A/B` 로 넣어 명암 범위를 재매핑한다.
5. `Invert` 가 켜져 있으면 `1 - 값` 경로를 사용한다.
6. 별도 패턴 UV/왜곡 경로에서 `Test textrue` 를 샘플링한다.
7. `Change to Pattern` 으로 원래 명암과 패턴 치환 결과를 분기한다.
8. `Emission Intensity` 로 최종 색을 마감한다.
9. `Mask Texture * Mssk Ins` 로 별도 알파를 만든다.

## 실제 최종 출력
- `SurfaceDescription.BaseColor`
- `SurfaceDescription.Alpha`

## 연결은 있지만 쓰이지 않는 출력 블록
- `VertexDescription.Position`
- `VertexDescription.Normal`
- `VertexDescription.Tangent`
- `SurfaceDescription.AlphaClipThreshold`

## 실무 관점 핵심
- 이 셰이더는 단순 흑백 셰이더가 아니라 `흑백 + 대비 범위 재매핑 + 패턴 치환 + 라인 왜곡` 조합형이다.
- 가장 재사용 가치가 높은 부분은 `_Contrast` 기반의 명암 재배치 로직이다.
- 패턴 치환은 별도 모듈처럼 떼어내기 쉽다.
