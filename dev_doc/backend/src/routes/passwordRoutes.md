# `backend/src/routes/passwordRoutes.ts` 코드 설명

이 파일은 애플리케이션의 핵심 기능인 **비밀번호 항목 관리**와 관련된 모든 API 경로(엔드포인트)를 정의합니다. 사용자가 저장한 웹사이트 로그인 정보, 노트, 카드 등 민감한 데이터를 생성(Create), 조회(Read), 수정(Update), 삭제(Delete)하는 CRUD 기능을 비롯하여, 데이터 가져오기/내보내기 등 부가적인 기능을 제공합니다.

---

## 주요 특징

### 1. 인증 필수

이 라우터에 정의된 모든 경로는 기본적으로 `authenticateToken` 미들웨어를 통과해야 합니다. 즉, **로그인한 사용자만** 이 기능들을 사용할 수 있습니다.

```typescript
import { authenticateToken } from '../middlewares/auth';
// ...
router.use(authenticateToken);
```

`router.use(authenticateToken);` 코드는 이 파일의 모든 라우트 앞에 `authenticateToken` 미들웨어를 적용하여, 유효한 JWT 토큰이 없는 요청은 모두 차단합니다.

### 2. 컨트롤러 위임

라우팅 파일 자체는 비즈니스 로직을 담고 있지 않습니다. 각 경로는 HTTP 요청을 받으면, 해당 요청을 처리할 실제 로직이 구현된 `passwordController`의 함수로 전달하는 역할만 합니다.

### 3. 오류 처리

모든 라우트 핸들러는 `try...catch` 블록으로 감싸여 있습니다. 컨트롤러 함수에서 예기치 않은 오류가 발생할 경우, 이를 감지하여 클라이언트에게 `500 Internal Server Error` 상태 코드와 함께 일관된 오류 메시지를 반환합니다. 이는 서버가 비정상적으로 종료되는 것을 방지합니다.

---

## API 엔드포인트 목록

기본 경로는 `/api/passwords` 입니다. (이 설정은 `src/index.ts`에서 `app.use('/api/passwords', passwordRoutes);` 코드로 정의됩니다.)

### 1. 비밀번호 항목 CRUD

-   **`POST /api/passwords`**
    -   **설명**: 새로운 비밀번호 항목을 생성합니다.
    -   **컨트롤러**: `passwordController.createPasswordItem`

-   **`GET /api/passwords`**
    -   **설명**: 현재 로그인한 사용자의 모든 비밀번호 항목 목록을 조회합니다.
    -   **컨트롤러**: `passwordController.getAllPasswordItems`

-   **`GET /api/passwords/:id`**
    -   **설명**: 특정 ID를 가진 단일 비밀번호 항목의 상세 정보를 조회합니다.
    -   **컨트롤러**: `passwordController.getPasswordItem`

-   **`PUT /api/passwords/:id`**
    -   **설명**: 특정 ID를 가진 비밀번호 항목의 정보를 수정합니다.
    -   **컨트롤러**: `passwordController.updatePasswordItem`

-   **`DELETE /api/passwords/:id`**
    -   **설명**: 특정 ID를 가진 비밀번호 항목을 삭제합니다.
    -   **컨트롤러**: `passwordController.deletePasswordItem`

### 2. 데이터 가져오기 & 내보내기

-   **`POST /api/passwords/export`**
    -   **설명**: 사용자의 모든 비밀번호 항목을 암호화된 파일 형태로 내보냅니다.
    -   **컨트롤러**: `passwordController.exportPasswordItems`

-   **`POST /api/passwords/import`**
    -   **설명**: 내보내기 했던 파일(JSON)을 가져와 데이터베이스에 복원합니다. 이 경로는 `multer` 미들웨어(`upload.single('file')`)를 사용하여 파일 업로드를 처리합니다.
    -   **컨트롤러**: `passwordController.importPasswordItems`

### 3. 부가 기능

-   **`GET /api/passwords/expiring`**
    -   **설명**: 비밀번호 만료일이 임박한 항목들의 목록을 조회합니다.
    -   **컨트롤러**: `passwordController.getExpiringPasswordItems`

-   **`POST /api/passwords/:id/track`**
    -   **설명**: 특정 비밀번호 항목의 사용 기록을 추적합니다. (예: 마지막 사용일 업데이트)
    -   **컨트롤러**: `passwordController.trackPasswordUsage`

-   **`GET /api/passwords/:id/analyze`** (주석 처리됨)
    -   **설명**: 저장된 비밀번호의 강도를 분석하는 기능으로, 현재는 비활성화되어 있습니다.
    -   **컨트롤러**: `passwordController.analyzePasswordStrength`
