# `backend/src/controllers/passwordController.ts` 코드 설명

이 파일은 `passwordRoutes.ts`에서 정의된 각 API 경로에 대한 실제 비즈니스 로직을 수행하는 **컨트롤러(Controller)** 입니다. 비밀번호 항목의 생성, 조회, 수정, 삭제(CRUD)와 같은 핵심 기능부터 데이터 가져오기/내보내기, 만료 예정 항목 조회, 사용 기록 추적 등 다양한 기능을 담당합니다.

---

## 핵심 설계 및 구조

### 1. 서비스 계층 (Service Layer) 분리

이 컨트롤러의 가장 중요한 설계 특징은 **서비스 계층(`PasswordItemService`)** 을 사용한다는 점입니다. 컨트롤러는 클라이언트로부터 HTTP 요청을 받아 필요한 데이터를 추출하고 유효성을 검증한 뒤, 실제 데이터베이스 처리, 암호화, 복호화 등 복잡하고 민감한 작업은 모두 `PasswordItemService`에 위임합니다.

이러한 구조는 다음과 같은 장점을 가집니다:
-   **관심사 분리(SoC)**: 컨트롤러는 '무엇을 할지' 결정하고, 서비스는 '어떻게 할지' 구현합니다. 코드를 이해하고 테스트하기 쉬워집니다.
-   **재사용성**: 동일한 서비스 로직을 다른 컨트롤러나 백그라운드 작업에서도 재사용할 수 있습니다.
-   **보안**: 데이터베이스와 직접 상호작용하는 로직을 서비스 계층에 캡슐화하여 보안을 강화합니다.

### 2. 파일 처리 (`multer` 및 임시 파일 관리)

-   **데이터 가져오기 (`importPasswordItems`)**: `multer` 라이브러리를 사용하여 CSV 파일 업로드를 처리합니다.
    -   `storage`: `multer.diskStorage`를 사용하여 업로드된 파일이 서버의 `temp/uploads/` 디렉토리에 임시로 저장되도록 설정합니다. 파일명은 고유하게 생성됩니다.
    -   `fileFilter`: `text/csv` MIME 타입의 파일만 허용합니다.
-   **데이터 내보내기 (`exportPasswordItems`)**: JSON 또는 CSV 형식으로 데이터를 내보낼 때, 서버의 `temp/exports/` 디렉토리에 임시 파일을 생성합니다.
-   **임시 파일 삭제**: 파일 가져오기 또는 내보내기 작업이 성공적으로 완료되거나 오류가 발생한 경우, 서버에 생성된 임시 파일(`filePath` 또는 `req.file.path`)을 `fs.unlinkSync`를 사용하여 즉시 삭제합니다. 이는 민감한 정보가 서버에 장기간 남아있지 않도록 보장하고 디스크 공간을 효율적으로 관리합니다.

### 3. 일관된 오류 처리

모든 컨트롤러 함수는 `try...catch` 블록으로 감싸여 있습니다.
-   서비스 계층(`PasswordItemService`)에서 발생한 오류(예: 유효성 검사 실패, 데이터베이스 오류)를 포함하여 모든 예외를 포착합니다.
-   오류 발생 시 `console.error`를 통해 서버 로그에 기록합니다.
-   클라이언트에게는 오류 객체에 `statusCode`가 정의되어 있으면 해당 코드를, 그렇지 않으면 기본적으로 `500 Internal Server Error` 상태 코드와 함께 일관된 JSON 형식의 오류 메시지(`{ success: false, message: '...' }`)를 반환합니다.
-   응답 헤더가 이미 전송된 경우(`res.headersSent`)에는 중복 응답을 보내지 않도록 처리합니다.

### 4. 사용자 인증 및 권한 부여

-   모든 컨트롤러 함수는 라우트 레벨에서 `authenticateToken` 미들웨어를 통해 JWT 토큰 기반 인증을 거친 사용자만 접근 가능하도록 전제합니다.
-   컨트롤러 함수 내에서는 `(req as any).user.id`를 통해 인증된 사용자의 ID를 가져와, 해당 사용자의 데이터에만 접근하고 조작하도록 보장합니다 (데이터 소유권 검증은 주로 `PasswordItemService`에서 이루어짐).

---

## 주요 함수 상세 설명

### `createPasswordItem`

