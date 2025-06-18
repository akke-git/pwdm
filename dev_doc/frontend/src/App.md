# `frontend/src/App.tsx` 문서

## 1. 파일 개요

`App.tsx` 파일은 React로 구축된 프론트엔드 애플리케이션의 최상위 루트 컴포넌트입니다. 애플리케이션의 전체적인 구조와 동작을 정의하며, 다음과 같은 핵심적인 역할을 수행합니다:

-   **애플리케이션 테마 설정**: Material-UI 라이브러리를 사용하여 다크 모드 기반의 커스텀 테마를 정의하고 적용합니다.
-   **페이지 라우팅**: `react-router-dom`을 사용하여 사용자의 URL 경로에 따라 적절한 페이지 컴포넌트를 렌더링합니다.
-   **전역 레이아웃**: 인증된 사용자를 위한 공통 레이아웃(`MainLayout`)을 제공하여 일관된 UI를 유지합니다.
-   **인증 관리**: 특정 페이지 접근 시 사용자의 인증 상태를 확인하고, 필요한 경우 로그인 페이지로 리다이렉트합니다 (`RequireAuth`).
-   **전역 상태 관리**: `SnackbarProvider`를 통해 애플리케이션 전역에서 사용자에게 알림 메시지(스낵바)를 표시할 수 있는 기능을 제공합니다.
-   **전역 스타일 적용**: `CssBaseline`과 `App.css`를 통해 기본적인 스타일 초기화 및 커스텀 전역 스타일을 적용합니다.

## 2. 주요 기능 및 구성 요소

### 2.1. Material-UI 테마 설정

애플리케이션의 시각적 스타일은 Material-UI의 `createTheme` 함수를 사용하여 정의됩니다. 주요 설정은 다음과 같습니다:

```typescript
// App.tsx
let theme = createTheme({
  palette: {
    mode: 'dark', // 다크 모드 활성화
    primary: {
      main: '#3a7bd5',
      light: '#63a4ff',
      dark: '#0056a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00bcd4',
      light: '#62efff',
      dark: '#008ba3',
      contrastText: '#ffffff',
    },
    background: {
      default: '#000',
      paper: '#212121',
    },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    success: { main: '#4caf50' },
  },
  typography: {
    fontFamily: 'AppleSDGothicNeo, "Apple SD Gothic Neo", Pretendard, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 8, // 컴포넌트의 기본 테두리 반경
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #3a7bd5 0%, #00d2ff 100%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3a7bd5 30%, #00d2ff 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: 'none',
          backgroundColor: '#212121',
        },
        elevation0: {
          border: 'none',
        }
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000',
          margin: 0,
          padding: 0,
          border: 'none',
          outline: 'none',
        },
        html: {
          backgroundColor: '#000',
          margin: 0,
          padding: 0,
          border: 'none',
          outline: 'none',
        },
        '*': {
          boxSizing: 'border-box',
          border: 'none',
          outline: 'none',
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#3a7bd5',
            },
          },
        },
      },
    },
  },
});
theme = responsiveFontSizes(theme); // 반응형 폰트 크기 활성화
```

-   **`palette`**: 다크 모드를 기본으로 하며, 주 색상(primary), 보조 색상(secondary), 배경색 등을 정의합니다.
-   **`typography`**: 기본 폰트 패밀리(`AppleSDGothicNeo`, `Pretendard` 등)와 각 타이포그래피 변형(h1, h2, button 등)의 스타일을 설정합니다.
-   **`shape`**: 컴포넌트의 모서리 둥글기(`borderRadius`)를 설정합니다.
-   **`components`**: Material-UI의 개별 컴포넌트(예: `MuiButton`, `MuiPaper`)에 대한 기본 스타일을 오버라이드하여 일관된 디자인을 적용합니다. 특히, `MuiCssBaseline`을 오버라이드하여 전역적으로 `box-sizing`, `border`, `outline` 등을 초기화하고 기본 배경색을 설정합니다.
-   **`responsiveFontSizes(theme)`**: 폰트 크기가 화면 크기에 따라 자동으로 조절되도록 합니다.
-   이 테마는 `<ThemeProvider theme={theme}>` 컴포넌트를 통해 애플리케이션 전체에 적용됩니다.

### 2.2. 페이지 라우팅

`react-router-dom` 라이브러리의 `BrowserRouter`, `Routes`, `Route`, `Navigate` 컴포넌트를 사용하여 SPA(Single Page Application) 라우팅을 구현합니다.

```tsx
// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// ... 페이지 컴포넌트 import ...
// Login, Register, Dashboard, SearchPage, SettingsPage, PasswordExportPage, PasswordImportPage

function App() {
  return (
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<RequireAuth><MainLayout><Dashboard /></MainLayout></RequireAuth>} />
            <Route path="/search" element={<RequireAuth><MainLayout><SearchPage /></MainLayout></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><MainLayout><SettingsPage /></MainLayout></RequireAuth>} />
            <Route path="/settings/export" element={<RequireAuth><MainLayout><PasswordExportPage /></MainLayout></RequireAuth>} />
            <Route path="/settings/import" element={<RequireAuth><MainLayout><PasswordImportPage /></MainLayout></RequireAuth>} />
            <Route path="/" element={<RequireAuth><Navigate to="/dashboard" replace /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/login" replace />} /> {/* 일치하는 라우트가 없을 경우 로그인 페이지로 */}
          </Routes>
        </Router>
      </ThemeProvider>
    </SnackbarProvider>
  );
}
```

