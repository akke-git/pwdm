# `passwordItemTypes.ts` 문서

**파일 경로**: `/project/pwdm/backend/src/types/passwordItemTypes.ts`

## 1. 개요

`passwordItemTypes.ts` 파일은 백엔드 시스템에서 비밀번호 항목(`PasswordItem`) 데이터의 구조를 정의하는 TypeScript 인터페이스들을 포함하고 있습니다. 이 인터페이스들은 주로 Sequelize 모델과 상호작용할 때 데이터의 형태를 명확히 하고, 타입 안정성을 보장하기 위해 사용됩니다. 

파일 내에는 새로운 비밀번호 항목을 생성할 때 필요한 속성을 정의하는 인터페이스와 데이터베이스로부터 조회된 비밀번호 항목의 전체 속성을 정의하는 인터페이스가 있습니다.

## 2. 인터페이스 상세

### 2.1. `IPasswordItemCreationAttributes`

이 인터페이스는 새로운 비밀번호 항목을 데이터베이스에 생성할 때 필요한 속성들을 정의합니다. 사용자가 직접 입력하거나 시스템 초기 설정에 필요한 최소한의 정보를 포함합니다.

```typescript
export interface IPasswordItemCreationAttributes {
  userId: number; // 사용자 ID (숫자형)
  title: string; // 항목 제목 또는 사이트 이름
  url?: string | null; // 관련 웹사이트 URL (선택 사항)
  username?: string | null; // 사용자 이름 또는 아이디 (선택 사항)
  password: string; // 암호화되기 전의 평문 비밀번호
  category?: string | null; // 카테고리 (선택 사항)
  tags?: string[] | null; // 태그 배열 (선택 사항)
  notes?: string | null; // 추가 메모 (선택 사항)
  isFavorite?: boolean | null; // 즐겨찾기 여부 (선택 사항)
  expiryDate?: Date | string | null; // 만료일 (Date 객체 또는 문자열, 선택 사항)
}
```

**속성 설명:**

-   `userId: number`: 이 비밀번호 항목을 소유한 사용자의 고유 ID입니다. (주석에 따르면 과거 문자열에서 숫자 타입으로 변경되었습니다.)
-   `title: string`: 비밀번호 항목의 제목입니다. 일반적으로 웹사이트 이름이나 서비스명으로 사용됩니다.
-   `url?: string | null`: 해당 계정 정보를 사용하는 웹사이트의 URL입니다. (선택 사항)
-   `username?: string | null`: 로그인 시 사용되는 사용자 이름 또는 이메일 주소입니다. (선택 사항)
-   `password: string`: **평문(Plain Text) 비밀번호**입니다. 이 값은 데이터베이스에 저장되기 전에 반드시 암호화 과정을 거쳐야 합니다.
-   `category?: string | null`: 비밀번호 항목을 분류하기 위한 카테고리 이름입니다. (선택 사항)
-   `tags?: string[] | null`: 검색이나 필터링을 용이하게 하기 위한 태그들의 배열입니다. (선택 사항)
-   `notes?: string | null`: 해당 항목에 대한 추가적인 메모나 설명입니다. (선택 사항)
-   `isFavorite?: boolean | null`: 사용자가 이 항목을 즐겨찾기로 표시했는지 여부입니다. (선택 사항)
-   `expiryDate?: Date | string | null`: 비밀번호의 만료 예정일입니다. 유연한 입력을 위해 `Date` 객체 또는 날짜 형식의 문자열을 허용합니다. (선택 사항)

### 2.2. `IPasswordItemAttributes`

이 인터페이스는 데이터베이스에 저장되어 있거나, 데이터베이스에서 조회된 비밀번호 항목의 전체 속성을 정의합니다. `IPasswordItemCreationAttributes`의 모든 필드를 포함하며, 데이터베이스 시스템에 의해 자동으로 관리되는 ID, 생성일, 수정일 등의 추가적인 시스템 필드들을 포함합니다.

