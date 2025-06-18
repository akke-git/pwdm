# `frontend/src/App.css` 문서

## 1. 파일 개요

`App.css` 파일은 주로 애플리케이션의 루트 요소인 `#root`의 반응형 레이아웃을 정의하고, 초기 Vite React 템플릿에서 제공된 예제 스타일(예: `.logo`, `.card`)을 포함하고 있습니다. 이 파일은 `App.tsx` 컴포넌트에서 직접 임포트되어 해당 컴포넌트 및 하위 요소들에 영향을 줄 수 있는 스타일을 제공합니다.

## 2. 주요 CSS 규칙 및 설명

### 2.1. `#root` 요소 스타일

```css
#root {
  width: 100vw; /* 전체 뷰포트 너비 */
  min-height: 100vh; /* 최소 뷰포트 높이 */
  text-align: center; /* 내부 텍스트 중앙 정렬 */
  padding: 0;
  margin: 0 auto; /* 수평 중앙 정렬 */
}

/* 모바일 사이즈에서 좌우 여백 줄이기 */
@media (max-width: 899px) {
  #root {
    width: 100%; /* 너비를 100%로 고정 */
    padding: 0 10px; /* 좌우 여백 10px 적용 */
  }
}

@media (min-width: 900px) {
  #root {
    max-width: 1280px; /* 최대 너비 1280px로 제한 */
    margin: 0 auto; /* 수평 중앙 정렬 유지 */
  }
}
```
-   **기본 스타일**: `#root` 요소는 기본적으로 화면 전체 너비와 최소 화면 전체 높이를 차지하도록 설정됩니다. 내부 텍스트는 중앙 정렬되며, 페이지 자체는 뷰포트 내에서 수평으로 중앙에 위치합니다.
-   **반응형 조정 (Mobile-first 접근 방식)**:
    -   화면 너비가 `899px` 이하일 때 (예: 모바일 및 작은 태블릿): `#root`의 너비는 `100%`로 설정되고, 콘텐츠 영역 확보를 위해 좌우에 `10px`의 패딩이 적용됩니다. 이는 `index.css`에서 설정된 `body`의 `min-width: 320px`와 함께 고려되어 작은 화면에서의 레이아웃을 결정합니다.
    -   화면 너비가 `900px` 이상일 때 (예: 데스크톱 및 큰 태블릿): `#root`의 최대 너비는 `1280px`로 제한되어 너무 넓은 화면에서 콘텐츠가 과도하게 퍼지는 것을 방지하고, `margin: 0 auto`를 통해 중앙 정렬을 유지합니다.

### 2.2. `.logo` 스타일 (Vite React 템플릿 기본 스타일)

```css
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter; /* filter 속성 변경 시 렌더링 최적화 */
  transition: filter 300ms; /* filter 변경에 대한 부드러운 전환 효과 */
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa); /* 호버 시 그림자 효과 */
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa); /* React 로고 호버 시 특정 그림자 효과 */
}
```
-   이 스타일들은 Vite React 템플릿에서 제공하는 기본 로고 스타일링으로 보입니다. 로고의 크기, 패딩, 그리고 마우스 호버 시 `filter` 속성을 이용한 `drop-shadow` 효과를 정의합니다.
-   `will-change: filter;`는 `filter` 속성의 애니메이션 또는 전환이 예상될 때 브라우저가 미리 최적화할 수 있도록 힌트를 줍니다.

### 2.3. `@keyframes logo-spin` 및 관련 미디어 쿼리 (Vite React 템플릿 기본 스타일)

```css
@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo { /* 두 번째 <a> 태그 안의 .logo에만 적용 */
    animation: logo-spin infinite 20s linear;
  }
}
```
-   `logo-spin` 키프레임은 요소를 360도 회전시키는 애니메이션을 정의합니다.
-   `prefers-reduced-motion: no-preference` 미디어 쿼리는 사용자가 운영체제에서 '움직임 감소' 설정을 하지 않았을 경우에만 내부 스타일을 적용합니다. 여기서는 두 번째 `<a>` 태그 내의 `.logo` 클래스를 가진 요소에 `logo-spin` 애니메이션을 20초 주기로 무한 반복 실행하도록 설정합니다. 이 역시 Vite React 템플릿의 기본 데모 스타일의 일부로 사용되었을 가능성이 높습니다.

### 2.4. `.card` 스타일 (Vite React 템플릿 기본 스타일)

```css
.card {
  padding: 2em;
}
```
-   `2em`의 패딩을 가진 `.card` 클래스를 정의합니다. 카드 UI 구성요소의 기본 스타일로 사용될 수 있습니다.

### 2.5. `.read-the-docs` 스타일 (Vite React 템플릿 기본 스타일)

```css
.read-the-docs {
  color: #888;
}
```
-   텍스트 색상을 연한 회색(`#888`)으로 설정하는 `.read-the-docs` 클래스를 정의합니다. 주로 보조적인 텍스트나 링크에 사용될 수 있습니다.

## 3. 역할 및 사용처

-   `#root` 스타일은 애플리케이션의 전체적인 컨테이너 레이아웃을 반응형으로 관리하는 데 중요한 역할을 합니다.
-   `.logo`, `@keyframes logo-spin`, `.card`, `.read-the-docs` 스타일은 현재 PwdM 애플리케이션의 핵심 기능보다는 초기 개발 템플릿에서 제공된 예제 스타일일 가능성이 높습니다. 실제 애플리케이션 디자인에 따라 사용되지 않거나 수정/제거될 수 있습니다.
-   이 파일은 `App.tsx`에서 임포트되므로, 여기에 정의된 스타일은 전역적인 `index.css` 스타일을 보충하거나 특정 컴포넌트 그룹에 대한 스타일을 제공할 수 있습니다.
