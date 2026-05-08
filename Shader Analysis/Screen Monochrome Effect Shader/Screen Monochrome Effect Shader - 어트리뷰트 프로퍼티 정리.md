# Screen Monochrome Effect Shader - 어트리뷰트 프로퍼티 정리

## 가장 중요한 사례: Contrast 의 `[Remap]`

### 원본 형태
- 프로퍼티 이름: `Contrast`
- 타입: `Vector2`
- 레퍼런스명: `_Contrast`
- 어트리뷰트: `Remap`
- 기본값: `(0.0, 1.0)`

### 이 어트리뷰트가 의미하는 것
- 머티리얼 인스펙터에서 `Vector2` 를 일반 2칸 입력으로 보여주는 대신
- `Min`, `Max`, 그리고 중앙의 `MinMaxSlider` 형태로 표시해주는 드로어다

### 확인한 근거
- 프로젝트 내 샘플 코드:
  - `Assets/Packages/Samples/Shader Graph/17.2.0/Custom Material Property Drawers/Editor/RemapDrawer.cs`
  - `Assets/Packages/Samples/Shader Graph/17.2.0/Custom Material Property Drawers/RemapDrawerExample.shadergraph`

### 드로어 동작 요약
- 파라미터 없는 `[Remap]` 은 기본 범위를 `[0, 1]` 로 사용
- `prop.vectorValue.x` 를 `Min`
- `prop.vectorValue.y` 를 `Max`
- 인스펙터에서 두 값과 슬라이더를 함께 편집

### 이 셰이더에서의 실제 사용 방식
- `_Contrast -> Split`
- `Split.R -> Inverse Lerp.A`
- `Split.G -> Inverse Lerp.B`

즉 `_Contrast` 는:
- `Contrast.x = 명암값이 0으로 취급되기 시작하는 지점`
- `Contrast.y = 명암값이 1로 취급되기 시작하는 지점`

### 나중에 안 헷갈리기 위한 기억 문장
`_Contrast 는 contrast multiplier 가 아니라 inverse-lerp min/max range 프로퍼티다.`

### 나중에 직접 다시 만들 때
1. `Vector2` 프로퍼티를 만든다
2. 프로퍼티에 `[Remap]` 어트리뷰트를 붙인다
3. `Split` 으로 `x/y` 를 꺼낸다
4. `Inverse Lerp(A=min, B=max, T=input)` 에 넣는다

### 의사코드
```c
float minV = _Contrast.x;
float maxV = _Contrast.y;
float contrasted = saturate( inverseLerp(minV, maxV, inputValue) );
```

## 이 셰이더에서 확인된 다른 어트리뷰트 프로퍼티

### 1. Distortion Intensity
- 프로퍼티: `_DistortionIntensity`
- 어트리뷰트: `MyCustomAttribute`
- 상태: 저장소 전체에서 동일 이름의 구현 코드를 찾지 못함
- 해석: 현재 프로젝트 기준으로는 실동작이 불명확한 커스텀/임시/레거시 메타데이터 가능성 높음

### 2. Distortion Range
- 프로퍼티: `_DistortionRange`
- 어트리뷰트: `MyCustomAttribute`
- 상태: 위와 동일
- 메모: `Remap` 처럼 동작이 확인된 어트리뷰트와 달리, 실제 에디터 표시/제어 변화는 코드 확인 불가

### 3. Line Count
- 프로퍼티: `_LineCount`
- 어트리뷰트: `_USEFRESNELEFFECT__0__1`
- 상태: 저장소에서 이 이름을 해석하는 드로어/코드는 찾지 못함
- 해석: 키워드 조건부 표시용으로 생성된 내부 문자열이거나, 레거시 속성 흔적일 가능성이 높음

## 결론
- 이번 셰이더에서 신뢰도 높게 해석 가능한 어트리뷰트는 `Contrast` 의 `[Remap]`
- 나머지 어트리뷰트는 이름은 남아 있지만, 프로젝트 코드 기준으로 동작 구현을 확인하지 못했으므로 문서에 `불명/추가 확인 필요` 로 남겨두는 것이 안전