-   각 `Route`는 특정 `path`와 해당 경로에 렌더링될 `element`(React 컴포넌트)를 매핑합니다.
-   인증이 필요한 페이지들은 `RequireAuth` 컴포넌트로 감싸져 있으며, 공통 UI를 위해 `MainLayout` 컴포넌트 내부에 렌더링됩니다.
-   루트 경로(`/`)는 인증된 사용자의 경우 `/dashboard`로 리다이렉트됩니다.
-   정의되지 않은 경로(`*`)로 접근 시 `/login` 페이지로 리다이렉트됩니다.

### 2.3. `MainLayout` 컴포넌트

`MainLayout`은 인증된 사용자가 접근하는 페이지들(예: 대시보드, 검색, 설정)에 공통적으로 적용되는 레이아웃 컴포넌트입니다.

```tsx
// App.tsx
const MainLayout: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: 7, /* Height of BottomNavigationBar */
          px: { xs: 0.5, sm: 1, md: 1.5 }, /* 반응형 좌우 패딩 */
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {children} {/* 실제 페이지 컨텐츠가 렌더링되는 부분 */}
      </Box>
      <BottomNavigationBar /> {/* 하단 네비게이션 바 */}
    </Box>
  );
};
```

-   Flexbox를 사용하여 전체 화면을 채우는 세로 방향 레이아웃을 구성합니다.
-   메인 콘텐츠 영역(`component="main"`)은 하단 네비게이션 바의 높이(`pb: 7`)를 제외한 나머지 공간을 차지하며, 반응형 좌우 패딩이 적용됩니다.
-   화면 하단에는 항상 `BottomNavigationBar` 컴포넌트가 표시됩니다.

### 2.4. `RequireAuth` 컴포넌트 (HOC)

`RequireAuth`는 특정 라우트에 대한 접근 제어를 담당하는 HOC(Higher-Order Component)입니다. 사용자가 인증되지 않은 경우(localStorage에 'token'이 없는 경우) 로그인 페이지로 리다이렉트합니다.

```tsx
// App.tsx
function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children; // 인증된 경우 자식 컴포넌트 렌더링
}
```

### 2.5. `SnackbarProvider` 컨텍스트

`SnackbarProvider`는 애플리케이션 전역에서 스낵바(간단한 알림 메시지)를 쉽게 띄울 수 있도록 하는 컨텍스트 제공자입니다. `App` 컴포넌트의 최상단에서 전체 애플리케이션을 감싸고 있어, 어떤 컴포넌트에서든 스낵바 기능을 사용할 수 있습니다. 이 컴포넌트는 `./components/SnackbarContext` 에서 가져옵니다.

```tsx
// App.tsx
import { SnackbarProvider } from './components/SnackbarContext';

function App() {
  return (
    <SnackbarProvider>
      {/* ... 나머지 애플리케이션 구조 ... */}
    </SnackbarProvider>
  );
}
```

### 2.6. 전역 스타일

-   **`CssBaseline`**: Material-UI에서 제공하는 컴포넌트로, 브라우저별 기본 스타일 차이를 정규화하고, 테마의 배경색 등을 body에 적용합니다. `App.tsx`의 테마 설정에서 `MuiCssBaseline`의 `styleOverrides`를 통해 추가적인 전역 스타일(예: `box-sizing: border-box`, `border: none`)이 정의되어 있습니다.
-   **`import './App.css';`**: `App.css` 파일을 가져와 추가적인 커스텀 전역 스타일을 애플리케이션에 적용합니다.

## 3. 임포트된 주요 모듈

-   `react`: React 라이브러리.
-   `react-router-dom`: 클라이언트 사이드 라우팅 (`BrowserRouter`, `Routes`, `Route`, `Navigate`).
-   `@mui/material`: Material-UI 컴포넌트 및 유틸리티 (`ThemeProvider`, `createTheme`, `CssBaseline`, `responsiveFontSizes`, `Box`).
-   페이지 컴포넌트 (`./pages/*`): `Login`, `Register`, `Dashboard`, `SearchPage`, `SettingsPage`, `PasswordExportPage`, `PasswordImportPage`.
-   공유 컴포넌트 (`./components/*`): `BottomNavigationBar`, `SnackbarProvider`.
-   스타일시트: `./App.css`.

## 4. `App` 컴포넌트 구조

```tsx
// App.tsx
function App() {
  return (
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* ... 라우트 정의 ... */}
          </Routes>
        </Router>
      </ThemeProvider>
    </SnackbarProvider>
  );
}

export default App;
```
`App` 컴포넌트는 `SnackbarProvider`로 시작하여, 그 안에 `ThemeProvider`, `CssBaseline`, 그리고 라우팅을 위한 `Router` 및 `Routes`를 포함하는 계층적 구조를 가집니다.

이처럼 `App.tsx` 파일은 애플리케이션의 전반적인 틀과 사용자 경험의 시작점을 정의하는 매우 중요한 파일입니다.
