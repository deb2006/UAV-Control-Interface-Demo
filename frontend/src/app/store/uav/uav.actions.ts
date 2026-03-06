import { createAction, props } from '@ngrx/store';
import { UAV } from './uav.state';

export const loadUAVs = createAction('[UAV] Load');
export const loadUAVsOk = createAction('[UAV] Load Success', props<{ uavs: UAV[] }>());
export const selectUAV = createAction('[UAV] Select', props<{ uav: UAV }>());
