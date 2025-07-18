# `backend/src/controllers/tagController.ts` 코드 설명

이 파일은 `tagRoutes.ts`에서 정의된 API 엔드포인트 요청을 받아 실제 비즈니스 로직을 수행하고, 그 결과를 클라이언트에게 응답하는 **태그 컨트롤러**입니다. 태그 자체의 CRUD 작업뿐만 아니라, 태그와 비밀번호 항목(`PasswordItem`) 간의 다대다(Many-to-Many) 관계를 관리하는 핵심 로직을 포함합니다. Sequelize 모델(`Tag`, `TagItem`, `PasswordItem`)을 직접 사용하여 데이터베이스와 상호작용합니다.

모든 컨트롤러 함수는 `async`로 선언되어 비동기적으로 작동하며, `try...catch` 블록을 사용하여 일반적인 오류 처리를 수행합니다.

---

## 주요 컨트롤러 함수 상세 설명

### 태그 자체 관리

1.  **`createTag`**
    -   **설명**: 새로운 태그를 생성합니다.
    -   **로직**: 이름 필수 검증, 사용자별 이름 중복 검증 후 `Tag.create()`로 생성.

2.  **`getAllTags`**
    -   **설명**: 현재 사용자의 모든 태그를 이름 오름차순으로 조회합니다.
    -   **로직**: `Tag.findAll()` 사용.

3.  **`getTag`**
    -   **설명**: 특정 ID의 태그 정보와 해당 태그가 사용된 비밀번호 항목의 개수를 조회합니다.
    -   **로직**: `Tag.findOne()`으로 태그 조회, `TagItem.count()`로 사용된 항목 수 집계.

4.  **`updateTag`**
    -   **설명**: 특정 태그의 이름 또는 색상을 수정합니다.
    -   **로직**: 태그 존재 여부 확인. 이름 변경 시 사용자별 이름 중복 검증 후 `tag.update()`로 수정.

5.  **`deleteTag`**
    -   **설명**: 특정 태그를 삭제합니다.
    -   **로직**: 태그 존재 여부 확인. `TagItem.destroy()`로 해당 태그와 연결된 모든 관계를 먼저 삭제한 후, `tag.destroy()`로 태그 자체를 삭제.

### 비밀번호 항목 - 태그 관계 관리

1.  **`addTagToPasswordItem`**
    -   **설명**: 특정 비밀번호 항목에 하나 이상의 태그를 연결합니다.
    -   **로직**:
        1.  요청 본문에서 태그 ID 목록(`tagIds`)을 받습니다.
        2.  `PasswordItem` 및 요청된 모든 `Tag`가 현재 사용자의 소유인지 확인합니다.
        3.  각 태그에 대해, `TagItem.findOne()`으로 이미 해당 비밀번호 항목과 연결되어 있는지 확인합니다.
        4.  연결되어 있지 않은 경우에만 `TagItem.create()`를 사용하여 새 연결을 생성합니다.

2.  **`removeTagFromPasswordItem`**
    -   **설명**: 특정 비밀번호 항목에서 특정 태그와의 연결을 제거합니다.
    -   **로직**:
        1.  `PasswordItem`과 `Tag`가 현재 사용자의 소유인지 확인합니다.
        2.  `TagItem.destroy()`를 사용하여 `passwordItemId`와 `tagId`가 일치하는 연결 레코드를 삭제합니다.
        3.  삭제된 레코드가 없으면(즉, 원래 연결이 없었으면) `404 Not Found`를 반환합니다.

3.  **`getPasswordItemTags`**
    -   **설명**: 특정 비밀번호 항목에 연결된 모든 태그 목록을 조회합니다.
    -   **로직**:
        1.  `PasswordItem.findOne()`을 사용하되, `include` 옵션을 통해 연결된 `Tag` 모델의 정보까지 함께 가져옵니다.
        2.  `through: { attributes: [] }` 옵션을 사용하여 중간 테이블인 `TagItem`의 속성은 결과에 포함하지 않습니다.
        3.  조회된 `passwordItem.Tags` (Sequelize가 자동으로 생성하는 관계 속성)를 반환합니다.

### 태그 통계 (일부)

-   **`getTagStats`** (파일에 전체 코드가 표시되지 않았지만, `categoryController.getCategoryStats`와 유사할 것으로 예상)
    -   **예상 설명**: 각 태그별로 해당 태그가 사용된 비밀번호 항목의 수를 집계하거나, 사용 빈도가 높은 태그 순위 등의 통계를 제공할 것으로 보입니다.

---

이 컨트롤러는 태그 관리의 전반적인 기능을 담당하며, 특히 `TagItem` 중간 테이블을 효과적으로 사용하여 태그와 비밀번호 항목 간의 다대다 관계를 구현하고 관리합니다. 데이터 유효성 검사와 사용자 권한 확인(모든 작업은 현재 로그인한 `userId` 범위 내에서 이루어짐)이 각 함수에 포함되어 있습니다.
