import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from './index';

interface UserAttributes {
  id?: number;
  username: string;
  email: string;
  password: string;
  masterPasswordHash: string;
  encryptionKey?: string;
  keySalt?: string;  // 키 유도에 사용되는 솔트
  twoFactorSecret?: string; // 2FA 비밀키
  twoFactorEnabled?: boolean; // 2FA 활성화 여부
  backupCodes?: string; // 백업 코드 (콤마로 구분된 해시 값)
  isGoogleUser?: boolean; // 구글 로그인 사용자 여부
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends UserAttributes {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public masterPasswordHash!: string;
  public encryptionKey!: string;
  public keySalt!: string;
  public twoFactorSecret!: string;
  public twoFactorEnabled!: boolean;
  public backupCodes!: string;
  public isGoogleUser!: boolean;
  public lastLogin!: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // 비밀번호 검증 메소드
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
  
  // 마스터 비밀번호 검증 메소드
  public async validateMasterPassword(masterPassword: string): Promise<boolean> {
    return bcrypt.compare(masterPassword, this.masterPasswordHash);
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: 'username', // 고유 제약 조건 이름을 'username'으로 명시
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: 'email',    // 고유 제약 조건 이름을 'email'로 명시
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  masterPasswordHash: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  encryptionKey: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  keySalt: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  twoFactorSecret: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  backupCodes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isGoogleUser: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'users',
  hooks: {
    beforeCreate: async (user: User) => {
      // 비밀번호 해싱
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      // 마스터 비밀번호 해싱
      if (user.masterPasswordHash) {
        user.masterPasswordHash = await bcrypt.hash(user.masterPasswordHash, 10);
      }
    },
    beforeUpdate: async (user: User) => {
      // 비밀번호가 변경된 경우에만 해싱
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      // 마스터 비밀번호가 변경된 경우에만 해싱
      if (user.changed('masterPasswordHash')) {
        user.masterPasswordHash = await bcrypt.hash(user.masterPasswordHash, 10);
      }
    },
  },
});

export default User;
