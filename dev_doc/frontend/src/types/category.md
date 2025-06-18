# `frontend/src/types/category.ts` 문서

## 1. 파일 개요

`category.ts` 파일은 애플리케이션 내에서 사용되는 카테고리(Category) 데이터와 관련된 TypeScript 인터페이스들을 정의합니다. 이러한 타입 정의는 개발 과정에서 데이터 구조의 일관성을 유지하고, 타입 안정성을 높여 오류를 줄이는 데 도움을 줍니다. 이 파일에 정의된 타입들은 주로 API 통신, 상태 관리, 컴포넌트 간 데이터 전달 등에서 활용됩니다.

## 2. 인터페이스 상세 설명

### 2.1. `Category` 인터페이스

`Category` 인터페이스는 시스템에서 관리되는 개별 카테고리 객체의 전체 구조를 정의합니다.

```typescript
export interface Category {
  id: number;          // 카테고리의 고유 식별자 (Primary Key)
  userId: number;        // 해당 카테고리를 생성한 사용자의 ID (Foreign Key)
  name: string;          // 카테고리 이름
  color: string;         // 카테고리를 시각적으로 구분하기 위한 색상 코드 (예: '#FF0000')
  icon: string;          // 카테고리를 나타내는 아이콘 정보 (예: 'mdi-folder')
  description?: string;   // 카테고리에 대한 추가 설명 (선택 사항)
  itemCount?: number;     // 해당 카테고리에 속한 항목(비밀번호 등)의 수 (선택 사항, 주로 통계용)
  createdAt: string;     // 카테고리 생성 일시 (ISO 8601 형식의 문자열)
  updatedAt: string;     // 카테고리 마지막 수정 일시 (ISO 8601 형식의 문자열)
}
```

-   **`id: number`**: 각 카테고리를 유일하게 식별하는 숫자형 ID입니다. 데이터베이스의 기본 키(Primary Key)에 해당합니다.
-   **`userId: number`**: 이 카테고리가 어떤 사용자에 의해 생성되었는지를 나타내는 사용자의 ID입니다. `User` 테이블의 ID를 참조하는 외래 키(Foreign Key) 역할을 할 수 있습니다.
-   **`name: string`**: 카테고리의 이름입니다. 필수 항목입니다.
-   **`color: string`**: 카테고리를 시각적으로 구분하기 위해 사용되는 색상 값입니다. 일반적으로 HEX 코드(예: `#FFFFFF`)나 CSS 색상 이름(예: `red`)으로 표현됩니다.
-   **`icon: string`**: 카테고리를 나타내는 아이콘을 지정하는 문자열입니다. 아이콘 라이브러리의 클래스 이름(예: `mdi-home`, `fa-star`) 등이 사용될 수 있습니다.
-   **`description?: string`**: 카테고리에 대한 부가적인 설명을 담는 문자열입니다. 선택적(`?`) 항목으로, 값이 없을 수도 있습니다.
-   **`itemCount?: number`**: 해당 카테고리에 연결된 항목(예: 비밀번호)의 개수를 나타냅니다. 주로 목록 뷰나 통계 정보 표시에 사용되며, 선택적 항목입니다.
-   **`createdAt: string`**: 카테고리가 시스템에 처음 생성된 날짜와 시간을 나타내는 문자열입니다. 일반적으로 ISO 8601 형식 (예: `"2023-10-27T10:30:00.000Z"`)으로 저장됩니다.
-   **`updatedAt: string`**: 카테고리의 정보가 마지막으로 수정된 날짜와 시간을 나타내는 문자열입니다. `createdAt`과 마찬가지로 ISO 8601 형식을 따릅니다.

### 2.2. `CategoryFormData` 인터페이스

`CategoryFormData` 인터페이스는 사용자가 새로운 카테고리를 생성하거나 기존 카테고리의 정보를 수정할 때 사용되는 폼(form) 데이터의 구조를 정의합니다. `Category` 인터페이스의 모든 필드를 포함하지 않고, 사용자가 직접 입력하거나 수정할 수 있는 필드들로 구성됩니다.

```typescript
export interface CategoryFormData {
  name: string;          // 카테고리 이름 (필수)
  color?: string;         // 카테고리 색상 (선택 사항)
  icon?: string;          // 카테고리 아이콘 (선택 사항)
  description?: string;   // 카테고리 설명 (선택 사항)
}
```

-   **`name: string`**: 생성하거나 수정할 카테고리의 이름입니다. 필수 항목입니다.
-   **`color?: string`**: 카테고리에 지정할 색상 값입니다. 선택적 항목입니다.
-   **`icon?: string`**: 카테고리에 지정할 아이콘 정보입니다. 선택적 항목입니다.
-   **`description?: string`**: 카테고리에 대한 설명입니다. 선택적 항목입니다.

이러한 타입 정의를 통해 카테고리 관련 데이터를 다루는 코드의 명확성을 높이고, 개발 중 발생할 수 있는 타입 관련 오류를 사전에 방지할 수 있습니다.
