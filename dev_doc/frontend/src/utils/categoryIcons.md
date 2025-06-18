# `frontend/src/utils/categoryIcons.tsx` 문서

## 1. 파일 개요

`categoryIcons.tsx` 파일은 애플리케이션에서 카테고리를 시각적으로 표현하는 데 사용되는 아이콘들을 관리하고 제공하는 유틸리티 파일입니다. Material-UI 라이브러리에서 다양한 아이콘 컴포넌트를 가져와, 이를 쉽게 사용하고 선택할 수 있도록 `iconMap` 객체, `getCategoryIcon` 함수, 그리고 `AVAILABLE_ICONS` 배열을 정의하고 내보냅니다. 이 파일은 아이콘 사용의 일관성을 유지하고, 아이콘 선택 UI 구현을 용이하게 합니다.

## 2. 가져온 모듈 및 아이콘

이 파일은 React와 다수의 Material-UI 아이콘 컴포넌트들을 가져옵니다.

```typescript
import React from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
// ... (기타 많은 아이콘들) ...
import SportsGolf from '@mui/icons-material/SportsGolf';
import CategoryIcon from '@mui/icons-material/Category'; // 기본 아이콘으로 사용
```

-   **`React`**: React 라이브러리, 특히 `React.ReactNode`, `React.ReactElement`, `React.cloneElement` 등을 사용하기 위해 필요합니다.
-   **Material-UI Icons (`@mui/icons-material/*`)**: 다양한 아이콘 컴포넌트들 (예: `FolderIcon`, `WorkIcon`, `CategoryIcon` 등)을 직접 가져와 사용합니다. `CategoryIcon`은 지정된 아이콘을 찾을 수 없을 때 사용될 기본 아이콘 역할을 합니다.

## 3. `iconMap` 객체

`iconMap` 객체는 문자열 형태의 아이콘 이름(키)과 해당 Material-UI 아이콘 컴포넌트(ReactNode, 값)를 매핑합니다. 이를 통해 아이콘 이름을 기반으로 실제 아이콘 컴포넌트를 동적으로 가져올 수 있습니다.

```typescript
export const iconMap: { [key: string]: React.ReactNode } = {
  folder: <FolderIcon />,
  work: <WorkIcon />,
  home: <HomeIcon />,
  finance: <AccountBalanceIcon />,
  // ... (기타 아이콘 매핑) ...
  favorite: <FavoriteIcon />,
};
```

-   **구조**: `{[key: string]: React.ReactNode}` 타입으로 정의되며, 각 키는 소문자 문자열(예: 'folder', 'work')이고, 각 값은 해당 아이콘의 JSX 엘리먼트입니다.
-   **목적**: 아이콘 이름을 문자열로 관리하면서도 실제 React 컴포넌트를 렌더링할 수 있도록 중간 다리 역할을 합니다. 예를 들어, 데이터베이스에 아이콘 이름을 문자열로 저장하고, UI에 표시할 때는 이 맵을 사용하여 해당 아이콘 컴포넌트를 찾아 렌더링합니다.

## 4. `getCategoryIcon` 함수

`getCategoryIcon` 함수는 아이콘 이름, 선택적 props, 그리고 선택적 색상 문자열을 받아 해당하는 아이콘 컴포넌트를 반환합니다. 만약 요청된 아이콘 이름이 `iconMap`에 없거나 유효하지 않으면 기본 아이콘(`CategoryIcon`)을 반환합니다.

```typescript
export const getCategoryIcon = (iconName: string | undefined, props?: any, color?: string): React.ReactElement => {
  if (!iconName || !iconMap[iconName]) {
    return <CategoryIcon style={{ color: color || 'inherit' }} {...props} />;
  }
  
  const IconComponent = iconMap[iconName];
  return React.cloneElement(
    IconComponent as React.ReactElement, 
    { 
      ...props,
      style: { ...((props?.style as object) || {}), color: color || 'inherit' }
    }
  );
};
```

-   **목적**: 아이콘 이름 문자열을 기반으로 적절한 아이콘 컴포넌트(ReactElement)를 생성하고, 추가적인 스타일(색상) 및 props를 적용하여 반환합니다.
-   **매개변수**:
    -   `iconName: string | undefined`: 가져올 아이콘의 이름입니다. `iconMap`의 키와 일치해야 합니다.
    -   `props?: any` (선택 사항): 아이콘 컴포넌트에 전달할 추가적인 props입니다 (예: `fontSize`, `className` 등).
    -   `color?: string` (선택 사항): 아이콘에 적용할 색상입니다. CSS 색상 값(예: `'red'`, `'#FF0000'`)을 사용합니다. 지정하지 않으면 'inherit' (부모 요소로부터 상속)이 적용됩니다.
-   **반환 값**: `React.ReactElement` - 스타일과 props가 적용된 아이콘 컴포넌트입니다.
-   **내부 로직**:
    1.  `iconName`이 제공되지 않았거나 `iconMap`에 해당 아이콘이 없으면, 기본 `CategoryIcon`에 전달된 `color`와 `props`를 적용하여 반환합니다.
    2.  유효한 `iconName`이 주어지면, `iconMap`에서 해당 `IconComponent`를 가져옵니다.
    3.  `React.cloneElement`를 사용하여 `IconComponent`를 복제하고, 여기에 기존 `props`와 함께 새로운 `style` (주어진 `color` 포함)을 병합하여 적용한 후 반환합니다. 이는 아이콘 컴포넌트에 동적으로 스타일과 props를 추가하는 유연한 방법을 제공합니다.

## 5. `AVAILABLE_ICONS` 배열

`AVAILABLE_ICONS` 배열은 사용자가 UI(예: 드롭다운 메뉴, 아이콘 선택기)에서 선택할 수 있는 아이콘들의 목록을 제공합니다. 각 요소는 아이콘의 값(내부 식별자), 레이블(화면에 표시될 이름), 그리고 실제 아이콘 컴포넌트를 포함하는 객체입니다.

```typescript
export const AVAILABLE_ICONS = [
  { value: 'folder', label: '폴더', icon: <FolderIcon /> },
  { value: 'work', label: '업무', icon: <WorkIcon /> },
  // ... (기타 사용 가능한 아이콘 정보) ...
  { value: 'favorite', label: '즐겨찾기', icon: <FavoriteIcon /> }
];
```

-   **구조**: 각 배열 요소는 다음 프로퍼티를 가진 객체입니다.
    -   `value: string`: 아이콘의 내부 식별자 문자열입니다. `iconMap`의 키와 일치하며, 데이터 저장 시 사용될 수 있습니다.
    -   `label: string`: UI에 사용자에게 표시될 아이콘의 한글 이름입니다.
    -   `icon: React.ReactNode`: 해당 아이콘의 실제 JSX 엘리먼트입니다. 선택 목록에 아이콘 미리보기를 표시하는 데 사용됩니다.
-   **목적**: 카테고리 생성/수정 폼 등에서 사용자가 아이콘을 선택할 수 있도록 목록을 제공하는 데 사용됩니다. 이 배열을 순회하여 아이콘 선택 UI를 동적으로 생성할 수 있습니다.

이 파일은 애플리케이션 전체에서 아이콘을 일관되고 효율적으로 관리하기 위한 중요한 유틸리티들을 제공합니다.
