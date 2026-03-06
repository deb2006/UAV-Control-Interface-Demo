import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { saveMissionOk, loadMissionsOk } from '../../store/mission/mission.actions';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class MissionService {
    constructor(private http: HttpClient, private store: Store) { }

    loadMissions() {
        return this.http.get<any[]>(`${API}/missions`).pipe(
            tap(missions => this.store.dispatch(loadMissionsOk({ missions })))
        );
    }

    createMission(payload: any) {
        return this.http.post<any>(`${API}/missions`, payload).pipe(
            tap(mission => this.store.dispatch(saveMissionOk({ mission })))
        );
    }

    abortMission(id: number) {
        return this.http.put(`${API}/missions/${id}/abort`, {});
    }

    deleteMission(id: number) {
        return this.http.delete(`${API}/missions/${id}`);
    }

    getHistory(uavId: number) {
        return this.http.get<any[]>(`${API}/telemetry/history/${uavId}`);
    }
}
