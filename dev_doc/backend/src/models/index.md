# `backend/src/models/index.ts` 코드 설명

이 파일은 데이터베이스 모델링의 **중심 허브(Central Hub)** 역할을 수행합니다. Sequelize ORM(Object-Relational Mapping)을 사용하여 데이터베이스 연결을 설정하고, 프로젝트 내에 정의된 모든 데이터 모델을 통합하여 다른 모듈에서 일관되게 사용할 수 있도록 관리합니다.

---

## 주요 기능 및 역할

### 1. 데이터베이스 연결 설정 (`sequelize` 객체)

-   `new Sequelize(...)`를 사용하여 데이터베이스 연결 인스턴스를 생성합니다.
-   `.env` 파일에 저장된 환경 변수(`DB_HOST`, `DB_USER`, `DB_PASSWORD` 등)를 사용하여 연결 정보를 설정합니다. 이를 통해 민감한 정보가 코드에 직접 노출되는 것을 방지합니다.
-   `dialect: 'mysql'`로 MySQL 데이터베이스를 사용하도록 지정합니다.
-   `logging: process.env.NODE_ENV === 'development' ? console.log : false` 설정을 통해, 개발 환경에서는 실행되는 SQL 쿼리를 콘솔에서 확인할 수 있지만, 프로덕션 환경에서는 로그가 출력되지 않도록 하여 성능 저하를 방지합니다.
-   `define` 옵션:
    -   `timestamps: true`: 모든 모델에 `createdAt`과 `updatedAt` 필드를 자동으로 추가하여 레코드 생성 및 수정 시간을 기록합니다.
    -   `underscored: true`: 모델 필드 이름(예: `passwordItem`)을 데이터베이스의 스네이크 케이스 컬럼명(예: `password_item`)으로 자동 변환해줍니다.

### 2. 모델 통합 및 내보내기

-   `./user.ts`, `./passwordItem.ts`, `./category.ts` 등 개별적으로 정의된 모든 모델 파일을 `import` 합니다.
-   가져온 모델들을 하나의 객체로 묶어 `export` 합니다.
-   이를 통해 서비스 계층이나 컨트롤러 계층에서는 이 `index.ts` 파일 하나만 `import`하면 모든 모델에 접근할 수 있게 되어 코드의 일관성과 유지보수성이 향상됩니다.

### 3. 관계 설정의 중심

-   주석에 명시된 대로, 모델 간의 관계(Associations)는 각 개별 모델 파일(`user.ts`, `passwordItem.ts` 등) 내에서 정의됩니다.
-   예를 들어, `User.hasMany(PasswordItem)`과 같은 관계 설정 코드는 `user.ts`나 `passwordItem.ts` 파일에 위치하게 됩니다. 이 `index.ts` 파일은 그 모델들을 한데 모으는 역할을 합니다.

---

## 요약

`models/index.ts`는 데이터베이스 연결을 초기화하고, 흩어져 있는 모델들을 한 곳에서 관리하며, 애플리케이션의 다른 부분들이 데이터베이스와 상호작용할 수 있는 단일 진입점을 제공하는 필수적인 파일입니다.
