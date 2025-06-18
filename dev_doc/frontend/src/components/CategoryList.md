# `frontend/src/components/CategoryList.tsx` 문서

## 1. 파일 개요

`CategoryList.tsx` 컴포넌트는 사용자의 비밀번호 카테고리 목록을 표시하고 관리하는 기능을 제공합니다. 사용자는 이 컴포넌트를 통해 카테고리를 선택하여 해당 카테고리의 비밀번호를 필터링하거나, 새 카테고리를 추가하고 기존 카테고리를 수정 또는 삭제할 수 있습니다. 이 컴포넌트는 일반적인 목록 형태로 사용될 수도 있고, `open` 및 `onClose` props를 통해 다이얼로그 형태로도 사용될 수 있도록 설계되었습니다.

## 2. Props (속성)

-   `onSelectCategory?: (category: string | null) => void`: 사용자가 목록에서 카테고리를 선택했을 때 호출되는 콜백 함수입니다. 선택된 카테고리의 이름 (문자열) 또는 "모든 비밀번호"를 의미하는 `null`, "즐겨찾기"를 의미하는 `"favorites"`를 인자로 전달받습니다.
-   `selectedCategory?: string | null`: 현재 외부에서 선택된 카테고리의 이름입니다. 이 값에 따라 목록의 해당 항목이 시각적으로 선택된 상태로 표시됩니다.
-   `open?: boolean`: (기본값: `false`) 이 컴포넌트를 다이얼로그 형태로 표시할지 여부를 결정합니다. `true`이고 `onClose` prop이 제공되면 다이얼로그로 렌더링됩니다.
-   `onClose?: () => void`: 다이얼로그 모드로 사용될 때, 다이얼로그를 닫기 위한 콜백 함수입니다.
-   `onCategoryUpdated?: () => void`: 카테고리가 성공적으로 추가, 수정 또는 삭제되었을 때 호출되는 콜백 함수입니다. 상위 컴포넌트에서 관련 데이터를 새로고침하는 등의 후속 조치를 할 수 있습니다.

## 3. 주요 상태(State) 변수

-   `categories (Category[])`: API를 통해 가져온 카테고리 객체의 배열입니다.
-   `loading (boolean)`: 카테고리 목록을 API로부터 불러오는 중인지 여부를 나타냅니다.
-   `openDialog (boolean)`: `CategoryDialog` (카테고리 생성/수정용 대화 상자)의 열림/닫힘 상태를 관리합니다.
-   `selectedCategoryForEdit (Category | undefined)`: `CategoryDialog`에서 수정할 대상 카테고리 객체입니다. 새 카테고리 생성 시에는 `undefined`입니다.
-   `menuAnchorEl (null | HTMLElement)`: 각 카테고리 항목 옆의 "더보기" 메뉴(점 3개 아이콘)의 위치를 지정하기 위한 DOM 요소입니다. 메뉴가 닫혀있으면 `null`입니다.
-   `menuCategory (Category | null)`: "더보기" 메뉴가 열린 대상 카테고리 객체입니다.

## 4. 주요 함수 및 로직

### 4.1. `fetchCategories(): Promise<void>`

-   `getAllCategories` API 함수를 호출하여 서버로부터 모든 카테고리 목록을 비동기적으로 가져옵니다.
-   가져온 데이터로 `categories` 상태를 업데이트합니다.
-   데이터를 가져오는 동안 `loading` 상태를 `true`로, 완료되면 `false`로 설정합니다.
-   오류 발생 시 `useSnackbar`를 통해 사용자에게 오류 메시지를 표시합니다.

### 4.2. `useEffect` Hook

-   컴포넌트가 마운트될 때 (일반 모드, `onClose` prop이 없을 경우) 또는 `open` prop이 `true`로 변경될 때 (다이얼로그 모드) `fetchCategories` 함수를 호출하여 카테고리 목록을 로드합니다.

### 4.3. 카테고리 CRUD 및 메뉴 관련 핸들러

-   `handleOpenMenu(event: React.MouseEvent<HTMLElement>, category: Category)`: 특정 카테고리 항목의 "더보기" 메뉴를 엽니다. `menuAnchorEl`과 `menuCategory` 상태를 설정합니다.
-   `handleCloseMenu()`: 열려 있는 "더보기" 메뉴를 닫습니다.
-   `handleAddCategory()`: 새 카테고리 추가를 위해 `CategoryDialog`를 열도록 `openDialog` 상태를 `true`로 설정하고, `selectedCategoryForEdit`을 `undefined`로 설정합니다.
-   `handleEditCategory(category: Category)`: 선택된 카테고리 수정을 위해 `CategoryDialog`를 열도록 `openDialog` 상태를 `true`로 설정하고, `selectedCategoryForEdit`을 해당 카테고리로 설정합니다. 메뉴도 닫습니다.
-   `handleDeleteCategory(category: Category): Promise<void>`: `deleteCategory` API를 호출하여 선택된 카테고리를 삭제합니다. 성공 시 스낵바 메시지 표시, `fetchCategories` 호출로 목록 새로고침, 필요한 경우 `onSelectCategory` 및 `onCategoryUpdated` 콜백을 호출합니다. 오류 발생 시 스낵바 메시지를 표시합니다. 메뉴도 닫습니다.
-   `handleDialogSaved()`: `CategoryDialog`에서 카테고리 정보가 성공적으로 저장(생성 또는 수정)되었을 때 호출됩니다. `CategoryDialog`를 닫고(`openDialog`를 `false`로), `fetchCategories`를 호출하여 목록을 새로고침하며, `onCategoryUpdated` 콜백을 호출합니다.
-   `handleCategoryClick(category: string | null)`: 사용자가 목록에서 특정 카테고리(또는 "모든 비밀번호", "즐겨찾기")를 클릭했을 때 `onSelectCategory` prop으로 전달된 콜백 함수를 호출합니다.

