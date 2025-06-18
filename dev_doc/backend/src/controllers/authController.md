# `backend/src/controllers/authController.ts` 코드 설명

이 파일은 사용자 인증과 관련된 핵심 비즈니스 로직을 처리하는 컨트롤러입니다. `authRoutes.ts`에서 정의된 각 API 경로에 대한 요청을 받아, 데이터베이스와 상호작용하고, 데이터를 처리하며, 최종 결과를 클라이언트에게 응답하는 역할을 합니다.

주요 기능은 다음과 같습니다:
-   일반 회원가입 및 로그인
-   Google 계정을 이용한 소셜 로그인
-   로그인된 사용자의 프로필 정보 조회
-   마스터 비밀번호 변경

---

## 1. 모듈 임포트 및 환경 변수 설정

컨트롤러 로직에 필요한 라이브러리와 모듈을 가져오고, JWT(JSON Web Token) 및 Google OAuth 관련 환경 변수를 설정합니다.

```typescript
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/index';
import { encrypt, deriveKeyFromPassword } from '../utils/encryption';
import { createSession } from './sessionController';
import axios from 'axios';

// 환경 변수
const JWT_SECRET = process.env.JWT_SECRET || '...';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Google OAuth 관련 환경 변수
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
```

-   **`jwt`**: 로그인 성공 시 사용자 정보를 담은 JWT를 생성하고 서명하는 데 사용됩니다.
-   **`bcrypt`**: 비밀번호를 안전하게 해싱(hashing)하고, 로그인 시 입력된 비밀번호와 해시된 비밀번호를 비교하는 데 사용됩니다. (실제 해싱 로직은 User 모델의 hook에 위임되어 있습니다.)
-   **`User`**: `User` 데이터베이스 테이블과 상호작용하기 위한 Sequelize 모델입니다.
-   **`encryption` 유틸**: 사용자의 데이터를 암호화하고, 마스터 비밀번호로부터 암호화 키를 생성하는 유틸리티 함수들을 포함합니다.
-   **`sessionController`**: 사용자 로그인 시 새로운 세션을 생성하는 함수를 가져옵니다.
-   **`axios`**: Google 서버에 API 요청을 보내기 위한 HTTP 클라이언트 라이브러리입니다.
-   **환경 변수**: 보안에 민감한 JWT 비밀 키나 Google 클라이언트 ID 같은 값들을 `.env` 파일에서 불러와 사용합니다. 만약 `.env` 파일에 값이 없으면, 개발 환경을 위한 기본값을 사용합니다.

---

## 2. 사용자 등록 (`register`)

새로운 사용자를 시스템에 등록하는 함수입니다.

**프로세스:**
1.  **입력 값 받기**: 요청(request)의 본문(body)에서 `username`, `email`, `password`, `masterPassword`를 추출합니다.
2.  **유효성 검사**: 모든 필수 필드가 입력되었는지 확인합니다.
3.  **이메일 중복 확인**: 입력된 이메일이 이미 데이터베이스에 존재하는지 확인하여 중복 가입을 방지합니다.
4.  **암호화 키 생성**: `deriveKeyFromPassword` 함수를 사용하여 사용자가 입력한 `masterPassword`로부터 암호화에 사용할 키와 솔트를 생성합니다. 생성된 키와 솔트는 **16진수 문자열(hex string)** 형태로 변환되어 각각 `encryptionKey`와 `keySalt`로 저장됩니다. 이 키는 나중에 사용자의 비밀번호 데이터를 암호화하는 데 사용됩니다.
5.  **사용자 생성**: `User.create`를 호출하여 새로운 사용자 레코드를 데이터베이스에 저장합니다.
    -   **중요**: `password`와 `masterPassword`는 데이터베이스에 저장되기 전에 `User` 모델에 정의된 `beforeCreate` hook에 의해 자동으로 해싱됩니다. 원본 비밀번호가 그대로 저장되지 않습니다.
