import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_for_development';

/**
 * JWT 토큰을 검증하는 미들웨어
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // 헤더에서 Authorization 값 가져오기
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN 형식에서 TOKEN 부분 추출
  
  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: '인증 토큰이 필요합니다.' 
    });
    return;
  }
  
  // 토큰 검증
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ 
        success: false, 
        message: '유효하지 않거나 만료된 토큰입니다.' 
      });
      return;
    }
    
    // 검증된 사용자 정보를 요청 객체에 추가
    (req as any).user = decoded;
    next();
  });
};

/**
 * 세션 유효성을 확인하는 미들웨어
 * 클라이언트에서 주기적으로 호출하여 세션 유지
 */
export const checkSession = (req: Request, res: Response): void => {
  res.status(200).json({ 
    success: true, 
    message: '세션이 유효합니다.' 
  });
};
