# `frontend/src/main.tsx` 문서

## 1. 파일 개요

`main.tsx` 파일은 프론트엔드 React 애플리케이션의 주 진입점(entry point)입니다. 이 파일의 핵심 역할은 다음과 같습니다:

-   React 애플리케이션을 실제 DOM에 렌더링(마운트)합니다.
-   애플리케이션 전역에서 사용될 Google OAuth 인증 컨텍스트를 설정합니다.
-   개발 모드에서 잠재적 문제를 감지하기 위한 `StrictMode`를 적용합니다.
-   전역 CSS 스타일과 애플리케이션의 루트 컴포넌트(`App.tsx`)를 로드합니다.

## 2. 주요 작업 및 임포트

### 2.1. React 애플리케이션 초기화 및 렌더링

```typescript
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
// ... other imports

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ... Providers ... */}
    <App />
    {/* ... Providers ... */}
  </StrictMode>,
);
```

-   `react-dom/client`의 `createRoot` 함수를 사용하여 React 18의 새로운 루트 API를 통해 애플리케이션을 초기화합니다. 이는 `public/index.html` 파일 내에 있는 ID가 `root`인 DOM 요소에 React 컴포넌트 트리를 마운트합니다.
-   `App` 컴포넌트 (애플리케이션의 최상위 컴포넌트)는 `StrictMode` 컴포넌트로 감싸여 렌더링됩니다. `StrictMode`는 개발 중에 애플리케이션 내의 잠재적인 문제를 식별하고 경고를 표시하는 데 도움을 줍니다.

### 2.2. Google OAuth 프로바이더 설정

```typescript
// main.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

// 구글 OAuth 클라이언트 ID - .env 파일에서 가져옵니다.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// 환경 변수가 설정되지 않은 경우 오류 발생
if (!GOOGLE_CLIENT_ID) {
  throw new Error('환경 변수 VITE_GOOGLE_CLIENT_ID가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
```

-   `@react-oauth/google` 패키지에서 `GoogleOAuthProvider`를 가져옵니다.
-   `App` 컴포넌트는 `GoogleOAuthProvider`로 감싸여, 애플리케이션의 모든 하위 컴포넌트에서 Google 인증 관련 훅(hook)이나 컴포넌트를 사용할 수 있게 됩니다.
-   `clientId` prop에는 Vite 환경 변수인 `import.meta.env.VITE_GOOGLE_CLIENT_ID` 값이 전달됩니다. 이 값은 프로젝트 루트의 `.env` 파일 (또는 `.env.development`, `.env.production` 등)에 정의되어 있어야 합니다.
-   **환경 변수 유효성 검사**: 코드는 `VITE_GOOGLE_CLIENT_ID` 환경 변수가 실제로 설정되어 있는지 확인합니다. 만약 이 값이 없다면, 애플리케이션 시작을 중단하고 개발자에게 해당 환경 변수를 설정하도록 명시적인 오류 메시지를 발생시킵니다. 이는 필수 구성 요소 누락으로 인한 런타임 오류를 사전에 방지하는 좋은 관행입니다.

### 2.3. 전역 스타일 및 루트 컴포넌트 임포트

```typescript
// main.tsx
import './index.css';
import App from './App.tsx';
```

-   `./index.css`: 애플리케이션 전반에 적용될 수 있는 전역 CSS 스타일을 포함하는 파일을 임포트합니다. 여기에는 일반적으로 CSS 리셋, 기본 HTML 요소 스타일, 유틸리티 클래스 등이 포함될 수 있습니다.
-   `./App.tsx`: 애플리케이션의 루트 React 컴포넌트인 `App`을 임포트합니다. 이 컴포넌트는 애플리케이션의 주요 레이아웃, 라우팅, 테마 설정 등을 포함합니다.

## 3. 전체 코드 스니펫

```typescript
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.tsx';

// 구글 OAuth 클라이언트 ID - .env 파일에서 가져옵니다.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// 환경 변수가 설정되지 않은 경우 오류 발생
if (!GOOGLE_CLIENT_ID) {
  throw new Error('환경 변수 VITE_GOOGLE_CLIENT_ID가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
```

## 4. 주요 의존성

-   `react`: React 라이브러리.
-   `react-dom/client`: React DOM 렌더링을 위한 클라이언트 관련 기능.
-   `@react-oauth/google`: Google OAuth 인증 통합을 위한 라이브러리.
-   `./index.css`: 전역 스타일시트.
-   `./App.tsx`: 애플리케이션 루트 컴포넌트.

## 5. 환경 변수

-   `VITE_GOOGLE_CLIENT_ID`: Google Cloud Console에서 발급받은 OAuth 2.0 클라이언트 ID. 이 값은 `.env` 파일에 반드시 설정되어야 합니다.
