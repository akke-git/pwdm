# `backend/src/routes/categoryRoutes.ts` 코드 설명

이 파일은 사용자의 비밀번호 항목들을 그룹화하는 **카테고리(Category)** 와 관련된 모든 API 엔드포인트를 정의하는 라우터입니다. 사용자는 이 API들을 통해 카테고리를 생성, 조회, 수정, 삭제할 수 있습니다.

---

## 기본 설정 및 미들웨어

```typescript
import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/security';
import * as categoryController from '../controllers/categoryController';

const router = express.Router();

// 모든 카테고리 라우트에 인증 미들웨어 적용
router.use(authenticateToken);
```

-   **`express.Router()`**: Express 프레임워크의 라우터를 생성하여 카테고리 관련 경로들을 모듈화합니다.
-   **`authenticateToken`**: `/backend/src/middlewares/auth.ts`에 정의된 JWT 기반 인증 미들웨어입니다. `router.use(authenticateToken)`를 통해 이 파일에 정의된 **모든 라우트는 기본적으로 인증된 사용자만 접근**할 수 있도록 보호됩니다. 즉, 요청 헤더에 유효한 JWT가 포함되어야 합니다.
-   **`apiLimiter`**: `/backend/src/middlewares/security.ts`에 정의된 요청 빈도 제한 미들웨어입니다. 특정 라우트에 적용되어 과도한 요청으로부터 서버를 보호합니다.
-   **`categoryController`**: `/backend/src/controllers/categoryController.ts`에서 카테고리 관련 요청을 실제로 처리하는 로직(함수)들을 가져옵니다.

---

## API 엔드포인트 상세 설명

### 1. 카테고리 생성

-   **경로**: `POST /`
-   **설명**: 새로운 카테고리를 생성합니다.
-   **미들웨어**: `apiLimiter` (요청 빈도 제한)
-   **컨트롤러**: `categoryController.createCategory`
-   **요청 본문 (Request Body)**: 카테고리 이름(`name`), 색상(`color`), 아이콘(`icon`), 설명(`description`) 등을 포함할 수 있습니다.

### 2. 모든 카테고리 조회

-   **경로**: `GET /`
-   **설명**: 현재 로그인한 사용자가 생성한 모든 카테고리 목록을 조회합니다.
-   **컨트롤러**: `categoryController.getAllCategories`

### 3. 카테고리 통계 조회

-   **경로**: `GET /stats`
-   **설명**: 카테고리 관련 통계 정보(예: 각 카테고리별 비밀번호 항목 수)를 조회합니다.
-   **컨트롤러**: `categoryController.getCategoryStats`

### 4. 특정 카테고리 조회

-   **경로**: `GET /:id`
-   **설명**: 특정 ID에 해당하는 카테고리의 상세 정보를 조회합니다.
-   **경로 매개변수 (Path Parameter)**: `id` (조회할 카테고리의 고유 ID)
-   **컨트롤러**: `categoryController.getCategory`

### 5. 카테고리 업데이트

-   **경로**: `PUT /:id`
-   **설명**: 특정 ID에 해당하는 카테고리의 정보를 수정합니다.
-   **미들웨어**: `apiLimiter` (요청 빈도 제한)
-   **경로 매개변수**: `id` (수정할 카테고리의 고유 ID)
-   **컨트롤러**: `categoryController.updateCategory`
-   **요청 본문**: 변경할 카테고리 정보 (이름, 색상, 아이콘, 설명 등)

### 6. 카테고리 삭제

-   **경로**: `DELETE /:id`
-   **설명**: 특정 ID에 해당하는 카테고리를 삭제합니다.
-   **미들웨어**: `apiLimiter` (요청 빈도 제한)
-   **경로 매개변수**: `id` (삭제할 카테고리의 고유 ID)
-   **컨트롤러**: `categoryController.deleteCategory`

---

이 라우트 파일은 카테고리 관리에 필요한 모든 기본적인 CRUD(Create, Read, Update, Delete) 작업과 추가적인 통계 조회 기능을 제공하며, 보안을 위해 인증 및 요청 제한 미들웨어를 적절히 활용하고 있습니다. 실제 비즈니스 로직은 `categoryController`에서 처리됩니다.
