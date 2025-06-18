# `backend/src/models/user.ts` 코드 설명

이 파일은 `users` 데이터베이스 테이블에 매핑되는 **`User` 모델**을 정의합니다. `User` 모델은 사용자 계정 정보, 인증 자격 증명, 그리고 애플리케이션의 보안과 관련된 모든 핵심 데이터를 관리하는 청사진입니다.

---

## 주요 필드(Attributes) 상세 설명

`User.init({...})` 객체 안에 정의된 각 필드는 데이터베이스 테이블의 컬럼에 해당합니다.

### 기본 사용자 정보
-   `id`: `INTEGER`, **Primary Key**. 사용자의 고유 식별자이며, 자동으로 증가합니다.
-   `username`: `STRING`, `allowNull: false`, `unique: true`. 사용자의 닉네임 또는 아이디. 반드시 존재해야 하며, 다른 사용자와 중복될 수 없습니다.
-   `email`: `STRING`, `allowNull: false`, `unique: true`. 사용자의 이메일 주소. 로그인 및 알림에 사용되며, 유효한 이메일 형식이어야 합니다 (`validate: { isEmail: true }`).
-   `isGoogleUser`: `BOOLEAN`, `defaultValue: false`. 사용자가 일반 회원가입이 아닌, 구글 OAuth를 통해 가입했는지 여부를 나타냅니다.
-   `lastLogin`: `DATE`. 사용자의 마지막 로그인 시간을 기록합니다.

### 보안 및 인증 관련 필드
-   `password`: `STRING`, `allowNull: false`. **(해시된 값)** 사용자의 계정 로그인 비밀번호입니다. 원본 비밀번호는 절대 저장되지 않습니다. (아래 'Hooks' 섹션 참조)
-   `masterPasswordHash`: `STRING`, `allowNull: false`. **(해시된 값)** 저장된 비밀번호 항목들을 암호화/복호화하는 데 사용되는 **마스터 비밀번호**의 해시값입니다.
-   `encryptionKey`: `STRING`. 마스터 비밀번호로부터 파생되어, 실제 비밀번호 항목(`PasswordItem`)들을 암호화하는 데 사용되는 대칭키입니다. 이 키 자체도 암호화되어 저장될 수 있습니다.
-   `keySalt`: `STRING`. `encryptionKey`를 생성할 때 사용되는 솔트(salt) 값입니다. 동일한 마스터 비밀번호라도 사용자마다 다른 암호화 키를 갖도록 보장합니다.

### 2단계 인증 (2FA) 필드
-   `twoFactorSecret`: `STRING`. 2단계 인증 앱(예: Google Authenticator)에서 사용하는 비밀 키입니다.
-   `twoFactorEnabled`: `BOOLEAN`, `defaultValue: false`. 사용자가 2단계 인증을 활성화했는지 여부를 나타냅니다.
-   `backupCodes`: `TEXT`. **(해시된 값)** 2단계 인증 기기를 분실했을 때를 대비한 백업 코드들의 해시 목록입니다.

---

## 핵심 기능 및 로직

### 1. Sequelize Hooks: 자동 비밀번호 해싱

이 모델의 가장 중요한 보안 기능 중 하나는 Sequelize **Hooks**를 사용한 자동 해싱입니다.

-   `beforeCreate`: 새로운 사용자가 생성되기 직전에, `password`와 `masterPasswordHash` 필드의 값을 `bcrypt.hash()`를 사용하여 해싱합니다. 따라서 데이터베이스에는 원본 비밀번호가 아닌, 해시된 값만 저장됩니다.
-   `beforeUpdate`: 사용자 정보가 업데이트될 때, `password`나 `masterPasswordHash` 필드가 변경되었는지(`user.changed(...)`) 확인하고, 변경된 경우에만 새로 해싱하여 저장합니다. 불필요한 연산을 방지하는 효율적인 방식입니다.

### 2. 인스턴스 메소드: 비밀번호 검증

-   `validatePassword(password)`: 사용자가 로그인 시 입력한 비밀번호(평문)를 인자로 받아, 데이터베이스에 저장된 해시값과 `bcrypt.compare()`를 통해 일치하는지 검증합니다. `true` 또는 `false`를 반환합니다.
-   `validateMasterPassword(masterPassword)`: 마스터 비밀번호를 검증할 때 사용되는 동일한 방식의 메소드입니다.

### 3. 모델 관계 (Associations)

`User` 모델은 다른 모델들과 다음과 같은 관계를 맺습니다. (관계 설정 코드는 각 모델 파일에 분산되어 정의될 수 있습니다.)
-   **User vs PasswordItem**: 한 명의 사용자는 여러 개의 비밀번호 항목을 가질 수 있습니다. (`1:N`, `hasMany`)
-   **User vs Category**: 한 명의 사용자는 여러 개의 카테고리를 생성할 수 있습니다. (`1:N`, `hasMany`)
-   **User vs Session**: 한 명의 사용자는 여러 개의 로그인 세션을 가질 수 있습니다. (`1:N`, `hasMany`)
