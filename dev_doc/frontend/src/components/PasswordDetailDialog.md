# `PasswordDetailDialog.tsx` Documentation

**File Path**: `/project/pwdm/frontend/src/components/PasswordDetailDialog.tsx`

## Overview

`PasswordDetailDialog.tsx` is a React component that provides a modal dialog interface for viewing, editing, and deleting individual password entries. It operates in two main modes: view mode and edit mode, and includes a confirmation step for deletions.

## Key Features and Components

### 1. UI and Styling (Material-UI)

-   **Dialog Structure**: Uses MUI `Dialog`, `DialogTitle`, `DialogContent`, and `DialogActions`.
-   **View Mode (`!editMode`)**:
    -   Displays password details as text: Site Name, Username/Email, Password (masked by default), Description/Notes, URL (as a clickable link), 카테고리 (조회 모드 시 `getCategoryIcon`을 통해 아이콘 표시, `categories`에서 가져온 `color`와 `Chip` 컴포넌트로 이름 표시), and Creation Date.
    -   Password field has a "Copy" (`ContentCopyIcon`) button and a toggle (`VisibilityIcon`/`VisibilityOffIcon`) to show/hide the actual password.
-   **Edit Mode (`editMode`)**:
    -   Presents editable fields: `TextField` for Site Name, Username, Password, Description, URL. `Select` dropdown for Category.
    -   Password field includes the show/hide toggle.
    -   카테고리 선택 필드 (`<Select>`)는 `categories` 상태에 저장된 목록을 기반으로 `<MenuItem>`들을 동적으로 렌더링합니다. `loadingCategories`가 `true`이면 로딩 인디케이터가 표시될 수 있습니다.
-   **Actions Area (`DialogActions`)**:
    -   **View Mode**: "Edit" and "Delete" buttons.
    -   **Edit Mode**: "Save" and "Cancel" buttons.
    -   **Delete Confirmation Mode**: Shows a warning message, a "Delete Confirmation" button, and a "Cancel" button.
-   **Feedback**: Uses `CircularProgress` for loading states and `Alert` for error messages. `Snackbar` (via `useSnackbar` hook) is used for success/failure notifications.
-   **Icons**: Utilizes various MUI icons for actions and information (e.g., `EditIcon`, `DeleteIcon`, `SaveIcon`, `LinkIcon`, `CalendarTodayIcon`).
-   **Styling**: `fontFamily` is consistently set to `'apple gothic'`. Dialog has rounded corners and a subtle box shadow.

### 2. State Management (`useState`)

-   `editMode` (boolean): Toggles between view and edit modes.
-   Form field states: `site`, `username`, `pwValue` (password value), `description`, `url`, `category`.
-   `categories` (Category[]): List of available categories fetched from the API.
-   `categoryIcon` (string): 현재 `password` prop으로 전달된 항목의 카테고리에 해당하는 아이콘의 이름입니다. `useEffect` 내에서 `categories` 목록과 `password?.category`를 비교하여 설정됩니다. 기본값은 'folder'입니다.
-   `loadingCategories` (boolean): Tracks loading state for categories.
-   `showPw` (boolean): Toggles password visibility in both view and edit modes.
-   `loading` (boolean): Indicates if an API operation (update/delete) is in progress.
-   `error` (string): Stores error messages from API calls or validation.
-   `confirmDelete` (boolean): Activates the delete confirmation step.

### 3. Props

-   `open` (boolean): 대화 상자의 표시 여부를 제어합니다. `true`이면 대화 상자가 열리고, `false`이면 닫힙니다.
-   `onClose: () => void`: 대화 상자가 닫힐 때 호출되는 콜백 함수입니다.
-   `password: PasswordItem | null`: 표시하거나 수정할 비밀번호 항목 데이터 객체입니다. `PasswordItem` 인터페이스는 `id`, `title`, `username`, `password`, `site`, `notes`, `description`, `url`, `category`, `createdAt`, `updatedAt` 등의 필드를 포함합니다.
-   `onUpdated: () => void`: 비밀번호 항목이 성공적으로 수정되거나 삭제된 후 호출되는 콜백 함수입니다. 일반적으로 부모 컴포넌트의 데이터 목록을 새로고침하는 데 사용됩니다.
-   `categoryIconMap?: { [key: string]: string }`: (선택 사항) 카테고리 이름과 아이콘 이름의 매핑 객체입니다. 현재 컴포넌트는 `useEffect` 내에서 `getAllCategories` API를 호출하여 카테고리 데이터를 직접 가져오고, `getCategoryIcon` 유틸리티 함수를 사용하여 아이콘을 결정하므로 이 prop은 직접적으로 활용되지 않을 수 있습니다.
-   `categoryColorMap?: { [key: string]: string }`: (선택 사항) 카테고리 이름과 색상 값의 매핑 객체입니다. `categoryIconMap`과 유사하게, 현재 컴포넌트는 API로부터 받은 카테고리 객체의 `color` 속성을 직접 사용합니다.

