# `backend/src/models/session.ts` 코드 설명

이 파일은 `sessions` 데이터베이스 테이블에 매핑되는 **`Session` 모델**을 정의합니다. 이 모델은 사용자의 로그인 세션 정보를 관리하며, 각 레코드는 사용자의 단일 로그인 세션을 나타냅니다. 이를 통해 사용자의 로그인 상태를 유지하고, 여러 기기에서의 접속을 관리하며, 보안상 필요한 경우 특정 세션을 무효화하는 등의 기능을 구현할 수 있습니다.

---

## 주요 필드(Attributes) 상세 설명

`Session.init({...})` 객체 안에 정의된 각 필드는 데이터베이스 테이블의 컬럼에 해당합니다.

-   `id`: `INTEGER`, **Primary Key**. 각 세션의 고유 식별자입니다.
-   `userId`: `INTEGER`, `allowNull: false`, **Foreign Key**. 이 세션이 속한 사용자를 식별하는 외래 키입니다. `users` 테이블의 `id`를 참조합니다.
-   `token`: `STRING`, `allowNull: false`, `unique: true`. 세션을 식별하는 고유한 토큰 문자열입니다. 일반적으로 JWT(JSON Web Token) 또는 이와 유사한 형태의 불투명한 문자열이 저장됩니다. 이 토큰은 클라이언트와 서버 간의 인증에 사용됩니다.
-   `deviceInfo`: `STRING`, `allowNull: false`. 세션이 생성된 기기(예: 브라우저 User-Agent, 모바일 앱 버전 등)에 대한 정보입니다. 사용자가 어떤 환경에서 로그인했는지 추적하는 데 사용됩니다.
-   `ipAddress`: `STRING`, `allowNull: false`. 세션이 시작된 클라이언트의 IP 주소입니다. 보안 감사 및 위치 기반 서비스에 활용될 수 있습니다.
-   `lastActive`: `DATE`, `allowNull: false`, `defaultValue: DataTypes.NOW`. 해당 세션에서 사용자가 마지막으로 활동한 시간입니다. 세션 타임아웃 관리에 사용될 수 있습니다.
-   `expiresAt`: `DATE`, `allowNull: false`. 이 세션이 만료되는 시간입니다. 만료된 세션은 더 이상 유효하지 않습니다.
-   `isRevoked`: `BOOLEAN`, `allowNull: false`, `defaultValue: false`. 관리자나 사용자에 의해 해당 세션이 수동으로 무효화되었는지 여부를 나타냅니다. `true`이면 세션 토큰이 유효하더라도 접근이 거부됩니다.

---

## 인덱스 (Indexes)

효율적인 데이터 조회를 위해 다음과 같은 인덱스가 설정되어 있습니다:

-   `sessions_user_id`: `userId` 필드에 대한 인덱스로, 특정 사용자의 모든 세션을 빠르게 조회할 수 있도록 합니다.
-   `sessions_token`: `token` 필드에 대한 인덱스로, 클라이언트로부터 전달받은 세션 토큰을 사용하여 해당 세션을 신속하게 찾을 수 있도록 합니다. (이 필드는 `unique: true` 제약 조건도 가지고 있습니다.)

---

## 모델 관계 (Associations)

```typescript
// 관계 설정
Session.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Session, { foreignKey: 'userId' });
```

-   `Session.belongsTo(User, ...)`: 하나의 세션은 반드시 한 명의 사용자에게 속합니다.
-   `User.hasMany(Session, ...)`: 한 명의 사용자는 여러 개의 활성 세션을 가질 수 있습니다 (예: 데스크톱 웹 브라우저, 모바일 앱 동시 로그인).

이 **일대다(One-to-Many)** 관계를 통해 특정 사용자의 모든 세션 정보를 쉽게 관리하고, 필요한 경우 특정 세션을 조회하거나 무효화하는 등의 작업을 수행할 수 있습니다.
