export interface TelemetryFrame {
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
    missionCompleted?: boolean;
    timestamp: Date;
}

export interface TelemetryState {
    current: TelemetryFrame | null;
    buffer: TelemetryFrame[];   // last 200 frames for trail
    connected: boolean;
}

export const telemetryInitialState: TelemetryState = {
    current: null,
    buffer: [],
    connected: false,
};
