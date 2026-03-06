import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type UserRole = 'admin' | 'operator' | 'viewer';

interface UserAttributes {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare id: number;
    declare name: string;
    declare email: string;
    declare passwordHash: string;
    declare role: UserRole;
}

User.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
        passwordHash: { type: DataTypes.STRING(255), allowNull: false },
        role: { type: DataTypes.ENUM('admin', 'operator', 'viewer'), defaultValue: 'operator' },
    },
    { sequelize, tableName: 'users', modelName: 'User', underscored: true }
);

export { User };