## 5. UI 렌더링

### 5.1. `renderCategoryList(): JSX.Element`

-   카테고리 목록의 주요 UI를 구성합니다.
-   **상단**: "카테고리"라는 제목과 함께 "새 카테고리 추가" 아이콘 버튼(`AddIcon`)이 표시됩니다.
-   **고정 항목**:
    -   "모든 비밀번호": 클릭 시 `handleCategoryClick(null)` 호출. 전체 비밀번호 개수를 `Chip`으로 표시.
    -   "즐겨찾기": 클릭 시 `handleCategoryClick('favorites')` 호출.
-   **동적 카테고리 목록**:
    -   `loading` 상태가 `true`이면 `CircularProgress`를 표시합니다.
    -   `categories` 배열이 비어있으면 "카테고리가 없습니다." 메시지와 "카테고리 추가" 버튼을 표시합니다.
    -   `categories` 배열에 항목이 있으면 각 카테고리를 `ListItem`으로 렌더링합니다.
        -   `ListItemButton`을 사용하여 클릭 가능하게 만듭니다.
        -   `getCategoryIcon` 유틸리티를 사용하여 카테고리 아이콘과 색상을 표시합니다.
        -   카테고리 이름과 해당 카테고리에 속한 아이템 개수(`itemCount`)를 `Chip`으로 표시합니다.
        -   각 항목에 마우스를 올리면 "더보기" 아이콘(`MoreVertIcon`)이 나타나며, 클릭 시 `handleOpenMenu`를 호출하여 수정/삭제 메뉴를 엽니다.
        -   `selectedCategory` prop과 일치하는 항목은 시각적으로 선택된 상태로 표시됩니다.

### 5.2. `renderMenu(): JSX.Element`

-   `MoreVertIcon` 클릭 시 나타나는 컨텍스트 메뉴를 렌더링합니다.
-   Material UI의 `Menu` 컴포넌트를 사용합니다.
-   "수정" (`EditIcon`) 및 "삭제" (`DeleteIcon`) `MenuItem`을 포함하며, 각각 `handleEditCategory`와 `handleDeleteCategory` 함수를 호출합니다.

### 5.3. 조건부 다이얼로그 렌더링

-   `open` prop이 `true`이고 `onClose` prop이 제공된 경우, 전체 컴포넌트는 Material UI의 `Dialog`로 래핑되어 모달 형태로 표시됩니다.
    -   `DialogTitle`: "카테고리 관리" 제목과 닫기 버튼 (`CloseIcon`).
    -   `DialogContent`: `renderCategoryList()`의 결과가 표시됩니다.
    -   `DialogActions`: "닫기" 버튼.
-   이 다이얼로그 모드 내에서도 `renderMenu()`와 `CategoryDialog`가 함께 렌더링되어 카테고리 수정/삭제 및 추가 기능이 동작합니다.
-   (참고: 문서 작성 시점의 코드에서 `open`과 `onClose`가 제공되지 않은 경우, 즉 일반 컴포넌트로 사용될 때의 UI는 비어있는 다이얼로그를 반환하도록 되어 있어, 해당 사용 사례는 의도되지 않았거나 미완성일 수 있습니다.)

## 6. 주요 의존성

-   **React**: `useState`, `useEffect` 훅 사용.
-   **Material UI (`@mui/material`)**: `Box`, `Typography`, `List`, `ListItem`, `ListItemIcon`, `ListItemText`, `ListItemButton`, `IconButton`, `Divider`, `Chip`, `Menu`, `MenuItem`, `Tooltip`, `CircularProgress`, `Button`, `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`.
-   **Material UI Icons (`@mui/icons-material`)**: `AddIcon`, `EditIcon`, `DeleteIcon`, `MoreVertIcon`, `FolderSpecialIcon`, `AllInclusiveIcon`, `CloseIcon`.
-   **`../types/category`**: `Category` 타입 정의.
-   **`../api/categoryApi`**: `getAllCategories`, `deleteCategory` API 함수.
-   **`./SnackbarContext`**: `useSnackbar` 훅.
-   **`./CategoryDialog`**: 카테고리 생성/수정 UI를 제공하는 자식 컴포넌트.
-   **`../utils/categoryIcons`**: `getCategoryIcon` 유틸리티 함수.

## 7. 스타일링

-   Material UI의 `sx` prop을 사용하여 컴포넌트 전반에 걸쳐 스타일이 적용됩니다.
-   선택된 리스트 아이템, 아이콘 색상, 칩 스타일 등이 동적으로 변경됩니다.
-   다크 테마를 고려한 스타일링이 적용될 수 있습니다 (코드 내 명시적 다크 테마 스타일링은 `CategoryDialog`에 비해 적으나, Material UI 기본 테마 설정에 따라 달라질 수 있음).
-   리스트 아이템 호버 시 "더보기" 버튼이 나타나는 인터랙션이 구현되어 있습니다.

이 컴포넌트는 카테고리 관련 기능을 중앙에서 관리하고 사용자에게 직관적인 인터페이스를 제공하는 역할을 합니다.
