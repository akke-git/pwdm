import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { sequelize } from './models/index';
import authRoutes from './routes/authRoutes';
import passwordRoutes from './routes/passwordRoutes';
import categoryRoutes from './routes/categoryRoutes';
import tagRoutes from './routes/tagRoutes';
import twoFactorRoutes from './routes/twoFactorRoutes';
import sessionRoutes from './routes/sessionRoutes';
import { apiLimiter } from './middlewares/security';
import { cleanupExpiredSessions } from './controllers/sessionController';

// 환경 변수 설정
dotenv.config();

// Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(helmet()); // 보안 헤더 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter); // API 요청 속도 제한

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Personal Password Manager API 서버에 오신 것을 환영합니다!' });
});

// API 라우트 연결
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/sessions', sessionRoutes);

// 서버 시작
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');
    
    // 데이터베이스 동기화
    // 개발 환경에서는 alter 옵션으로, 프로덕션에서는 force 옵션 없이 실행
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('개발 환경: 데이터베이스 모델 동기화 완료');
    } else {
      await sequelize.sync();
      console.log('프로덕션 환경: 데이터베이스 모델 동기화 완료');
    }
    
    // 만료된 세션 정리 스케줄러 (하루에 한 번)
    setInterval(cleanupExpiredSessions, 24 * 60 * 60 * 1000);
    
    console.log(`서버가 포트 ${PORT}에서 실행 중...`);
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
  }
});
