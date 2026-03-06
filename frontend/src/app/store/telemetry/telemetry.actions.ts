import { createAction, props } from '@ngrx/store';
import { TelemetryFrame } from './telemetry.state';

export const telemetryReceived = createAction('[Telemetry] Frame Received', props<{ frame: TelemetryFrame }>());
export const telemetryConnected = createAction('[Telemetry] Connected');
export const telemetryDisconnected = createAction('[Telemetry] Disconnected');
