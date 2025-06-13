import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { apiLimiter } from '../middlewares/security';
import * as tagController from '../controllers/tagController';

const router = express.Router();

// 모든 태그 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 태그 생성
router.post('/', apiLimiter, tagController.createTag);

// 모든 태그 조회
router.get('/', tagController.getAllTags);

// 태그 통계 조회
router.get('/stats', tagController.getTagStats);

// 특정 태그 조회
router.get('/:id', tagController.getTag);

// 태그 업데이트
router.put('/:id', apiLimiter, tagController.updateTag);

// 태그 삭제
router.delete('/:id', apiLimiter, tagController.deleteTag);

// 비밀번호 항목에 태그 추가
router.post('/password/:passwordItemId', apiLimiter, tagController.addTagToPasswordItem);

// 비밀번호 항목의 태그 조회
router.get('/password/:passwordItemId', tagController.getPasswordItemTags);

// 비밀번호 항목에서 태그 제거
router.delete('/password/:passwordItemId/:tagId', apiLimiter, tagController.removeTagFromPasswordItem);

export default router;
