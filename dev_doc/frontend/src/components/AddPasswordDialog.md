# `frontend/src/components/AddPasswordDialog.tsx` 문서

## 1. 파일 개요

`AddPasswordDialog.tsx`는 사용자가 새로운 비밀번호 항목(사이트 정보, 아이디, 비밀번호, 설명, 카테고리 등)을 입력하고 시스템에 등록할 수 있도록 하는 Material UI 기반의 대화 상자(Dialog) 컴포넌트입니다. 이 컴포넌트는 입력 폼, 유효성 검사, API를 통한 데이터 제출, 사용자 피드백 기능을 포함합니다.

## 2. Props (속성)

컴포넌트는 다음 props를 받습니다:

```typescript
interface AddPasswordDialogProps {
  open: boolean;      // 대화 상자의 열림/닫힘 상태를 제어합니다.
  onClose: () => void; // 대화 상자가 닫힐 때 호출되는 콜백 함수입니다.
  onAdd: () => void;   // 비밀번호가 성공적으로 추가된 후 호출되는 콜백 함수입니다.
}
```

## 3. 주요 상태(State) 변수

-   `site (string)`: 사용자가 입력한 사이트 이름 또는 제목.
-   `url (string)`: 사이트 URL (선택 사항).
-   `username (string)`: 사용자 아이디 또는 이메일.
-   `password (string)`: 비밀번호.
-   `description (string)`: 추가 설명 (선택 사항).
-   `category (string)`: 선택된 카테고리의 이름 (선택 사항).
-   `error (string)`: 유효성 검사 실패 또는 API 오류 발생 시 표시될 메시지.
-   `loading (boolean)`: 비밀번호 등록 API 호출 중 로딩 상태를 나타냄.
-   `showPassword (boolean)`: 비밀번호 필드의 내용을 보이거나 숨길지 여부.
-   `categories (Category[])`: 백엔드에서 가져온 카테고리 목록.
-   `loadingCategories (boolean)`: 카테고리 목록을 불러오는 중인지 여부.

## 4. 주요 함수 및 로직

### 4.1. `validate(): boolean`

-   폼 제출 전에 입력 값들의 유효성을 검사합니다.
-   검사 항목:
    -   사이트 이름과 비밀번호는 필수 입력입니다.
    -   아이디가 이메일 형식일 경우, 유효한 이메일 형식인지 확인합니다.
    -   비밀번호는 최소 4자 이상이어야 합니다.
    -   URL이 입력된 경우, 유효한 URL 형식인지 확인합니다.
-   유효성 검사에 실패하면 `error` 상태를 설정하고 `false`를 반환합니다. 성공 시 `error` 상태를 비우고 `true`를 반환합니다.

### 4.2. `handleSubmit(e: React.FormEvent): Promise<void>`

-   폼 제출 이벤트를 처리합니다.
-   `validate()` 함수를 호출하여 유효성을 먼저 검사합니다.
-   유효성 검사를 통과하면 `loading` 상태를 `true`로 설정합니다.
-   `../api/axios.ts`에서 Axios 인스턴스를 동적으로 가져온 후, `/passwords` 엔드포인트로 `POST` 요청을 보냅니다.
    -   요청 본문에는 `site` (API에서는 `title`), `url`, `username`, `password`, `description` (API에서는 `notes`), `category` (선택된 경우) 정보가 포함됩니다.
    -   요청 헤더에는 `Authorization: Bearer ${token}`이 포함됩니다.
-   API 응답 성공 시:
    -   `SnackbarContext`를 통해 성공 메시지("비밀번호가 등록되었습니다!")를 표시합니다.
    -   `onAdd()` 및 `onClose()` 콜백을 호출합니다.
    -   입력 필드 상태를 초기화합니다.
-   API 응답 실패 또는 오류 발생 시:
    -   `error` 상태를 설정하고 `SnackbarContext`를 통해 오류 메시지를 표시합니다.
-   `finally` 블록에서 `loading` 상태를 `false`로 설정합니다.

### 4.3. `useEffect` (카테고리 목록 로딩)

```typescript
useEffect(() => {
  if (open) { // 대화 상자가 열릴 때만 실행
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await getAllCategories(); // categoryApi.ts 사용
        setCategories(data);
      } catch (err) { /* ... */ }
      finally { setLoadingCategories(false); }
    };
    fetchCategories();
  }
}, [open]);
```

-   `open` prop이 변경될 때 실행됩니다.
-   대화 상자가 열리면(`open`이 `true`), `getAllCategories` API 함수를 호출하여 카테고리 목록을 가져와 `categories` 상태에 저장합니다.
-   카테고리를 불러오는 동안 `loadingCategories` 상태를 관리합니다.

### 4.4. `handleClose(): void`

