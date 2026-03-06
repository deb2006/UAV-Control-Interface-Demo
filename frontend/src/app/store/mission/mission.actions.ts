import { createAction, props } from '@ngrx/store';
import { Mission, Waypoint } from './mission.state';

export const addWaypoint = createAction('[Mission] Add Waypoint', props<{ waypoint: Waypoint }>());
export const removeWaypoint = createAction('[Mission] Remove Waypoint', props<{ index: number }>());
export const clearWaypoints = createAction('[Mission] Clear Waypoints');
export const saveMissionOk = createAction('[Mission] Save OK', props<{ mission: Mission }>());
export const loadMissionsOk = createAction('[Mission] Load OK', props<{ missions: Mission[] }>());
