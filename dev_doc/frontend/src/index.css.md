# `frontend/src/index.css` 문서

## 1. 파일 개요

`index.css` 파일은 PwdM 프론트엔드 애플리케이션의 전역 스타일을 정의하는 주 CSS 파일입니다. 이 파일에 정의된 스타일은 애플리케이션 전체의 기본적인 모양과 느낌, 타이포그래피, 색상 스키마 등을 일관되게 유지하는 데 사용됩니다. `main.tsx` 파일에서 직접 임포트되어 애플리케이션 시작 시 로드됩니다.

## 2. 주요 CSS 규칙 및 설명

### 2.1. Pretendard 웹 폰트 임포트

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
```
-   CDN을 통해 Pretendard 웹 폰트를 가져옵니다. Pretendard 폰트는 가독성이 뛰어나고 다양한 굵기를 지원하여 현대적인 웹 디자인에 적합합니다.

### 2.2. 전역 스타일 리셋

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  border: none;
  outline: none;
}
```
-   모든 HTML 요소(`*`)에 대해 기본 `margin`, `padding`을 제거하고, `box-sizing`을 `border-box`로 설정하여 레이아웃 계산을 용이하게 합니다. 또한, 기본 `border`와 `outline`도 제거하여 일관된 스타일링 기반을 마련합니다.

### 2.3. 브라우저 자동 완성 스타일 재정의 (Webkit 기반)

```css
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #000 inset !important; /* 배경색을 어둡게 */
  -webkit-text-fill-color: #fff !important; /* 텍스트 색상을 밝게 */
  transition: background-color 5000s ease-in-out 0s; /* 부드러운 전환 효과 */
}
```
-   Webkit 기반 브라우저(Chrome, Safari 등)에서 input 필드 자동 완성 시 적용되는 기본 스타일(일반적으로 밝은 배경)을 어두운 테마에 맞게 재정의합니다. 배경을 검은색으로, 텍스트 색상을 흰색으로 강제합니다.

### 2.4. 기본 HTML 구조 스타일 (`html`, `body`, `#root`)

```css
html, body, #root {
  width: 100%;
  height: 100%;
  background-color: #000; /* 기본 배경색 검정 */
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
}
```
-   HTML 문서의 루트 요소(`html`), `body`, 그리고 React 애플리케이션이 마운트되는 `#root` 요소에 대해 전체 화면을 차지하도록 너비와 높이를 100%로 설정합니다. 기본 배경색은 검은색(#000)으로 지정하고, 불필요한 여백과 테두리를 제거합니다.

### 2.5. 루트 요소 스타일 (`:root`)

```css
:root {
  font-family: 'Apple Gothic', 'Apple SD Gothic Neo', 'AppleSDGothicNeo', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: dark; /* 어두운 색상 스키마 사용 명시 */
  color: rgba(255, 255, 255, 0.87); /* 기본 텍스트 색상 */
  background-color: #000; /* 기본 배경색 */

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```
-   **폰트**: 기본 `font-family`를 'Apple Gothic' 계열과 'Pretendard'로 설정하여 다양한 운영체제에서 일관된 폰트 경험을 제공합니다. (USER RULE: 폰트는 항상 apple gothic을 사용한다)
-   **타이포그래피**: 기본 `line-height`와 `font-weight`를 설정합니다.
-   **색상 스키마**: `color-scheme: dark;`를 통해 브라우저에 어두운 테마를 사용 중임을 알립니다. 기본 텍스트 색상과 배경색을 어두운 테마에 맞게 지정합니다.
-   **폰트 렌더링**: `font-synthesis`, `text-rendering`, `-webkit-font-smoothing`, `-moz-osx-font-smoothing` 속성을 사용하여 폰트 렌더링 품질을 향상시킵니다.

### 2.6. 링크 (`a`) 스타일

```css
a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}
```
-   기본 링크(`<a>`) 태그의 폰트 굵기, 색상, 텍스트 장식을 설정하고, 마우스 호버 시 색상 변경 효과를 정의합니다.

### 2.7. `body` 추가 스타일

```css
body {
  margin: 0;
  padding: 0;
  display: flex; /* 내부 컨텐츠 정렬을 위해 flex 사용 가능성 */
  min-width: 320px; /* 최소 너비 설정 */
  min-height: 100vh; /* 최소 높이를 화면 높이만큼 설정 */
  background-color: #000;
  border: none;
  outline: none;
  overflow-x: hidden; /* 가로 스크롤바 숨김 */
}
```
-   `body` 요소에 추가적인 스타일을 정의합니다. `display: flex`는 내부 요소들의 레이아웃 관리를 위함일 수 있으며, `min-width`와 `min-height`는 반응형 디자인을 고려한 설정입니다. `overflow-x: hidden`은 가로 스크롤바가 불필요하게 나타나는 것을 방지합니다.

### 2.8. 제목 (`h1`) 스타일

```css
h1 {
  font-size: 3.2em;
  line-height: 1.1;
}
```
-   `<h1>` 태그의 기본 폰트 크기와 줄 간격을 설정합니다.

### 2.9. 버튼 (`button`) 스타일

```css
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
```
-   기본 버튼 스타일을 정의합니다. 모서리 둥글기, 테두리, 패딩, 폰트, 배경색, 커서 모양, 전환 효과 등을 포함합니다. 마우스 호버 시 및 포커스 시 스타일도 정의되어 있습니다.

### 2.10. Light 모드 미디어 쿼리

```css
@media (prefers-color-scheme: light) {
  :root {
    color: rgba(255, 255, 255, 0.87); /* 여전히 어두운 테마 텍스트 색상 */
    background-color: #000; /* 여전히 어두운 테마 배경색 */
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #1a1a1a; /* 여전히 어두운 테마 버튼 배경색 */
  }
}
```
-   사용자의 운영체제나 브라우저가 라이트 모드를 선호하도록 설정되어 있을 때 적용될 스타일입니다. 현재 코드에서는 라이트 모드일 때도 `:root`의 색상과 버튼 배경색이 어두운 테마를 유지하도록 설정되어 있습니다. 이는 애플리케이션이 일관되게 어두운 테마만을 지원하려는 의도일 수 있습니다.

## 3. 전체적인 역할

`index.css`는 애플리케이션 전체에 일관된 시각적 스타일의 기초를 제공합니다. CSS 리셋, 기본 타이포그래피, 색상 팔레트, 기본 요소(링크, 버튼 등)의 스타일링을 통해 UI의 통일성을 높이고, Material-UI와 같은 컴포넌트 라이브러리의 스타일을 보완하거나 기본값을 설정하는 역할을 합니다.