-   **목적**: 새로운 비밀번호 항목을 생성합니다.
-   **요청**:
    -   `POST /api/passwords`
    -   `req.body`: `IPasswordItemCreationAttributes` 인터페이스를 따르는 객체 (예: `title`, `url`, `username`, `password`, `category`, `tags`, `notes`, `isFavorite`, `expiryDate`). `title`과 `password`는 필수입니다.
-   **로직**:
    1.  `req.user.id`에서 사용자 ID를 가져옵니다.
    2.  `req.body`에서 비밀번호 항목 데이터를 가져옵니다.
    3.  `PasswordItemService.create(userId, passwordData)`를 호출하여 항목 생성을 위임합니다. 서비스 내에서 비밀번호 암호화가 이루어집니다.
    4.  성공 시 생성된 항목 정보를 `201 Created` 상태 코드와 함께 반환합니다.
-   **오류 처리**: 필수 필드 누락, 사용자 찾기 실패 등의 경우 `PasswordItemService`에서 발생한 오류를 그대로 반환합니다.

### `getAllPasswordItems`

-   **목적**: 현재 사용자의 모든 비밀번호 항목 목록을 조회합니다. 필터링 및 정렬 기능을 제공합니다.
-   **요청**:
    -   `GET /api/passwords`
    -   `req.query`:
        -   `category` (string, optional): 특정 카테고리 필터링
        -   `isFavorite` (boolean, optional): 즐겨찾기 항목만 필터링
        -   `searchTerm` (string, optional): `title`, `url`, `username`, `notes` 필드에서 검색
        -   `sortBy` (string, optional): 정렬 기준 필드 (예: `title`, `createdAt`, `lastUsedAt`, `strength`)
        -   `sortOrder` (string, optional): 정렬 순서 (`ASC` 또는 `DESC`, 기본값 `ASC`)
-   **로직**:
    1.  `req.user.id`에서 사용자 ID를 가져옵니다.
    2.  `req.query`에서 필터링 및 정렬 옵션을 추출합니다.
    3.  `PasswordItemService.getAll(userId, filterOptions)`를 호출하여 항목 목록 조회를 위임합니다. 서비스 내에서 비밀번호는 암호화된 상태로 유지됩니다.
    4.  성공 시 조회된 항목 목록과 개수를 `200 OK` 상태 코드와 함께 반환합니다.
-   **참고**: 이 함수는 비밀번호 자체를 반환하지 않으며, 목록 조회에 최적화되어 있습니다.

### `getPasswordItem`

-   **목적**: ID로 특정 비밀번호 항목의 상세 정보를 조회합니다.
-   **요청**:
    -   `GET /api/passwords/:id`
    -   `req.params.id`: 조회할 비밀번호 항목의 ID.
-   **로직**:
    1.  `req.user.id`에서 사용자 ID를 가져옵니다.
    2.  `req.params.id`에서 항목 ID를 가져와 정수형으로 변환합니다. 유효하지 않은 ID 형식인 경우 `400 Bad Request` 오류를 반환합니다.
    3.  `PasswordItemService.getById(userId, itemId)`를 호출하여 항목 상세 정보 조회를 위임합니다. 서비스 내에서 해당 항목의 비밀번호가 복호화됩니다.
    4.  성공 시 복호화된 항목 정보를 `200 OK` 상태 코드와 함께 반환합니다.
-   **오류 처리**: 항목을 찾을 수 없거나 사용자에게 권한이 없는 경우 `PasswordItemService`에서 발생한 오류(예: `404 Not Found`)를 반환합니다.

### `updatePasswordItem`

-   **목적**: 특정 비밀번호 항목의 정보를 수정합니다.
-   **요청**:
    -   `PUT /api/passwords/:id`
    -   `req.params.id`: 수정할 비밀번호 항목의 ID.
    -   `req.body`: `Partial<IPasswordItemUpdateAttributes>` 인터페이스를 따르는 객체 (수정할 필드와 값).
-   **로직**:
    1.  `req.user.id`에서 사용자 ID를 가져옵니다.
    2.  `req.params.id`에서 항목 ID를 가져와 정수형으로 변환합니다.
    3.  `req.body`에서 수정할 데이터를 가져옵니다.
    4.  `PasswordItemService.update(userId, itemId, updateData)`를 호출하여 항목 수정을 위임합니다. 비밀번호가 변경되는 경우 서비스 내에서 재암호화됩니다.
    5.  성공 시 수정된 항목 정보를 `200 OK` 상태 코드와 함께 반환합니다.
