# `backend/src/routes/twoFactorRoutes.ts` 코드 설명

이 파일은 2단계 인증(Two-Factor Authentication, 2FA)과 관련된 모든 API 엔드포인트를 정의하는 라우터입니다. 사용자는 이 API들을 통해 2FA를 설정, 활성화, 비활성화하고, 현재 상태를 확인하며, 인증 토큰 및 백업 코드를 검증할 수 있습니다.

---

## 기본 설정 및 미들웨어

```typescript
import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/security';
import * as twoFactorController from '../controllers/twoFactorController';

const router = express.Router();

// 모든 2FA 라우트에 인증 미들웨어 적용
router.use(authenticateToken);
```

-   **`express.Router()`**: Express 프레임워크의 라우터를 생성하여 2FA 관련 경로들을 모듈화합니다.
-   **`authenticateToken`**: `/backend/src/middlewares/auth.ts`에 정의된 JWT 기반 인증 미들웨어입니다. `router.use(authenticateToken)`를 통해 이 파일에 정의된 **모든 라우트는 기본적으로 인증된 사용자만 접근**할 수 있도록 보호됩니다.
-   **`apiLimiter`**: `/backend/src/middlewares/security.ts`에 정의된 요청 빈도 제한 미들웨어입니다. 2FA 설정, 활성화, 비활성화, 검증 등 중요한 보안 관련 작업에 적용되어 과도한 요청으로부터 서버를 보호합니다.
-   **`twoFactorController`**: `/backend/src/controllers/twoFactorController.ts`에서 2FA 관련 요청을 실제로 처리하는 로직(함수)들을 가져옵니다.

---

## API 엔드포인트 상세 설명

기본 경로는 `/api/2fa` 입니다. (이 설정은 `src/index.ts`에서 `app.use('/api/2fa', twoFactorRoutes);` 코드로 정의됩니다.)

### 1. 2FA 설정 초기화 (QR 코드 생성)

-   **경로**: `POST /setup`
-   **설명**: 사용자가 2FA를 설정할 수 있도록 초기화합니다. 서버는 새로운 2FA 비밀 키를 생성하고, 이 키를 기반으로 인증 앱(예: Google Authenticator)에서 스캔할 수 있는 QR 코드 이미지 데이터와 비밀 키 문자열을 반환합니다. 이 단계에서는 아직 2FA가 활성화되지 않습니다.
-   **미들웨어**: `apiLimiter`
-   **컨트롤러**: `twoFactorController.setupTwoFactor`

### 2. 2FA 활성화

-   **경로**: `POST /enable`
-   **설명**: 사용자가 `/setup` 단계에서 받은 비밀 키를 인증 앱에 등록하고, 해당 앱에서 생성된 TOTP(Time-based One-Time Password) 토큰을 제출하여 2FA를 최종적으로 활성화합니다. 성공적으로 활성화되면 백업 코드도 함께 생성되어 사용자에게 제공됩니다.
-   **미들웨어**: `apiLimiter`
-   **컨트롤러**: `twoFactorController.enableTwoFactor`
-   **요청 본문**: `{ "token": "사용자가 입력한 TOTP 토큰" }`

### 3. 2FA 비활성화

-   **경로**: `POST /disable`
-   **설명**: 사용자의 2FA 설정을 비활성화합니다. 비활성화를 위해서는 현재 유효한 TOTP 토큰과 사용자의 마스터 비밀번호가 필요할 수 있습니다 (컨트롤러 로직에 따라 다름).
-   **미들웨어**: `apiLimiter`
-   **컨트롤러**: `twoFactorController.disableTwoFactor`
-   **요청 본문**: `{ "token": "사용자가 입력한 TOTP 토큰", "masterPassword": "사용자 마스터 비밀번호" }` (필요시)

### 4. 2FA 상태 확인

-   **경로**: `GET /status`
-   **설명**: 현재 로그인한 사용자의 2FA 활성화 상태를 확인합니다.
-   **컨트롤러**: `twoFactorController.getTwoFactorStatus`

### 5. 2FA 토큰 검증

-   **경로**: `POST /verify`
-   **설명**: 사용자가 로그인 또는 특정 중요 작업 수행 시 제출한 TOTP 토큰의 유효성을 검증합니다.
-   **미들웨어**: `apiLimiter`
-   **컨트롤러**: `twoFactorController.verifyTwoFactorToken`
-   **요청 본문**: `{ "token": "사용자가 입력한 TOTP 토큰" }`

### 6. 백업 코드 검증

-   **경로**: `POST /verify-backup`
-   **설명**: 사용자가 TOTP 토큰을 사용할 수 없을 때(예: 인증 기기 분실) 제공하는 백업 코드의 유효성을 검증합니다. 성공적으로 검증되면 해당 백업 코드는 일반적으로 다시 사용할 수 없도록 처리됩니다.
-   **미들웨어**: `apiLimiter`
-   **컨트롤러**: `twoFactorController.verifyBackupCode`
-   **요청 본문**: `{ "backupCode": "사용자가 입력한 백업 코드" }`

---

이 라우트 파일은 사용자의 계정 보안을 강화하기 위한 2단계 인증 기능을 제공하며, 모든 관련 작업은 `twoFactorController`에서 처리됩니다.
