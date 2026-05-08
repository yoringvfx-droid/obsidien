# 02_Simple PP Distortion Effect Shader - 전체 구조

## 한 줄 요약
메인 텍스처를 왜곡 벡터로 해석한 뒤, 이를 `Screen Position`에 더해서 화면을 다시 샘플링하는 포스트 디스토션 셰이더다.

## 최상위 흐름
1. 메인 텍스처 UV를 시간 기반으로 이동시킨다.
2. 메인 텍스처에서 왜곡 소스를 만든다.
3. 왜곡 소스에 `Distortion Intensity` 와 `Vertex Color A` 를 곱한다.
4. 그 결과를 `Screen Position` 에 더한다.
5. `_GrabPassTransparent` 를 새 UV로 샘플링한다.
6. 샘플된 색을 `Color Mode`, `Vertex Color`, `Emission Intensity` 로 마감한다.
7. 별도 라인에서 `Mask Texture`, `Smoothstep`, `Saturate` 로 알파를 계산한다.

## 실제 최종 출력
- `Base Color`
- `Alpha`

## 그래프에 있지만 실사용 연결이 없는 블록
- `VertexDescription.Position`
- `VertexDescription.Normal`
- `VertexDescription.Tangent`
- `SurfaceDescription.AlphaClipThreshold`

## 실무 관점 핵심 포인트
- 이 셰이더의 본질은 오브젝트 텍스처 표현보다 `화면 왜곡 샘플러` 에 가깝다.
- `Main Texture` 는 일반적인 알베도보다 `왜곡 패턴 맵` 역할이 더 강하다.
- `Vertex Color A` 의 영향이 커서, 이식 시 버텍스 컬러 사용 여부를 먼저 결정해야 한다.
- 알파 계산은 색상 계산과 별도 경로라서, 일부 프로젝트에서는 색상 라인은 유지하고 알파 라인만 교체할 수 있다.
