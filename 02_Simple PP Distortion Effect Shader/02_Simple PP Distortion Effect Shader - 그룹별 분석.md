# 02_Simple PP Distortion Effect Shader - 그룹별 분석

## 그룹 1. 화면 비율/기준 UV
### 역할
- 화면 비율 보정용 값과 기준 UV를 만든다.

### 포함 노드
- `Screen`
- `Divide`
- `Vector2`
- `UV`
- `Subtract`
- `Multiply`
- `Add`

### 출력
- 이후 왜곡 UV 계산에 쓰이는 보정된 기준 좌표

### 메모
- 화면 종횡비 영향이 큰 프로젝트면 유지하는 편이 안전하다.
- 단순한 테스트 셰이더에서는 생략 후 단순화 가능하다.

## 그룹 2. 메인 텍스처 UV 애니메이션
### 역할
- `Main Texture` 를 시간 기반으로 흐르게 만든다.

### 포함 노드
- `Main Texture Offset Intensity`
- `Time`
- `Multiply`
- `Tiling And Offset`

### 출력
- `Main Texture` 와 `Normal From Texture` 에 공통으로 들어가는 UV

### 메모
- 정적 왜곡이면 제거 가능
- 열기류, 에너지, 물결 계열에는 유지 추천

## 그룹 3. 왜곡 소스 생성
### 역할
- 메인 텍스처를 실제 왜곡 벡터로 해석한다.

### 포함 노드
- `Main Texture`
- `Sample Texture 2D`
- `Normal From Texture`
- 하단 `Subtract/Multiply/Add`
- `Distortion Type`

### 타입별 의미
- `Type01`: 메인 텍스처 샘플 직접 사용
- `Type02`: 노말 변환 결과 사용
- `Type03`: 메인 텍스처 샘플에 `R` 채널 가중을 곱한 변형

### 출력
- 선택된 왜곡 벡터

### 메모
- 이식 가치가 가장 높은 핵심 그룹
- 일반적으로는 `Type02` 만 따로 옮겨도 실전 활용도가 높다

## 그룹 4. 왜곡 강도 적용
### 역할
- 왜곡 소스에 최종 세기를 부여한다.

### 포함 노드
- `Vertex Color`
- `Split`
- `Distortion Intensity`
- `Multiply`

### 실제 영향값
- `왜곡 소스 * Distortion Intensity * Vertex Color A`

### 출력
- `Screen Position` 에 더해질 최종 왜곡 오프셋

### 메모
- 버텍스 알파 기반 제어가 필요 없으면 `Vertex Color A` 를 상수 `1` 로 대체 가능

## 그룹 5. 화면 샘플링 디스토션
### 역할
- 왜곡된 화면색을 만들어낸다.

### 포함 노드
- `Screen Position`
- `Add`
- `_GrabPassTransparent`
- `Sample Texture 2D`

### 출력
- 왜곡된 화면 색상

### 메모
- 이 그룹이 없으면 이 셰이더는 포스트 디스토션이 아니라 일반 UV 왜곡 셰이더가 된다

## 그룹 6. 최종 컬러 출력
### 역할
- 왜곡된 화면색을 스타일링해서 `Base Color` 로 보낸다.

### 포함 노드
- `Dot Product`
- `Color Mode`
- `Vertex Color`
- `Emission Intensity`
- `Multiply`

### 실제 영향
- `Color / Greyscale` 선택
- 버텍스 컬러 곱
- 최종 밝기 배율

### 메모
- `Emission Intensity` 이름이지만 실제 연결은 `Emission` 이 아니라 `Base Color` 쪽 마감 배율이다

## 그룹 7. 알파/마스크 제어
### 역할
- 효과가 어디에 보일지 결정한다.

### 포함 노드
- `Mask Texture`
- `Mask Intensity`
- `Distortion Alpha Range`
- `Remap`
- `Smoothstep`
- `Multiply`
- `Saturate`

### 실제 영향
- 메인 텍스처 `R`
- 버텍스 컬러 `A`
- 별도 마스크 텍스처
- 범위 커브 조절

### 메모
- 경계 페이드, 노이즈 컷, 영역 제한용으로 재사용 가치가 높다
