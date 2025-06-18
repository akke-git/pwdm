# `backend/src/services/passwordItemService.ts` 코드 설명

이 파일은 **서비스 계층(Service Layer)** 으로, 비밀번호 항목 관리와 관련된 모든 핵심 비즈니스 로직을 담당합니다. 컨트롤러(`passwordController`)로부터 요청을 받아, 데이터베이스와 직접 상호작용하고, 암호화/복호화와 같은 민감한 작업을 수행한 뒤 그 결과를 다시 컨트롤러에 반환합니다.

---

## 핵심 아키텍처 및 역할

`PasswordItemService`는 정적(static) 클래스로 구현되어, 별도의 인스턴스 생성 없이 `PasswordItemService.create(...)`와 같이 직접 메소드를 호출할 수 있습니다.

### 1. 데이터 암호화 및 복호화

-   **암호화**: 새로운 비밀번호를 저장(`create`)하거나 기존 비밀번호를 수정(`update`)할 때, 반드시 `User` 모델에 저장된 해당 사용자의 고유 `encryptionKey`를 사용하여 비밀번호를 암호화합니다. 암호화된 데이터만이 데이터베이스에 저장됩니다.
-   **복호화**: 저장된 비밀번호를 조회(`getById`, `getAllDecryptedItemsForUser`)할 때, 동일한 `encryptionKey`를 사용하여 원래의 평문으로 복호화한 후 반환합니다. 만약 키가 없거나 일치하지 않으면 복호화는 실패합니다.
-   **사용 라이브러리**: 암호화 로직은 `utils/encryption.ts` 파일에 캡슐화되어 있습니다.

### 2. 데이터베이스 상호작용 (Sequelize)

-   `PasswordItem`, `User`, `PasswordHistory` 모델을 사용하여 데이터베이스의 데이터를 처리합니다.
-   `findAll`, `findOne`, `create`, `update`, `destroy` 등 Sequelize ORM의 메소드를 사용하여 CRUD 작업을 수행합니다.
-   검색, 필터링 등 복잡한 조회 조건은 Sequelize의 `Op` (Operators)를 활용하여 구현합니다.

### 3. 사용자 정의 오류 처리

-   단순히 오류를 반환하는 대신, `Error` 객체를 생성하고 `statusCode` (예: 400, 404, 500)를 추가하여 `throw` 합니다.
-   이를 통해 상위 계층인 컨트롤러가 오류의 종류를 명확히 인지하고, 클라이언트에게 적절한 HTTP 상태 코드와 메시지를 응답할 수 있게 합니다.

---

## 주요 메소드 상세 설명

### `create(userId, passwordData)`

1.  `title`과 `password`가 필수 항목인지 확인합니다.
2.  `userId`로 사용자를 찾아 `encryptionKey`를 가져옵니다. 키가 없으면 오류를 발생시킵니다.
3.  `encryption.ts`의 `encrypt` 함수를 호출하여 `passwordData.password`를 암호화합니다.
4.  암호화된 비밀번호와 나머지 데이터를 `PasswordItem.create`를 통해 데이터베이스에 저장합니다.

### `getAll(userId, queryParams)`

1.  `userId`를 기본 조건으로 설정합니다.
2.  `queryParams`에 `category`, `favorite`, `search`가 있으면, 해당 조건을 Sequelize `where` 절에 추가합니다.
    -   `search`의 경우 `title`, `url`, `username`, `notes` 필드에 대해 `LIKE` 검색을 수행합니다.
3.  데이터베이스에서 조건에 맞는 항목 목록을 조회합니다.
4.  만약 `queryParams.decrypt`가 `'true'`이면, 사용자의 `encryptionKey`로 각 항목의 비밀번호를 복호화하여 반환합니다. 그렇지 않으면 암호화된 상태 그대로 반환합니다.

### `getById(userId, itemId)`

1.  `userId`와 `itemId`로 특정 항목을 조회합니다.
2.  항목을 찾지 못하면 `404 Not Found` 오류를 발생시킵니다.
3.  사용자의 `encryptionKey`를 가져와 항목의 비밀번호를 **반드시 복호화**합니다.
4.  해당 항목의 `lastUsed` 시간을 현재 시간으로 업데이트하여 사용 기록을 남깁니다.
5.  복호화된 데이터가 포함된 객체를 반환합니다.

### `update(userId, itemId, updateData)`

1.  `userId`와 `itemId`로 수정할 항목을 찾습니다.
2.  `updateData`에 `password` 필드가 포함되어 있으면, `create`와 마찬가지로 새 비밀번호를 암호화합니다.
3.  `passwordItem.update()`를 호출하여 변경된 데이터를 데이터베이스에 저장합니다.

### `delete(userId, itemId)`

1.  `userId`와 `itemId`로 삭제할 항목을 찾습니다.
2.  `passwordItem.destroy()`를 호출하여 데이터베이스에서 해당 레코드를 삭제합니다.

### `getAllDecryptedItemsForUser(userId)`

1.  `userId`로 사용자를 찾아 `encryptionKey`를 가져옵니다. 키가 없으면 오류를 발생시킵니다.
2.  해당 사용자의 모든 `PasswordItem`을 조회합니다.
3.  각 항목의 암호화된 비밀번호를 `encryptionKey`를 사용하여 복호화합니다.
4.  복호화 과정에서 오류가 발생하면 콘솔에 오류를 기록하고 해당 비밀번호는 빈 문자열 등으로 처리될 수 있습니다.
5.  모든 항목이 포함된 배열을 반환하되, 각 항목의 비밀번호는 복호화된 상태입니다. (날짜 필드는 ISO 문자열 형태로 변환될 수 있음)

### `getExpiringItems(userId, days?, date?)`

1.  `userId`를 기본 조건으로 설정합니다.
2.  만료일(`expiryDate`)이 `NULL`이 아닌 항목만 대상으로 합니다.
3.  `days` 파라미터가 제공되면, 오늘부터 `days`일 후까지 만료되는 항목을 조회합니다. (이미 만료된 항목은 제외될 수 있음)
4.  `date` 파라미터가 제공되면, 해당 `date` 또는 그 이전에 만료되는 항목을 조회합니다.
5.  `days`와 `date`가 모두 제공되지 않으면, 이미 만료되었거나 오늘 만료되는 항목을 조회합니다.
6.  조건에 맞는 항목들을 만료일 오름차순으로 정렬하여 반환합니다. (비밀번호 필드는 제외하고 반환)

### `importItems(userId, itemsToImport)`

1.  가져올 데이터(`itemsToImport`) 배열을 순회합니다.
2.  각 항목의 비밀번호를 사용자의 `encryptionKey`로 암호화합니다.
3.  `title`과 `username`을 기준으로 이미 데이터베이스에 동일한 항목이 있는지 확인하여 중복 저장을 방지합니다.
4.  중복되지 않은 항목만 `PasswordItem.create`를 통해 데이터베이스에 저장합니다.
5.  최종적으로 가져오기에 성공한 항목, 건너뛴 항목, 실패한 항목의 수를 집계하여 반환합니다.

### `trackUsageAndUpdateLastUsed(...)`

1.  `getById`와 유사하게 항목을 조회합니다.
2.  항목의 `lastUsed` 필드를 현재 시간으로 갱신합니다.
3.  별도의 `PasswordHistory` 테이블에 사용 기록(어떤 작업, 시간, IP 주소, 접속 환경 등)을 레코드로 추가하여, 사용자의 활동을 상세하게 추적할 수 있도록 합니다.
