# 02_Simple PP Distortion Effect Shader - Pseudocode

```c
// 1) Animated UV for distortion source
float2 animatedUV = MainUV + (_MainTexOffsetIntensity * Time);

// 2) Build distortion source
float4 mainSample = Sample(MainTexture, animatedUV);
float3 normalLike = NormalFromTexture(MainTexture, animatedUV);

float2 uvAspectBase = BuildAspectCorrectedUV(...);
float2 customDistortion = ((uvAspectBase - 0.5) * aspectScale) + 0.5;

float4 distortionSource;
switch (DistortionType)
{
    case Type01:
        distortionSource = mainSample;
        break;
    case Type02:
        distortionSource = float4(normalLike, 1.0);
        break;
    case Type03:
        distortionSource = mainSample * mainSample.r;
        break;
}

// 3) Apply strength
float distortionMask = VertexColor.a * _DistortionIntensity;
float4 distortionOffset = distortionSource * distortionMask;

// 4) Distorted screen sample
float4 screenUV = ScreenPosition + distortionOffset;
float4 distortedScreen = Sample(_GrabPassTransparent, screenUV.xy);

// 5) Color mode
float grey = dot(distortedScreen.rgb, float3(0.299, 0.587, 0.114));
float3 colorOutput = (ColorMode == GreyScale)
    ? grey.xxx
    : distortedScreen.rgb;

// 6) Final color
float3 finalColor = colorOutput * VertexColor.rgb * _EmissionIntensity;

// 7) Alpha
float alphaBase = mainSample.r * VertexColor.a;
float alphaRange = Remap(_DistortionAlphaRange, 0..1, 1..0.01);
float alphaCurve = Smoothstep(0, alphaRange, alphaBase);
float mask = Sample(MaskTexture, mainUV).r * _MaskIntensity;
float finalAlpha = saturate(alphaCurve * mask);

return float4(finalColor, finalAlpha);
```

## 해석 포인트
- 이 셰이더의 핵심 출력은 `finalColor` 보다 `screenUV` 생성이다.
- `Main Texture` 는 색상이 아니라 왜곡 패턴 데이터로 보는 게 맞다.
- `finalAlpha` 는 색상 라인과 독립적이라서 별도 재활용이 쉽다.
