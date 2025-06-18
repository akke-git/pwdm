# `frontend/src/components/EditProfileDialog.tsx` 문서

## 1. 파일 개요

`EditProfileDialog.tsx` 컴포넌트는 사용자가 자신의 프로필 정보 중 닉네임(username)을 수정할 수 있도록 하는 Material UI 기반의 대화 상자(Dialog)입니다. 사용자의 현재 이메일 주소는 수정 불가능하게 표시되며, 닉네임만 변경하여 서버에 저장하는 기능을 제공합니다.

## 2. Props (속성)

-   `open (boolean)`: 대화 상자의 표시 여부를 제어합니다. `true`이면 대화 상자가 열리고, `false`이면 닫힙니다.
-   `onClose: () => void`: 대화 상자가 닫힐 때 호출되는 콜백 함수입니다. 사용자가 닫기 버튼을 클릭하거나, 취소 버튼을 누르거나, 성공적으로 저장한 후 호출됩니다.
-   `userInfo: { email: string; username?: string }`: 현재 로그인된 사용자의 정보 객체입니다.
    -   `email (string)`: 사용자의 이메일 주소 (필수).
    -   `username?: string`: 사용자의 현재 닉네임 (선택 사항).
-   `onUpdated: (username: string) => void`: 닉네임이 성공적으로 서버에 업데이트된 후 호출되는 콜백 함수입니다. 새로 업데이트된 닉네임을 인자로 전달받습니다.

## 3. 주요 상태(State) 변수

-   `username (string)`: 사용자가 입력 필드에 입력하는 새 닉네임입니다. 대화 상자가 열릴 때 `userInfo.username` 값으로 초기화됩니다.
-   `loading (boolean)`: API 요청(프로필 업데이트)이 진행 중인지 여부를 나타냅니다. `true`이면 로딩 상태로, 버튼 비활성화 및 로딩 인디케이터가 표시될 수 있습니다.
-   `error (string)`: 닉네임 유효성 검사 실패 또는 API 요청 중 발생한 오류 메시지를 저장합니다. 이 값이 있으면 화면에 오류 알림(`Alert`)이 표시됩니다.

## 4. 주요 함수 및 로직

### 4.1. `useEffect` Hook

-   `userInfo` prop 또는 `open` prop이 변경될 때 실행됩니다.
-   대화 상자가 열리거나 사용자 정보가 변경되면 `username` 상태를 `userInfo.username` (또는 빈 문자열)으로 업데이트하고, `error` 상태를 초기화합니다. 이는 대화 상자가 다시 열릴 때 이전 입력 값이나 오류 메시지가 남아있지 않도록 합니다.

### 4.2. `handleSubmit(e: React.FormEvent): Promise<void>`

-   폼이 제출될 때 (일반적으로 "저장" 버튼 클릭 시) 비동기적으로 실행됩니다.
-   `e.preventDefault()`를 호출하여 기본 폼 제출 동작을 막습니다.
-   입력된 `username`이 비어있는지 확인하고, 비어있으면 `error` 상태를 설정하고 함수를 종료합니다.
-   `loading` 상태를 `true`로 설정합니다.
-   `localStorage`에서 `token` (JWT 인증 토큰)을 가져옵니다.
-   미리 설정된 `axios` 인스턴스인 `api`를 사용하여 `/auth/profile` 엔드포인트로 `PUT` 요청을 보냅니다. 요청 본문에는 `{ username }`이 포함되고, 헤더에는 `Authorization: Bearer ${token}`이 포함됩니다.
-   **API 응답 처리**:
    -   요청 성공 및 응답 데이터의 `success`가 `true`인 경우:
        -   `useSnackbar`의 `showMessage` 함수를 사용하여 "닉네임이 변경되었습니다."와 같은 성공 메시지를 사용자에게 표시합니다.
        -   `onUpdated(username)` 콜백 함수를 호출하여 상위 컴포넌트에 변경된 닉네임을 알립니다.
        -   `onClose()` 콜백 함수를 호출하여 대화 상자를 닫습니다.
    -   요청 성공했으나 응답 데이터의 `success`가 `false`이거나, API 요청 자체가 실패한 경우(HTTP 오류 등):
        -   `error` 상태에 서버에서 받은 오류 메시지 또는 기본 오류 메시지를 설정합니다.
        -   `showMessage` 함수를 사용하여 해당 오류 메시지를 사용자에게 표시합니다.
