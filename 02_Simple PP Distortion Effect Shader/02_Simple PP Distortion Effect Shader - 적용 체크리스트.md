# 02_Simple PP Distortion Effect Shader - 적용 체크리스트

## 적용 전 확인
- 화면 텍스처를 샘플링할 수 있는가
- 현재 프로젝트가 `GrabPass` 또는 동등한 대체 경로를 제공하는가
- 버텍스 컬러를 사용하는 메시 파이프라인인가
- 메인 텍스처를 왜곡 패턴 맵으로 사용할 수 있는가

## 최소 이식 체크리스트
- `Main Texture` 준비
- 화면 샘플 텍스처 준비
- 왜곡 소스 생성 라인 연결
- `Distortion Intensity` 노출
- `Screen Position + Offset` 경로 연결

## 알파까지 이식할 때
- 메인 텍스처 `R` 채널 의미 확인
- `Mask Texture` 필요 여부 결정
- `Distortion Alpha Range` 감도 확인
- `Vertex Color A` 가 실제로 존재하는지 확인

## 단순화 옵션
- 버텍스 컬러가 없으면 `Vertex Color A = 1`
- `Distortion Type` 선택이 불필요하면 고정 타입 사용
- 애니메이션이 필요 없으면 그룹 2 제거
- 그레이스케일 옵션이 필요 없으면 `Color Mode` 제거
- 외곽 제어가 필요 없으면 `Mask Texture` 제거

## 깨질 수 있는 지점
- 화면 텍스처 좌표계 차이
- 프로젝트별 `Screen Position` 해석 차이
- 해상도/종횡비가 바뀔 때 왜곡 패턴 찌그러짐
- 투명 오브젝트 정렬 순서
- 모바일에서 화면 재샘플링 비용 증가

## 추천 이식 순서
1. 그룹 5 없이 왜곡 소스부터 독립 검증
2. 화면 샘플링 연결
3. `Distortion Intensity` 조절
4. 알파 마스크 추가
5. 컬러 옵션 추가

## 추천 프리셋
- 경량형: 그룹 3 + 그룹 4 + 그룹 5
- 표준형: 그룹 2 + 그룹 3 + 그룹 4 + 그룹 5 + 그룹 7
- 풀옵션형: 전체 유지