-   **오류 처리**: 항목을 찾을 수 없거나 유효성 검사 실패 시 `PasswordItemService`에서 발생한 오류를 반환합니다.

### `deletePasswordItem`

-   **목적**: 특정 비밀번호 항목을 삭제합니다.
-   **요청**:
    -   `DELETE /api/passwords/:id`
    -   `req.params.id`: 삭제할 비밀번호 항목의 ID.
-   **로직**:
    1.  `req.user.id`에서 사용자 ID를 가져옵니다.
    2.  `req.params.id`에서 항목 ID를 가져와 정수형으로 변환합니다.
    3.  `PasswordItemService.delete(userId, itemId)`를 호출하여 항목 삭제를 위임합니다.
    4.  성공 시 `200 OK` 상태 코드와 성공 메시지를 반환합니다.
-   **오류 처리**: 항목을 찾을 수 없는 경우 `PasswordItemService`에서 발생한 오류를 반환합니다.

### `exportPasswordItems`

-   **목적**: 사용자의 모든 비밀번호 데이터를 JSON 또는 CSV 파일 형식으로 내보냅니다.
-   **요청**:
    -   `GET /api/passwords/export`
    -   `req.query.format` (string, optional): 내보낼 파일 형식 (`json` 또는 `csv`, 기본값 `json`).
-   **로직**:
    1.  `req.user.id`에서 사용자 ID를 가져옵니다.
    2.  `PasswordItemService.getAllDecryptedItemsForUser(userId)`를 호출하여 **복호화된** 모든 항목 데이터를 가져옵니다.
    3.  **JSON 형식 (`format === 'json'` 또는 기본값)**:
        -   가져온 데이터를 `{ version, exportedAt, items }` 구조로 래핑합니다.
        -   `JSON.stringify`를 사용하여 JSON 문자열로 변환합니다.
        -   임시 파일(`temp/exports/password-export-${userId}-${exportId}.json`)에 저장합니다.
    4.  **CSV 형식 (`format === 'csv'`)**:
        -   `json2csv` 라이브러리의 `Parser`를 사용합니다.
        -   CSV 헤더 필드를 정의합니다 (`title`, `url`, `username`, `password`, `category`, `notes`, `tags`, `isFavorite`, `expiryDate`, `createdAt`, `updatedAt`, `lastUsedAt`).
        -   데이터를 CSV 문자열로 변환합니다.
        -   Excel 등에서 한글 깨짐을 방지하기 위해 문자열 시작 부분에 **BOM(`\uFEFF`)** 을 추가합니다.
        -   임시 파일(`temp/exports/password-export-${userId}-${exportId}.csv`)에 `utf8` 인코딩으로 저장합니다.
    5.  `res.download(filePath, fileName, callback)`을 사용하여 클라이언트에게 파일 다운로드를 시작시킵니다.
    6.  다운로드 콜백 함수 내에서, 성공 또는 실패 여부와 관계없이 서버에 생성된 임시 파일을 `fs.unlinkSync`로 삭제합니다.
-   **오류 처리**: 데이터 조회 실패, 파일 생성 실패, CSV 변환 오류 등의 경우 적절한 오류 메시지와 함께 `500 Internal Server Error`를 반환하고, 생성된 임시 파일이 있다면 삭제합니다.

### `importPasswordItems`

-   **목적**: 사용자가 업로드한 CSV 파일을 읽어 비밀번호 항목들을 데이터베이스에 가져옵니다.
-   **요청**:
    -   `POST /api/passwords/import`
    -   `Content-Type: multipart/form-data`
    -   `req.file`: `multer` 미들웨어에 의해 처리된 업로드된 CSV 파일 객체. 파일은 `temp/uploads/`에 임시 저장됩니다.
