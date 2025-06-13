import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
// @ts-ignore
import zxcvbn from 'zxcvbn';

/**
 * 비밀번호 강도 검사 미들웨어
 * zxcvbn 라이브러리를 사용하여 비밀번호 강도를 검사합니다.
 */
export const passwordStrengthCheck = (req: Request, res: Response, next: NextFunction): void => {
  const { password } = req.body;
  
  if (!password) {
    res.status(400).json({
      success: false,
      message: '비밀번호가 제공되지 않았습니다.'
    });
    return;
  }
  
  // zxcvbn을 사용하여 비밀번호 강도 검사
  const result = zxcvbn(password);
  
  // 비밀번호 강도가 1 미만인 경우 (0-4 척도)
  if (result.score < 1) {
    res.status(400).json({
      success: false,
      message: '비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용하세요.',
      feedback: result.feedback.suggestions,
      score: result.score
    });
    return;
  }
  
  next();
};

/**
 * 마스터 비밀번호 강도 검사 미들웨어
 * 마스터 비밀번호는 일반 비밀번호보다 더 강력해야 합니다.
 */
export const masterPasswordStrengthCheck = (req: Request, res: Response, next: NextFunction): void => {
  const { masterPassword } = req.body;
  
  if (!masterPassword) {
    res.status(400).json({
      success: false,
      message: '마스터 비밀번호가 제공되지 않았습니다.'
    });
    return;
  }
  
  // zxcvbn을 사용하여 마스터 비밀번호 강도 검사
  const result = zxcvbn(masterPassword);
  
  // 마스터 비밀번호 강도가 1 미만인 경우 (0-4 척도)
  if (result.score < 1) {
    res.status(400).json({
      success: false,
      message: '마스터 비밀번호가 너무 약합니다. 매우 강력한 비밀번호를 사용하세요.',
      feedback: result.feedback.suggestions,
      score: result.score
    });
    return;
  }
  
  next();
};

/**
 * 로그인 시도 횟수 제한 미들웨어
 * 15분 동안 5번의 로그인 시도만 허용합니다.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 15분 동안 최대 5번의 요청만 허용
  message: {
    success: false,
    message: '너무 많은 로그인 시도가 있었습니다. 15분 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API 요청 횟수 제한 미들웨어
 * 1분 동안 100번의 요청만 허용합니다.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 100, // 1분 동안 최대 100번의 요청만 허용
  message: {
    success: false,
    message: '너무 많은 요청이 있었습니다. 잠시 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
