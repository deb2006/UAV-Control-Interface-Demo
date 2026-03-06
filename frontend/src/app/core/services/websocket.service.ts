import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, BehaviorSubject } from 'rxjs';

const WS_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
    private socket!: Socket;
    private reconnectTimer?: ReturnType<typeof setTimeout>;

    private telemetryInternal$ = new Subject<any>();
    readonly telemetry$ = this.telemetryInternal$.asObservable();

    private missionCompletedSubject = new Subject<void>();
    readonly missionCompleted$ = this.missionCompletedSubject.asObservable();

    readonly connected$ = new BehaviorSubject<boolean>(false);
    readonly error$ = new Subject<string>();

    connect() {
        if (this.socket?.connected) return;
        this.socket = io(WS_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: Infinity,
            reconnectionDelay: 2000,
        });

        this.socket.on('connect', () => {
            console.log('[WS] Connected');
            this.connected$.next(true);
        });
        this.socket.on('disconnect', (reason) => {
            console.warn('[WS] Disconnected:', reason);
            this.connected$.next(false);
        });
        this.socket.on('telemetry', (data) => this.telemetryInternal$.next(data));
        this.socket.on('mission_started', (mission) => console.log('Mission started:', mission));
        this.socket.on('mission_completed', () => {
            console.log('🏁 Mission Completed Event Received');
            // We'll use a signal or observable here, or just trigger a refresh via a provided callback/subject
            this.missionCompletedSubject.next();
        });
        this.socket.on('home_set', (pos) => console.log('Home set:', pos));
        this.socket.on('error', (msg: any) => {
            this.error$.next(msg?.message || 'Socket error');
        });
    }

    subscribeUAV(uavId: number) {
        this.socket?.emit('subscribe_uav', uavId);
    }

    unsubscribeUAV(uavId: number) {
        this.socket?.emit('unsubscribe_uav', uavId);
    }

    startMission(uavId: number, missionId: number) {
        this.socket?.emit('start_mission', { uavId, missionId });
    }

    setHome(uavId: number, latitude: number, longitude: number) {
        this.socket?.emit('set_home', { uavId, latitude, longitude });
    }

    updateUavParams(uavId: number, params: { altitude?: number, airspeed?: number }) {
        this.socket.emit('update_uav_params', { uavId, params });
    }

    performAction(uavId: number, action: string) {
        this.socket.emit('perform_action', { uavId, action });
    }

    disconnect() {
        this.socket?.disconnect();
        this.connected$.next(false);
    }

    ngOnDestroy() {
        this.disconnect();
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    }
}
