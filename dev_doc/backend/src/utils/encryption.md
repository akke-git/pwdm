# `encryption.ts` 문서

**파일 경로**: `/project/pwdm/backend/src/utils/encryption.ts`

## 1. 개요

`encryption.ts` 파일은 백엔드 시스템에서 사용되는 다양한 암호화 관련 유틸리티 함수와 비밀번호 관리 기능을 제공합니다. 주요 기능으로는 텍스트 암호화 및 복호화, 마스터 비밀번호로부터 암호화 키 파생 및 재생성, 비밀번호 강도 검사, 안전한 랜덤 비밀번호 생성 등이 있습니다. 이 모듈은 `crypto` 내장 모듈을 활용하여 강력한 암호화 표준을 따릅니다.

## 2. 주요 상수

모듈 상단에는 암호화 작업에 사용되는 주요 상수들이 정의되어 있습니다.

-   `ENCRYPTION_KEY: string`: 
    -   환경 변수 `process.env.ENCRYPTION_KEY`에서 로드되는 기본 암호화 키입니다.
    -   환경 변수가 설정되지 않은 경우, 개발 환경을 위한 기본값 `'default_encryption_key_for_development'`가 사용됩니다.
    -   **주의**: 프로덕션 환경에서는 반드시 강력하고 유니크한 키를 환경 변수를 통해 설정해야 합니다.
-   `IV_LENGTH: number = 16`: AES 블록 크기(16바이트)로, 초기화 벡터(IV)의 길이를 정의합니다.
-   `SALT_LENGTH: number = 32`: 키 파생 함수에서 사용될 솔트(salt)의 길이(32바이트)를 정의합니다.
-   `KEY_LENGTH: number = 32`: 파생될 암호화 키의 길이(32바이트 = 256비트)를 정의합니다.
-   `ITERATIONS: number = 100000`: PBKDF2 키 파생 함수에서 사용될 반복 횟수입니다. 높은 반복 횟수는 무차별 대입 공격(Brute-force attack)에 대한 저항력을 높입니다.

## 3. 함수 상세

### 3.1. `deriveKeyFromPassword(masterPassword: string, salt?: Buffer): { key: Buffer; salt: Buffer }`

-   **설명**: 사용자의 마스터 비밀번호로부터 암호화 키를 안전하게 파생합니다. PBKDF2 알고리즘(SHA512 해시 사용)을 사용하여 키 스트레칭(key stretching)을 수행합니다.
-   **매개변수**:
    -   `masterPassword: string`: 사용자가 제공하는 마스터 비밀번호 (평문).
    -   `salt?: Buffer`: (선택 사항) 키 파생에 사용할 솔트. 제공되지 않으면 내부적으로 `SALT_LENGTH`에 정의된 길이의 랜덤 솔트가 생성됩니다.
-   **반환값**: `{ key: Buffer; salt: Buffer }`
    -   `key`: 파생된 암호화 키 (Buffer 형태).
    -   `salt`: 키 파생에 사용된 솔트 (Buffer 형태). 이 솔트는 나중에 동일한 키를 재생성하는 데 필요하므로 저장되어야 합니다.

### 3.2. `regenerateKeyFromPassword(masterPassword: string, saltHex: string): Buffer`

-   **설명**: 저장된 솔트와 사용자의 마스터 비밀번호를 사용하여 이전에 파생된 암호화 키를 재생성합니다. `deriveKeyFromPassword`와 동일한 PBKDF2 설정을 사용합니다.
-   **매개변수**:
    -   `masterPassword: string`: 사용자가 제공하는 마스터 비밀번호 (평문).
    -   `saltHex: string`: 이전에 `deriveKeyFromPassword` 함수를 통해 얻어 16진수 문자열로 저장된 솔트.
-   **반환값**: `Buffer` - 재생성된 암호화 키.

### 3.3. `encrypt(text: string, key: string = ENCRYPTION_KEY): string`

-   **설명**: 주어진 평문 텍스트를 AES-256-CBC 알고리즘을 사용하여 암호화합니다.
-   **매개변수**:
    -   `text: string`: 암호화할 평문 문자열.
    -   `key: string = ENCRYPTION_KEY`: (선택 사항) 암호화에 사용할 키. 기본값은 모듈 상수의 `ENCRYPTION_KEY`입니다. 이 키는 `crypto.scryptSync`를 통해 내부적으로 다시 한번 파생되며, 이때 하드코딩된 솔트 `'salt'`가 사용됩니다.
        -   **참고**: 만약 사용자별 데이터 암호화를 위해 이 함수를 사용한다면, `key` 매개변수에는 `deriveKeyFromPassword`를 통해 얻은 사용자 고유의 키를 전달하는 것이 보안상 더 안전합니다. 전역 `ENCRYPTION_KEY`는 시스템 전체 설정 등에 적합할 수 있습니다.
-   **반환값**: `string` - 암호화된 문자열. 형식은 `iv.toString('hex') + ':' + encryptedData.toString('hex')` 입니다. IV는 복호화 시 필요합니다.

### 3.4. `decrypt(encryptedText: string, key: string = ENCRYPTION_KEY): string`

-   **설명**: `encrypt` 함수를 통해 암호화된 문자열을 복호화하여 원본 평문을 얻습니다. AES-256-CBC 알고리즘을 사용합니다.
-   **매개변수**:
    -   `encryptedText: string`: 복호화할 암호화된 문자열 (형식: `IV(hex):암호문(hex)`).
    -   `key: string = ENCRYPTION_KEY`: (선택 사항) 복호화에 사용할 키. `encrypt` 함수에서 사용된 것과 동일한 키여야 합니다. 키 파생 방식 또한 `encrypt` 함수와 동일합니다.
