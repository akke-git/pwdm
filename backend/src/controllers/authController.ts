import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/index';
import { encrypt, deriveKeyFromPassword } from '../utils/encryption';
import { createSession } from './sessionController';
import axios from 'axios';

// 환경 변수
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_for_development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Google OAuth 관련 환경 변수
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// 환경 변수 검증
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('경고: Google OAuth 환경 변수가 설정되지 않았습니다. Google 로그인 기능이 작동하지 않을 수 있습니다.');
}

// JWT 타입 정의
interface JwtPayload {
  id: number;
  email: string;
  username: string; // 사용자 이름 추가
}

/**
 * 사용자 등록
 */
export const register = async (req: Request, res: Response) => {
  try {
    console.log('회원가입 요청 받음:', req.body);
    const { username, email, password, masterPassword } = req.body;
    
    // 필수 필드 검증
    if (!username || !email || !password || !masterPassword) {
      console.log('필수 필드 검증 실패:', { username, email, password: password ? '있음' : '없음', masterPassword: masterPassword ? '있음' : '없음' });
      return res.status(400).json({ 
        success: false, 
        message: '모든 필수 필드를 입력해주세요.' 
      });
    }
    
    // 이미 존재하는 사용자인지 확인
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: '이미 등록된 이메일입니다.' 
      });
    }
    
    console.log('마스터 비밀번호 처리 시작...');  
    // 마스터 비밀번호로부터 안전한 암호화 키 유도
    console.log('마스터 비밀번호로부터 키 유도 시도...');
    let encryptionKey: string;
    let keySalt: string;
    
    try {
      const { key, salt } = deriveKeyFromPassword(masterPassword);
      console.log('키 유도 성공:', { saltLength: salt.length });
      
      // 암호화 키와 솔트를 저장하기 위해 문자열로 변환
      encryptionKey = key.toString('hex');
      keySalt = salt.toString('hex');
      console.log('키 변환 성공:', { encryptionKeyLength: encryptionKey.length, keySaltLength: keySalt.length });
    } catch (error: any) {
      console.error('키 유도 중 오류 발생:', error);
      throw new Error(`키 유도 오류: ${error.message || '알 수 없는 오류'}`);
    }
    
    // 사용자 생성
    const user = await User.create({
      username,
      email,
      password, // 모델의 hook에서 해싱됨
      masterPasswordHash: masterPassword, // 모델의 hook에서 해싱됨
      encryptionKey,
      keySalt,
    });
    
    // 민감 정보 제외하고 응답
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
    
    res.status(201).json({
      success: true,
      message: '사용자 등록이 완료되었습니다.',
      data: userData,
    });
  } catch (error: any) {
    console.error('사용자 등록 오류:', error);
    console.error('오류 상세 정보:', { 
      message: error.message, 
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // 사용자에게 표시할 오류 메시지
    let errorMessage = '서버 오류가 발생했습니다.';
    
    // 데이터베이스 관련 오류인 경우 더 자세한 정보 제공
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = '입력 데이터가 유효하지 않습니다. 입력 정보를 확인해주세요.';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage
    });
  }
};

