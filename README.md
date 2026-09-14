# SKILL / CAST

기술명 타이핑 액션 게임. 현재 **Phase 1 — 전투 Core**만 구현했습니다.

## 실행

Node.js 20.9 이상 필요 (개발/검증: Node 24).

이 작업 환경에서 Turbopack의 CSS 처리 중 내부 포트 권한 오류가 발생해 개발/빌드 명령은 Next.js가 지원하는 Webpack을 사용합니다.

```sh
npm ci
npm run dev
```

http://localhost:3000 에서 전투 시작 → 임시 참격 버튼으로 공격합니다.
플레이어 HP 100, 오우거 HP 200, 참격 피해 10, 적 공격은 5초마다 피해 20입니다.
어느 한쪽 HP가 0이면 전투를 멈추며 전투 초기화 버튼으로 재시작합니다.
타이핑, 스킬 효과, Perfect/통계, 정식 결과 화면은 이후 Phase에서 구현합니다.

## 구조

- `src/game/engine/GameEngine.ts`: DOM에 의존하지 않는 전투 상태와 시간/피해 계산
- `src/game/engine/Renderer.ts`: 도형 기반 Canvas 2D 장면
- `src/components/game/GameCanvas.tsx`: RAF, ResizeObserver, DPR, lifecycle
- `src/components/game/Game.tsx`: React HP/타이머 HUD와 검증용 조작

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
브라우저 테스트는 시작/버튼 공격/적 공격/종료/초기화와 DPR/리사이즈를 검증합니다.
한글 IME 실제 입력 검증은 Phase 2 범위입니다.