-   대화 상자를 닫을 때 호출됩니다.
-   `loading` 상태가 아닐 경우에만 실행됩니다.
-   모든 입력 필드 및 관련 상태(`site`, `url`, `username`, `password`, `description`, `category`, `error`, `showPassword`)를 초기화합니다.
-   `onClose()` 콜백 함수를 호출합니다.

## 5. UI 구조 (JSX)

-   **`<Dialog>`**: 전체 대화 상자 컨테이너.
    -   `open`, `onClose`, `maxWidth`, `fullWidth` 등의 props를 사용합니다.
    -   `PaperProps`를 통해 다크 테마 스타일(`bgcolor: '#121212'`, `color: '#fff'`, `borderRadius`, `boxShadow`, `border`)이 적용됩니다.
-   **`<DialogTitle>`**: "비밀번호 추가" 제목과 우측 상단의 닫기(`CloseIcon`) 버튼을 포함합니다.
-   **`<Divider />`**: 제목과 내용, 내용과 액션 버튼 영역을 구분합니다.
-   **`<Box component="form" onSubmit={handleSubmit}>`**: 실제 입력 폼.
    -   **`<DialogContent>`**: 폼 필드들을 포함하는 영역.
        -   `{error && <Alert severity="error">...}`: `error` 상태에 메시지가 있으면 에러 알림을 표시합니다.
        -   **`<TextField>` (사이트 이름)**: 필수 입력, `HttpIcon` 아이콘 포함.
        -   **`<TextField>` (사이트 URL)**: 선택 입력, `LinkIcon` 아이콘 포함, `placeholder` 제공.
        -   **`<TextField>` (아이디/이메일)**: `PersonIcon` 아이콘 포함.
        -   **`<TextField>` (비밀번호)**: 필수 입력, `LockIcon` 아이콘 포함. `type`은 `showPassword` 상태에 따라 'text' 또는 'password'로 변경됩니다. 비밀번호 보이기/숨기기 토글(`Visibility`/`VisibilityOff` 아이콘) 기능이 `InputAdornment`로 제공됩니다.
        -   **`<TextField>` (설명)**: 선택 입력, 여러 줄 입력 가능(`multiline`), `DescriptionIcon` 아이콘 포함.
        -   **`<FormControl>` 및 `<Select>` (카테고리)**: 선택 입력, `FolderIcon` 아이콘 포함. `categories` 상태에서 가져온 목록으로 `<MenuItem>`들을 동적으로 생성합니다. 각 `MenuItem`에는 카테고리 색상을 나타내는 작은 원과 카테고리 이름이 표시됩니다.
    -   **`<DialogActions>`**: 하단 버튼 영역.
        -   **`<Button>` (취소)**: `handleClose` 호출, `CancelIcon` 아이콘 포함, `variant="outlined"`.
        -   **`<Button>` (등록)**: `type="submit"`으로 폼 제출, `loading` 상태에 따라 "등록 중..." 텍스트와 `CircularProgress` 아이콘 또는 "등록" 텍스트와 `AddIcon` 아이콘 표시, `variant="contained"`.

## 6. 주요 의존성 및 컨텍스트

-   **Material UI (`@mui/material`)**: UI 컴포넌트 라이브러리.
    -   `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Button`, `TextField`, `Box`, `Typography`, `Divider`, `IconButton`, `InputAdornment`, `CircularProgress`, `Alert`, `FormControl`, `InputLabel`, `Select`, `MenuItem`
-   **Material UI Icons (`@mui/icons-material`)**: 아이콘.
    -   `FolderIcon`, `Visibility`, `VisibilityOff`, `AddIcon`, `CancelIcon`, `CloseIcon`, `LinkIcon`, `HttpIcon`, `PersonIcon`, `LockIcon`, `DescriptionIcon`
-   **React**: `useState`, `useEffect` 훅 사용.
-   **`./SnackbarContext`**: `useSnackbar` 훅을 사용하여 사용자에게 성공/오류 메시지를 스낵바 형태로 표시합니다.
-   **`../api/categoryApi`**: `getAllCategories` 함수를 사용하여 카테고리 목록을 가져옵니다.
-   **`../api/axios`**: (동적 `import`) 비밀번호 등록 API 호출 시 사용될 Axios 인스턴스를 가져옵니다.
-   **`../types/category`**: `Category` 타입 정보를 가져옵니다.

## 7. 스타일링

-   주로 Material UI의 `sx` prop을 사용하여 인라인 스타일링 및 다크 테마를 적용합니다.
-   대화 상자 배경색 (`#121212`), 텍스트 색상 (`#fff`), 보더 색상 등을 명시적으로 지정하여 일관된 다크 모드 UI를 제공합니다.
-   각 입력 필드 및 버튼에는 `borderRadius`가 적용되어 부드러운 외관을 가집니다.

이 컴포넌트는 사용자 친화적인 인터페이스를 통해 새로운 비밀번호 정보를 효율적으로 추가할 수 있도록 설계되었습니다.
