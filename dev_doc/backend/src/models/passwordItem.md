# `backend/src/models/passwordItem.ts` 코드 설명

이 파일은 `password_items` 데이터베이스 테이블에 매핑되는 **`PasswordItem` 모델**을 정의합니다. 이 모델은 사용자가 저장하는 개별 로그인 정보, 보안 노트 등 각각의 비밀번호 항목에 대한 데이터 구조를 나타냅니다. 이 애플리케이션에서 가장 핵심적인 데이터를 담는 모델입니다.

---

## 주요 필드(Attributes) 상세 설명

`PasswordItem.init({...})` 객체 안에 정의된 각 필드는 데이터베이스 테이블의 컬럼에 해당합니다.

-   `id`: `INTEGER`, **Primary Key**. 각 비밀번호 항목의 고유 식별자이며, 자동으로 증가합니다.
-   `userId`: `INTEGER`, `allowNull: false`, **Foreign Key**. 이 항목이 어떤 사용자에게 속하는지를 나타내는 외래 키입니다. `users` 테이블의 `id`를 참조합니다.
-   `title`: `STRING`, `allowNull: false`. 비밀번호 항목의 제목(예: "Google", "Naver"). 사용자가 항목을 식별하는 데 사용됩니다.
-   `url`: `STRING`. 해당 계정의 웹사이트 주소입니다.
-   `username`: `STRING`. 해당 계정의 아이디 또는 이메일 주소입니다.
-   `password`: `TEXT`, `allowNull: false`. **가장 중요한 필드**. 사용자의 실제 비밀번호가 **암호화된 상태**로 저장됩니다. 원본 평문 비밀번호는 절대 데이터베이스에 저장되지 않습니다.
-   `category`: `STRING`. 항목을 분류하기 위한 카테고리 이름입니다. (예: "업무", "개인", "금융")
-   `tags`: `JSON`. 항목에 여러 태그를 자유롭게 추가할 수 있도록 JSON 배열 형태로 저장됩니다. 이를 통해 유연한 검색 및 분류가 가능합니다.
-   `notes`: `TEXT`. 비밀번호 외에 추가적으로 저장하고 싶은 메모나 보안 질문 등을 위한 필드입니다. 이 필드의 내용도 암호화되어야 안전합니다. (현재 서비스 로직에서 암호화 처리 필요)
-   `isFavorite`: `BOOLEAN`, `defaultValue: false`. 사용자가 자주 사용하는 항목을 '즐겨찾기'로 표시할 수 있는 기능입니다.
-   `lastUsed`: `DATE`. 사용자가 이 항목을 마지막으로 사용한 날짜와 시간입니다.
-   `expiryDate`: `DATE`. 비밀번호의 만료일을 설정하여, 주기적인 변경을 유도할 수 있습니다.

---

## 모델 관계 (Associations)

이 파일의 하단부에는 `PasswordItem` 모델과 `User` 모델 간의 관계가 명확하게 정의되어 있습니다.

```typescript
// 관계 설정
PasswordItem.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PasswordItem, { foreignKey: 'userId' });
```

-   `PasswordItem.belongsTo(User, ...)`: `PasswordItem` 모델은 `User` 모델에 속한다는 것을 의미합니다. 즉, 하나의 비밀번호 항목은 반드시 한 명의 사용자를 가집니다. `foreignKey: 'userId'`는 이 관계를 맺는 키가 `password_items` 테이블의 `userId` 컬럼임을 명시합니다.

-   `User.hasMany(PasswordItem, ...)`: `User` 모델은 여러 개의 `PasswordItem`을 가질 수 있다는 것을 의미합니다. 즉, 한 명의 사용자는 여러 개의 비밀번호 항목을 저장할 수 있습니다.

이 두 줄의 코드를 통해 Sequelize는 **일대다(One-to-Many)** 관계를 설정합니다. 이 관계 덕분에, 특정 사용자의 모든 비밀번호 항목을 쉽게 조회하거나(`user.getPasswordItems()`), 특정 비밀번호 항목의 소유자 정보를 가져오는(`passwordItem.getUser()`) 등의 작업을 편리하게 수행할 수 있습니다.
