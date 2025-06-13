import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';
import User from './user';

interface CategoryAttributes {
  id?: number;
  userId: number;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CategoryCreationAttributes extends CategoryAttributes {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public userId!: number;
  public name!: string;
  public color!: string;
  public icon!: string;
  public description!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init({
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
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#3498db', // 기본 색상
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'folder', // 기본 아이콘
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'categories',
  indexes: [
    {
      unique: true,
      name: 'categories_user_name_unique',
      fields: ['user_id', 'name']
    }
  ]
});

// 관계 설정
Category.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Category, { foreignKey: 'userId' });

export default Category;
