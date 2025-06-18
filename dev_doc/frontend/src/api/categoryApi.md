# `frontend/src/api/categoryApi.ts` 문서

## 1. 파일 개요

`categoryApi.ts` 파일은 애플리케이션의 카테고리(Category) 데이터와 관련된 모든 백엔드 API 상호작용을 담당합니다. 카테고리의 생성(Create), 조회(Read), 수정(Update), 삭제(Delete) (CRUD) 작업을 위한 함수들과 카테고리 관련 통계 정보를 가져오는 함수를 제공합니다. 이 파일은 `./axios.ts`에서 설정된 Axios 인스턴스를 사용하여 API 요청을 수행합니다.

## 2. 가져온 모듈 및 타입

```typescript
import api from './axios';
import type { Category, CategoryFormData } from '../types/category';
```

-   **`api from './axios'`**: `./axios.ts` 파일에서 기본 설정된 Axios 인스턴스를 가져옵니다. 이 인스턴스에는 기본 URL 및 요청 인터셉터(예: JWT 토큰 자동 첨부)가 설정되어 있습니다.
-   **`type { Category, CategoryFormData } from '../types/category'`**: 카테고리 데이터의 구조를 정의하는 TypeScript 타입들을 가져옵니다.
    -   `Category`: 카테고리 객체의 전체 구조를 나타내는 타입입니다 (예: `id`, `name`, `description`).
    -   `CategoryFormData`: 카테고리 생성 또는 수정 시 사용되는 폼 데이터의 구조를 나타내는 타입입니다.

## 3. API 함수 상세 설명

이 파일의 모든 API 함수는 비동기 함수(`async/await`)로 작성되었으며, `localStorage`에서 직접 'token'을 가져와 `Authorization` 헤더를 설정합니다. 
**참고**: `axios.ts` 파일의 요청 인터셉터에서 이미 JWT 토큰을 자동으로 헤더에 추가하도록 설정되어 있다면, 여기서 각 함수마다 수동으로 토큰을 가져와 헤더를 설정하는 로직은 중복될 수 있으며, 인터셉터에 의존하는 것이 더 깔끔한 방법일 수 있습니다. 그러나 현재 코드에서는 각 함수별로 명시적으로 헤더를 설정하고 있습니다.

### 3.1. `getAllCategories`

모든 카테고리 목록을 조회합니다.

```typescript
export const getAllCategories = async (): Promise<Category[]> => {
  const token = localStorage.getItem('token');
  const response = await api.get('/categories', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};
```

-   **목적**: 등록된 모든 카테고리의 목록을 가져옵니다.
-   **HTTP 메소드**: `GET`
-   **엔드포인트**: `/categories`
-   **매개변수**: 없음.
-   **반환 값**: `Promise<Category[]>` - 카테고리 객체의 배열을 반환하는 프로미스.
-   **인증**: `Authorization: Bearer ${token}` 헤더를 통해 인증합니다.
-   **데이터 반환**: `response.data.data`를 통해 실제 카테고리 배열을 반환합니다. (백엔드 응답 구조에 따라 `response.data` 또는 `response.data.data` 등으로 데이터 위치가 다를 수 있습니다.)

### 3.2. `getCategory`

특정 ID의 카테고리 정보를 조회합니다.

```typescript
export const getCategory = async (id: number): Promise<Category> => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};
```

-   **목적**: 주어진 ID에 해당하는 특정 카테고리의 상세 정보를 가져옵니다.
-   **HTTP 메소드**: `GET`
-   **엔드포인트**: `/categories/{id}` (예: `/categories/123`)
-   **매개변수**: `id: number` - 조회할 카테고리의 ID.
-   **반환 값**: `Promise<Category>` - 해당 카테고리 객체를 반환하는 프로미스.
-   **인증**: `Authorization: Bearer ${token}` 헤더를 통해 인증합니다.

### 3.3. `createCategory`

새로운 카테고리를 생성합니다.

```typescript
export const createCategory = async (categoryData: CategoryFormData): Promise<Category> => {
  const token = localStorage.getItem('token');
  const response = await api.post('/categories', categoryData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};
```

-   **목적**: 새로운 카테고리를 시스템에 등록합니다.
-   **HTTP 메소드**: `POST`
-   **엔드포인트**: `/categories`
-   **매개변수**: `categoryData: CategoryFormData` - 생성할 카테고리의 정보 (이름, 설명 등).
-   **반환 값**: `Promise<Category>` - 생성된 카테고리 객체(ID 포함)를 반환하는 프로미스.
-   **인증**: `Authorization: Bearer ${token}` 헤더를 통해 인증합니다.

### 3.4. `updateCategory`

기존 카테고리 정보를 수정합니다.

```typescript
export const updateCategory = async (id: number, categoryData: CategoryFormData): Promise<Category> => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/categories/${id}`, categoryData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};
```

-   **목적**: 주어진 ID에 해당하는 카테고리의 정보를 수정합니다.
-   **HTTP 메소드**: `PUT`
-   **엔드포인트**: `/categories/{id}`
-   **매개변수**:
    -   `id: number`: 수정할 카테고리의 ID.
    -   `categoryData: CategoryFormData`: 수정할 카테고리의 정보.
-   **반환 값**: `Promise<Category>` - 수정된 카테고리 객체를 반환하는 프로미스.
-   **인증**: `Authorization: Bearer ${token}` 헤더를 통해 인증합니다.

### 3.5. `deleteCategory`

특정 ID의 카테고리를 삭제합니다. 연관된 항목들을 다른 카테고리로 재할당하는 옵션을 제공할 수 있습니다.

```typescript
export const deleteCategory = async (id: number, reassignTo?: number): Promise<void> => {
  const token = localStorage.getItem('token');
  const url = reassignTo ? `/categories/${id}?reassignTo=${reassignTo}` : `/categories/${id}`;
  await api.delete(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

-   **목적**: 주어진 ID에 해당하는 카테고리를 삭제합니다.
-   **HTTP 메소드**: `DELETE`
-   **엔드포인트**: `/categories/{id}` 또는 `/categories/{id}?reassignTo={reassignToId}`
-   **매개변수**:
    -   `id: number`: 삭제할 카테고리의 ID.
    -   `reassignTo?: number` (선택 사항): 삭제되는 카테고리에 속한 항목들을 재할당할 다른 카테고리의 ID. 이 값이 제공되면 쿼리 파라미터 `reassignTo`로 전달됩니다.
-   **반환 값**: `Promise<void>` - 작업 완료 후 아무것도 반환하지 않는 프로미스.
-   **인증**: `Authorization: Bearer ${token}` 헤더를 통해 인증합니다.

### 3.6. `getCategoryStats`

카테고리 관련 통계 정보를 조회합니다.

```typescript
export const getCategoryStats = async (): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await api.get('/categories/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};
```

-   **목적**: 카테고리에 대한 통계 정보(예: 카테고리별 항목 수 등)를 가져옵니다.
-   **HTTP 메소드**: `GET`
-   **엔드포인트**: `/categories/stats`
-   **매개변수**: 없음.
-   **반환 값**: `Promise<any>` - 통계 데이터를 담고 있는 객체를 반환하는 프로미스. (정확한 타입은 API 응답에 따라 정의해야 합니다.)
-   **인증**: `Authorization: Bearer ${token}` 헤더를 통해 인증합니다.
