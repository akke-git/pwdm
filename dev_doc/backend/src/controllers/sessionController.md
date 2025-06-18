# Session Controller (`sessionController.ts`)

이 컨트롤러는 사용자 로그인 세션과 관련된 모든 기능을 관리합니다. 사용자의 활성 세션 조회, 특정 세션 또는 다른 모든 세션 취소(로그아웃), 세션 활성 상태 업데이트, 새 세션 생성 및 만료된 세션 정리 등의 역할을 수행합니다.

## 주요 의존성

-   `express`: 웹 프레임워크
-   `sequelize`: ORM, `Session` 모델 사용
-   `jsonwebtoken`: JWT 토큰 디코딩 (세션 만료 시간 추출용)

## 컨트롤러 함수 상세 설명

### 1. `getAllSessions`

-   **라우트**: `GET /sessions` (가상, 실제 라우트는 `sessionRoutes.ts` 확인 필요)
-   **인증**: 필요 (요청 객체에서 `user.id` 사용)
-   **설명**: 현재 로그인한 사용자의 모든 활성(만료되지 않고, 취소되지 않은) 세션 목록을 조회합니다.
-   **로직**:
    1.  요청 헤더에서 현재 JWT 토큰을 추출합니다.
    2.  `Session.findAll`을 사용하여 `userId`가 현재 사용자와 일치하고, `expiresAt`이 현재 시간 이후이며, `isRevoked`가 `false`인 세션들을 조회합니다. `lastActive` 시간 기준 내림차순으로 정렬합니다.
    3.  조회된 각 세션 정보에 `isCurrent` 필드를 추가하여, 해당 세션이 현재 요청에서 사용 중인 토큰의 세션인지 여부를 표시합니다.
    4.  성공 시 `200 OK` 상태와 함께 세션 목록 및 개수를 반환합니다.
-   **주요 응답 필드**:
    -   `id`: 세션 ID
    -   `userId`: 사용자 ID
    -   `deviceInfo`: 세션 생성 시 기록된 User-Agent 정보
    -   `ipAddress`: 세션 생성 시 기록된 IP 주소
    -   `lastActive`: 마지막 활성 시간
    -   `expiresAt`: 세션 만료 시간 (JWT 만료 시간과 동일)
    -   `isCurrent`: boolean, 현재 요청의 세션인지 여부

### 2. `revokeSession`

-   **라우트**: `DELETE /sessions/:id` (가상)
-   **인증**: 필요
-   **설명**: 특정 ID의 세션을 취소(무효화)합니다. 해당 세션으로의 접근을 차단하는 효과적인 로그아웃 기능입니다.
-   **로직**:
    1.  경로 매개변수에서 세션 ID (`id`)를 가져옵니다.
    2.  `Session.findOne`을 사용하여 해당 ID와 `userId`를 만족하는 세션을 찾습니다.
    3.  세션이 없으면 `404 Not Found`를 반환합니다.
    4.  세션의 `isRevoked` 필드를 `true`로 설정하고 저장합니다.
    5.  취소된 세션이 현재 요청의 세션이었는지 여부를 `isCurrentSession`으로 응답에 포함합니다.
    6.  성공 시 `200 OK` 상태와 함께 성공 메시지 및 `isCurrentSession` 정보를 반환합니다.

### 3. `revokeAllOtherSessions`

-   **라우트**: `POST /sessions/revoke-others` (가상)
-   **인증**: 필요
-   **설명**: 현재 사용 중인 세션을 제외한, 해당 사용자의 다른 모든 활성 세션을 취소합니다. "다른 모든 기기에서 로그아웃" 기능에 해당합니다.
-   **로직**:
    1.  요청 헤더에서 현재 JWT 토큰을 추출합니다.
    2.  `Session.update`를 사용하여 `userId`가 현재 사용자와 일치하고, `token`이 현재 토큰과 다르며, `isRevoked`가 `false`인 모든 세션의 `isRevoked` 필드를 `true`로 업데이트합니다.
    3.  성공 시 `200 OK` 상태와 함께 성공 메시지 및 취소된 세션의 수를 반환합니다.

### 4. `updateSessionActivity`

-   **라우트**: `PATCH /sessions/activity` (가상)
-   **인증**: 필요
-   **설명**: 현재 활성 세션의 `lastActive` 시간을 현재 시간으로 업데이트합니다. 사용자의 활동을 추적하는 데 사용될 수 있습니다.
-   **로직**:
    1.  요청 헤더에서 현재 JWT 토큰을 추출합니다. 토큰이 없으면 `401 Unauthorized`.
    2.  `Session.findOne`을 사용하여 현재 토큰에 해당하고 취소되지 않은 세션을 찾습니다.
    3.  세션이 없으면 `404 Not Found`.
    4.  세션의 `lastActive` 필드를 현재 시간으로 업데이트하고 저장합니다.
    5.  성공 시 `200 OK` 상태와 함께 성공 메시지를 반환합니다.

### 5. `createSession` (비 API 함수)

-   **호출**: `authController` 등에서 로그인 성공 시 내부적으로 호출됩니다.
-   **매개변수**: `req: Request`, `res: Response`, `userId: number`, `token: string`
-   **설명**: 새로운 사용자 세션 정보를 데이터베이스에 기록합니다.
-   **로직**:
    1.  요청 객체에서 User-Agent (`req.headers['user-agent']`)와 IP 주소 (`req.ip`)를 추출합니다.
    2.  제공된 JWT `token`을 디코딩하여 만료 시간(`exp`)을 추출하고, 이를 `expiresAt` (Date 객체)으로 변환합니다. 만료 시간이 없으면 기본값(예: 7일 후)을 사용합니다.
    3.  `Session.create`를 사용하여 `userId`, `token`, `deviceInfo`, `ipAddress`, `lastActive` (현재 시간), `expiresAt`, `isRevoked` (`false`) 값을 데이터베이스에 저장합니다.
    4.  오류 발생 시 콘솔에 로그를 남깁니다 (별도 응답 없음).

### 6. `cleanupExpiredSessions` (비 API 함수)

-   **호출**: 주기적인 스케줄러 작업(예: cron job)을 통해 호출될 것으로 예상됩니다.
-   **설명**: 데이터베이스에서 만료되었거나 이미 취소된 세션들을 삭제하여 데이터베이스를 정리합니다.
-   **로직**:
    1.  `Session.destroy`를 사용하여 `expiresAt`이 현재 시간보다 이전이거나, `isRevoked`가 `true`인 모든 세션 레코드를 삭제합니다.
    2.  성공 또는 오류 발생 시 콘솔에 로그를 남깁니다.

## 보안 고려 사항

-   세션 토큰은 JWT로, 그 자체로 상태를 가지지 않지만, 서버 측 `Session` 테이블과 연동하여 세션 취소(로그아웃) 기능을 구현합니다.
-   `isRevoked` 필드를 통해 특정 세션을 무효화할 수 있어, 토큰이 탈취되더라도 해당 세션을 서버 측에서 차단할 수 있습니다.
-   `cleanupExpiredSessions`를 통해 불필요한 세션 데이터를 주기적으로 정리하여 데이터베이스 부하를 줄이고 개인정보 노출 위험을 최소화합니다.

이 컨트롤러는 사용자 세션의 라이프사이클을 효과적으로 관리하여 보안성과 사용성을 높이는 데 기여합니다.
