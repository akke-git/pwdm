import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// 암호화 키는 환경 변수에서 가져옵니다
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_encryption_key_for_development';
const IV_LENGTH = 16; // AES 블록 크기
const SALT_LENGTH = 32; // 솔트 길이
const KEY_LENGTH = 32; // 키 길이 (256비트)
const ITERATIONS = 100000; // 반복 횟수

/**
 * 문자열을 암호화합니다.
 * @param text 암호화할 평문
 * @param key 암호화에 사용할 키 (선택적, 기본값은 환경 변수)
 * @returns 암호화된 문자열 (IV + 암호문)
 */
/**
 * 마스터 비밀번호에서 암호화 키를 유도합니다.
 * @param masterPassword 마스터 비밀번호
 * @param salt 솔트 (선택적, 기본값은 랜덤 생성)
 * @returns 유도된 키와 사용된 솔트
 */
export function deriveKeyFromPassword(masterPassword: string, salt?: Buffer): { key: Buffer; salt: Buffer } {
  // 솔트가 없으면 랜덤 솔트 생성
  const usedSalt = salt || crypto.randomBytes(SALT_LENGTH);
  
  // PBKDF2를 사용하여 키 유도
  const key = crypto.pbkdf2Sync(masterPassword, usedSalt, ITERATIONS, KEY_LENGTH, 'sha512');
  
  return { key, salt: usedSalt };
}

/**
 * 저장된 솔트로 마스터 비밀번호에서 키를 재생성합니다.
 * @param masterPassword 마스터 비밀번호
 * @param saltHex 16진수 문자열로 저장된 솔트
 * @returns 유도된 키
 */
export function regenerateKeyFromPassword(masterPassword: string, saltHex: string): Buffer {
  // 16진수 문자열을 버퍼로 변환
  const salt = Buffer.from(saltHex, 'hex');
  
  // PBKDF2를 사용하여 키 유도
  return crypto.pbkdf2Sync(masterPassword, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

export function encrypt(text: string, key: string = ENCRYPTION_KEY): string {
  // 랜덤 초기화 벡터 생성
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // 암호화 키 생성 (32바이트 = 256비트)
  const derivedKey = crypto.scryptSync(key, 'salt', KEY_LENGTH);
  
  // 암호화 객체 생성
  const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
  
  // 암호화 수행
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // IV와 암호문을 함께 반환 (IV는 복호화에 필요)
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * 암호화된 문자열을 복호화합니다.
 * @param encryptedText 암호화된 문자열 (IV + 암호문)
 * @param key 복호화에 사용할 키 (선택적, 기본값은 환경 변수)
 * @returns 복호화된 평문
 */
export function decrypt(encryptedText: string, key: string = ENCRYPTION_KEY): string {
  // IV와 암호문 분리
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedData = textParts[1];
  
  // 암호화 키 생성 (32바이트 = 256비트)
  const derivedKey = crypto.scryptSync(key, 'salt', KEY_LENGTH);
  
  // 복호화 객체 생성
  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
  
  // 복호화 수행
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * 비밀번호 강도를 검사합니다.
 * @param password 검사할 비밀번호
 * @returns 비밀번호 강도 점수 (0-100)
 */
export function checkPasswordStrength(password: string): { score: number; feedback: string } {
  let score = 0;
  const feedback: string[] = [];
  
  // 길이 검사
  if (password.length < 8) {
    feedback.push('비밀번호는 최소 8자 이상이어야 합니다.');
  } else {
    score += Math.min(password.length * 2, 20); // 최대 20점
  }
  
  // 복잡성 검사
  if (/[a-z]/.test(password)) score += 10; // 소문자
  if (/[A-Z]/.test(password)) score += 10; // 대문자
  if (/[0-9]/.test(password)) score += 10; // 숫자
  if (/[^a-zA-Z0-9]/.test(password)) score += 15; // 특수문자
  
  // 다양성 검사
  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars * 2, 15); // 최대 15점
  
  // 연속된 문자 검사
  let hasSequence = false;
  for (let i = 0; i < password.length - 2; i++) {
    const charCode1 = password.charCodeAt(i);
    const charCode2 = password.charCodeAt(i + 1);
    const charCode3 = password.charCodeAt(i + 2);
    
    if (charCode1 + 1 === charCode2 && charCode2 + 1 === charCode3) {
      hasSequence = true;
      break;
    }
  }
  
  if (hasSequence) {
    score -= 10;
    feedback.push('연속된 문자 사용은 보안에 취약합니다.');
  }
  
  // 반복된 문자 검사
  let hasRepeat = false;
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      hasRepeat = true;
      break;
    }
  }
  
  if (hasRepeat) {
    score -= 10;
    feedback.push('반복된 문자 사용은 보안에 취약합니다.');
  }
  
  // 점수 범위 조정 (0-100)
  score = Math.max(0, Math.min(score, 100));
  
  // 피드백 생성
  if (score < 40) {
    feedback.unshift('취약한 비밀번호입니다.');
  } else if (score < 70) {
    feedback.unshift('적절한 비밀번호입니다.');
  } else {
    feedback.unshift('강력한 비밀번호입니다.');
  }
  
  return {
    score,
    feedback: feedback.join(' '),
  };
}

/**
 * 안전한 랜덤 비밀번호를 생성합니다.
 * @param length 비밀번호 길이 (기본값: 16)
 * @param options 비밀번호 생성 옵션
 * @returns 생성된 비밀번호
 */
export function generatePassword(
  length: number = 16,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
  } = {}
): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
  } = options;
  
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let chars = '';
  if (includeUppercase) chars += uppercase;
  if (includeLowercase) chars += lowercase;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;
  
  if (chars.length === 0) {
    throw new Error('적어도 하나의 문자 유형을 포함해야 합니다.');
  }
  
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % chars.length;
    password += chars[randomIndex];
  }
  
  return password;
}
