# Screen Monochrome Effect Shader - 적용 체크리스트

## 최소 이식 세트
- 화면 샘플 텍스처 소스
- `Color Source`
- `_Contrast`
- `Invert`
- `Emission Intensity`

## 패턴화까지 이식할 때
- `Test textrue`
- `Pattern UV Mode`
- `Pattern Scale`
- `Pattern Range`
- `Change to Pattern`

## 라인 왜곡까지 이식할 때
- `Center`
- `Distortion Intensity`
- `Distortion Range`
- `Line Count`
- `Line Mask Random`
- `Use Distortion?`
- `Use Custom Dada?`

## 알파까지 유지할 때
- `Mask Texture`
- `Mssk Ins`

## 가장 실용적인 재사용 단위
1. `Screen Sample -> Greyscale -> Contrast Remap -> Invert`
2. `Pattern UV -> Pattern Texture -> Pattern Replace`
3. `Mask Texture -> Alpha`

## 주의점
- `_Contrast` 를 float 하나로 오해하면 원래 결과가 안 나온다
- `Use Custom Dada?` 와 일부 어트리뷰트는 이름이 불명확해 이식 시 의도를 다시 점검해야 한다
- `_GrabPassTransparent` 의 대체 소스를 프로젝트 렌더러에 맞게 바꿔야 한다
