import { createReducer, on } from '@ngrx/store';
import { telemetryInitialState } from './telemetry.state';
import { telemetryReceived, telemetryConnected, telemetryDisconnected } from './telemetry.actions';

const BUFFER_SIZE = 200;

export const telemetryReducer = createReducer(
    telemetryInitialState,
    on(telemetryConnected, (s) => ({ ...s, connected: true })),
    on(telemetryDisconnected, (s) => ({ ...s, connected: false })),
    on(telemetryReceived, (s, { frame }) => {
        const buffer = [...s.buffer, frame].slice(-BUFFER_SIZE);
        return { ...s, current: frame, buffer };
    })
);
