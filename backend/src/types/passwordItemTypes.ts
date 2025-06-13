// backend/src/types/passwordItemTypes.ts

// PasswordItem 모델의 속성을 기반으로 필요한 타입을 정의합니다.
export interface IPasswordItemCreationAttributes {
  userId: number; // Changed from string to number
  title: string;
  url?: string | null;
  username?: string | null;
  password: string; // 암호화되기 전의 평문 비밀번호
  category?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  isFavorite?: boolean | null;
  expiryDate?: Date | string | null;
}

export interface IPasswordItemAttributes {
  id: number; // Changed from string to number
  userId: number; // Added and set to number, consistent with PasswordItem model
  title: string;
  url?: string | null;
  username?: string | null;
  password: string; // 암호화된 비밀번호 (서비스 레이어에서 복호화 시 평문으로 바뀔 수 있음)
  category?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  isFavorite?: boolean | null;
  lastUsed?: Date | null;
  expiryDate?: Date | string | null; // Model uses Date, allow string for input flexibility
  createdAt?: Date;
  updatedAt?: Date;
}
