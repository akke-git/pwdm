# `PasswordTableStyles.css` 문서

**파일 경로**: `/project/pwdm/frontend/src/components/PasswordTableStyles.css`

## 1. 개요

`PasswordTableStyles.css` 파일은 `/project/pwdm/frontend/src/components/PasswordTable.tsx` 컴포넌트의 시각적 스타일을 정의하는 CSS 파일입니다. 주로 Material-UI 컴포넌트의 기본 스타일을 오버라이드하여 애플리케이션의 다크 테마에 맞춘 커스텀 디자인을 구현합니다. 데스크톱 환경의 테이블 뷰와 모바일 환경의 카드 뷰 모두에 적용되는 상세한 스타일 규칙을 포함하고 있습니다.

## 2. 주요 스타일링 대상 및 특징

이 CSS 파일은 `PasswordTable.tsx` 내의 다양한 UI 요소에 대한 스타일을 지정합니다.

### 2.1. 전반적인 다크 테마 (Dark Theme)

-   **배경색**: 주로 `#1a1a1a` (기본 배경) 또는 `#2a2a2a` (호버 시 또는 강조 배경)와 같은 어두운 색상이 사용됩니다.
-   **텍스트 색상**: 대부분의 텍스트는 어두운 배경과의 명확한 대비를 위해 `#ffffff` (흰색)으로 설정됩니다.
-   **테두리**: `1px solid rgba(255, 255, 255, 0.1)`과 같이 흰색에 투명도를 적용하여 은은하고 부드러운 구분선을 표현합니다.

### 2.2. 데스크톱 테이블 뷰 스타일

-   **선택자**: `.MuiTableContainer-root`, `.MuiTable-root`, `.MuiTableCell-root`, `.MuiTableHead-root .MuiTableCell-root`, `.MuiTableRow-root` 등 Material-UI 테이블 관련 클래스.
-   **스타일**: 테이블 컨테이너, 테이블 자체, 각 셀, 테이블 헤더 셀, 테이블 행에 대한 배경색, 글자색, 폰트 두께, 테두리 스타일을 정의합니다.
-   테이블 헤더는 배경색 (`#2a2a2a`)과 굵은 폰트(`font-weight: 600`)로 강조됩니다.
-   테이블 행에 마우스를 올리면 (`:hover`) 배경색이 변경되어 사용자 인터랙션을 시각적으로 피드백합니다.

### 2.3. 모바일 카드 뷰 스타일 (`.password-item`)

-   **선택자**: `.password-item` 클래스.
-   **스타일**: 각 비밀번호 항목을 나타내는 카드의 배경색 (`#1a1a1a`), 테두리(제거), 패딩, 그림자(제거), 하단 구분선 등을 정의합니다.
-   카드에 마우스를 올리면 (`:hover`) 배경색이 `#2a2a2a`로 변경됩니다.

### 2.4. 카드 내 요소 스타일

-   **카테고리 칩 (`.password-item .MuiChip-root[class*="MuiChip-outlined"]`)**: 
    -   카테고리 표시용 칩의 스타일입니다. 현재 코드에서는 배경색과 테두리 색상 관련 스타일이 주석 처리되어 있으며, 이는 `PasswordTable.tsx` 컴포넌트 내에서 JavaScript를 통해 카테고리별로 동적 색상을 적용하기 위함으로 보입니다.
    -   칩 내부 라벨의 폰트 두께는 `font-weight: 500`으로 설정됩니다.
-   **사용자 이름 (`.password-item .MuiTypography-body2`)**: 흰색 텍스트, 폰트 두께 `500`, 약간의 투명도(`opacity: 0.95`)를 적용합니다.
-   **아이콘 (`.password-item .MuiSvgIcon-root`)**: 
    -   일반 아이콘에 `filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.5))` 스타일을 적용하여 약간의 입체감을 줍니다.
    -   특정 아이콘(예: `AccountCircleIcon`, `DescriptionIcon`, 링크 아이콘)에는 각각 다른 색상(` #64b5f6`, `#81c784`)이 지정됩니다.
-   **비밀번호 관련 칩 (`.password-item .MuiChip-root:not([class*="MuiChip-outlined"])`)**: 
    -   카테고리 칩이 아닌 다른 정보(예: 비밀번호 보기 버튼)를 담는 칩의 스타일입니다. 보라색 계열의 테두리(`border: 1px solid #ba68c8`)와 반투명 배경(`background-color: rgba(186, 104, 200, 0.2)`)을 가집니다.
-   **타이틀/사이트 이름 (`.password-item .MuiTypography-subtitle1`)**: 굵은 폰트(`font-weight: 700`), 흰색 텍스트, 약간의 텍스트 그림자, 큰 폰트 크기(`1.2rem`), 적절한 자간(`letter-spacing: 0.3px`)으로 강조됩니다.
-   **노트 텍스트 (`.password-item .notes-text`)**: 밝은 회색 계열(` #e0e0e0`), 폰트 두께 `500`, 약간의 투명도를 적용합니다.

### 2.5. 스타일 우선순위 및 강제 적용

-   다수의 스타일 규칙에 `!important` 키워드가 사용되었습니다. 이는 Material-UI의 기본 스타일이나 다른 CSS 규칙보다 이 파일에 정의된 스타일이 우선적으로 적용되도록 하기 위함입니다. 이를 통해 특정 디자인 의도를 강제할 수 있지만, 과도한 사용은 CSS 관리의 복잡성을 증가시킬 수 있습니다.

### 2.6. 컨트롤 바 배경색 강제 설정

-   **선택자**: `.css-dih03a`, `[class*="css-dih03a"]`, `.MuiBox-root`, `.MuiPaper-root`.
-   이러한 일반적인 Material-UI 클래스 선택자에 대해 배경색을 `#000000 !important` (검은색)으로 강제하는 스타일이 포함되어 있습니다. 이는 `PasswordTable.tsx` 상단에 위치한 검색창과 카테고리 필터가 포함된 컨트롤 바 영역의 배경을 의도한 것으로 보입니다. 하지만 이 선택자들은 매우 광범위하여 `PasswordTable` 외부의 다른 컴포넌트에도 의도치 않은 영향을 줄 수 있으므로 주의가 필요합니다. 좀 더 구체적인 선택자를 사용하거나, 컴포넌트 레벨에서 `sx` prop 또는 `styled-components`를 통해 스타일을 적용하는 것이 더 안전한 방법일 수 있습니다.

## 3. 사용처

이 CSS 파일은 `PasswordTable.tsx` 컴포넌트에서 import 되어 해당 컴포넌트와 그 하위 요소들의 스타일을 지정하는 데 사용됩니다.

```javascript
// PasswordTable.tsx (예시)
import './PasswordTableStyles.css';
// ... 나머지 코드
```

## 4. 유지보수 시 고려사항

-   `!important`의 사용 빈도가 높아 스타일 충돌 시 디버깅이 어려울 수 있습니다. 가능한 경우 선택자 우선순위를 활용하거나, Material-UI의 `sx` prop 또는 `styled` API를 사용하는 것을 고려할 수 있습니다.
-   컨트롤 바 배경색 설정에 사용된 일반적인 클래스 선택자는 예기치 않은 사이드 이펙트를 유발할 수 있으므로, 범위를 좁히거나 다른 방식으로 스타일을 적용하는 것이 좋습니다.

이 문서는 `PasswordTableStyles.css` 파일의 주요 스타일 규칙과 그 목적을 이해하는 데 도움을 주기 위해 작성되었습니다.
