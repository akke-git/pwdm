import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/security';
import * as twoFactorController from '../controllers/twoFactorController';

const router = express.Router();

// 모든 2FA 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 2FA 설정 초기화 (QR 코드 생성)
router.post('/setup', apiLimiter, twoFactorController.setupTwoFactor);

// 2FA 활성화
router.post('/enable', apiLimiter, twoFactorController.enableTwoFactor);

// 2FA 비활성화
router.post('/disable', apiLimiter, twoFactorController.disableTwoFactor);

// 2FA 상태 확인
router.get('/status', twoFactorController.getTwoFactorStatus);

// 2FA 토큰 검증
router.post('/verify', apiLimiter, twoFactorController.verifyTwoFactorToken);

// 백업 코드 검증
router.post('/verify-backup', apiLimiter, twoFactorController.verifyBackupCode);

export default router;
