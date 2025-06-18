# `backend/src/models/tag.ts` 코드 설명

이 파일은 **`Tag` 모델**과 **`TagItem` 모델**을 정의하여, 비밀번호 항목(`PasswordItem`)과 태그(`Tag`) 간의 **다대다(Many-to-Many)** 관계를 구현합니다. 이를 통해 사용자는 하나의 항목에 여러 태그를 붙이거나(예: '업무', '중요', '프로젝트X'), 하나의 태그를 여러 항목에 재사용하며 매우 유연하게 데이터를 분류하고 검색할 수 있습니다.

---

## 모델 상세 설명

### 1. `Tag` 모델

`Tag` 모델은 사용자가 생성하는 개별 태그 자체를 나타냅니다.

-   **주요 필드**:
    -   `id`: 태그의 고유 식별자.
    -   `userId`: 이 태그를 생성한 사용자의 ID. (`users` 테이블 참조)
    -   `name`: 태그의 이름. (예: 'urgent', 'personal')
    -   `color`: 태그를 시각적으로 구분하기 위한 색상 코드.
-   **고유 제약 조건**: `Category` 모델과 마찬가지로, `userId`와 `name`을 묶어 고유 인덱스로 지정했습니다. 즉, **한 명의 사용자는 동일한 이름의 태그를 중복해서 생성할 수 없습니다.**

### 2. `TagItem` 모델 (Join Table)

`TagItem` 모델은 `Tag`와 `PasswordItem` 사이를 연결하는 **중간 테이블(Join Table 또는 Pivot Table)** 역할을 합니다. 이 테이블의 각 레코드는 '어떤 태그'가 '어떤 비밀번호 항목'에 연결되었는지를 나타냅니다.

-   **주요 필드**:
    -   `id`: 관계의 고유 식별자.
    -   `tagId`: 연결된 `Tag`의 ID. (`tags` 테이블 참조)
    -   `passwordItemId`: 연결된 `PasswordItem`의 ID. (`password_items` 테이블 참조)
-   **고유 제약 조건**: `tag_id`와 `password_item_id`를 묶어 고유 인덱스로 지정했습니다. 이는 **하나의 비밀번호 항목에 동일한 태그가 두 번 이상 연결되는 것을 방지**하여 데이터의 중복을 막습니다.

---

## 핵심 기능: 다대다(Many-to-Many) 관계 설정

이 파일의 가장 중요한 부분은 `belongsToMany` 메소드를 사용한 관계 설정입니다.

```typescript
// 관계 설정
Tag.belongsToMany(PasswordItem, { 
  through: TagItem,          // 중간 테이블로 TagItem 모델을 사용
  foreignKey: 'tagId',       // TagItem 테이블에서 Tag를 참조하는 키
  otherKey: 'passwordItemId' // TagItem 테이블에서 PasswordItem을 참조하는 키
});

PasswordItem.belongsToMany(Tag, { 
  through: TagItem,          // 동일한 중간 테이블 사용
  foreignKey: 'passwordItemId',
  otherKey: 'tagId'
});
```

-   `Tag.belongsToMany(PasswordItem, ...)`: `Tag` 모델은 여러 `PasswordItem`에 속할 수 있습니다.
-   `PasswordItem.belongsToMany(Tag, ...)`: `PasswordItem` 모델은 여러 `Tag`를 가질 수 있습니다.
-   `through: TagItem`: 이 다대다 관계가 `TagItem`이라는 중간 테이블을 통해 이루어진다는 것을 Sequelize에 알려줍니다.
-   `foreignKey` & `otherKey`: 중간 테이블에서 각 모델을 참조하는 외래 키를 명시합니다.

이 관계 설정을 통해, Sequelize는 다음과 같은 강력하고 직관적인 메소드를 자동으로 제공합니다:
-   `passwordItem.getTags()`: 특정 비밀번호 항목에 연결된 모든 태그 목록을 가져옵니다.
-   `passwordItem.addTag(tag)`: 특정 비밀번호 항목에 태그를 추가합니다.
-   `tag.getPasswordItems()`: 특정 태그가 연결된 모든 비밀번호 항목 목록을 가져옵니다.
