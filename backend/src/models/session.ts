import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';
import User from './user';

interface SessionAttributes {
  id?: number;
  userId: number;
  token: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: Date;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SessionCreationAttributes extends SessionAttributes {}

class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  public id!: number;
  public userId!: number;
  public token!: string;
  public deviceInfo!: string;
  public ipAddress!: string;
  public lastActive!: Date;
  public expiresAt!: Date;
  public isRevoked!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Session.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  deviceInfo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  lastActive: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  sequelize,
  tableName: 'sessions',
  indexes: [
    {
      name: 'sessions_user_id',
      fields: ['user_id']
    },
    {
      name: 'sessions_token',
      fields: ['token']
    }
  ]
});

// 관계 설정
Session.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Session, { foreignKey: 'userId' });

export default Session;
