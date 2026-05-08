# Screen Monochrome Effect Shader - 이식 가능한 기능 조각

## 1. 화면 흑백 변환
### 목적
- 화면을 샘플링해서 RGB 또는 그레이스케일 값을 얻기

### 필요한 노드
- `_GrabPassTransparent`
- `Sample Texture 2D`
- `Dot Product`
- `Color Source`
- `Saturate`

### 입력
- 화면 텍스처
- 화면 UV

### 출력
- `RGB` 또는 `Grecy` 선택 결과

### 같이 가져오면 좋은 것
- `Emission Intensity`

### 제거 가능한 요소
- `Contrast`
- `Invert`
- `Pattern`
- `Mask`

### 추천 사용 상황
- 화면 흑백 포스트 이펙트 시작점

## 2. Contrast Remap
### 목적
- 입력 명암값을 새 min/max 기준으로 0~1 범위에 다시 배치

### 필요한 노드
- `Contrast`
- `Split`
- `Inverse Lerp`
- `Saturate`

### 입력
- 명암 입력값
- `_Contrast.x`
- `_Contrast.y`

### 출력
- 재매핑된 명암값

### 핵심 메모
- `_Contrast` 는 float 하나가 아니라 `Vector2(min, max)`
- 인스펙터에서는 `[Remap]` 어트리뷰트 덕분에 `MinMaxSlider` 형식으로 보임

### 의사코드
```c
float remapped = saturate(inverseLerp(_Contrast.x, _Contrast.y, inputValue));
```

### 추천 사용 상황
- 명암 문턱값 조정
- 흑백화 후 특정 범위만 강조
- 후처리 마스크 생성

## 3. Invert 토글
### 목적
- 재매핑된 명암을 반전 가능하게 만들기

### 필요한 노드
- `Invert`
- `One Minus`
- `Branch`

### 입력
- 원본 명암값
- `Invert`

### 출력
- 원본 또는 반전된 명암

### 의사코드
```c
float result = _Invert ? (1.0 - inputValue) : inputValue;
```

### 추천 사용 상황
- 밝은 부분 강조/어두운 부분 강조 전환

## 4. 패턴 UV 생성
### 목적
- 패턴 텍스처를 뷰 기준 또는 화면 기준으로 배치

### 필요한 노드
- `Pattern UV Mode`
- `VFX View Lock Obj Position`
- `ESG Compact Screen Position`
- `Pattern Scale`
- `Add`

### 입력
- UV 또는 Screen Position 계열 좌표
- `Pattern UV Mode`
- `Pattern Scale`

### 출력
- 패턴 텍스처용 UV

### 추천 사용 상황
- 스크린톤
- 모노크롬 패턴 오버레이

## 5. 패턴 치환
### 목적
- 흑백/명암 결과를 패턴 텍스처 기반 값으로 교체

### 필요한 노드
- `Test textrue`
- `Sample Texture 2D`
- `Pattern Range`
- `Smoothstep`
- `Saturate`
- `Change to Pattern`
- `Branch` 또는 `Lerp`

### 입력
- 원래 명암 결과
- 패턴 텍스처 샘플 결과
- `Pattern Range`
- `Change to Pattern`

### 출력
- 원래 명암 또는 패턴 치환 결과

### 추천 사용 상황
- 코믹풍 스크린톤
- 흑백 패턴 FX

## 6. 라인 왜곡 모듈
### 목적
- 패턴 UV에 방향성과 라인성 왜곡을 추가

### 필요한 노드
- `Use Distortion?`
- `Use Custom Dada?`
- `Center`
- `Distortion Intensity`
- `Distortion Range`
- `Line Count`
- `Line Mask Random`
- `Polar Coordinates`
- `Tiling And Offset`
- `Multiply`
- `Lerp`

### 입력
- 기준 UV
- 중심점
- 왜곡 강도/범위
- 라인 개수
- 라인 랜덤값

### 출력
- 왜곡된 패턴 UV

### 메모
- 이 조각은 구조가 가장 크고 의존성도 많음
- 단독 이식보다 패턴 UV 생성 모듈과 함께 가져가는 편이 자연스럽다

## 7. 마스크 알파
### 목적
- 최종 효과의 알파 영역을 독립 제어

### 필요한 노드
- `Mask Texture`
- `Sample Texture 2D`
- `Mssk Ins`
- `Multiply`
- `Saturate`

### 입력
- 마스크 텍스처
- 마스크 UV
- `Mssk Ins`

### 출력
- 최종 알파

### 추천 사용 상황
- 다른 셰이더의 알파 라인만 교체하고 싶을 때

## 8. 최종 밝기 마감
### 목적
- 명암 또는 패턴 결과를 최종 컬러로 마감

### 필요한 노드
- `Emission Intensity`
- `Multiply`

### 입력
- 최종 shade 값
- `_EmissionIntensity`

### 출력
- `BaseColor`

### 추천 사용 상황
- 단일 채널 결과를 최종 화면 밝기로 넘길 때

## 빠른 조합 예시
### 가장 작은 흑백 셰이더
- `화면 흑백 변환`
- `Contrast Remap`
- `Invert 토글`
- `최종 밝기 마감`

### 스크린톤형 셰이더
- `화면 흑백 변환`
- `Contrast Remap`
- `패턴 UV 생성`
- `패턴 치환`
- `최종 밝기 마감`

### 라인 왜곡 포함형
- `화면 흑백 변환`
- `Contrast Remap`
- `패턴 UV 생성`
- `라인 왜곡 모듈`
- `패턴 치환`
- `마스크 알파`
- `최종 밝기 마감`

## 가장 중요한 재사용 포인트
- 이 셰이더에서 가장 독립적으로 가치가 높은 조각은 `Contrast Remap`
- 가장 스타일 영향이 큰 조각은 `패턴 치환`
- 가장 프로젝트 의존성이 큰 조각은 `라인 왜곡 모듈`