### 4. Core Functionality

-   **Data Initialization (`useEffect` on `password`, `open`)**: When the dialog opens or the `password` prop changes, internal states (form fields, editMode, etc.) are reset based on the new `password` data.
-   **Category Loading (`useEffect` on `open`, `password?.category`)**: 대화 상자가 열리거나(`open` prop 변경) 표시된 비밀번호 항목의 카테고리(`password?.category`)가 변경될 때 실행됩니다. `getAllCategories` API (`../api/categoryApi`)를 호출하여 사용 가능한 모든 카테고리 목록을 가져와 `categories` 상태에 저장합니다. 또한, 현재 `password` 항목의 카테고리(`password?.category`)에 해당하는 아이콘 이름을 찾아 `categoryIcon` 상태를 업데이트합니다.
-   **View/Edit Toggle**: The "Edit" button switches `editMode` to `true`. "Cancel" (in edit mode) or successful "Save" switches it back to `false`.
-   **Password Visibility Toggle (`handleTogglePasswordVisibility`)**: Changes the `showPw` state.
-   **Copy Password (`handleCopy`)**: Uses `navigator.clipboard.writeText()` to copy `pwValue`.
-   **Update Password (`handleUpdate`)**:
    -   Performs basic validation (site, username, password are required).
    -   `localStorage`에서 인증 토큰을 가져옵니다.
    -   `axios` 인스턴스를 동적으로 import (`(await import('../api/axios')).default`)하여 `/passwords/{password.id}` 엔드포인트로 `PUT` 요청을 보냅니다. 요청 본문에는 수정된 사이트 정보, 사용자 이름, 비밀번호, 설명, URL, 카테고리 등이 포함됩니다.
    -   On success: Exits edit mode, shows a success Snackbar message, and calls `onUpdated()`.
    -   On failure: Sets the `error` state and shows an error Snackbar message.
-   **Delete Password (`handleDelete`, `setConfirmDelete`)**:
    -   "Delete" button first sets `confirmDelete` to `true` to show the confirmation step.
    -   "Delete Confirmation" 버튼을 클릭하면 `handleDelete` 함수가 호출됩니다. 이 함수는 `localStorage`에서 인증 토큰을 가져오고, `axios` 인스턴스를 동적으로 import하여 `/passwords/{password.id}` 엔드포인트로 `DELETE` 요청을 보냅니다.
    -   On success: Closes the dialog, shows a success Snackbar, and calls `onUpdated()`.
    -   On failure: Sets `error` and shows an error Snackbar.
-   **Dialog Close (`handleClose`)**: Resets internal states and calls the `onClose()` prop, only if not `loading`.

### 5. Dependencies

-   `react` (useState, useEffect, React.FC)
-   `@mui/material` (Dialog, Button, TextField, IconButton, Alert, Select, Chip, etc.)
-   `@mui/icons-material` (Visibility, ContentCopy, Edit, Delete, etc.)
-   `../utils/categoryIcons` (for `getCategoryIcon`)
-   `./SnackbarContext` (for `useSnackbar` hook)
-   `../api/categoryApi` (for `getAllCategories`)
-   `../api/axios` (for API calls, dynamically imported)

## Notes

-   The component dynamically imports the `axios` instance within its handler functions (`handleUpdate`, `handleDelete`).
-   It manages its own category data fetching, which could potentially be optimized if the parent (`PasswordTable`) already has this data and passes it down.
-   Error handling is provided for API requests and basic form validation.
