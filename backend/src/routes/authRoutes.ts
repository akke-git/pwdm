import express, { Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';
import { passwordStrengthCheck, masterPasswordStrengthCheck, loginLimiter } from '../middlewares/security';

const router = express.Router();

// 공개 라우트
router.post('/register', passwordStrengthCheck, masterPasswordStrengthCheck, async (req: Request, res: Response) => {
  try {
    await authController.register(req, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    await authController.login(req, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/google-login', async (req: Request, res: Response) => {
  try {
    await authController.googleLogin(req, res);
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 인증 필요 라우트
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    await authController.getProfile(req, res);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/change-master-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    await authController.changeMasterPassword(req, res);
  } catch (error) {
    console.error('Change master password error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
