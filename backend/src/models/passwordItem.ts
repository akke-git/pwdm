import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';
import User from './user';

interface PasswordItemAttributes {
  id?: number;
  userId: number;
  title: string;
  url?: string;
  username?: string;
  password: string; // 암호화된 비밀번호
  category?: string;
  tags?: string[];
  notes?: string;
  isFavorite?: boolean;
  lastUsed?: Date;
  expiryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PasswordItemCreationAttributes extends PasswordItemAttributes {}

class PasswordItem extends Model<PasswordItemAttributes, PasswordItemCreationAttributes> implements PasswordItemAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public url!: string;
  public username!: string;
  public password!: string;
  public category!: string;
  public tags!: string[];
  public notes!: string;
  public isFavorite!: boolean;
  public lastUsed!: Date;
  public expiryDate!: Date;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PasswordItem.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '암호화된 비밀번호',
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'password_items',
});

// 관계 설정
PasswordItem.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PasswordItem, { foreignKey: 'userId' });

export default PasswordItem;
