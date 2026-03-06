import { createReducer, on } from '@ngrx/store';
import { uavInitialState } from './uav.state';
import { loadUAVs, loadUAVsOk, selectUAV } from './uav.actions';

export const uavReducer = createReducer(
    uavInitialState,
    on(loadUAVs, (s) => ({ ...s, loading: true })),
    on(loadUAVsOk, (s, { uavs }) => ({ ...s, uavs, loading: false })),
    on(selectUAV, (s, { uav }) => ({ ...s, selected: uav }))
);
