import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { telemetryReceived, telemetryConnected, telemetryDisconnected } from '../../store/telemetry/telemetry.actions';

@Injectable({ providedIn: 'root' })
export class TelemetryService implements OnDestroy {
    private subs: Subscription[] = [];

    constructor(private ws: WebSocketService, private store: Store) { }

    start(uavId: number) {
        this.ws.connect();
        this.ws.subscribeUAV(uavId);

        this.subs.push(
            this.ws.connected$.subscribe(status => {
                this.store.dispatch(status ? telemetryConnected() : telemetryDisconnected());
            }),
            this.ws.telemetry$.subscribe(frame => {
                this.store.dispatch(telemetryReceived({ frame }));
            })
        );
    }

    startMission(uavId: number, missionId: number) {
        this.ws.startMission(uavId, missionId);
    }

    setHome(uavId: number, lat: number, lng: number) {
        this.ws.setHome(uavId, lat, lng);
    }

    updateParams(uavId: number, params: { altitude?: number, airspeed?: number }) {
        this.ws.updateUavParams(uavId, params);
    }

    performAction(uavId: number, action: string) {
        this.ws.performAction(uavId, action);
    }

    stop(uavId: number) {
        this.ws.unsubscribeUAV(uavId);
        this.subs.forEach(s => s.unsubscribe());
        this.subs = [];
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }
}
