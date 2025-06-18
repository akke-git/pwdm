# `frontend/src/assets` 디렉토리 문서

## 1. 디렉토리 개요

`frontend/src/assets` 디렉토리는 프론트엔드 애플리케이션에서 사용되는 정적 에셋 파일들을 저장하는 곳입니다. 여기에는 이미지 파일(JPG, PNG, SVG 등), 폰트 파일, 또는 기타 미디어 파일들이 포함될 수 있습니다.

## 2. 에셋 목록

현재 이 디렉토리에는 다음과 같은 에셋 파일들이 있습니다:

-   **`banner.jpg`**
    -   **설명**: (여기에 `banner.jpg` 파일의 용도, 출처 또는 관련 정보를 기술합니다. 예를 들어, '메인 페이지 상단에 표시되는 배너 이미지' 또는 '프로젝트 로고 이미지' 등)
    -   **미리보기**: (필요시 이미지 경로 또는 스크린샷을 추가할 수 있습니다.)

-   **`react.svg`**
    -   **설명**: React 로고 SVG 파일입니다. Vite를 사용하여 React 프로젝트를 초기 생성했을 때 기본적으로 포함되는 에셋일 가능성이 높습니다. 애플리케이션 내에서 React 기술 스택을 나타내는 아이콘 등으로 사용될 수 있습니다.
    -   **미리보기**: (필요시 이미지 경로 또는 스크린샷을 추가할 수 있습니다.)

## 3. 사용 방법

이 디렉토리의 에셋들은 일반적으로 React 컴포넌트 내에서 `import` 문을 통해 직접 참조하거나, CSS 파일에서 `url()` 함수를 통해 경로를 지정하여 사용됩니다.

**예시 (React 컴포넌트에서 이미지 사용):**

```tsx
import React from 'react';
import bannerImage from '../assets/banner.jpg'; // 경로에 따라 조정

function MyComponent() {
  return <img src={bannerImage} alt="Banner" />;
}

export default MyComponent;
```

**예시 (CSS에서 배경 이미지 사용):**

```css
.my-element {
  background-image: url('../assets/banner.jpg'); /* 경로에 따라 조정 */
}
```

새로운 에셋을 추가할 경우, 이 `README.md` 파일에도 해당 에셋에 대한 정보를 업데이트하는 것이 좋습니다.