```typescript
export interface IPasswordItemAttributes {
  id: number; // 항목의 고유 ID (숫자형)
  userId: number; // 사용자 ID (숫자형)
  title: string; // 항목 제목
  url?: string | null; // 관련 웹사이트 URL (선택 사항)
  username?: string | null; // 사용자 이름 (선택 사항)
  password: string; // 데이터베이스에 저장된 암호화된 비밀번호
  category?: string | null; // 카테고리 (선택 사항)
  tags?: string[] | null; // 태그 배열 (선택 사항)
  notes?: string | null; // 추가 메모 (선택 사항)
  isFavorite?: boolean | null; // 즐겨찾기 여부 (선택 사항)
  lastUsed?: Date | null; // 마지막 사용일 (선택 사항)
  expiryDate?: Date | string | null; // 만료일 (Date 객체 또는 문자열, 선택 사항)
  createdAt?: Date; // 생성 시각 (데이터베이스 자동 관리)
  updatedAt?: Date; // 마지막 수정 시각 (데이터베이스 자동 관리)
}
```

**속성 설명:**

-   `id: number`: 데이터베이스에서 각 비밀번호 항목에 할당되는 고유한 기본 키(Primary Key) 값입니다. (주석에 따르면 과거 문자열에서 숫자 타입으로 변경되었습니다.)
-   `userId: number`: `IPasswordItemCreationAttributes`의 `userId`와 동일합니다.
-   `title: string`: `IPasswordItemCreationAttributes`의 `title`과 동일합니다.
-   `url?: string | null`: `IPasswordItemCreationAttributes`의 `url`과 동일합니다.
-   `username?: string | null`: `IPasswordItemCreationAttributes`의 `username`과 동일합니다.
-   `password: string`: **데이터베이스에 저장된 형태의 암호화된 비밀번호 문자열**입니다. 클라이언트에게 이 값을 직접 노출해서는 안 되며, 필요한 경우 서비스 계층에서 복호화 과정을 거쳐 평문으로 변환될 수 있습니다 (예: 사용자 본인 확인 후 비밀번호 보기 기능).
-   `category?: string | null`: `IPasswordItemCreationAttributes`의 `category`와 동일합니다.
-   `tags?: string[] | null`: `IPasswordItemCreationAttributes`의 `tags`와 동일합니다.
-   `notes?: string | null`: `IPasswordItemCreationAttributes`의 `notes`와 동일합니다.
-   `isFavorite?: boolean | null`: `IPasswordItemCreationAttributes`의 `isFavorite`과 동일합니다.
-   `lastUsed?: Date | null`: 이 비밀번호 항목이 마지막으로 사용된 날짜 및 시각입니다. (선택 사항)
-   `expiryDate?: Date | string | null`: `IPasswordItemCreationAttributes`의 `expiryDate`와 동일합니다.
-   `createdAt?: Date`: 이 항목이 데이터베이스에 처음 생성된 시각입니다. 일반적으로 데이터베이스 시스템(ORM)에 의해 자동으로 설정됩니다.
-   `updatedAt?: Date`: 이 항목의 정보가 마지막으로 수정된 시각입니다. 일반적으로 데이터베이스 시스템(ORM)에 의해 자동으로 설정됩니다.

## 3. 사용 예시 및 참고사항

-   이 타입들은 주로 서비스 계층(Service Layer)이나 컨트롤러 계층(Controller Layer)에서 데이터베이스 모델과의 상호작용 시 사용됩니다.
-   `password` 필드는 생성 시점에는 평문이지만, 데이터베이스에 저장될 때는 반드시 강력한 암호화 알고리즘을 통해 암호화되어야 합니다. 조회 시에는 암호화된 상태로 가져오며, 특정 기능(예: 비밀번호 보기)을 위해 복호화할 수 있습니다.
-   `userId`와 `id` 필드의 타입이 `number`로 통일된 것은 데이터베이스 스키마와의 일관성을 유지하기 위함으로 보입니다.

이 문서는 `passwordItemTypes.ts` 파일에 정의된 타입들의 의미와 사용 목적을 명확히 하여, 백엔드 개발 시 데이터 구조에 대한 이해를 돕기 위해 작성되었습니다.
