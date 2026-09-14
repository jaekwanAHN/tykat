# SKILL / CAST

기술명 타이핑 액션 게임. 현재 **Phase 4 — Typing Metrics**까지 구현했습니다.

## 실행

Node.js 20.9 이상 필요 (개발/검증: Node 24).

이 작업 환경에서 Turbopack의 CSS 처리 중 내부 포트 권한 오류가 발생해 개발/빌드 명령은 Next.js가 지원하는 Webpack을 사용합니다.

```sh
npm ci
npm run dev
```

http://localhost:3000 에서 전투 시작 → 기술명을 정확히 입력하고 Enter로 발동합니다.
플레이어 HP 100, 오우거 HP 200, 적 공격은 5초마다 피해 20입니다.
참격 10 / 화염참격 25 / 폭염연옥참 50 피해, 치유 +30 HP(최대 100), 회피 1초입니다.
회피는 전투 시간 기준이며 재사용 시 1초로 갱신합니다. 쿨다운은 없습니다.
공백을 포함한 불일치와 빈 Enter는 CAST FAILED로 처리하고 입력창을 비웁니다.
한글 조합 확정 Enter는 발동하지 않습니다. 조합을 끝낸 뒤 Enter를 한 번 더 누르세요.
시작/초기화 시 입력창에 포커스하며, 전투장 클릭이나 창 복귀로 포커스를 회복합니다. Tab 이동은 가로채지 않습니다.
어느 한쪽 HP가 0이면 전투를 멈추며 전투 초기화 버튼으로 재시작합니다.
Canvas에 참격 궤적, 화염 파티클, 폭염연옥참 교차 참격/flash/강한 흔들림, 데미지 숫자와 기술명을 표시합니다.
피격 시 붉은 flash와 밀림, 치유 시 실제 회복량과 상승 파티클, 회피 시 옆 이동과 성공 시 DODGE!가 표시됩니다.
정식 결과 화면은 Phase 5에서 구현합니다.

### Perfect와 통계

- 첫 키 입력/한글 조합 시작부터 발동 Enter까지 시간을 측정합니다. 대기·조합 확정 시간과 탭을 벗어난 시간도 포함합니다.
- 참격·회피·치유 900ms, 화염참격 1500ms, 폭염연옥참 2000ms 이내에 오타 수정 없이 성공하면 Perfect입니다. 붙여넣기/드롭/자동 입력은 제외합니다.
- Perfect 공격 피해는 1.5배 반올림(15/38/75)입니다. 회피 시간과 치유량에는 배율이 없으며 Perfect 횟수에는 포함됩니다.
- Combo는 기술 성공마다 +1, 잘못된 기술/빈 Enter/피격 시 0입니다. 회피 성공은 유지합니다.
- ACC는 제출 문자열 중 가장 가까운 기술명과 위치가 같은 문자 수 ÷ (제출 문자 수 + Backspace/Delete/잘라내기 수정 횟수)입니다. IME 조합 중간 자모는 세지 않습니다. 빈 Enter는 Combo만 초기화하며 문자 정확도 분모를 늘리지 않습니다.
- WPM은 제출한 완성형 문자 5개를 한 단어로 보고 입력 시도 시간으로 계산합니다. 실패 시도도 포함하며 붙여넣기 등 보조 입력은 제외합니다. 기술 사이 대기 시간은 제외합니다. 일반 영문 타자 측정치와 직접 비교할 수 없습니다.
- 초기값은 ACC 100%, WPM 0입니다. 전투 초기화 시 모든 통계를 초기화합니다.

## 구조

- `src/game/engine/GameEngine.ts`: DOM에 의존하지 않는 전투 상태와 시간/피해 계산
- `src/game/engine/Renderer.ts`: 도형 기반 Canvas 2D 장면
- `src/components/game/GameCanvas.tsx`: RAF, ResizeObserver, DPR, lifecycle
- `src/components/game/Game.tsx`: React HP/타이머 HUD와 전투 조작
- `src/components/game/SkillInput.tsx`: 기술명 입력, IME 처리, 부분 일치 강조
- `src/game/data/skills.ts`: 5개 기술 데이터, 정확한 매칭과 치유 계산
- `src/game/effects/`: 전투 이벤트 타입, 효과 수명/파티클/움직임과 Canvas 효과 렌더링
- `src/lib/typing/`: 입력 시도 추적과 Perfect/피해/Accuracy/WPM 순수 계산

전투 이벤트를 Canvas lifecycle의 EffectSystem에 직접 전달합니다. UI를 흔들지 않으며, 전투 종료 후에도 마지막 효과는 끝까지 재생합니다. 초기화 시 효과를 비우고, 연속 사용 시 파티클 240개/효과 24개로 제한합니다. 같은 이벤트 지점에 추후 효과음을 연결할 수 있습니다.

HUD 타이머는 최대 초당 10회, HP/상태 변경은 즉시 전달합니다. 프레임 시간은 최대 100ms로 제한하고 숨겨진 탭의 전투 시간은 정지합니다. 긴 프레임 지연에는 실제 벽시계보다 전투 시간이 느려질 수 있습니다.

## 검증

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

단위 테스트는 공격 주기/FPS 독립성, HP 하한, 종료/초기화, 지연 프레임, UI 통지 빈도를 검증합니다.
단위 테스트는 기술 매칭, 3종 피해, 회피 경계/갱신, 치유 상한, 종료 이후 입력 차단도 검증합니다.
브라우저 테스트는 기술명 입력/적 공격/종료/초기화, DPR/리사이즈, 조합 이벤트, 연속 Enter, 포커스 복귀, 치유/회피를 검증합니다.

### 실제 IME 수동 확인 (Mac / Windows Chrome)

Linux Chromium의 자동 composition 이벤트 검사는 OS 한글 입력기를 대체하지 않습니다. 다음 항목은 대상 OS에서 추가 수동 확인이 필요합니다.

1. 한글 입력기로 `화염참격`을 입력하고 마지막 글자 조합 중 Enter: HP는 그대로, 입력값은 유지.
2. 다음 Enter: 적 HP가 200 → 175, 입력창은 비워짐.
3. `폭염연옥참` 연속 입력, 오타 후 Backspace 수정, 빈 Enter, Enter 길게 누르기 확인.
4. 조합 중 전투 초기화/탭 전환 후 입력 복귀가 정상인지 확인.
