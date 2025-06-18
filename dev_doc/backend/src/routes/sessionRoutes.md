# `backend/src/routes/sessionRoutes.ts` 코드 설명

이 파일은 사용자 세션(Session) 관리와 관련된 API 엔드포인트를 정의하는 라우터입니다. 사용자는 이 API들을 통해 현재 활성화된 세션 목록을 확인하고, 특정 세션을 종료하거나, 현재 사용 중인 세션을 제외한 모든 세션을 한 번에 종료할 수 있습니다.

---

## 기본 설정 및 미들웨어

```typescript
import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/security';
import * as sessionController from '../controllers/sessionController';

const router = express.Router();

// 모든 세션 라우트에 인증 미들웨어 적용
router.use(authenticateToken);
```

-   **`express.Router()`**: Express 프레임워크의 라우터를 생성하여 세션 관련 경로들을 모듈화합니다.
-   **`authenticateToken`**: `/backend/src/middlewares/auth.ts`에 정의된 JWT 기반 인증 미들웨어입니다. `router.use(authenticateToken)`를 통해 이 파일에 정의된 **모든 라우트는 기본적으로 인증된 사용자만 접근**할 수 있도록 보호됩니다. 즉, 요청 헤더에 유효한 JWT가 포함되어야 합니다.
-   **`apiLimiter`**: `/backend/src/middlewares/security.ts`에 정의된 요청 빈도 제한 미들웨어입니다. 세션 삭제와 같이 리소스를 소모할 수 있는 작업에 적용되어 과도한 요청으로부터 서버를 보호합니다.
-   **`sessionController`**: `/backend/src/controllers/sessionController.ts`에서 세션 관련 요청을 실제로 처리하는 로직(함수)들을 가져옵니다.

---

## API 엔드포인트 상세 설명

기본 경로는 `/api/sessions` 입니다. (이 설정은 `src/index.ts`에서 `app.use('/api/sessions', sessionRoutes);` 코드로 정의됩니다.)

### 1. 모든 활성 세션 조회

-   **경로**: `GET /`
-   **설명**: 현재 로그인한 사용자의 모든 활성 세션 목록을 조회합니다. 각 세션 정보에는 마지막 활동 시간, IP 주소, 사용자 에이전트 등이 포함될 수 있으며, 현재 요청이 발생한 세션이 어떤 것인지 식별할 수 있는 정보도 함께 제공됩니다.
-   **컨트롤러**: `sessionController.getAllSessions`

### 2. 세션 활성 상태 업데이트 (핑)

-   **경로**: `POST /ping`
-   **설명**: 현재 사용 중인 세션의 마지막 활동 시간을 갱신합니다. 이는 세션 타임아웃 관리에 사용될 수 있습니다. 주기적으로 이 엔드포인트를 호출하여 세션을 활성 상태로 유지할 수 있습니다.
-   **컨트롤러**: `sessionController.updateSessionActivity`

### 3. 특정 세션 취소 (로그아웃)

-   **경로**: `DELETE /:id`
-   **설명**: 특정 ID에 해당하는 세션을 강제로 종료(취소)합니다. 이는 사용자가 다른 기기에서 자신의 계정을 원격으로 로그아웃시키는 데 사용될 수 있습니다.
-   **미들웨어**: `apiLimiter` (요청 빈도 제한)
-   **경로 매개변수 (Path Parameter)**: `id` (취소할 세션의 고유 ID)
-   **컨트롤러**: `sessionController.revokeSession`

### 4. 현재 세션을 제외한 모든 세션 취소

-   **경로**: `DELETE /`
-   **설명**: 현재 요청이 발생한 세션을 제외하고, 해당 사용자의 다른 모든 활성 세션을 종료(취소)합니다. 보안 강화를 위해 사용자가 의심스러운 활동을 감지했을 때 유용합니다.
-   **미들웨어**: `apiLimiter` (요청 빈도 제한)
-   **컨트롤러**: `sessionController.revokeAllOtherSessions`

---

이 라우트 파일은 사용자의 세션 관리 기능을 제공하여 보안성과 사용 편의성을 높입니다. 모든 작업은 인증된 사용자에 한해 수행되며, 실제 로직은 `sessionController`에서 처리됩니다.
