# `PasswordTable.tsx` Documentation

**File Path**: `/project/pwdm/frontend/src/components/PasswordTable.tsx`

## Overview

`PasswordTable.tsx` is a comprehensive React component responsible for displaying, filtering, searching, and managing a list of stored passwords. It's designed to be responsive, offering a table view for desktop and a card-based view for mobile devices. It integrates with dialogs for viewing password details and revealing actual passwords (likely after master password verification).

## Key Features and Components

### 1. UI and Styling (Material-UI)

-   **Responsive Layout**: Adapts its presentation based on screen size using `useMediaQuery`.
    -   **Desktop**: Displays passwords in an MUI `Table` with columns for site/title, username, URL, category, last updated, and actions.
    -   **Mobile**: Displays passwords as individual MUI `Card`s, each showing key information and actions.
-   **Filtering and Searching**:
    -   **Controls Bar**: 상단에 위치하며, 어두운 배경 테마가 적용된 영역입니다. 다음 컨트롤들을 포함합니다:
        -   **Category Filter**: MUI `Select` 드롭다운을 사용하여 카테고리별로 비밀번호를 필터링합니다 ("All" 옵션 포함).
        -   **Search Bar**: MUI `TextField`와 `SearchIcon`을 사용하여 사이트 이름, 제목, 설명, 또는 메모 내용으로 비밀번호를 검색합니다.
-   **Data Display**:
    -   비밀번호 항목에는 사이트/제목, 사용자 이름이 표시됩니다. 카테고리 정보는 `categoryIconMap`과 `categoryColorMap` (API로부터 생성된 맵)을 참조하여 아이콘과 함께 표시됩니다.
    -   URLs are displayed as clickable links with a `LinkIcon`.
-   **Loading State**: Uses MUI `Skeleton` components to provide a visual placeholder while data is being fetched. Different skeleton layouts are used for mobile and desktop.
-   **Empty/Error States**:
    -   If no passwords match the filter criteria or if there's no data, a message with an `InfoOutlinedIcon` is displayed.
    -   If an error occurs during data fetching, an MUI `Alert` (severity `error`) shows the error message.
-   **Pagination**: MUI `TablePagination` is used to manage large sets of password entries across multiple pages.
-   **Actions per Item**:
    -   **Details**: Clicking an item (row or card) opens `PasswordDetailDialog`.
    -   **Show Password**: An `IconButton` with `VisibilityIcon` opens `ShowPasswordDialog` to reveal the password.
    -   A `MoreVertIcon` might be present for additional actions (e.g., edit, delete via `PasswordDetailDialog`).
-   **Styling**: Uses a combination of `sx` prop, `styled` components, and an external CSS file (`PasswordTableStyles.css`).

### 2. State Management (`useState`)

-   `passwords` (PasswordItem[]): Array of all fetched password objects.
-   `loading` (boolean): Tracks data fetching state.
-   `error` (string): Stores error messages from API calls.
-   `detailOpen` (boolean): Controls visibility of `PasswordDetailDialog`.
-   `passwordDetail` (PasswordItem | null): The password item currently being viewed/edited in `PasswordDetailDialog`.
-   `categoryIconMap`, `categoryColorMap` (object): Maps category names to their respective icon names and color codes, fetched from `categoryApi`.
-   `showPasswordDialogOpen` (boolean): Controls visibility of `ShowPasswordDialog`.
-   `currentPasswordForDialog` (string), `currentPasswordTitleForDialog` (string): Data for `ShowPasswordDialog`.
-   `searchTerm` (string): Current value of the search input.
-   `selectedCategory` (string): Currently selected category for filtering.
-   `categories` (string[]): 카테고리 필터 드롭다운에 사용될 문자열 배열입니다. `fetchPasswords` 함수 내에서 가져온 `passwords` 데이터로부터 고유한 카테고리 이름을 추출하고, 항상 "All" 옵션을 포함하여 이 상태를 설정합니다.
-   `page` (number), `rowsPerPage` (number): States for `TablePagination`.

### 3. Data Fetching and Processing

