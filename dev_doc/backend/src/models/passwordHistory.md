# `backend/src/models/passwordHistory.ts` 코드 설명

이 파일은 `password_history` 데이터베이스 테이블에 매핑되는 **`PasswordHistory` 모델**을 정의합니다. 이 모델은 사용자가 특정 비밀번호 항목에 대해 수행하는 모든 활동을 기록하는 **로그(Log) 또는 감사 추적(Audit Trail)** 역할을 합니다. 이를 통해 보안을 강화하고, 의심스러운 활동을 추적하며, 사용자에게 자신의 계정 활동 내역을 제공할 수 있습니다.

---

## 주요 필드(Attributes) 상세 설명

`PasswordHistory.init({...})` 객체 안에 정의된 각 필드는 데이터베이스 테이블의 컬럼에 해당합니다.

-   `id`: `INTEGER`, **Primary Key**. 각 기록의 고유 식별자입니다.
-   `passwordItemId`: `INTEGER`, `allowNull: false`, **Foreign Key**. 활동이 발생한 대상 `PasswordItem`의 ID입니다. `password_items` 테이블의 `id`를 참조합니다.
-   `userId`: `INTEGER`, `allowNull: false`, **Foreign Key**. 활동을 수행한 `User`의 ID입니다. `users` 테이블의 `id`를 참조합니다.
-   `action`: `STRING`, `allowNull: false`. 사용자가 수행한 행동의 종류를 나타냅니다. (예: `'view'`, `'copy'`, `'autofill'`, `'edit'` 등)
-   `timestamp`: `DATE`, `allowNull: false`. 활동이 발생한 정확한 시간입니다.
-   `userAgent`: `STRING`. 활동이 발생한 클라이언트(브라우저, 앱 등)의 User-Agent 문자열입니다. 사용자의 접속 환경을 파악하는 데 사용됩니다.
-   `ipAddress`: `STRING`. 활동을 수행한 클라이언트의 IP 주소입니다. 접속 위치를 추적하는 데 사용됩니다.

---

## 모델 관계 (Associations)

이 모델은 `User`와 `PasswordItem` 두 모델의 중간에서 이들을 연결하는 중요한 역할을 합니다.

```typescript
// User와의 관계
PasswordHistory.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PasswordHistory, { foreignKey: 'userId' });

// PasswordItem과의 관계
PasswordHistory.belongsTo(PasswordItem, { foreignKey: 'passwordItemId' });
PasswordItem.hasMany(PasswordHistory, { foreignKey: 'passwordItemId' });
```

### 관계 해석

1.  **`PasswordHistory`와 `User`의 관계 (`1:N`)**
    -   `PasswordHistory.belongsTo(User, ...)`: 하나의 `PasswordHistory` 기록은 반드시 한 명의 `User`에게 속합니다.
    -   `User.hasMany(PasswordHistory, ...)`: 한 명의 `User`는 여러 개의 `PasswordHistory` 기록을 가질 수 있습니다.

2.  **`PasswordHistory`와 `PasswordItem`의 관계 (`1:N`)**
    -   `PasswordHistory.belongsTo(PasswordItem, ...)`: 하나의 `PasswordHistory` 기록은 반드시 하나의 `PasswordItem`에 대해 발생합니다.
    -   `PasswordItem.hasMany(PasswordHistory, ...)`: 하나의 `PasswordItem`은 여러 번 사용될 수 있으므로, 여러 개의 `PasswordHistory` 기록을 가질 수 있습니다.

이러한 관계 설정을 통해, 특정 사용자의 모든 활동 기록을 조회하거나(`user.getPasswordHistories()`), 특정 비밀번호 항목의 전체 사용 내역을 조회하는(`passwordItem.getPasswordHistories()`) 등 복합적인 데이터 조회가 매우 용이해집니다.
