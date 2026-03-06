import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { UAV } from './UAV';

interface TelemetryLogAttributes {
    id: number;
    uavId: number;
    latitude: number;
    longitude: number;
    altitude: number;
    battery: number;
    airspeed: number;
    roll: number;
    pitch: number;
    yaw: number;
    flightMode: string;
    signalStrength: number;
    cpuUsage: number;
    temperature: number;
    reachedWaypoints: number[];
    timestamp: Date;
}
interface TelemetryLogCreationAttributes extends Optional<TelemetryLogAttributes, 'id'> { }

class TelemetryLog extends Model<TelemetryLogAttributes, TelemetryLogCreationAttributes>
    implements TelemetryLogAttributes {
    declare id: number;
    declare uavId: number;
    declare latitude: number;
    declare longitude: number;
    declare altitude: number;
    declare battery: number;
    declare airspeed: number;
    declare roll: number;
    declare pitch: number;
    declare yaw: number;
    declare flightMode: string;
    declare signalStrength: number;
    declare cpuUsage: number;
    declare temperature: number;
    declare reachedWaypoints: number[];
    declare timestamp: Date;
}

TelemetryLog.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        uavId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'uavs', key: 'id' } },
        latitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
        longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
        altitude: { type: DataTypes.FLOAT },
        battery: { type: DataTypes.FLOAT },
        airspeed: { type: DataTypes.FLOAT },
        roll: { type: DataTypes.FLOAT },
        pitch: { type: DataTypes.FLOAT },
        yaw: { type: DataTypes.FLOAT },
        flightMode: { type: DataTypes.STRING(50) },
        signalStrength: { type: DataTypes.INTEGER },
        cpuUsage: { type: DataTypes.FLOAT },
        temperature: { type: DataTypes.FLOAT },
        reachedWaypoints: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const val = this.getDataValue('reachedWaypoints' as any);
                return val ? JSON.parse(val) : [];
            },
            set(val: number[]) {
                this.setDataValue('reachedWaypoints' as any, JSON.stringify(val));
            }
        },
        timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { sequelize, tableName: 'telemetry_logs', modelName: 'TelemetryLog', underscored: true, timestamps: false }
);

TelemetryLog.belongsTo(UAV, { foreignKey: 'uavId', as: 'uav' });
UAV.hasMany(TelemetryLog, { foreignKey: 'uavId', as: 'telemetryLogs' });

export { TelemetryLog };
