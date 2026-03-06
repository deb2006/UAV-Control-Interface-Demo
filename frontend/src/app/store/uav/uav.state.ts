export interface UAV {
    id: number;
    name: string;
    serialNumber: string;
    status: string;
    lastSeen: string;
}

export interface UAVState {
    uavs: UAV[];
    selected: UAV | null;
    loading: boolean;
}

export const uavInitialState: UAVState = {
    uavs: [],
    selected: null,
    loading: false,
};
