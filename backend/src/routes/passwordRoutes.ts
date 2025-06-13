import express, { Request, Response, NextFunction } from 'express';
import * as passwordController from '../controllers/passwordController';
import { authenticateToken } from '../middlewares/auth';
import { upload } from '../controllers/passwordController';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 비밀번호 항목 CRUD 라우트
router.post('/', async (req: Request, res: Response) => {
  try {
    await passwordController.createPasswordItem(req, res);
  } catch (error) {
    console.error('Create password item error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    await passwordController.getAllPasswordItems(req, res);
  } catch (error) {
    console.error('Get all password items error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    await passwordController.getPasswordItem(req, res);
  } catch (error) {
    console.error('Get password item error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    await passwordController.updatePasswordItem(req, res);
  } catch (error) {
    console.error('Update password item error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await passwordController.deletePasswordItem(req, res);
  } catch (error) {
    console.error('Delete password item error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 항목 내보내기
router.post('/export', async (req: Request, res: Response) => {
  try {
    await passwordController.exportPasswordItems(req, res);
  } catch (error) {
    console.error('Export password items error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 항목 가져오기 (JSON 파일)
router.post('/import', upload.single('file'), async (req: Request, res: Response) => {
  try {
    await passwordController.importPasswordItems(req, res);
  } catch (error) {
    console.error('Import password items error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 만료 예정인 비밀번호 항목 조회
router.get('/expiring', async (req: Request, res: Response) => {
  try {
    await passwordController.getExpiringPasswordItems(req, res);
  } catch (error) {
    console.error('Get expiring password items error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 사용 기록 추적
router.post('/:id/track', async (req: Request, res: Response) => {
  try {
    await passwordController.trackPasswordUsage(req, res);
  } catch (error) {
    console.error('Track password usage error:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 강도 분석
// router.get('/:id/analyze', async (req: Request, res: Response) => {
//   try {
//     await passwordController.analyzePasswordStrength(req, res);
//   } catch (error) {
//     console.error('Analyze password strength error:', error);
//     res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
//   }
// });

export default router;
