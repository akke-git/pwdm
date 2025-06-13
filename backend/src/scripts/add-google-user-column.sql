-- users 테이블에 isGoogleUser 컬럼 추가
ALTER TABLE users ADD COLUMN isGoogleUser BOOLEAN NOT NULL DEFAULT FALSE;
