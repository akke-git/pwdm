import { Request, Response } from 'express';
import { Session } from '../models/index';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';

/**
 * 사용자의 모든 활성 세션 조회
 */
export const getAllSessions = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const currentToken = req.headers.authorization?.split(' ')[1] || '';
    
    // 만료되지 않고 취소되지 않은 세션 조회
    const sessions = await Session.findAll({
      where: {
        userId,
        expiresAt: { [Op.gt]: new Date() },
        isRevoked: false
      },
      order: [['lastActive', 'DESC']]
    });
    
    // 현재 세션 표시를 위해 데이터 가공
    const formattedSessions = sessions.map(session => {
      const plainSession = session.get({ plain: true });
      return {
        ...plainSession,
        isCurrent: plainSession.token === currentToken
      };
    });
    
    res.status(200).json({
      success: true,
      count: formattedSessions.length,
      data: formattedSessions
    });
  } catch (error) {
    console.error('세션 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 특정 세션 취소 (로그아웃)
 */
export const revokeSession = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const currentToken = req.headers.authorization?.split(' ')[1] || '';
    
    // 세션 조회
    const session = await Session.findOne({
      where: {
        id: Number(id),
        userId
      }
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '세션을 찾을 수 없습니다.'
      });
    }
    
    // 세션 취소
    session.isRevoked = true;
    await session.save();
    
    // 현재 세션을 취소한 경우 응답에 표시
    const isCurrentSession = session.token === currentToken;
    
    res.status(200).json({
      success: true,
      message: '세션이 성공적으로 취소되었습니다.',
      data: {
        isCurrentSession
      }
    });
  } catch (error) {
    console.error('세션 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 현재 세션을 제외한 모든 세션 취소
 */
export const revokeAllOtherSessions = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const currentToken = req.headers.authorization?.split(' ')[1] || '';
    
    // 현재 세션을 제외한 모든 세션 취소
    const result = await Session.update(
      { isRevoked: true },
      {
        where: {
          userId,
          token: { [Op.ne]: currentToken },
          isRevoked: false
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: '다른 모든 세션이 성공적으로 취소되었습니다.',
      data: {
        revokedCount: result[0]
      }
    });
  } catch (error) {
    console.error('세션 일괄 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 세션 활성 상태 업데이트
 */
export const updateSessionActivity = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentToken = req.headers.authorization?.split(' ')[1] || '';
    
    if (!currentToken) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }
    
    // 세션 조회
    const session = await Session.findOne({
      where: {
        token: currentToken,
        isRevoked: false
      }
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '유효한 세션을 찾을 수 없습니다.'
      });
    }
    
    // 세션 활성 시간 업데이트
    session.lastActive = new Date();
    await session.save();
    
    res.status(200).json({
      success: true,
      message: '세션 활성 상태가 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('세션 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 새 세션 생성 (로그인 시 호출)
 */
export const createSession = async (req: Request, res: Response, userId: number, token: string): Promise<void> => {
  try {
    // 디바이스 정보 추출
    const userAgent = req.headers['user-agent'] || '알 수 없는 기기';
    const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
    
    // JWT 만료 시간 추출
    const decodedToken = jwt.decode(token) as any;
    const expiresAt = decodedToken?.exp ? new Date(decodedToken.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    // 세션 생성
    await Session.create({
      userId,
      token,
      deviceInfo: userAgent,
      ipAddress,
      lastActive: new Date(),
      expiresAt,
      isRevoked: false
    });
  } catch (error) {
    console.error('세션 생성 오류:', error);
  }
};

/**
 * 만료된 세션 정리 (스케줄러에서 호출)
 */
export const cleanupExpiredSessions = async (): Promise<void> => {
  try {
    await Session.destroy({
      where: {
        [Op.or]: [
          { expiresAt: { [Op.lt]: new Date() } },
          { isRevoked: true }
        ]
      }
    });
    
    console.log('만료된 세션 정리 완료');
  } catch (error) {
    console.error('세션 정리 오류:', error);
  }
};
