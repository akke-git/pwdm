import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/security';
import * as sessionController from '../controllers/sessionController';

const router = express.Router();

// 모든 세션 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 모든 활성 세션 조회
router.get('/', sessionController.getAllSessions);

// 세션 활성 상태 업데이트 (핑)
router.post('/ping', sessionController.updateSessionActivity);

// 특정 세션 취소 (로그아웃)
router.delete('/:id', apiLimiter, sessionController.revokeSession);

// 현재 세션을 제외한 모든 세션 취소
router.delete('/', apiLimiter, sessionController.revokeAllOtherSessions);

export default router;
