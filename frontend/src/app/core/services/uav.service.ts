import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';
import { loadUAVsOk, selectUAV } from '../../store/uav/uav.actions';
import { UAV } from '../../store/uav/uav.state';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class UAVService {
    constructor(private http: HttpClient, private store: Store) { }

    loadUAVs() {
        return this.http.get<UAV[]>(`${API}/uavs`).pipe(
            tap(uavs => {
                this.store.dispatch(loadUAVsOk({ uavs }));
                if (uavs.length > 0) this.store.dispatch(selectUAV({ uav: uavs[0] }));
            })
        );
    }

    selectUAV(uav: UAV) {
        this.store.dispatch(selectUAV({ uav }));
    }
}
