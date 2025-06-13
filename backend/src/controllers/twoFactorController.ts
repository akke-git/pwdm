import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../models/index';

/**
 * 2FA 설정 초기화
 * 사용자를 위한 새로운 2FA 비밀키를 생성하고 QR 코드를 반환합니다.
 */
export const setupTwoFactor = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    
    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 이미 2FA가 활성화되어 있는지 확인
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '이미 2단계 인증이 활성화되어 있습니다. 재설정하려면 먼저 비활성화하세요.'
      });
    }
    
    // 새로운 비밀키 생성
    const secret = speakeasy.generateSecret({
      name: `비밀번호 관리자 (${user.username})`,
      length: 20
    });
    
    // 사용자 정보 업데이트
    user.twoFactorSecret = secret.base32;
    await user.save();
    
    // QR 코드 생성
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');
    
    res.status(200).json({
      success: true,
      message: '2단계 인증 설정이 준비되었습니다.',
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl
      }
    });
  } catch (error) {
    console.error('2FA 설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 2FA 활성화
 * 사용자가 제공한 토큰을 검증하고 2FA를 활성화합니다.
 */
export const enableTwoFactor = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
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
    
    // 이미 2FA가 활성화되어 있는지 확인
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '이미 2단계 인증이 활성화되어 있습니다.'
      });
    }
    
    // 비밀키가 없는 경우
    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2단계 인증 설정이 완료되지 않았습니다. 먼저 설정을 초기화하세요.'
      });
    }
    
    // 토큰 검증
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token
    });
    
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: '잘못된 인증 코드입니다. 다시 시도하세요.'
      });
    }
    
    // 백업 코드 생성 (10개)
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex');
      const hashedCode = await bcrypt.hash(code, 10);
      backupCodes.push(hashedCode);
    }
    
    // 2FA 활성화 및 백업 코드 저장
    user.twoFactorEnabled = true;
    user.backupCodes = backupCodes.join(',');
    await user.save();
    
    // 백업 코드 반환 (해시되지 않은 원본)
    const originalBackupCodes = [];
    for (let i = 0; i < 10; i++) {
      originalBackupCodes.push(crypto.randomBytes(4).toString('hex'));
    }
    
    res.status(200).json({
      success: true,
      message: '2단계 인증이 성공적으로 활성화되었습니다.',
      data: {
        backupCodes: originalBackupCodes
      }
    });
  } catch (error) {
    console.error('2FA 활성화 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 2FA 비활성화
 * 사용자의 2FA를 비활성화합니다.
 */
export const disableTwoFactor = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { token, masterPassword } = req.body;
    
    if (!token || !masterPassword) {
      return res.status(400).json({
        success: false,
        message: '인증 토큰과 마스터 비밀번호가 필요합니다.'
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
    
    // 2FA가 활성화되어 있지 않은 경우
    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2단계 인증이 활성화되어 있지 않습니다.'
      });
    }
    
    // 마스터 비밀번호 검증
    const validMasterPassword = await user.validateMasterPassword(masterPassword);
    if (!validMasterPassword) {
      return res.status(401).json({
        success: false,
        message: '마스터 비밀번호가 일치하지 않습니다.'
      });
    }
    
    // 토큰 검증
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token
    });
    
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: '잘못된 인증 코드입니다. 다시 시도하세요.'
      });
    }
    
    // 2FA 비활성화
    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    user.backupCodes = '';
    await user.save();
    
    res.status(200).json({
      success: true,
      message: '2단계 인증이 성공적으로 비활성화되었습니다.'
    });
  } catch (error) {
    console.error('2FA 비활성화 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 2FA 상태 확인
 * 사용자의 2FA 활성화 상태를 반환합니다.
 */
export const getTwoFactorStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    
    // 사용자 조회
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        enabled: user.twoFactorEnabled,
        setupComplete: !!user.twoFactorSecret
      }
    });
  } catch (error) {
    console.error('2FA 상태 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 2FA 백업 코드 검증
 * 사용자가 제공한 백업 코드를 검증합니다.
 */
export const verifyBackupCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { backupCode } = req.body;
    
    if (!backupCode) {
      return res.status(400).json({
        success: false,
        message: '백업 코드가 필요합니다.'
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
    
    // 백업 코드가 없는 경우
    if (!user.backupCodes) {
      return res.status(400).json({
        success: false,
        message: '백업 코드가 설정되어 있지 않습니다.'
      });
    }
    
    // 백업 코드 검증
    const storedCodes = user.backupCodes.split(',');
    let validCode = false;
    let validCodeIndex = -1;
    
    for (let i = 0; i < storedCodes.length; i++) {
      const isMatch = await bcrypt.compare(backupCode, storedCodes[i]);
      if (isMatch) {
        validCode = true;
        validCodeIndex = i;
        break;
      }
    }
    
    if (!validCode) {
      return res.status(401).json({
        success: false,
        message: '잘못된 백업 코드입니다.'
      });
    }
    
    // 사용된 백업 코드 제거
    storedCodes.splice(validCodeIndex, 1);
    user.backupCodes = storedCodes.join(',');
    await user.save();
    
    res.status(200).json({
      success: true,
      message: '백업 코드가 확인되었습니다.',
      data: {
        remainingCodes: storedCodes.length
      }
    });
  } catch (error) {
    console.error('백업 코드 검증 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 2FA 토큰 검증
 * 사용자가 제공한 2FA 토큰을 검증합니다.
 */
export const verifyTwoFactorToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
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
    
    // 2FA가 활성화되어 있지 않은 경우
    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2단계 인증이 활성화되어 있지 않습니다.'
      });
    }
    
    // 토큰 검증
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1 // 30초 전후로 1단위 허용 (총 90초)
    });
    
    if (!verified) {
      return res.status(401).json({
        success: false,
        message: '잘못된 인증 코드입니다.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: '인증 코드가 확인되었습니다.'
    });
  } catch (error) {
    console.error('2FA 토큰 검증 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};
