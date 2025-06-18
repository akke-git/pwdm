# `backend/src/routes/tagRoutes.ts` 코드 설명

이 파일은 사용자가 비밀번호 항목들을 유연하게 분류하고 검색할 수 있도록 돕는 **태그(Tag)** 와 관련된 모든 API 엔드포인트를 정의하는 라우터입니다. 사용자는 이 API들을 통해 태그를 생성, 조회, 수정, 삭제할 수 있으며, 특정 비밀번호 항목에 태그를 연결하거나 해제할 수도 있습니다.

---

## 기본 설정 및 미들웨어

```typescript
import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/security';
import * as tagController from '../controllers/tagController';

const router = express.Router();

// 모든 태그 라우트에 인증 미들웨어 적용
router.use(authenticateToken);
```

-   **`express.Router()`**: Express 프레임워크의 라우터를 생성하여 태그 관련 경로들을 모듈화합니다.
-   **`authenticateToken`**: `/backend/src/middlewares/auth.ts`에 정의된 JWT 기반 인증 미들웨어입니다. 이 파일에 정의된 **모든 라우트는 기본적으로 인증된 사용자만 접근**할 수 있도록 보호됩니다.
-   **`apiLimiter`**: `/backend/src/middlewares/security.ts`에 정의된 요청 빈도 제한 미들웨어입니다. 데이터 생성, 수정, 삭제 등 서버에 부하를 줄 수 있는 작업에 적용됩니다.
-   **`tagController`**: `/backend/src/controllers/tagController.ts`에서 태그 관련 요청을 실제로 처리하는 로직(함수)들을 가져옵니다.

---

## API 엔드포인트 상세 설명

### 태그 자체 관리 API

1.  **태그 생성**
    -   **경로**: `POST /`
    -   **설명**: 새로운 태그를 생성합니다.
    -   **미들웨어**: `apiLimiter`
    -   **컨트롤러**: `tagController.createTag`
    -   **요청 본문**: 태그 이름(`name`), 색상(`color`) 등을 포함할 수 있습니다.

2.  **모든 태그 조회**
    -   **경로**: `GET /`
    -   **설명**: 현재 로그인한 사용자가 생성한 모든 태그 목록을 조회합니다.
    -   **컨트롤러**: `tagController.getAllTags`

3.  **태그 통계 조회**
    -   **경로**: `GET /stats`
    -   **설명**: 태그 관련 통계 정보(예: 각 태그별 사용 빈도)를 조회합니다.
    -   **컨트롤러**: `tagController.getTagStats`

4.  **특정 태그 조회**
    -   **경로**: `GET /:id`
    -   **설명**: 특정 ID에 해당하는 태그의 상세 정보를 조회합니다.
    -   **경로 매개변수**: `id` (조회할 태그의 고유 ID)
    -   **컨트롤러**: `tagController.getTag`

5.  **태그 업데이트**
    -   **경로**: `PUT /:id`
    -   **설명**: 특정 ID에 해당하는 태그의 정보를 수정합니다.
    -   **미들웨어**: `apiLimiter`
    -   **경로 매개변수**: `id` (수정할 태그의 고유 ID)
    -   **컨트롤러**: `tagController.updateTag`
    -   **요청 본문**: 변경할 태그 정보 (이름, 색상 등)

6.  **태그 삭제**
    -   **경로**: `DELETE /:id`
    -   **설명**: 특정 ID에 해당하는 태그를 삭제합니다. 이 태그와 비밀번호 항목 간의 연결 정보(`TagItem`)도 함께 삭제됩니다.
    -   **미들웨어**: `apiLimiter`
    -   **경로 매개변수**: `id` (삭제할 태그의 고유 ID)
    -   **컨트롤러**: `tagController.deleteTag`

### 비밀번호 항목 - 태그 관계 관리 API

1.  **비밀번호 항목에 태그 추가**
    -   **경로**: `POST /password/:passwordItemId`
    -   **설명**: 특정 비밀번호 항목에 기존에 생성된 태그를 연결(추가)합니다. 요청 본문에 태그 ID(`tagId`) 또는 태그 이름(`tagName`)을 전달하여 연결할 태그를 지정합니다.
    -   **미들웨어**: `apiLimiter`
    -   **경로 매개변수**: `passwordItemId` (태그를 추가할 비밀번호 항목의 ID)
    -   **컨트롤러**: `tagController.addTagToPasswordItem`
    -   **요청 본문**: `{ "tagId": "태그ID" }` 또는 `{ "tagName": "태그이름" }`

2.  **비밀번호 항목의 태그 조회**
    -   **경로**: `GET /password/:passwordItemId`
    -   **설명**: 특정 비밀번호 항목에 연결된 모든 태그 목록을 조회합니다.
    -   **경로 매개변수**: `passwordItemId` (태그 목록을 조회할 비밀번호 항목의 ID)
    -   **컨트롤러**: `tagController.getPasswordItemTags`

3.  **비밀번호 항목에서 태그 제거**
    -   **경로**: `DELETE /password/:passwordItemId/:tagId`
    -   **설명**: 특정 비밀번호 항목에서 특정 태그와의 연결을 제거합니다.
    -   **미들웨어**: `apiLimiter`
    -   **경로 매개변수**:
        -   `passwordItemId`: 태그를 제거할 비밀번호 항목의 ID
        -   `tagId`: 제거할 태그의 ID
    -   **컨트롤러**: `tagController.removeTagFromPasswordItem`

---

이 라우트 파일은 태그 자체의 관리뿐만 아니라, 태그와 비밀번호 항목 간의 다대다 관계를 관리하는 데 필요한 API들을 포괄적으로 제공합니다. 실제 로직은 `tagController`에서 처리됩니다.