-   **`fetchPasswords()`**: 비동기 함수로, `api` (Axios 인스턴스)를 사용하여 `/passwords?decrypt=true` API 엔드포인트에서 암호화 해제된 비밀번호 목록을 가져옵니다. 서버 응답은 일반적으로 `{ success: boolean, count: number, data: PasswordItem[] }` 구조를 가집니다. 응답 데이터의 유효성을 검사한 후, `passwords` 상태를 채우고, 가져온 데이터에서 고유한 카테고리 목록을 추출하여 `categories` 상태를 업데이트합니다. `initialCategoryFilter` prop이 제공되고 유효한 경우, `selectedCategory` 상태를 해당 값으로 설정합니다.
-   **Category Data**: Fetches category details (name, icon, color) using `getAllCategories` from `../api/categoryApi.ts` to populate `categoryIconMap` and `categoryColorMap`.
-   **`useEffect` Hooks**:
    -   Triggers `fetchPasswords` when `refreshKey` (prop) or `initialCategoryFilter` (prop) changes.
    -   Resets pagination to the first page (`setPage(0)`) when `selectedCategory`, `searchTerm`, or `passwords` change to ensure consistent UX.

### 4. Filtering and Searching Logic

-   `filteredPasswords`: `passwords` 상태, 현재 선택된 `selectedCategory`, 그리고 `searchTerm`을 기반으로 실시간으로 계산되는 파생 배열입니다.
    -   Filters by `selectedCategory` first.
    -   그 후, `searchTerm`이 존재하면, 검색어(대소문자 구분 없음)가 각 비밀번호 항목의 `site`, `title`, `description`, 또는 `notes` 필드 중 하나라도 포함되어 있는지 확인하여 추가 필터링합니다.

### 5. Child Components (Dialogs)

-   **`PasswordDetailDialog`**: Used to display/edit the full details of a selected password item. It receives the password item and an `onRefresh` callback.
-   **`ShowPasswordDialog`**: Used to display the actual password for an item, likely after master password verification. It receives the password string and title.

### 6. Props

-   `refreshKey` (number, optional): Changing this key externally triggers a re-fetch of passwords.
-   `onRefreshProp?: () => void`: (선택 사항) `PasswordTable` 내부의 `onRefresh` 함수가 호출될 때 (예: `PasswordDetailDialog`에서 항목 수정/삭제 후) 함께 호출될 수 있는 콜백 함수입니다. 부모 컴포넌트에 데이터 새로고침이나 다른 액션을 트리거할 수 있도록 합니다. 내부 `onRefresh` 함수와의 이름 충돌을 피하기 위해 prop 이름이 `onRefreshProp`으로 지정되었습니다.
-   `initialCategoryFilter` (string, optional): Allows setting an initial category filter when the table mounts.

### 7. Event Handlers

-   `handleChangePage`, `handleChangeRowsPerPage`: Manage pagination state.
-   `handleOpenShowPasswordDialog`, `handleCloseShowPasswordDialog`: Manage `ShowPasswordDialog` visibility.
-   Handlers for opening `PasswordDetailDialog` (e.g., `handleCardClick` or similar for row clicks).
-   `onRefresh()`: Internal refresh function that calls `fetchPasswords()` and the `onRefreshProp` if provided.

## Dependencies

-   `react` (useEffect, useState, React.FC)
-   `@mui/material` (various components like Table, Card, Select, TextField, Skeleton, Alert, Dialogs, etc.)
-   `@mui/icons-material` (LinkIcon, VisibilityIcon, SearchIcon, etc.)
-   `../api/axios` (for API calls)
-   `../utils/categoryIcons` (카테고리 아이콘을 가져오는 `getCategoryIcon` 유틸리티. 현재는 `categoryIconMap`을 통해 간접적으로 사용될 수 있으나, 직접 호출보다는 맵을 참조합니다.)
-   `../api/categoryApi` (for `getAllCategories`)
-   `./PasswordDetailDialog`
-   `./ShowPasswordDialog`
-   `./PasswordTableStyles.css` (custom CSS)

## Notes

-   The component handles decryption of passwords by requesting `decrypt=true` from the API.
-   It dynamically builds the category filter options based on the categories present in the fetched password data.