/**
 * 로그인
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, masterPassword } = req.body;
    
    // 필수 필드 검증
    if (!email || !password || !masterPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '이메일, 비밀번호, 마스터 비밀번호를 모두 입력해주세요.' 
      });
    }
    
    // 사용자 조회
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
      });
    }
    
    // 비밀번호 검증
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
      });
    }
    
    // 마스터 비밀번호 검증
    const isMasterPasswordValid = await user.validateMasterPassword(masterPassword);
    if (!isMasterPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: '마스터 비밀번호가 올바르지 않습니다.' 
      });
    }
    
    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();
    
    // JWT 토큰 생성
    const payload: JwtPayload = { id: user.id, email: user.email, username: user.username };
    // 타입 오류 해결을 위해 any 타입 사용
    const token = jwt.sign(payload, JWT_SECRET as any) as string;
    
    // 세션 생성
    await createSession(req, res, user.id, token);
    
    res.status(200).json({
      success: true,
      message: '로그인 성공',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          lastLogin: user.lastLogin,
          twoFactorEnabled: user.twoFactorEnabled
        },
      },
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
};

/**
 * 사용자 정보 조회
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    // req.user는 인증 미들웨어에서 설정됨
    const userId = (req as any).user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'lastLogin', 'createdAt', 'updatedAt'],
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '사용자를 찾을 수 없습니다.' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
};

/**
 * 구글 로그인
 */
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { googleToken, email, name, masterPassword } = req.body;
    
    // 필수 필드 검증
    if (!googleToken || !email || !masterPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '구글 토큰, 이메일, 마스터 비밀번호를 모두 입력해주세요.' 
      });
    }
    
    // Google OAuth 토큰 검증
    try {
      console.log('구글 로그인 시도:', { email, name });
      console.log('환경 변수 확인:', { 
        GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID ? '설정됨' : '설정되지 않음',
        GOOGLE_CLIENT_SECRET: GOOGLE_CLIENT_SECRET ? '설정됨' : '설정되지 않음'
      });
      
      // 환경 변수가 설정되지 않은 경우 개발 모드에서는 검증을 건너뛰기
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.warn('경고: Google OAuth 환경 변수가 설정되지 않아 토큰 검증을 건너뜁니다.');
        // 개발 환경에서는 토큰 검증 없이 진행
        if (process.env.NODE_ENV === 'development') {
          console.log('개발 환경에서 토큰 검증 생략');
        } else {
          // 운영 환경에서는 오류 반환
          return res.status(500).json({
            success: false,
            message: '서버 설정 오류: Google OAuth 환경 변수가 설정되지 않았습니다.'
          });
        }
      } else {
        // Google OAuth API를 사용하여 토큰 검증
        console.log('구글 토큰 검증 시도...');
        const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`;
        const response = await axios.get(tokenInfoUrl);
        const tokenData = response.data;
        console.log('구글 토큰 검증 응답:', tokenData);
        
        // 토큰의 이메일과 요청 이메일이 일치하는지 확인
        if (tokenData.email !== email) {
          console.error('이메일 불일치:', { tokenEmail: tokenData.email, requestEmail: email });
          return res.status(401).json({
            success: false,
            message: '인증 정보가 일치하지 않습니다.'
          });
        }
        
        // 토큰의 클라이언트 ID가 우리 앱의 클라이언트 ID와 일치하는지 확인
        if (tokenData.aud !== GOOGLE_CLIENT_ID) {
          console.error('클라이언트 ID 불일치:', { tokenAud: tokenData.aud, configClientId: GOOGLE_CLIENT_ID });
          return res.status(401).json({
            success: false,
            message: '유효하지 않은 클라이언트입니다.'
          });
        }
        
        console.log('구글 토큰 검증 성공:', tokenData.email);
      }
    } catch (tokenError) {
      console.error('구글 토큰 검증 오류:', tokenError);
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 구글 토큰입니다.'
      });
    }
    
    // 사용자 조회
    let user = await User.findOne({ where: { email } });
    
    if (user) {
      // 기존 사용자인 경우 - 마스터 비밀번호 검증
      const isMasterPasswordValid = await user.validateMasterPassword(masterPassword);
      if (!isMasterPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: '마스터 비밀번호가 올바르지 않습니다.' 
        });
      }
    } else {
      // 새 사용자인 경우 - 새 계정 생성
      // 마스터 비밀번호로부터 안전한 암호화 키 유도
      const { key, salt } = deriveKeyFromPassword(masterPassword);
      
      // 암호화 키와 솔트를 저장하기 위해 문자열로 변환
      const encryptionKey = key.toString('hex');
      const keySalt = salt.toString('hex');
      
      // 사용자 생성
      user = await User.create({
        username: name || email.split('@')[0], // 이름이 없는 경우 이메일에서 추출
        email,
        password: Math.random().toString(36).slice(-10), // 랜덤 비밀번호 생성 (사용자는 구글 로그인만 사용)
        masterPasswordHash: masterPassword, // 모델의 hook에서 해싱됨
        encryptionKey,
        keySalt,
        isGoogleUser: true, // 구글 사용자 표시
      });
    }
    
    // 마지막 로그인 시간 업데이트
    user.lastLogin = new Date();
    await user.save();
    
    // JWT 토큰 생성
    const payload: JwtPayload = { id: user.id, email: user.email, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET as any) as string;
    
    // 세션 생성
    await createSession(req, res, user.id, token);
    
    res.status(200).json({
      success: true,
      message: '구글 로그인 성공',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          lastLogin: user.lastLogin,
          twoFactorEnabled: user.twoFactorEnabled
        },
      },
    });
  } catch (error) {
    console.error('구글 로그인 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
};

/**
 * 마스터 비밀번호 변경
 */
export const changeMasterPassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentMasterPassword, newMasterPassword } = req.body;
    
    // 필수 필드 검증
    if (!currentMasterPassword || !newMasterPassword) {
      return res.status(400).json({ 
        success: false, 
        message: '현재 마스터 비밀번호와 새 마스터 비밀번호를 입력해주세요.' 
      });
    }
    
    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '사용자를 찾을 수 없습니다.' 
      });
    }
    
    // 현재 마스터 비밀번호 검증
    const isValid = await user.validateMasterPassword(currentMasterPassword);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: '현재 마스터 비밀번호가 올바르지 않습니다.' 
      });
    }
    
    // 새 마스터 비밀번호로 안전한 암호화 키 유도
    const { key, salt } = deriveKeyFromPassword(newMasterPassword);
    
    // 암호화 키와 솔트를 저장하기 위해 문자열로 변환
    const encryptionKey = key.toString('hex');
    const keySalt = salt.toString('hex');
    
    // 마스터 비밀번호 업데이트
    user.masterPasswordHash = newMasterPassword; // 모델의 hook에서 해싱됨
    user.encryptionKey = encryptionKey;
    user.keySalt = keySalt;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: '마스터 비밀번호가 성공적으로 변경되었습니다.',
    });
  } catch (error) {
    console.error('마스터 비밀번호 변경 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
};
