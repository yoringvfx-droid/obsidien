# Screen Monochrome Effect Shader - 그룹별 분석

## 그룹 1. 화면 샘플링과 색상 원본 선택
### 역할
- 현재 화면을 가져오고, RGB 그대로 쓸지 그레이스케일로 바꿀지 결정

### 핵심 노드
- `_GrabPassTransparent`
- `Sample Texture 2D`
- `Dot Product`
- `Color Source`
- `Saturate`

### 해석
- `Color Source = RGB` 이면 원래 화면색 유지
- `Color Source = Grecy` 이면 `Dot Product(0.299, 0.587, 0.114)` 기반 흑백값 사용

### 이식 포인트
- 다른 셰이더에도 가장 쉽게 붙일 수 있는 전처리 모듈

## 그룹 2. Contrast 범위 재매핑
### 역할
- 흑백값 또는 선택된 색상값을 새 명암 범위로 재배치

### 핵심 노드
- `Contrast`
- `Split`
- `Inverse Lerp`
- `Saturate`

### 실제 동작
- `Contrast.x -> Inverse Lerp.A`
- `Contrast.y -> Inverse Lerp.B`
- `입력 명암값 -> Inverse Lerp.T`

### 의미
- `_Contrast` 는 `입력값이 어느 구간에서 0~1로 압축/확장될지` 정하는 범위
- 일반적인 “contrast multiplier” 개념으로 이해하면 나중에 헷갈리기 쉽다

### 이식 포인트
- 범용 `Threshold Range Remap` 모듈로 재사용 가능

## 그룹 3. Invert 분기
### 역할
- 재매핑된 명암을 뒤집을지 결정

### 핵심 노드
- `Invert`
- `One Minus`
- `Branch`

### 실제 동작
- `Invert = true` 이면 `1 - 명암`
- `Invert = false` 이면 원래 명암 유지

## 그룹 4. 패턴 UV 생성
### 역할
- 패턴 텍스처가 어떤 좌표계로 샘플링될지 결정

### 핵심 노드
- `Pattern UV Mode`
- `VFX View Lock Obj Position`
- `ESG Compact Screen Position`
- `Pattern Scale`
- `Add`
- `Sample Texture 2D`

### 모드
- `View`
- `ScreenSize`

### 해석
- 패턴이 뷰 고정인지, 화면 크기 기준인지 선택

## 그룹 5. 라인 왜곡 / 방향 결정
### 역할
- 패턴 UV에 추가 왜곡을 줘서 단조로운 스크린톤이 아니라 라인성 왜곡을 넣음

### 핵심 노드
- `Use Distortion?`
- `Use Custom Dada?`
- `Center`
- `Distortion Intensity`
- `Distortion Range`
- `Line Count`
- `Line Mask Random`
- `Polar Coordinates`
- `Tiling And Offset`
- `Lerp`
- `Multiply`

### 해석
- 화면 기준 좌표를 중심점 기준으로 재해석하고
- 라인 수, 왜곡 강도, 랜덤성으로 방향성과 패턴 변형을 만든다

### 메모
- `Use Custom Dada?` 는 추가 입력 채널 선택용 키워드처럼 보이지만, 이름이 불분명해 문서에 반드시 별도 메모가 필요

## 그룹 6. 패턴 치환
### 역할
- 원래 명암 결과를 유지할지, 패턴 텍스처 기반 값으로 바꿀지 선택

### 핵심 노드
- `Test textrue`
- `Pattern Range`
- `Smoothstep`
- `Saturate`
- `Change to Pattern`
- `Branch` / `Lerp`

### 해석
- 단순 흑백이 아니라 스크린톤처럼 보이게 만드는 핵심 그룹

## 그룹 7. 마스크와 최종 출력
### 역할
- 알파와 최종 발광 배율 결정

### 핵심 노드
- `Mask Texture`
- `Mssk Ins`
- `Emission Intensity`
- `Multiply`
- `Saturate`

### 출력
- `BaseColor`
- `Alpha`
