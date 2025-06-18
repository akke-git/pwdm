# `frontend/src/components/BottomNavigationBar.tsx` 문서

## 1. 파일 개요

`BottomNavigationBar.tsx` 컴포넌트는 애플리케이션의 주요 섹션 간의 탐색을 용이하게 하는 화면 하단 고정 네비게이션 바를 제공합니다. Material UI의 `BottomNavigation` 컴포넌트를 기반으로 하며, 홈(대시보드), 비밀번호 추가, 카테고리 관리, 설정 페이지로 이동하거나 관련 기능을 실행하는 버튼들을 포함합니다.

## 2. Props (속성)

이 컴포넌트는 별도의 props를 받지 않습니다.

## 3. 주요 상태(State) 변수

-   `addPasswordOpen (boolean)`: `AddPasswordDialog` 컴포넌트(새 비밀번호 추가 대화 상자)의 열림/닫힘 상태를 관리합니다. 기본값은 `false`입니다.
-   `categoryListOpen (boolean)`: `CategoryList` 컴포넌트(카테고리 목록 및 관리 인터페이스)의 열림/닫힘 상태를 관리합니다. 기본값은 `false`입니다.

## 4. 주요 함수 및 로직

### 4.1. `getRouteValue(pathname: string): string`

-   `react-router-dom`의 `useLocation()` 훅을 통해 얻은 현재 URL의 `pathname`을 인자로 받습니다.
-   `pathname`을 분석하여 `BottomNavigation` 컴포넌트에서 현재 활성화되어야 할 탭의 `value`를 반환합니다.
    -   `pathname`이 `/settings`로 시작하면 `'/settings'`를 반환합니다.
    -   `pathname`이 `/dashboard`로 시작하면 `'/dashboard'`를 반환합니다.
    -   그 외의 경우 (기본값), `'/dashboard'`를 반환합니다.

### 4.2. `handleAddSuccess(): void`

-   `AddPasswordDialog` 컴포넌트에서 비밀번호가 성공적으로 추가되었을 때 호출되는 콜백 함수입니다.
-   현재 구현에서는 `window.location.reload()`를 호출하여 페이지 전체를 새로고침합니다. 이는 추가된 비밀번호를 목록에 즉시 반영하기 위한 간단한 방법일 수 있으나, 사용자 경험 측면에서는 상태 관리를 통해 부분 업데이트하는 것이 더 좋을 수 있습니다.

### 4.3. `handleCategoryUpdated(): void`

-   `CategoryList` 컴포넌트에서 카테고리 정보가 성공적으로 업데이트(생성, 수정, 삭제 등)되었을 때 호출되는 콜백 함수입니다.
-   `handleAddSuccess`와 마찬가지로 현재는 `window.location.reload()`를 호출하여 페이지를 새로고침합니다.

## 5. UI 구조 (JSX)

-   최상위 요소는 React Fragment (`<>...</>`)입니다.
-   **`<Box>` (네비게이션 바 컨테이너)**:
    -   `sx` prop을 사용하여 화면 하단에 고정(`position: 'fixed'`, `bottom: 0`)시키고, 전체 너비를 사용하며, iOS의 하단 안전 영역(`env(safe-area-inset-bottom)`)을 고려한 패딩을 적용합니다.
    -   높은 `zIndex` 값을 가져 다른 요소들 위에 표시되도록 합니다.
    -   상단에 미세한 구분선(`borderTop`)과 그림자 효과(`boxShadow`)를 적용합니다.
    -   배경색은 어두운 테마에 맞춰 `#1e1e1e`로 설정됩니다.
-   **`<BottomNavigation>`**:
    -   `showLabels` prop을 통해 아이콘과 함께 레이블 텍스트가 항상 표시되도록 합니다.
    -   `value` prop에는 `getRouteValue(location.pathname)`의 결과가 바인딩되어 현재 경로에 맞는 탭이 활성화됩니다.
    -   배경색, 텍스트 색상 등이 `sx` prop을 통해 어두운 테마에 맞게 조정됩니다.
    -   내부의 `<BottomNavigationAction>`들의 최소 너비 제한을 제거하고 패딩을 조정하여 공간을 효율적으로 사용합니다.
-   **`<BottomNavigationAction>` (각 네비게이션 버튼)**: 총 4개의 액션 버튼이 있습니다.
    1.  **Home**:
        -   레이블: "Home"
        -   아이콘: `<HomeIcon />` (색상: `#64b5f6`)
        -   `value`: `"/dashboard"`
        -   `component={Link} to="/dashboard"`: 클릭 시 `/dashboard` 경로로 라우팅합니다.
    2.  **Pass Add**:
        -   레이블: "Pass Add"
        -   아이콘: `<AddIcon />` (색상: `#81c784`)
        -   `onClick`: `setAddPasswordOpen(true)`를 호출하여 `AddPasswordDialog`를 엽니다.
    3.  **Category**:
        -   레이블: "Category"
        -   아이콘: `<CategoryIcon />` (색상: `#ffb74d`)
        -   `onClick`: `setCategoryListOpen(true)`를 호출하여 `CategoryList`를 엽니다.
    4.  **Settings**:
        -   레이블: "Settings"
        -   아이콘: `<SettingsIcon />` (색상: `#ba68c8`)
        -   `value`: `"/settings"`
        -   `component={Link} to="/settings"`: 클릭 시 `/settings` 경로로 라우팅합니다.
    -   모든 액션 버튼에는 `fontFamily: 'apple gothic'`이 적용되며, 선택되었을 때(`&.Mui-selected`) 텍스트 색상이 아이콘 색상과 동일하게 변경됩니다.
-   **다이얼로그/모달 렌더링**:
    -   `<AddPasswordDialog open={addPasswordOpen} onClose={() => setAddPasswordOpen(false)} onAdd={handleAddSuccess} />`
    -   `<CategoryList open={categoryListOpen} onClose={() => setCategoryListOpen(false)} onCategoryUpdated={handleCategoryUpdated} />`
    -   이들 컴포넌트는 `BottomNavigationBar` 내에서 상태에 따라 조건부로 렌더링되거나 내부적으로 표시/숨김 처리됩니다.

## 6. 주요 의존성

-   **React**: `useState` 훅 사용.
-   **`react-router-dom`**: `Link`, `useLocation` 사용.
-   **Material UI (`@mui/material`)**: `BottomNavigation`, `BottomNavigationAction`, `Box`.
-   **Material UI Icons (`@mui/icons-material`)**: `HomeIcon`, `AddIcon`, `CategoryIcon`, `SettingsIcon`.
-   **`./AddPasswordDialog`**: 비밀번호 추가 기능을 제공하는 로컬 컴포넌트.
-   **`./CategoryList`**: 카테고리 목록 및 관리 기능을 제공하는 로컬 컴포넌트.

## 7. 스타일링

-   주로 Material UI의 `sx` prop을 사용하여 인라인 스타일링 및 다크 테마를 적용합니다.
-   사용자 정의 폰트(`apple gothic`)가 네비게이션 액션 레이블에 적용됩니다.
-   선택된 네비게이션 액션의 색상 변경 로직이 포함되어 사용자에게 현재 활성화된 탭을 시각적으로 알려줍니다.

이 컴포넌트는 모바일 환경을 포함한 다양한 화면 크기에서 일관된 사용자 경험을 제공하기 위한 핵심 탐색 요소로 기능합니다.
