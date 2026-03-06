import { createReducer, on } from '@ngrx/store';
import { missionInitialState } from './mission.state';
import { addWaypoint, removeWaypoint, clearWaypoints, saveMissionOk, loadMissionsOk } from './mission.actions';

export const missionReducer = createReducer(
    missionInitialState,
    on(addWaypoint, (s, { waypoint }) => ({ ...s, waypoints: [...s.waypoints, waypoint] })),
    on(removeWaypoint, (s, { index }) => ({ ...s, waypoints: s.waypoints.filter((_, i) => i !== index) })),
    on(clearWaypoints, (s) => ({ ...s, waypoints: [] })),
    on(saveMissionOk, (s, { mission }) => ({ ...s, missions: [...s.missions, mission], waypoints: [] })),
    on(loadMissionsOk, (s, { missions }) => ({ ...s, missions }))
);
