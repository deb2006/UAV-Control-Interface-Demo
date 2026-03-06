import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type UAVStatus = 'active' | 'idle' | 'offline' | 'maintenance';

interface UAVAttributes {
    id: number;
    name: string;
    serialNumber: string;
    status: UAVStatus;
    lastSeen: Date;
}
interface UAVCreationAttributes extends Optional<UAVAttributes, 'id'> { }

class UAV extends Model<UAVAttributes, UAVCreationAttributes> implements UAVAttributes {
    declare id: number;
    declare name: string;
    declare serialNumber: string;
    declare status: UAVStatus;
    declare lastSeen: Date;
}

UAV.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(100), allowNull: false },
        serialNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        status: {
            type: DataTypes.ENUM('active', 'idle', 'offline', 'maintenance'),
            defaultValue: 'idle',
        },
        lastSeen: { type: DataTypes.DATE, allowNull: true },
    },
    { sequelize, tableName: 'uavs', modelName: 'UAV', underscored: true }
);

export { UAV };
