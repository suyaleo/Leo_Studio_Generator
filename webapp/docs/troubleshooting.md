# 문제 해결

Leo Studio가 렌더를 거절하면 이유와 할 일을 말합니다. 사람들이 실제로 보는 메시지입니다.

## 메모리와 이 맥의 티어 {#memory}

헤더 상태 칩이 메모리를 한눈에 보여 줍니다. 누르면 **티어**, **메모리**, **헬퍼**, **모델**, **대기열**, **렌더**. **티어**를 누르면 이 맥이 돌릴 수 있는 것이 나옵니다.

- *"Helper killed by the OS — out of memory"* — macOS가 렌더를 죽였습니다. 메모리 많이 쓰는 앱(브라우저, Slack, iOS Simulator)을 닫고 다시, 또는 품질을 **Quick**으로. 메모리가 약 절반입니다.
- *"Image pre-flight: … needs a N GB Mac"* — 그 이미지 엔진이 이 맥에 안 맞습니다. **Auto**나 더 가벼운 프리셋. *needs ~N GB free*는 맞지만 다른 앱이 지금 메모리를 잡고 있습니다.
- *"Training needs at least 24 GB of memory"* — 이 맥에서 캐릭터 학습을 못 합니다.

### 36–60 GB 맥의 Hailuo H3 {#h3-compact}

H3 풀 엔진은 60 GB가 필요합니다. 36 GB부터는 컴팩트 Q8 엔진입니다. 한 번 빌드해야 합니다.

> *"Hailuo H3 runs on this Mac — on its reduced-RAM lane … Run 'Install Hailuo H3' … (~5 minutes, ~22 GB on disk, no extra download)."*

그다음 설정 → **Hailuo H3 모델** → Automatic 또는 Compact. 36 GB 미만이면 H3는 없습니다. LTX로 하세요. 모든 모드가 됩니다.

## 모델·애드온이 없음 {#missing}

- *"Extend needs the LTX-2.5 High add-on (the Q8 model), which isn't downloaded on this Mac yet"* — 키프레임·High 품질도 같습니다. 모델 창에서 설치(상태 칩 → **모델**).
- *"Upscale & Face Fix needs the LTX-2.5 Pixel Spatial Upscaler adapter"* — 모델 창에서 받은 뒤 다시 렌더.
- *"Stopped before rendering — the model weights are incomplete"* — 받기가 끊겼습니다. 모델 창에서 이어 받으세요. 설정 → **모델 파일 검증**이 모든 파일을 확인하고 깨진 것만 다시 받기를 줍니다.

## "Click Update" — 패널보다 오래된 엔진 {#stale-engine}

*"This install's vendored engine predates LTX-2.5's text encoder … Click Update — and if the first click only moves the panel, click it once more."*

패널만 업데이트되고 아래 엔진은 아닙니다. 한 번 더 업데이트하세요. 오래된 버전은 업데이터를 먼저 바꿉니다. H3는 *"the installed Hailuo H3 runner is behind this panel"* — **Install Hailuo H3**를 다시. 디스크의 가중치는 유지됩니다.

업데이트했는데도 옛 버전처럼 동작하면 옛 코드가 아직 돌고 있습니다. 버전 칩이 **Leo Studio 재시작**이면 그걸 누르거나 패널을 끄고 다시 켜세요.

## GPU 워치독 {#gpu-watchdog}

*"the macOS GPU watchdog killed a Metal command buffer"* — macOS가 너무 긴 GPU 작업을 끊었습니다. 드라이버 수준 킬이지 Leo Studio 버그 리포트가 아닙니다. 나머지 세션은 프롬프트 인코딩을 더 짧게 재시도합니다. 반복되면 칩·macOS 버전·크래시 로그가 있는 GitHub 이슈로 이어집니다.

## 재시작 후 대기열 {#queue-restart}

패널을 다시 켜면 대기열이 이어집니다. 멈춘 채로 꺼졌으면 알아서 다시 시작하고, 로그가 말합니다.

## 로그 읽기 {#logs}

아래 패널 **로그**가 렌더 로그입니다. 렌더가 죽으면 `step:`으로 시작하는 마지막 줄이 도달한 단계입니다. 신고에 그걸 넣으세요.

## 이슈 신고 {#report}

헤더 버그 버튼이 **버그 신고**를 엽니다. 버전, 맥 정보, 로그 마지막 50줄을 채우고 GitHub 이슈를 새 탭으로 엽니다. 거기서 제출하기 전에는 아무것도 안 나갑니다. 이슈: [github.com/mrbizarro/phosphene/issues](https://github.com/mrbizarro/phosphene/issues).
