import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/security';
import * as categoryController from '../controllers/categoryController';

const router = express.Router();

// 모든 카테고리 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 카테고리 생성
router.post('/', apiLimiter, categoryController.createCategory);

// 모든 카테고리 조회
router.get('/', categoryController.getAllCategories);

// 카테고리 통계 조회
router.get('/stats', categoryController.getCategoryStats);

// 특정 카테고리 조회
router.get('/:id', categoryController.getCategory);

// 카테고리 업데이트
router.put('/:id', apiLimiter, categoryController.updateCategory);

// 카테고리 삭제
router.delete('/:id', apiLimiter, categoryController.deleteCategory);

export default router;
