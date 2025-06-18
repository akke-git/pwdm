# `frontend/src/components/CategoryDialog.tsx` 문서

## 1. 파일 개요

`CategoryDialog.tsx` 컴포넌트는 사용자가 새 카테고리를 생성하거나 기존 카테고리의 정보를 수정할 수 있도록 하는 Material UI 기반의 대화 상자(Dialog)입니다. 카테고리 이름, 색상, 아이콘, 설명을 입력받으며, 입력값에 대한 유효성 검사 및 API 연동을 통한 서버 저장 기능을 수행합니다. 다크 테마에 최적화된 UI를 제공합니다.

## 2. Props (속성)

-   `open (boolean)`: 대화 상자의 표시 여부를 제어합니다. `true`이면 대화 상자가 열리고, `false`이면 닫힙니다.
-   `onClose: () => void`: 대화 상자가 닫힐 때 호출되는 콜백 함수입니다. 사용자가 닫기 버튼을 클릭하거나, 취소 버튼을 누르거나, 성공적으로 저장한 후 호출됩니다.
-   `category?: Category`: (선택 사항) 수정할 기존 카테고리 객체입니다. 이 prop이 제공되면 대화 상자는 "카테고리 수정" 모드로 동작하며, 폼 필드는 해당 카테고리의 정보로 채워집니다. 제공되지 않으면 "새 카테고리 생성" 모드로 동작합니다.
-   `onSaved: () => void`: 카테고리 정보가 성공적으로 생성 또는 수정되어 서버에 저장된 후 호출되는 콜백 함수입니다.

## 3. 주요 상태(State) 변수

-   `name (string)`: 사용자가 입력하는 카테고리의 이름입니다.
-   `color (string)`: 사용자가 선택하는 카테고리의 색상입니다. Hexadecimal 색상 코드로 저장되며, 기본값은 `'#3498db'` (파란색 계열)입니다.
-   `icon (string)`: 사용자가 선택하는 카테고리의 아이콘 식별자 문자열입니다. 기본값은 `'folder'`입니다.
-   `description (string)`: 사용자가 입력하는 카테고리에 대한 설명입니다 (선택 사항).
-   `loading (boolean)`: API 요청(카테고리 생성/수정)이 진행 중인지 여부를 나타냅니다. `true`이면 로딩 상태로, 버튼 비활성화 및 로딩 인디케이터가 표시될 수 있습니다.
-   `error (string)`: 유효성 검사 실패 또는 API 요청 중 발생한 오류 메시지를 저장합니다. 이 값이 있으면 화면에 오류 알림이 표시됩니다.

## 4. 주요 상수

-   `AVAILABLE_ICONS`: `../utils/categoryIcons.ts` 파일에서 가져온, 사용자가 선택할 수 있는 아이콘 목록입니다. 각 아이콘 객체는 `value` (문자열 식별자), `label` (표시용 이름), `icon` (렌더링될 React 아이콘 컴포넌트)을 포함합니다.
-   `AVAILABLE_COLORS`: 사용자가 선택할 수 있는 미리 정의된 색상 목록입니다. 각 색상 객체는 `value` (Hex 색상 코드)와 `label` (표시용 색상 이름)을 포함합니다.

## 5. 주요 함수 및 로직

### 5.1. `useEffect` Hook

-   `open` 또는 `category` prop이 변경될 때 실행됩니다.
-   대화 상자가 열리거나 수정할 카테고리가 변경되면 폼 필드를 초기화합니다.
    -   `category` prop이 있으면 해당 카테고리의 `name`, `color`, `icon`, `description`으로 상태를 설정합니다 (수정 모드).
    -   `category` prop이 없으면 `name`, `description`을 비우고, `color`와 `icon`을 기본값으로 설정합니다 (생성 모드).
-   `error` 상태를 초기화합니다.

### 5.2. `validate(): boolean`

-   폼 제출 전에 입력값의 유효성을 검사합니다.
-   현재는 카테고리 이름(`name`)이 비어있는지만 확인합니다.
-   이름이 비어있으면 `error` 상태에 메시지를 설정하고 `false`를 반환합니다.
-   유효하면 `error` 상태를 비우고 `true`를 반환합니다.

### 5.3. `handleSubmit(e: React.FormEvent): Promise<void>`

-   폼이 제출될 때 (일반적으로 "저장" 버튼 클릭 시) 비동기적으로 실행됩니다.
-   `e.preventDefault()`를 호출하여 기본 폼 제출 동작을 막습니다.
-   `validate()` 함수를 호출하여 유효성 검사를 수행하고, 실패하면 함수를 종료합니다.
-   현재 상태(`name`, `color`, `icon`, `description`)를 기반으로 `CategoryFormData` 타입의 `categoryData` 객체를 생성합니다.
-   `loading` 상태를 `true`로 설정합니다.
-   `category` prop의 존재 여부에 따라 분기합니다:
    -   **수정 모드 (`category` 존재 시)**: `updateCategory(category.id, categoryData)` API를 호출하여 카테고리를 수정합니다.
    -   **생성 모드 (`category` 미존재 시)**: `createCategory(categoryData)` API를 호출하여 새 카테고리를 생성합니다.
-   API 호출 성공 시:
    -   `useSnackbar`의 `showMessage` 함수를 사용하여 성공 메시지를 사용자에게 표시합니다.
    -   `onSaved()` 콜백 함수를 호출합니다.
    -   `handleClose()` 함수를 호출하여 대화 상자를 닫고 폼을 초기화합니다.
