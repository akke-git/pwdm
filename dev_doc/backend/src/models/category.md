# `backend/src/models/category.ts` 코드 설명

이 파일은 `categories` 데이터베이스 테이블에 매핑되는 **`Category` 모델**을 정의합니다. 이 모델은 사용자가 수많은 비밀번호 항목들을 '업무', '개인', '금융' 등과 같이 의미 있는 그룹으로 체계적으로 분류하고 관리할 수 있도록 돕는 역할을 합니다.

---

## 주요 필드(Attributes) 상세 설명

`Category.init({...})` 객체 안에 정의된 각 필드는 데이터베이스 테이블의 컬럼에 해당합니다.

-   `id`: `INTEGER`, **Primary Key**. 각 카테고리의 고유 식별자입니다.
-   `userId`: `INTEGER`, `allowNull: false`, **Foreign Key**. 이 카테고리를 생성한 사용자를 식별하는 외래 키입니다. `users` 테이블의 `id`를 참조합니다.
-   `name`: `STRING`, `allowNull: false`. 카테고리의 이름입니다. (예: "업무용", "SNS 계정")
-   `color`: `STRING`. 프론트엔드에서 카테고리를 시각적으로 구분하기 위한 색상 코드입니다. (예: `#3498db`)
-   `icon`: `STRING`. 카테고리를 나타내는 아이콘의 이름 또는 경로입니다. (예: `folder`, `credit-card`)
-   `description`: `STRING`. 카테고리에 대한 부가적인 설명입니다.

---

## 핵심 기능 및 제약 조건

### 1. 복합 고유 키 (Composite Unique Index)

```typescript
indexes: [
  {
    unique: true,
    name: 'categories_user_name_unique',
    fields: ['user_id', 'name']
  }
]
```

이 모델의 가장 중요한 제약 조건 중 하나는 `indexes` 설정입니다. `user_id`와 `name` 두 필드를 묶어 **고유(unique) 인덱스**로 지정했습니다.

-   **의미**: **한 명의 사용자는 동일한 이름의 카테고리를 두 개 이상 생성할 수 없습니다.**
-   **예시**: A 사용자는 '쇼핑' 카테고리를 하나만 가질 수 있습니다. 하지만 B 사용자도 '쇼핑'이라는 이름의 카테고리를 가질 수 있습니다. 즉, 카테고리 이름의 고유성은 각 사용자 범위 내에서만 적용됩니다.
-   **효과**: 데이터의 정합성을 보장하고, 사용자가 자신의 카테고리 목록을 혼동 없이 관리할 수 있도록 합니다.

### 2. 모델 관계 (Associations)

```typescript
// 관계 설정
Category.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Category, { foreignKey: 'userId' });
```

-   `Category.belongsTo(User, ...)`: 하나의 카테고리는 반드시 한 명의 사용자에게 속합니다.
-   `User.hasMany(Category, ...)`: 한 명의 사용자는 여러 개의 카테고리를 생성하고 소유할 수 있습니다.

이 **일대다(One-to-Many)** 관계를 통해 특정 사용자가 생성한 모든 카테고리 목록을 쉽게 조회할 수 있습니다.
