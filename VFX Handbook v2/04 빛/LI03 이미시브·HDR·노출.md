---
title: "LI03 이미시브·HDR·노출"
id: LI03
chapter: "04 빛"
type: principle
tags:
  - vfx-handbook
  - light
sources: [L40, L41, L48, L49, L52, L53, L54, L55, L56]
evidence: []
---

# 이미시브·HDR·노출

> [!abstract] 원리
> **임계값과 배율로 블룸 자격을 정하고 텍스처 안에 휘도 위계를 둔다. 노출·톤매핑과 같이 본다.**

## 왜
- 임계값(threshold)이 어떤 요소가 블룸할 자격이 있는지 정한다. 핵심 예술적 제어다.
- 이미시브(emissive)가 균일하게 밝으면 블룸도 균일해져 초점과 펀치가 사라진다.
- 자동 노출(eye adaptation) 환경에서는 블룸이 예측 불가하게 변한다. 어두운 복도에서 괜찮던 이펙트가 밝은 야외에서 날아갈 수 있다.
- 같은 이미시브 값도 톤매핑(tone mapping) 곡선(ACES, Filmic, Reinhard)에 따라 전혀 다른 블룸으로 보인다. 곡선은 프로젝트 파이프라인 기준으로 보정한다.

## 규칙
- 처리 순서는 HDR 프레임 캡처 → 임계 패스 → 블러(Gaussian, dual-pass, 컨볼루션 커널) → 가산 합성 → 톤매핑이다.
- 이미시브는 임계값을 넘는 HDR 강도(휘도)로 쓴다. 배율 예는 3–10×다.
- 임계값 바로 위로 방출하면 부드러운 미세 글로우, 훨씬 위로 방출하면 하드하고 강한 버스트가 된다.
- 텍스처 안에 밝기 위계를 심는다. 코어가 가장 밝고 바깥은 임계값 쪽으로 페더한다.
- 불에서는 불꽃 코어만 블룸시키고, 가산 렌더링되는 연기 파티클은 이미시브 맵으로 분리한다.
- 노출 대응은 이미시브를 Eye Adaptation 값으로 나눠 정규화한다. 낮/밤, 실내/실외 같은 문맥별 HDR 배율과 영역별 포스트 프로세스 볼륨의 "VFX Multiplier"를 둔다.
- 다른 후처리와 함께 보정한다. 렌즈 플레어는 중간 강도로 초점 블룸과 경쟁시키지 않고, 글레어·스타버스트는 중간 강도로 방사 블룸의 방향성을 보완한다. DoF는 낮게, 컬러 그레이딩은 블룸 틴트가 그레이드를 존중한다.

## 체크
- [ ] 이미시브 텍스처가 코어 > 바깥 순서의 밝기 구배를 갖는가. 균일하면 블룸도 균일하다.
- [ ] 어두운 곳과 밝은 곳에서 같은 이펙트의 블룸이 비슷하게 보이는가.
- [ ] 연기 파티클이 불꽃 코어와 함께 블룸에 걸리지 않는가.

## 연결
- [[LI02 블룸 — 다리이자 대비 킬러]]
- [[LI01 빛의 4층위]]
- [[LI05 화면 레벨 장치]]

## 출처
- [[LIT — HDR & Bloom — Art Perspective]] § How Bloom Works · L40, L41
- [[LIT — HDR & Bloom — Art Perspective]] § Emissive Design for Bloom: 1 · L48
- [[LIT — HDR & Bloom — Art Perspective]] § Emissive Design for Bloom: 2 / Common Mistakes · L49
- [[LIT — HDR & Bloom — Art Perspective]] § Emissive Design for Bloom: 5 · L52
- [[LIT — HDR & Bloom — Art Perspective]] § Environment Interaction: Eye Adaptation and Exposure · L53, L54
- [[LIT — HDR & Bloom — Art Perspective]] § Bloom in Relation to Other Effects · L55, L56