-   **로직**:
    1.  `req.user.id`에서 사용자 ID를 가져옵니다.
    2.  `req.file`이 없는 경우 `400 Bad Request` 오류를 반환합니다.
    3.  `fs.readFileSync(filePath, 'utf8')`로 임시 CSV 파일 내용을 읽습니다.
    4.  파일 시작 부분의 **BOM(`\uFEFF`)** 이 있다면 제거하여 파싱 오류를 방지합니다.
    5.  CSV 데이터를 파싱합니다:
        -   첫 번째 줄을 헤더로 인식하고, 각 헤더의 따옴표를 제거하고 trim 합니다.
        -   필수 헤더(`name`)가 없으면 오류를 발생시킵니다.
        -   데이터 각 줄을 파싱하여 `title`, `url`, `username`, `password`, `notes`, `category` 등의 값을 추출합니다.
        -   **중복 `title` 처리**:
            -   `PasswordItemService.getAll(userId, {})`로 기존 항목들의 `title`을 가져와 Set에 저장합니다.
            -   가져올 항목의 `title` (소문자 변환)이 이미 존재하거나 현재 가져오기 작업 중인 다른 항목과 중복될 경우, `title` 뒤에 숫자를 붙여 고유하게 만듭니다 (예: "My Site", "My Site 2", "My Site 3").
    6.  파싱된 항목 데이터 배열을 `PasswordItemService.importItems(userId, importItems)`로 전달하여 실제 데이터베이스 저장 및 암호화 작업을 위임합니다.
    7.  성공 시 가져온 항목 수, 성공/실패 정보를 `200 OK` 상태 코드와 함께 반환합니다.
    8.  작업 완료 후 (성공/실패 무관) 업로드된 임시 파일을 `fs.unlinkSync`로 삭제합니다.
-   **오류 처리**: 파일 없음, 잘못된 CSV 형식, 파일 읽기/파싱 오류, 가져올 항목 없음 등의 경우 `400 Bad Request` 또는 `500 Internal Server Error`를 반환하고 임시 파일을 삭제합니다.

### `getExpiringPasswordItems`

-   **목적**: 만료일이 임박했거나 특정 기간 내에 만료될 비밀번호 항목들을 조회합니다.
-   **요청**:
    -   `GET /api/passwords/expiring`
    -   `req.query`:
        -   `days` (number, optional): 현재 날짜로부터 만료까지 남은 일수 (예: `7`이면 7일 이내 만료).
        -   `date` (string, optional, YYYY-MM-DD format): 특정 기준 날짜. 이 날짜까지 만료되는 항목을 조회.
-   **로직**:
    1.  `req.user.id`에서 사용자 ID를 가져옵니다.
    2.  `req.query`에서 `days` 또는 `date` 값을 추출하고 유효성을 검사합니다.
    3.  `PasswordItemService.getExpiringItems(userId, days, date)`를 호출하여 만료 예정 항목 조회를 위임합니다.
    4.  성공 시 조회된 항목 목록과 개수를 `200 OK` 상태 코드와 함께 반환합니다.
-   **오류 처리**: 서비스에서 발생한 오류를 반환합니다.

### `trackPasswordUsage`

-   **목적**: 특정 비밀번호 항목의 사용(조회, 복사 등)을 기록하고 마지막 사용일을 업데이트합니다.
-   **요청**:
    -   `POST /api/passwords/:id/track-usage`
    -   `req.params.id`: 사용 기록을 추적할 비밀번호 항목의 ID.
    -   `req.body.action` (string, optional): 사용 유형 (예: 'view', 'copy_password', 'auto_fill'). 기본값 'view'.
-   **로직**:
    1.  `req.user.id`에서 사용자 ID, `req.params.id`에서 항목 ID를 가져와 정수형으로 변환합니다.
    2.  `req.body.action` (기본값 'view'), `req.headers['user-agent']`, `req.ip` (IP 주소)를 가져옵니다.
    3.  `PasswordItemService.trackUsageAndUpdateLastUsed(userId, itemId, action, userAgent, ipAddress)`를 호출하여 사용 기록 저장 및 마지막 사용일 업데이트를 위임합니다.
    4.  성공 시 `200 OK` 상태 코드와 성공 메시지를 반환합니다.
-   **오류 처리**: ID 유효성 오류, 서비스에서 발생한 오류 등을 반환합니다.

---

이 문서는 `passwordController.ts`의 주요 기능과 로직 흐름을 이해하는 데 도움을 줄 것입니다. 각 함수는 `PasswordItemService`와 긴밀하게 연동되어 실제 비즈니스 로직을 수행하며, 컨트롤러는 주로 HTTP 요청 처리, 데이터 유효성 검증, 서비스 호출, 응답 포맷팅의 역할을 담당합니다.