6.  **성공 응답**: 새로 생성된 사용자의 정보(민감 정보 제외: `id`, `username`, `email`, `createdAt`)와 함께 성공 메시지를 클라이언트에게 보냅니다.
7.  **에러 처리**: 과정 중 오류가 발생하면, 적절한 오류 메시지를 클라이언트에게 응답합니다. 특히, `SequelizeValidationError` 또는 `SequelizeUniqueConstraintError`와 같은 Sequelize 관련 오류 발생 시 "입력 데이터가 유효하지 않습니다."와 같이 보다 구체적인 사용자 친화적 메시지를 반환합니다.

```typescript
export const register = async (req: Request, res: Response) => {
  // ... 로직 ...
};
```

---

## 3. 로그인 (`login`)

기존 사용자의 로그인을 처리하는 함수입니다.

**프로세스:**
1.  **입력 값 받기**: `email`, `password`, `masterPassword`를 요청 본문에서 받습니다.
2.  **사용자 조회**: 입력된 `email`로 데이터베이스에서 사용자를 찾습니다.
3.  **비밀번호 검증**: `user.validatePassword` 메소드를 호출하여 입력된 `password`가 저장된 해시 값과 일치하는지 확인합니다.
4.  **마스터 비밀번호 검증**: `user.validateMasterPassword` 메소드를 호출하여 입력된 `masterPassword`가 저장된 해시 값과 일치하는지 확인합니다.
5.  **로그인 시간 업데이트**: 검증이 모두 성공하면, 사용자의 `lastLogin` 필드를 현재 시간으로 업데이트합니다.
6.  **JWT 생성**: `jwt.sign`을 사용하여 사용자의 `id`, `email`, `username`을 담은 JWT를 생성합니다. 이 토큰은 이후의 API 요청에서 사용자를 인증하는 데 사용됩니다.
7.  **세션 생성**: `createSession` 함수를 호출하여 로그인 세션 정보를 데이터베이스에 기록합니다.
8.  **성공 응답**: 생성된 JWT와 사용자 정보(`id`, `username`, `email`, `lastLogin`, `twoFactorEnabled`)를 클라이언트에게 전달합니다.

```typescript
export const login = async (req: Request, res: Response) => {
  // ... 로직 ...
};
```

---

## 4. Google 로그인 (`googleLogin`)

Google 계정을 사용하여 로그인하거나 신규 가입하는 로직을 처리합니다.

**프로세스:**
1.  **입력 값 받기**: 프론트엔드에서 받은 `googleToken`, `email`, `name`(선택적 사용자 이름), `masterPassword`를 받습니다.
2.  **Google 토큰 검증**: Google의 `tokeninfo` 엔드포인트에 `axios`로 요청을 보내 프론트에서 받은 `googleToken`이 유효한지 검증합니다. 이 과정에서 토큰에 포함된 이메일과 클라이언트 ID가 우리 시스템의 정보와 일치하는지 확인합니다.
    -   **환경 변수 의존성**: `GOOGLE_CLIENT_ID`와 `GOOGLE_CLIENT_SECRET` 환경 변수가 설정되어 있어야 합니다. 만약 이 변수들이 설정되지 않은 경우:
        -   **개발 환경 (`NODE_ENV === 'development'`)**: 토큰 검증 과정을 건너뛰고 진행합니다.
        -   **운영 환경**: 서버 설정 오류로 간주하고 `500 Internal Server Error`를 반환합니다.
