# `frontend/src/api/axios.ts` 문서

## 1. 파일 개요

`axios.ts` 파일은 PwdM 프론트엔드 애플리케이션에서 사용되는 전역 Axios 인스턴스를 생성하고 설정하는 역할을 합니다. 이 인스턴스는 백엔드 API와의 모든 HTTP 통신에 일관된 설정을 적용하기 위해 사용됩니다. 주요 기능은 다음과 같습니다:

-   개발 환경과 프로덕션 환경에 따라 API 요청의 기본 URL(`baseURL`)을 동적으로 설정합니다.
-   모든 API 요청에 자동으로 인증 토큰(JWT)을 포함시키는 요청 인터셉터(request interceptor)를 설정합니다.
-   CORS 환경에서 쿠키와 같은 인증 정보를 주고받을 수 있도록 `withCredentials: true` 옵션을 설정합니다.

## 2. 주요 기능 및 설정

### 2.1. Axios 인스턴스 생성 및 기본 URL 설정

```typescript
// frontend/src/api/axios.ts
import axios from 'axios';

const isDevelopment = import.meta.env.DEV;

const api = axios.create({
  baseURL: isDevelopment ? 'http://localhost:3000/api' : '/api',
  withCredentials: true,
});
```

-   `axios.create()`: 새로운 Axios 인스턴스를 생성합니다. 전역 Axios 설정(`axios.defaults`)을 변경하는 대신, 별도의 인스턴스를 사용하면 애플리케이션 내 여러 API 엔드포인트에 대해 독립적인 설정을 유지할 수 있어 유용합니다.
-   `baseURL`:
    -   `import.meta.env.DEV`는 Vite 환경 변수로, 개발 서버 실행 시 `true`가 됩니다.
    -   개발 환경(`isDevelopment`가 `true`)에서는 `baseURL`을 `http://localhost:3000/api`로 설정합니다. 이는 일반적으로 로컬에서 실행 중인 백엔드 개발 서버의 주소입니다.
    -   프로덕션 환경(`isDevelopment`가 `false`)에서는 `baseURL`을 `/api`로 설정합니다. 이는 프론트엔드와 동일한 도메인에서 API가 `/api` 경로를 통해 제공될 때 사용됩니다 (예: 리버스 프록시 설정).
-   `withCredentials: true`: 이 옵션은 서로 다른 도메인 간의 요청(CORS) 시 쿠키, 인증 헤더 등의 자격 증명 정보를 함께 전송하도록 허용합니다. 백엔드 서버에서도 해당 도메인에 대해 `Access-Control-Allow-Credentials` 헤더를 `true`로 설정해야 정상적으로 동작합니다.

### 2.2. 요청 인터셉터 (Request Interceptor)

```typescript
// frontend/src/api/axios.ts
// ... (imports and instance creation)

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {}; // 헤더 객체가 없을 경우 초기화
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

-   `api.interceptors.request.use()`: API 요청이 서버로 전송되기 *전에* 가로채서 특정 작업을 수행하도록 설정합니다.
-   **첫 번째 콜백 함수 (요청 성공 시)**:
    -   `config`: 현재 요청의 설정 객체입니다. 이 객체를 수정하여 요청 헤더, URL 등을 변경할 수 있습니다.
    -   `localStorage.getItem('token')`: 브라우저의 `localStorage`에서 `token`이라는 키로 저장된 JWT를 가져옵니다.
    -   `if (token)`: 토큰이 존재하면,
        -   `config.headers = config.headers || {};`: `config.headers` 객체가 존재하지 않을 경우 (예: 일부 요청 유형에서 기본 헤더가 없는 경우) 빈 객체로 초기화합니다. 이는 `config.headers['Authorization']` 할당 시 오류를 방지합니다.
        -   `config.headers['Authorization'] = \`Bearer ${token}\`;`: `Authorization` 헤더에 `Bearer ` 접두사와 함께 JWT를 설정합니다. 이는 일반적인 JWT 인증 방식입니다.
    -   `return config;`: 수정된 설정 객체를 반환하여 요청이 계속 진행되도록 합니다.
-   **두 번째 콜백 함수 (요청 오류 시)**:
    -   `error`: 요청 설정 과정에서 발생한 오류 객체입니다.
    -   `Promise.reject(error)`: 오류를 그대로 전파하여, 해당 요청을 호출한 부분에서 `.catch()`를 통해 처리할 수 있도록 합니다.

### 2.3. 모듈 익스포트

```typescript
// frontend/src/api/axios.ts
// ... (imports, instance creation, interceptor)

export default api;
```

-   설정된 Axios 인스턴스 `api`를 모듈의 기본값으로 내보냅니다. 다른 파일에서는 `import api from './api/axios';`와 같이 가져와서 사용할 수 있습니다.

## 3. 전체 코드 스니펫

```typescript
// frontend/src/api/axios.ts
import axios from 'axios';

const isDevelopment = import.meta.env.DEV;

const api = axios.create({
  baseURL: isDevelopment ? 'http://localhost:3000/api' : '/api',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

## 4. 사용 예시

다른 API 모듈 (예: `categoryApi.ts`)에서 이 `api` 인스턴스를 임포트하여 사용합니다.

```typescript
// 예시: frontend/src/api/categoryApi.ts
import api from './axios'; // 설정된 Axios 인스턴스 임포트
import { Category } from '../types/category';

export const getCategories = async (): Promise<Category[]> => {
  // 별도의 헤더 설정 없이 api 인스턴스를 사용하면 자동으로 Authorization 헤더가 추가됨
  const response = await api.get('/categories');
  return response.data;
};
```

이 중앙화된 Axios 인스턴스 설정을 통해, 모든 API 요청에 일관된 `baseURL`과 인증 로직을 적용할 수 있으며, 코드 중복을 줄이고 유지보수성을 향상시킬 수 있습니다.
