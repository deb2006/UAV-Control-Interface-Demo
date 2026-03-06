export interface Waypoint {
    id?: number;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    actionType: string;
    sequenceOrder: number;
}

export interface Mission {
    id?: number;
    uavId: number;
    missionName: string;
    status: string;
    waypoints: Waypoint[];
}

export interface MissionState {
    missions: Mission[];
    active: Mission | null;
    waypoints: Waypoint[];   // draft waypoints for planner
    loading: boolean;
}

export const missionInitialState: MissionState = {
    missions: [],
    active: null,
    waypoints: [],
    loading: false,
};
