import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';
import User from './user';
import PasswordItem from './passwordItem';

interface PasswordHistoryAttributes {
  id?: number;
  passwordItemId: number;
  userId: number;
  action: string;  // 'view', 'copy', 'autofill' 등
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PasswordHistoryCreationAttributes extends PasswordHistoryAttributes {}

class PasswordHistory extends Model<PasswordHistoryAttributes, PasswordHistoryCreationAttributes> implements PasswordHistoryAttributes {
  public id!: number;
  public passwordItemId!: number;
  public userId!: number;
  public action!: string;
  public timestamp!: Date;
  public userAgent!: string;
  public ipAddress!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PasswordHistory.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  passwordItemId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'password_items',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  action: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'password_history',
});

// 관계 설정
PasswordHistory.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PasswordHistory, { foreignKey: 'userId' });

PasswordHistory.belongsTo(PasswordItem, { foreignKey: 'passwordItemId' });
PasswordItem.hasMany(PasswordHistory, { foreignKey: 'passwordItemId' });

export default PasswordHistory;
