import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Mission } from './Mission';

export type WaypointAction = 'hover' | 'capture' | 'rtl' | 'land' | 'waypoint';

interface WaypointAttributes {
    id: number;
    missionId: number;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    actionType: WaypointAction;
    sequenceOrder: number;
}
interface WaypointCreationAttributes extends Optional<WaypointAttributes, 'id'> { }

class Waypoint extends Model<WaypointAttributes, WaypointCreationAttributes> implements WaypointAttributes {
    declare id: number;
    declare missionId: number;
    declare latitude: number;
    declare longitude: number;
    declare altitude: number;
    declare speed: number;
    declare actionType: WaypointAction;
    declare sequenceOrder: number;
}

Waypoint.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        missionId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'missions', key: 'id' } },
        latitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
        longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
        altitude: { type: DataTypes.FLOAT, defaultValue: 50 },
        speed: { type: DataTypes.FLOAT, defaultValue: 15 },
        actionType: {
            type: DataTypes.ENUM('hover', 'capture', 'rtl', 'land', 'waypoint'),
            defaultValue: 'waypoint',
        },
        sequenceOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, tableName: 'waypoints', modelName: 'Waypoint', underscored: true }
);

Waypoint.belongsTo(Mission, { foreignKey: 'missionId', as: 'mission' });
Mission.hasMany(Waypoint, { foreignKey: 'missionId', as: 'waypoints' });

export { Waypoint };