3.  **사용자 조회**: `email`로 데이터베이스에서 사용자를 찾습니다.
4.  **분기 처리**:
    -   **기존 사용자**: `validateMasterPassword`를 통해 입력된 마스터 비밀번호가 올바른지 검증합니다.
    -   **신규 사용자**: Google 계정 정보와 입력받은 `masterPassword`를 사용하여 새로운 사용자 계정을 생성합니다. `username`은 제공된 `name` 값을 사용하거나, `name`이 없으면 이메일 주소의 `@` 앞부분을 사용합니다. 일반 `password`는 임의의 안전한 문자열로 자동 생성되며(사용자는 Google 로그인을 통해 접근하므로 직접 사용하지 않음), `isGoogleUser` 플래그를 `true`로 설정합니다. `masterPassword`로부터 유도된 `encryptionKey`와 `keySalt`도 16진수 문자열로 저장됩니다.
5.  **로그인 처리**: 위 과정이 성공하면, 일반 로그인과 동일하게 마지막 로그인 시간을 업데이트하고, JWT를 생성하며, 세션을 기록한 후 성공 응답을 보냅니다. 응답에는 JWT와 사용자 정보(`id`, `username`, `email`, `lastLogin`, `twoFactorEnabled`)가 포함됩니다.

```typescript
export const googleLogin = async (req: Request, res: Response) => {
  // ... 로직 ...
};
```

---

## 5. 프로필 조회 (`getProfile`)

로그인된 사용자의 정보를 조회합니다.

**프로세스:**
1.  **사용자 ID 확인**: `authenticateToken` 미들웨어가 JWT를 검증하고 `req.user`에 저장한 사용자 정보에서 `id`를 가져옵니다.
2.  **사용자 조회**: `User.findByPk`를 사용하여 해당 `id`의 사용자 정보를 데이터베이스에서 조회합니다. 이때 `attributes` 옵션을 사용하여 비밀번호 해시 등 민감한 정보를 제외하고 필요한 필드만 선택적으로 가져옵니다.
3.  **성공 응답**: 조회된 사용자 정보를 클라이언트에게 전달합니다.

```typescript
export const getProfile = async (req: Request, res: Response) => {
  // ... 로직 ...
};
```

---

## 6. 마스터 비밀번호 변경 (`changeMasterPassword`)

사용자의 마스터 비밀번호와 관련 암호화 키를 변경합니다.

**프로세스:**
1.  **입력 값 받기**: `req.user.id`로 사용자 ID를, 요청 본문에서 `currentMasterPassword`와 `newMasterPassword`를 받습니다.
2.  **사용자 조회**: `id`로 사용자를 찾습니다.
3.  **현재 마스터 비밀번호 검증**: `validateMasterPassword`를 통해 `currentMasterPassword`가 올바른지 확인합니다.
4.  **새 암호화 키 생성**: `deriveKeyFromPassword`를 사용하여 `newMasterPassword`로부터 새로운 암호화 키와 솔트를 생성합니다. 생성된 키와 솔트는 **16진수 문자열(hex string)** 형태로 변환되어 각각 `encryptionKey`와 `keySalt`로 저장됩니다.
5.  **정보 업데이트**: 사용자의 `masterPasswordHash` (새로운 `newMasterPassword`는 모델 hook에 의해 해싱됨), 새로운 `encryptionKey`, 그리고 새로운 `keySalt`를 데이터베이스에 저장합니다.
    -   **매우 중요**: 이 컨트롤러 함수는 **마스터 비밀번호와 암호화 키만 업데이트**합니다. 사용자의 기존에 암호화된 데이터(예: 저장된 비밀번호 항목들)를 **새로운 암호화 키로 다시 암호화하는 과정은 포함되어 있지 않습니다.** 따라서 마스터 비밀번호를 변경한 후 기존 데이터에 접근하려면, 모든 관련 데이터를 새로운 키로 마이그레이션(재암호화)하는 별도의 절차가 반드시 필요합니다. 이 점을 간과하면 기존 데이터를 해독할 수 없게 됩니다.
6.  **성공 응답**: 변경이 완료되었음을 알리는 성공 메시지를 응답합니다.

```typescript
export const changeMasterPassword = async (req: Request, res: Response) => {
  // ... 로직 ...
};
```
