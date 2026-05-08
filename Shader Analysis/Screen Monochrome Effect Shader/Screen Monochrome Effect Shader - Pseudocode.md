# Screen Monochrome Effect Shader - Pseudocode

```c
// 1) Screen sample
float4 screenSample = Sample(_GrabPassTransparent, screenUV);

// 2) RGB or grayscale source
float grey = dot(screenSample.rgb, float3(0.299, 0.587, 0.114));
float sourceValue = (ColorSource == Grecy) ? grey : saturate(screenSample.r + screenSample.g + screenSample.b);

// 3) Contrast remap
float contrastMin = _Contrast.x;
float contrastMax = _Contrast.y;
float remappedValue = saturate(inverseLerp(contrastMin, contrastMax, saturate(sourceValue)));

// 4) Invert
float baseShade = _Invert ? (1.0 - remappedValue) : remappedValue;

// 5) Pattern UV + distortion
float2 patternUV = BuildPatternUV(PatternUVMode, Center, PatternScale, DistortionIntensity, DistortionRange, LineCount, LineMaskRandom, ...);
float patternTex = Sample(TestTexture, patternUV).r;

// 6) Pattern shaping
float patternShade = saturate(patternTex + PatternRange);
float finalShade = _ChangeToPattern ? patternShade : baseShade;

// 7) Final color and alpha
float3 finalColor = finalShade.xxx * _EmissionIntensity;
float finalAlpha = saturate(Sample(MaskTexture, screenUV).r * _MsskIns);

return float4(finalColor, finalAlpha);
```

## 해석 메모
- 실제 그래프는 패턴 UV와 왜곡 경로가 더 복잡하지만, 재사용 관점 핵심은 위 흐름이다.
- `_Contrast` 부분만 따로 떼어 다른 셰이더에 이식해도 가치가 높다.
