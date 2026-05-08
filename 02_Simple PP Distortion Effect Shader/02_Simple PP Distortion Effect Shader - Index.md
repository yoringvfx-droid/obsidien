# 02_Simple PP Distortion Effect Shader

## 개요
- 원본 파일: `Assets/Cosmos/ResourcesAddressable/Effects/_Core/Shaders/00_Distortion Effect Shader/02_Simple PP Distortion Effect Sahder.shadergraph`
- 성격: `Screen Position + GrabPass` 기반의 포스트 디스토션 셰이더
- 핵심 구조: `왜곡 소스 생성 -> 왜곡 강도 결합 -> 화면 재샘플링 -> 색상 출력 / 알파 출력`

## 이 노트 세트의 목적
- 다른 프로젝트에서 필요한 기능만 빠르게 골라 이식
- Shader Graph를 다시 다 뜯어보지 않고도 최소 단위로 재조립
- 프로퍼티, 의존성, 주의점을 빠르게 확인

## 빠른 이동
- [[02_Simple PP Distortion Effect Shader - 전체 구조]]
- [[02_Simple PP Distortion Effect Shader - 그룹별 분석]]
- [[02_Simple PP Distortion Effect Shader - 이식 가능한 기능 조각]]
- [[02_Simple PP Distortion Effect Shader - 프로퍼티 설명서]]
- [[02_Simple PP Distortion Effect Shader - Pseudocode]]
- [[02_Simple PP Distortion Effect Shader - 적용 체크리스트]]

## 빠른 결론
- 최소 왜곡 코어만 가져가려면: `왜곡 소스 생성 + 왜곡 강도 적용 + 화면 샘플링`
- 실전형으로 쓰려면: `위 3개 + 알파/마스크 제어`
- 스타일 옵션까지 유지하려면: `Color Mode` 그룹 추가

## 첨부 이미지
![그룹 박스 표시](02_Simple%20PP%20Distortion%20Effect%20Shader%20-%20Grouped%20Boxes.png)
