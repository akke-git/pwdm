# `SnackbarContext.tsx` 문서

**파일 경로**: `/project/pwdm/frontend/src/components/SnackbarContext.tsx`

## 1. 개요

`SnackbarContext.tsx`는 React Context API를 활용하여 애플리케이션 전역에서 Material-UI의 `Snackbar` 컴포넌트를 통해 사용자에게 간결한 알림 메시지(스낵바)를 쉽게 표시할 수 있도록 지원하는 유틸리티입니다. 이를 통해 어떤 컴포넌트에서든 간단한 함수 호출만으로 사용자에게 성공, 오류, 정보, 경고 등의 피드백을 일관된 방식으로 제공할 수 있습니다.

## 2. 주요 구성 요소

### 2.1. `SnackbarContextProps` 인터페이스

스낵바 컨텍스트가 제공하는 값의 타입을 정의합니다.

```typescript
interface SnackbarContextProps {
  showMessage: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}
```

-   `showMessage`: 스낵바를 표시하는 함수입니다.
    -   `message: string`: 스낵바에 표시될 텍스트 메시지입니다.
    -   `severity?: 'success' | 'error' | 'info' | 'warning'`: 메시지의 심각도 수준을 나타냅니다. 이 값에 따라 스낵바의 `Alert` 컴포넌트 스타일(색상, 아이콘)이 변경됩니다. 기본값은 'info'입니다.

### 2.2. `SnackbarContext`

`React.createContext`를 사용하여 생성된 컨텍스트 객체입니다. `showMessage` 함수를 애플리케이션의 하위 컴포넌트들로 전달하는 역할을 합니다.

```typescript
const SnackbarContext = createContext<SnackbarContextProps>({
  showMessage: () => {}, // 초기 기본값
});
```

### 2.3. `useSnackbar` 커스텀 훅

컴포넌트 내에서 `SnackbarContext`에 쉽게 접근하여 `showMessage` 함수를 사용할 수 있도록 제공되는 커스텀 훅입니다.

```typescript
export const useSnackbar = () => useContext(SnackbarContext);
```

사용 예시:
```typescript
import { useSnackbar } from './SnackbarContext';

const MyComponent = () => {
  const { showMessage } = useSnackbar();
  
  const handleClick = () => {
    showMessage('Operation successful!', 'success');
  };
  
  return <button onClick={handleClick}>Perform Action</button>;
};
```

### 2.4. `SnackbarProvider` 컴포넌트

애플리케이션의 최상위 또는 스낵바 기능을 사용하고자 하는 컴포넌트 트리의 상위를 감싸는 Provider 컴포넌트입니다. 실제 스낵바의 상태 관리 및 렌더링 로직을 포함합니다.

```typescript
export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ... 상태 및 함수 정의 ...
  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar /* ...props... */ >
        <Alert /* ...props... */ >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
```

#### 2.4.1. 상태 관리 (`useState`)

-   `open (boolean)`: `Snackbar`의 현재 표시 여부를 제어합니다.
-   `message (string)`: `Snackbar`에 표시될 메시지 내용을 저장합니다.
-   `severity ('success' | 'error' | 'info' | 'warning')`: 현재 표시될 메시지의 심각도 수준을 저장합니다.

#### 2.4.2. 주요 함수

-   `showMessage(msg: string, sev: ... = 'info')`: 외부에서 `useSnackbar` 훅을 통해 호출되는 함수입니다. 전달받은 메시지(`msg`)와 심각도(`sev`)로 내부 상태를 업데이트하고, `open` 상태를 `true`로 만들어 스낵바를 화면에 표시합니다.
-   `handleClose(_: any, reason?: string)`: Material-UI `Snackbar` 컴포넌트의 `onClose` 이벤트 핸들러입니다. 사용자가 스낵바 외부를 클릭하여 닫으려고 하는 경우(`reason === 'clickaway'`)를 제외하고, `open` 상태를 `false`로 설정하여 스낵바를 닫습니다.

#### 2.4.3. 렌더링

-   `SnackbarContext.Provider`를 통해 `showMessage` 함수를 하위 컴포넌트들이 사용할 수 있도록 제공합니다.
-   실제 Material-UI `Snackbar` 컴포넌트를 렌더링합니다.
    -   `open`: `open` 상태와 바인딩됩니다.
    -   `autoHideDuration`: 3000ms (3초)로 설정되어, 3초 후 자동으로 사라집니다.
    -   `onClose`: `handleClose` 함수와 연결됩니다.
    -   `anchorOrigin`: `{ vertical: 'bottom', horizontal: 'center' }`로 설정되어 화면 하단 중앙에 스낵바가 표시됩니다.
-   `Snackbar` 내부에는 Material-UI `Alert` 컴포넌트가 사용됩니다.
    -   `onClose`: `handleClose` 함수와 연결되어, `Alert` 내의 닫기 버튼으로도 스낵바를 닫을 수 있습니다.
    -   `severity`: `severity` 상태와 바인딩되어, 메시지 종류에 따른 적절한 스타일(색상, 아이콘)을 표시합니다.
    -   `sx={{ width: '100%' }}`: `Alert` 컴포넌트가 `Snackbar` 너비에 꽉 차도록 설정합니다.
    -   `Alert`의 자식 요소로 `message` 상태값이 표시됩니다.

## 3. 사용 방법

1.  애플리케이션의 최상위 컴포넌트(예: `App.tsx` 또는 `main.tsx`)를 `SnackbarProvider`로 감쌉니다.

    ```tsx
    // main.tsx 또는 App.tsx
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import { SnackbarProvider } from './components/SnackbarContext';

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </React.StrictMode>
    );
    ```

2.  스낵바 메시지를 표시하고 싶은 컴포넌트 내에서 `useSnackbar` 훅을 사용하여 `showMessage` 함수를 가져옵니다.

    ```tsx
    // 예시 컴포넌트
    import React from 'react';
    import { useSnackbar } from './SnackbarContext';
    import Button from '@mui/material/Button';

    const MyFeatureComponent = () => {
      const { showMessage } = useSnackbar();

      const handleSuccess = () => {
        showMessage('Data saved successfully!', 'success');
      };

      const handleError = () => {
        showMessage('Failed to save data.', 'error');
      };

      return (
        <div>
          <Button onClick={handleSuccess}>Save (Success)</Button>
          <Button onClick={handleError}>Save (Error)</Button>
        </div>
      );
    };

    export default MyFeatureComponent;
    ```

## 4. 의존성

-   `react` (createContext, useContext, useState, React.FC, React.ReactNode)
-   `@mui/material` (Snackbar, Alert)

이 문서는 `SnackbarContext.tsx`의 구조와 사용법을 이해하는 데 도움을 주기 위해 작성되었습니다.
