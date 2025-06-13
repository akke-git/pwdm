import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';
import User from './user';
import PasswordItem from './passwordItem';

interface TagAttributes {
  id?: number;
  userId: number;
  name: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TagCreationAttributes extends TagAttributes {}

class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  public id!: number;
  public userId!: number;
  public name!: string;
  public color!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 태그 항목 관계 테이블 (다대다 관계)
interface TagItemAttributes {
  id?: number;
  tagId: number;
  passwordItemId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TagItemCreationAttributes extends TagItemAttributes {}

class TagItem extends Model<TagItemAttributes, TagItemCreationAttributes> implements TagItemAttributes {
  public id!: number;
  public tagId!: number;
  public passwordItemId!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tag.init({
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
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#2ecc71', // 기본 색상
  },
}, {
  sequelize,
  tableName: 'tags',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'name'],
      name: 'tags_user_name_unique'
    }
  ]
});

TagItem.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  tagId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'tags',
      key: 'id',
    },
  },
  passwordItemId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'password_items',
      key: 'id',
    },
  },
}, {
  sequelize,
  tableName: 'tag_items',
  indexes: [
    {
      unique: true,
      fields: ['tag_id', 'password_item_id'],
      name: 'tag_item_unique'
    }
  ]
});

// 관계 설정
Tag.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Tag, { foreignKey: 'userId' });

Tag.belongsToMany(PasswordItem, { 
  through: TagItem,
  foreignKey: 'tagId',
  otherKey: 'passwordItemId'
});

PasswordItem.belongsToMany(Tag, { 
  through: TagItem,
  foreignKey: 'passwordItemId',
  otherKey: 'tagId'
});

export { Tag, TagItem };
export default Tag;