-   API 호출 실패 시:
    -   `error` 상태에 서버에서 받은 오류 메시지 또는 기본 오류 메시지를 설정합니다.
    -   `showMessage` 함수를 사용하여 오류 메시지를 사용자에게 표시합니다.
-   `finally` 블록에서 `loading` 상태를 `false`로 설정합니다.

### 5.4. `handleClose(): void`

-   대화 상자를 닫을 때 호출됩니다.
-   `loading` 상태가 아닐 경우에만 실행됩니다 (API 요청 중에는 닫기 방지).
-   모든 폼 관련 상태(`name`, `color`, `icon`, `description`, `error`)를 초기값으로 리셋합니다.
-   `onClose()` prop으로 전달받은 콜백 함수를 호출합니다.

## 6. UI 구조 (JSX)

-   **`<Dialog>` (최상위 컴포넌트)**:
    -   `open`, `onClose` (로딩 중 아닐 때만 `handleClose` 연결), `maxWidth`, `fullWidth` 등의 props를 설정합니다.
    -   `PaperProps.sx`를 통해 대화 상자 패널의 스타일(둥근 모서리, 그림자, 다크 테마 배경색 `#121212`, 텍스트 색상, 테두리 등)을 지정합니다.
-   **`<DialogTitle>`**:
    -   대화 상자의 제목 (`category` prop 유무에 따라 '카테고리 수정' 또는 '새 카테고리 생성')과 우측 상단에 닫기 버튼 (`<IconButton>` + `<CloseIcon>`)을 표시합니다.
-   **`<form onSubmit={handleSubmit}>`**:
    -   **`<DialogContent>` (폼 필드 영역)**:
        -   `error` 상태가 있을 경우 `<Alert severity="error">`를 통해 오류 메시지를 표시합니다.
        -   **미리보기 영역 (`<Box>`)**: 현재 선택/입력된 아이콘, 색상, 이름, 설명을 시각적으로 보여주는 영역입니다.
        -   **카테고리 이름 (`<TextField>`)**: `autoFocus`, `required` 설정. `InputProps`로 시작 부분에 `<LabelIcon>` 표시.
        -   **색상 선택 (`<FormControl>` + `<Select>`)**: `AVAILABLE_COLORS`를 `MenuItem`으로 렌더링. 각 `MenuItem`은 색상 견본과 색상 이름을 표시. `InputProps`로 시작 부분에 `<ColorLensIcon>` 표시.
        -   **아이콘 선택 (`<FormControl>` + `<Select>`)**: `AVAILABLE_ICONS`를 `MenuItem`으로 렌더링. 각 `MenuItem`은 아이콘 컴포넌트와 아이콘 이름을 표시.
        -   **설명 (`<TextField>`)**: `multiline`, `minRows={2}` 설정. `InputProps`로 시작 부분에 `<DescriptionIcon>` 표시.
        -   모든 입력 필드 및 레이블은 `sx` prop을 통해 다크 테마에 맞게 스타일링됩니다 (배경, 텍스트 색상, 테두리 색상 등).
    -   **`<DialogActions>` (하단 버튼 영역)**:
        -   **취소 버튼 (`<Button>`)**: 클릭 시 `handleClose` 호출. `<CancelIcon>` 포함.
        -   **저장 버튼 (`<Button type="submit">`)**: 폼 제출 트리거. `loading` 상태에 따라 텍스트("저장 중..." 또는 "저장")와 아이콘 (`<CircularProgress>` 또는 `<SaveIcon>`)이 변경됩니다.
        -   버튼들도 다크 테마에 맞게 스타일링됩니다.

## 7. 주요 의존성

-   **React**: `useState`, `useEffect` 훅 사용.
-   **Material UI (`@mui/material`)**: `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Button`, `TextField`, `Box`, `Typography`, `Divider`, `IconButton`, `InputAdornment`, `CircularProgress`, `Alert`, `MenuItem`, `Select`, `FormControl`, `InputLabel`.
-   **Material UI Icons (`@mui/icons-material`)**: `SaveIcon`, `CancelIcon`, `CloseIcon`, `LabelIcon`, `ColorLensIcon`, `DescriptionIcon`.
-   **`./SnackbarContext`**: `useSnackbar` 훅을 통해 사용자에게 알림 메시지를 표시합니다.
-   **`../types/category`**: `Category` 및 `CategoryFormData` 타입 정의.
-   **`../api/categoryApi`**: `createCategory`, `updateCategory` API 함수.
-   **`../utils/categoryIcons`**: `AVAILABLE_ICONS` 상수.

## 8. 스타일링

-   전반적으로 다크 테마(`bgcolor: '#121212'`, `#1e1e1e` 등)에 맞춰 `sx` prop을 통해 스타일이 적용됩니다.
-   입력 필드, 레이블, 버튼 등의 텍스트 색상, 테두리 색상 등이 다크 모드 가독성을 위해 조정됩니다.
-   대화 상자 자체에도 둥근 모서리, 그림자, 강조된 테두리 효과가 적용되어 시각적 계층을 명확히 합니다.

이 컴포넌트는 사용자 친화적인 인터페이스를 통해 카테고리 관리 기능을 제공하며, 애플리케이션의 다른 부분과 일관된 다크 테마 디자인을 유지합니다.
