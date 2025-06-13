import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 데이터베이스 연결 설정
export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'password_manager',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

// 모델 파일들을 임포트
import User from './user';
import PasswordItem from './passwordItem';
import PasswordHistory from './passwordHistory';
import Category from './category';
import Tag, { TagItem } from './tag';
import Session from './session';

// 관계 설정은 각 모델 파일 내에서 정의됨

// 모델 내보내기
export { User, PasswordItem, PasswordHistory, Category, Tag, TagItem, Session };
