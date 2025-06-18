# `ShowPasswordDialog.tsx` 문서

**파일 경로**: `/project/pwdm/frontend/src/components/ShowPasswordDialog.tsx`

## 1. 개요

`ShowPasswordDialog.tsx` 컴포넌트는 사용자에게 선택된 항목의 실제 비밀번호 문자열을 안전하게 표시하고, 해당 비밀번호를 클립보드로 복사할 수 있는 기능을 제공하는 Material-UI 기반의 다이얼로그입니다. 사용자가 비밀번호를 확인하고 쉽게 복사하여 사용할 수 있도록 돕는 간단하고 직관적인 인터페이스를 제공합니다.

## 2. Props (속성)

`ShowPasswordDialog` 컴포넌트는 다음과 같은 props를 받습니다:

```typescript
interface ShowPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  passwordValue: string;
  title?: string; // Optional title for context, e.g., site name
}
```

-   **`open: boolean`**: (필수) 다이얼로그의 열림/닫힘 상태를 제어합니다. `true`이면 다이얼로그가 화면에 표시되고, `false`이면 숨겨집니다.
-   **`onClose: () => void`**: (필수) 다이얼로그가 닫힐 때 호출되는 콜백 함수입니다. 사용자가 닫기 버튼을 클릭하거나 다이얼로그 외부를 클릭했을 때 실행됩니다.
-   **`passwordValue: string`**: (필수) 다이얼로그 내에 표시될 실제 비밀번호 문자열입니다.
-   **`title?: string`**: (선택 사항) 다이얼로그의 제목으로 표시될 문자열입니다. 예를 들어, 어떤 웹사이트의 비밀번호인지 컨텍스트를 제공할 수 있습니다. 이 prop이 제공되지 않으면 기본 제목으로 'View Password'가 사용됩니다.

## 3. 주요 기능 및 UI 구성

`ShowPasswordDialog`는 Material-UI 컴포넌트를 활용하여 구성됩니다.

### 3.1. 다이얼로그 구조

-   **`Dialog`**: 전체 다이얼로그를 감싸는 최상위 컨테이너입니다.
    -   `maxWidth="xs"`와 `fullWidth` prop을 사용하여 다이얼로그의 너비를 제한하고 화면 너비에 맞게 조정합니다.
    -   `PaperProps`를 통해 다이얼로그 배경 스타일(`backgroundColor: 'background.paper'`)과 모서리 둥글기(`borderRadius: 2`)를 설정하여 애플리케이션 테마와 일관성을 유지합니다.
-   **`DialogTitle`**: 다이얼로그의 제목 영역입니다.
    -   `title` prop 값 또는 기본값 'View Password'를 `Typography` 컴포넌트(`variant="h6"`)로 표시합니다. 폰트는 'apple gothic'으로 지정됩니다.
    -   오른쪽 상단에는 `IconButton`으로 감싸인 `CloseIcon`이 있어 사용자가 다이얼로그를 닫을 수 있습니다.
-   **`DialogContent`**: 다이얼로그의 주 내용 영역입니다.
    -   `dividers` prop을 사용하여 제목 및 액션 영역과 시각적으로 구분합니다.
    -   내부에는 `Box` 컴포넌트를 사용하여 비밀번호 문자열과 복사 버튼을 가로로 배치합니다.
        -   **비밀번호 표시**: `Typography` 컴포넌트(`variant="body1"`)를 사용하여 `passwordValue`를 표시합니다.
            -   가독성을 위해 모노스페이스 _Monospaced_ 폰트 (`Menlo, Monaco, Consolas, "Courier New", monospace`)가 적용됩니다.
            -   `wordBreak: 'break-all'` 스타일을 통해 긴 비밀번호 문자열이 영역을 벗어나지 않고 줄바꿈되도록 합니다.
            -   폰트 크기는 `1.1rem`으로 설정됩니다.
        -   **복사 버튼**: `IconButton`으로 감싸인 `ContentCopyIcon`이 표시되어 사용자가 비밀번호를 클립보드로 복사할 수 있습니다.
-   **`DialogActions`**: 다이얼로그 하단의 액션 버튼 영역입니다.
    -   'Close' 텍스트를 가진 `Button` (`variant="outlined"`)이 제공되어 사용자가 다이얼로그를 닫을 수 있습니다. 버튼 텍스트 폰트는 'apple gothic'으로 지정됩니다.

### 3.2. 비밀번호 복사 기능

-   **`handleCopyPassword()`**: 사용자가 `ContentCopyIcon` 버튼을 클릭하면 호출되는 함수입니다.
    -   `navigator.clipboard.writeText(passwordValue)` API를 사용하여 현재 `passwordValue`를 사용자의 클립보드로 복사합니다.
    -   복사 성공 시: `useSnackbar` 훅을 통해 'Password copied to clipboard!' 메시지를 `success` 타입의 스낵바로 사용자에게 알립니다.
    -   복사 실패 시: 'Failed to copy password.' 메시지를 `error` 타입의 스낵바로 표시하고, 개발자 콘솔에 오류 메시지를 출력합니다.

## 4. 상태 관리 및 Hooks

-   **`useSnackbar()`**: `./SnackbarContext.tsx`에서 제공하는 커스텀 훅입니다.
    -   `showMessage` 함수를 가져와 사용자에게 작업 결과(성공/실패)에 대한 피드백 메시지를 스낵바 형태로 표시하는 데 사용됩니다.

## 5. 스타일링

-   주요 스타일링은 Material-UI의 `sx` prop을 통해 인라인으로 적용됩니다.
-   전반적으로 애플리케이션의 다크 테마와 일관성을 유지하도록 배경색, 텍스트 색상 등이 설정됩니다.
-   사용자 규칙에 따라 주요 텍스트(제목, 버튼)에는 'apple gothic' 폰트가 적용됩니다.
-   비밀번호 문자열은 명확한 구분을 위해 모노스페이스 폰트를 사용합니다.

## 6. 의존성

-   `react`
-   `@mui/material` (Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Box)
-   `@mui/icons-material` (ContentCopyIcon, CloseIcon)
-   `./SnackbarContext` (for `useSnackbar`)

## 7. 사용 예시 (부모 컴포넌트에서)

```tsx
import React, { useState } from 'react';
import ShowPasswordDialog from './ShowPasswordDialog';
import Button from '@mui/material/Button';

const MyComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const passwordToDisplay = 'S3cr3tP@$$wOrd';
  const siteName = 'ExampleSite.com';

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpenDialog}>Show Password</Button>
      <ShowPasswordDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        passwordValue={passwordToDisplay}
        title={siteName}
      />
    </>
  );
};

export default MyComponent;
```

이 문서는 `ShowPasswordDialog.tsx` 컴포넌트의 기능, props, 내부 구조 및 사용 방법에 대한 이해를 돕기 위해 작성되었습니다.
