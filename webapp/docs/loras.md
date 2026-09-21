# LoRAs

LoRA는 얼굴·스타일·모션·가속을 모델에 가르치는 작은 애드온입니다. 영상 폼의 **LoRAs** 섹션(이미지에도 옮겨 감)에서 켭니다.

## 피커 {#picker}

- 요약은 *없음*, 또는 설치·활성 개수.
- 행을 눌러 켜고 끕니다. 켜면 첫 트리거가 프롬프트에 들어갑니다. 활성 행의 트리거 칩이 다시 넣습니다.
- **strength** — −2에서 2. 권장값 또는 1.0에서 시작.
- LoRA가 다섯 개 이상이면 이름·트리거로 필터.
- 행 버튼: 표시 이름 바꾸기, 파일 받기, CivitAI에서 열기, 디스크에서 삭제(먼저 물음. 영구).
- **가이드 쓰기**는 기획 모델이 LoRA가 하는 일, 프롬프트 법, 시작 강도를 씁니다.
- **?**는 계열이 모름 — 이 엔진에서 될 수도 안 될 수도. **Update**는 CivitAI에 새 버전(**업데이트 확인**).

LoRA는 엔진별입니다. LTX LoRA는 Hailuo H3에 안 올라가고 반대도 같습니다. 피커는 활성 엔진 라이브러리를 보여주고 *다른 모드 N개 보기*를 줍니다.

## CivitAI와 Hugging Face 둘러보기 {#browse}

**CivitAI 찾아보기**가 브라우저를 엽니다.

1. 소스 — **CivitAI** 또는 **Hugging Face** — 엔진: **All**, **LTX**, **Hailuo H3**.
2. 검색(이름, 스타일, 제작자. Hugging Face는 `author:someone` 또는 `owner/repo`) 후 Enter.
3. 결과에 **Install**. `mlx_models/loras/`에 들어가 피커에서 켜집니다. 다른 엔진용이면 어느 엔진으로 바꾸라고 말합니다.

CivitAI 받기는 API 키가 필요합니다. 브라우저 배너 또는 설정 → **API 토큰**. Hugging Face는 종류(Characters, Styles, Motion, Speed)와 **With example**로 걸러지고, 설치 전에 리포를 읽으세요.

## 파일을 직접 넣기 {#import}

- **LTX** — `.safetensors`를 `mlx_models/loras/`에 복사하고 재스캔.
- **Hailuo H3** — **H3 LoRA 가져오기**가 `.safetensors`(최대 4 GB)를 읽고 권장 강도를 말합니다.

## Hailuo H3에서 LoRA 쌓기 {#h3-stacking}

- 쌓는 H3 설치에서는 렌더당 **LoRA 최대 4개**, 강도 각각, Turbo는 같이 탑니다. 강도 합은 1.5 근처 이하. 같은 것을 당기는 LoRA 둘(얼굴 둘, 스타일 둘)은 피하세요.
- 옛 H3는 **어댑터 슬롯 하나**: **Adapter** 행이 이 렌더에 **Turbo** 또는 **내 LoRA**. 허용보다 많이 고르면 몇 개를 빼라고 하고 잡이 멈춥니다.
