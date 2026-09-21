# 이미지

이미지 탭은 스틸을 만듭니다. 엔진 두 종류: **Reference Edit**는 준 이미지를 다시 그리고, **Ideogram 4**는 그림에 글자를 넣습니다.

## 엔진 고르기 {#engines}

| 엔진 | 용도 |
|---|---|
| **Auto (설정 따름)** | 이 맥에 대해 설정이 고른 것 |
| **Reference Edit — Fast** | 이미지→이미지 4스텝, 약 1:20, 레퍼런스 여러 장 — 기본 |
| **Reference Edit — Standard** | 8스텝, 약 2:05, LoRA 없음 |
| **Reference Edit — Quality** | 40스텝, 약 3:50 — 최종 |
| **Ideogram 4 — 타이포·레이아웃** | 이미지 안 글자, 레퍼런스 선택 |

메뉴 옆 칩이 다운로드 여부를 말합니다. 이 맥 메모리보다 큰 엔진은 회색이고 *N GB 맥 필요*입니다.

## 레퍼런스 이미지 {#references}

Reference Edit는 그림이 최소 하나 필요합니다. **Primary**에 넣고, **Multi-ref**에 최대 둘 더(*최근 업로드*에서 클릭). 두 장 이상이면 프롬프트에 이름을 적으세요 — *레퍼런스 1의 재킷과 레퍼런스 2의 거리*.

그다음 **Aspect**(기본 16:9 1280×720, 더 작으면 더 빠름), **Candidates (n)** — 한 번에 1–8장 — **Seed**, **생성**([[sc:prompt.generate]]).

## Ideogram 4 — 그림 위 글자 {#ideogram}

첫 렌더가 Ideogram 4를 받습니다(약 28 GB, 한 번). 상업 사용은 Ideogram 라이선스가 필요합니다.

- **Simple** — 그냥 프롬프트. **Layout** — 아래 캔버스.
- **Render**: **Design**(일러스트, 그래픽) 또는 **Photographic**(카메라).
- **품질**: Default(20스텝), Turbo(12, 더 빠름), Quality(48, 더 느림). **⚡ Fast mode**는 M1/M2·작은 맥용으로 메모리를 덜 씁니다.
- 레퍼런스가 있으면 **Use reference**: Ideogram이 픽셀 복사가 아니라 설명으로 다시 그립니다. 끄면 레퍼런스는 무시되고, 패널이 경고합니다.
- **Image palette**는 색 최대 16개.

### Layout 캔버스 {#layout}

1. **Layout**을 고릅니다. 프레임에 드래그해서 박스를 그리거나 **Insert text** / **Insert object**. **Examples…**가 포스터·로고·라벨·밈 레이아웃을 넣습니다.
2. 박스를 고르면 **Region**(Text 또는 Object), **Text (literal words)**, 선택 설명, **Style**, **Align**, **Color**.
3. **Snap**이 켜져 있으면 삼등분·중심·서로에 붙습니다.

박스 선택된 캔버스 키:

[[shortcuts:canvas]]

Layout 렌더는 박스가 최소 하나 필요합니다.
