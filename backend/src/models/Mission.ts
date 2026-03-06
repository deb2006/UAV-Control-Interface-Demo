import { DataTypes, Model, Optional, BelongsTo } from 'sequelize';
import { sequelize } from '../config/database';
import { UAV } from './UAV';

export type MissionStatus = 'planned' | 'active' | 'completed' | 'aborted';

interface MissionAttributes {
    id: number;
    uavId: number;
    missionName: string;
    status: MissionStatus;
}
interface MissionCreationAttributes extends Optional<MissionAttributes, 'id'> { }

class Mission extends Model<MissionAttributes, MissionCreationAttributes> implements MissionAttributes {
    declare id: number;
    declare uavId: number;
    declare missionName: string;
    declare status: MissionStatus;
    static readonly associations: { uav: BelongsTo };
}

Mission.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        uavId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'uavs', key: 'id' } },
        missionName: { type: DataTypes.STRING(150), allowNull: false },
        status: {
            type: DataTypes.ENUM('planned', 'active', 'completed', 'aborted'),
            defaultValue: 'planned',
        },
    },
    { sequelize, tableName: 'missions', modelName: 'Mission', underscored: true }
);

Mission.belongsTo(UAV, { foreignKey: 'uavId', as: 'uav' });
UAV.hasMany(Mission, { foreignKey: 'uavId', as: 'missions' });

export { Mission };