-   **반환값**: `string` - 복호화된 평문 문자열.

### 3.5. `checkPasswordStrength(password: string): { score: number; feedback: string }`

-   **설명**: 입력된 비밀번호의 강도를 평가하고, 점수와 피드백 메시지를 반환합니다.
-   **매개변수**:
    -   `password: string`: 강도를 검사할 비밀번호 문자열.
-   **반환값**: `{ score: number; feedback: string }`
    -   `score`: 비밀번호 강도 점수 (0 ~ 100 사이). 점수가 높을수록 강력한 비밀번호입니다.
    -   `feedback`: 비밀번호 강도에 대한 사용자 친화적인 피드백 메시지.
-   **평가 기준**:
    -   최소 길이 (8자 이상 권장)
    -   소문자, 대문자, 숫자, 특수문자 포함 여부
    -   사용된 고유 문자의 수 (다양성)
    -   연속된 문자 (예: 'abc', '123') 사용 시 감점
    -   반복된 문자 (예: 'aaa', '111') 사용 시 감점

### 3.6. `generatePassword(length: number = 16, options: { ... } = {}): string`

-   **설명**: 안전하고 무작위적인 비밀번호를 생성합니다.
-   **매개변수**:
    -   `length: number = 16`: (선택 사항) 생성할 비밀번호의 길이. 기본값은 16입니다.
    -   `options?: object`: (선택 사항) 비밀번호에 포함될 문자 유형을 지정하는 객체.
        -   `includeUppercase?: boolean` (기본값: `true`): 대문자 포함 여부.
        -   `includeLowercase?: boolean` (기본값: `true`): 소문자 포함 여부.
        -   `includeNumbers?: boolean` (기본값: `true`): 숫자 포함 여부.
        -   `includeSymbols?: boolean` (기본값: `true`): 특수문자 (`!@#$%^&*()_+-=[]{}|;:,.<>?`) 포함 여부.
-   **반환값**: `string` - 생성된 랜덤 비밀번호.
-   **오류 처리**: 만약 모든 문자 유형 옵션이 `false`로 설정되어 사용 가능한 문자 집합이 없으면 오류를 발생시킵니다.

## 4. 사용 시나리오 예시

1.  **사용자 회원가입 시 마스터 키 및 데이터 암호화 키 생성**:
    ```typescript
    // 사용자가 마스터 비밀번호 설정
    const masterPassword = "user_master_password";
    const { key: userSpecificKey, salt: userSalt } = deriveKeyFromPassword(masterPassword);
    
    // userSalt는 DB에 저장 (e.g., userSalt.toString('hex'))
    // userSpecificKey는 민감 정보 암호화에 사용
    const sensitiveData = "Some secret data";
    const encryptedData = encrypt(sensitiveData, userSpecificKey.toString('hex')); // 실제 사용 시 key 타입을 일관성 있게 관리 필요
    ```

2.  **사용자 로그인 시 데이터 복호화 키 재생성**:
    ```typescript
    // 사용자가 마스터 비밀번호 입력
    const masterPasswordAttempt = "user_master_password_attempt";
    const storedSaltHex = "hex_string_of_the_stored_salt_for_this_user";
    const regeneratedKey = regenerateKeyFromPassword(masterPasswordAttempt, storedSaltHex);
    
    // regeneratedKey를 사용하여 암호화된 데이터 복호화
    // const decryptedData = decrypt(encryptedDataFromDB, regeneratedKey.toString('hex'));
    ```

## 5. 보안 고려사항

-   `ENCRYPTION_KEY`는 매우 민감한 정보이므로, 프로덕션 환경에서는 환경 변수를 통해 안전하게 관리하고, 소스 코드에 하드코딩하지 않아야 합니다.
-   `encrypt` 및 `decrypt` 함수에서 `key` 매개변수를 생략하고 기본 `ENCRYPTION_KEY`를 사용할 경우, 이 키는 `scryptSync`를 통해 파생되지만 하드코딩된 솔트('salt')를 사용합니다. 만약 여러 사용자 또는 여러 항목에 대해 동일한 `ENCRYPTION_KEY`를 사용한다면, 이는 모든 암호화된 데이터가 동일한 최종 암호화 키(IV 제외)로 보호됨을 의미할 수 있습니다. 사용자별 또는 항목별로 고유한 키(예: `deriveKeyFromPassword`로 생성된 키)를 `encrypt`/`decrypt` 함수에 명시적으로 전달하는 것이 더 강력한 보안 모델을 제공할 수 있습니다.
-   솔트(`salt`)는 암호화 키의 유일성을 보장하고 레인보우 테이블 공격을 방지하는 데 중요합니다. 각기 다른 암호화 키 파생 시에는 고유한 솔트를 사용해야 합니다.
-   PBKDF2의 반복 횟수(`ITERATIONS`)는 충분히 높게 설정하여 키 파생의 계산 비용을 증가시켜야 합니다. 현재 값(100,000)은 적절한 시작점이나, 시스템 성능과 보안 요구사항에 따라 조정될 수 있습니다.

이 문서는 `encryption.ts` 파일의 기능과 올바른 사용법, 그리고 관련된 보안적 측면을 이해하는 데 도움을 주기 위해 작성되었습니다.