-   `finally` 블록에서 `loading` 상태를 `false`로 설정하여 API 요청 완료 후 UI를 정상 상태로 복구합니다.

## 5. UI 구조 (JSX)

-   **`<Dialog>` (최상위 컴포넌트)**:
    -   `open`, `onClose` (로딩 중 아닐 때만 `onClose` 연결), `maxWidth`, `fullWidth` 등의 props를 설정합니다.
    -   `PaperProps.sx`를 통해 대화 상자 패널의 스타일(둥근 모서리, 그림자 등)을 지정합니다.
-   **`<DialogTitle>`**:
    -   대화 상자의 제목 "프로필 수정"과 우측 상단에 닫기 버튼 (`<IconButton>` + `<CloseIcon>`)을 표시합니다.
-   **`<form onSubmit={handleSubmit}>`**:
    -   **`<DialogContent>` (폼 필드 영역)**:
        -   `error` 상태가 있을 경우 `<Alert severity="error">`를 통해 오류 메시지를 표시합니다.
        -   **프로필 정보 표시 영역 (`<Box>`)**: 중앙 정렬된 아바타와 이메일 주소를 표시합니다.
            -   `<Avatar>`: `username`이 있으면 첫 글자를 대문자로 표시하고, 없으면 기본 `<PersonIcon>`을 표시합니다.
            -   `<Typography>`: `userInfo.email`을 표시합니다.
        -   **닉네임 입력 필드 (`<TextField>`)**: `autoFocus` 설정. `InputProps`로 시작 부분에 `<PersonIcon>` 표시.
        -   **이메일 표시 필드 (`<TextField>`)**: `userInfo.email`을 표시하며, `disabled`로 설정되어 수정 불가능합니다. `InputProps`로 시작 부분에 `<EmailIcon>` 표시.
        -   모든 `TextField`는 `sx` prop을 통해 둥근 모서리 스타일(`borderRadius: 1.5`)이 적용됩니다.
    -   **`<DialogActions>` (하단 버튼 영역)**:
        -   **취소 버튼 (`<Button>`)**: 클릭 시 `onClose` 호출. `<CancelIcon>` 포함.
        -   **저장 버튼 (`<Button type="submit">`)**: 폼 제출 트리거. `loading` 상태에 따라 텍스트("저장 중..." 또는 "저장")와 아이콘 (`<CircularProgress>` 또는 `<SaveIcon>`)이 변경됩니다.
        -   버튼들도 `sx` prop을 통해 둥근 모서리 스타일이 적용됩니다.

## 6. 주요 의존성

-   **React**: `useState`, `useEffect` 훅 사용.
-   **Material UI (`@mui/material`)**: `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Button`, `TextField`, `CircularProgress`, `Typography`, `Box`, `Divider`, `IconButton`, `InputAdornment`, `Alert`, `Avatar`.
-   **Material UI Icons (`@mui/icons-material`)**: `PersonIcon`, `SaveIcon`, `CancelIcon`, `CloseIcon`, `EmailIcon`.
-   **`./SnackbarContext`**: `useSnackbar` 훅을 통해 사용자에게 알림 메시지를 표시합니다.
-   **`../api/axios`**: 사전에 설정된 `axios` 인스턴스 (`api`)를 사용하여 API 요청을 보냅니다.

## 7. 스타일링

-   Material UI 컴포넌트의 기본 스타일과 함께 `sx` prop을 사용하여 커스텀 스타일(둥근 모서리, 그림자 등)을 적용합니다.
-   아바타, 입력 필드 아이콘 등 시각적 요소를 포함하여 사용자 친화적인 인터페이스를 제공합니다.

이 컴포넌트는 사용자가 자신의 닉네임을 쉽게 변경하고, 변경 결과를 즉시 피드백 받을 수 있도록 설계되었습니다.
