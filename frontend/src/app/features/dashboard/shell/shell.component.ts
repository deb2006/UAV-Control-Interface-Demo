import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TelemetryPanelComponent } from '../../telemetry/telemetry-panel/telemetry-panel.component';
import { MapViewComponent } from '../../map/map-view/map-view.component';
import { MissionPlannerComponent } from '../../missions/mission-planner/mission-planner.component';
import { MonitoringPanelComponent } from '../../monitoring/monitoring-panel/monitoring-panel.component';
import { UAVService } from '../../../core/services/uav.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { MissionService } from '../../../core/services/mission.service';
import { AuthService } from '../../../core/services/auth.service';
import { UAV } from '../../../store/uav/uav.state';
import { selectUAV } from '../../../store/uav/uav.actions';

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [
        CommonModule,
        TelemetryPanelComponent,
        MapViewComponent,
        MissionPlannerComponent,
        MonitoringPanelComponent,
    ],
    template: `
    <div class="gcs-layout">
      <!-- TOP BAR -->
      <header class="top-bar">
        <div class="top-bar-left">
          <div class="logo">⬆ <span class="glow-text">ASTRA</span>LINK</div>
          <div class="uav-selector">
            <span class="data-label">ACTIVE UAV</span>
            <select class="uav-select" (change)="onUavChange($event)" [disabled]="!(uavs$ | async)?.length">
              <option *ngFor="let u of (uavs$ | async)" [value]="u.id">{{ u.name }} – {{ u.serialNumber }}</option>
            </select>
          </div>
        </div>

        <div class="top-bar-center">
          <div class="sys-time">{{ currentTime }}</div>
        </div>

        <div class="top-bar-right">
          <div class="conn-status" [class.connected]="connected$ | async">
            <div class="pulse-dot"></div>
            <span>{{ (connected$ | async) ? 'LIVE' : 'OFFLINE' }}</span>
          </div>
          <div class="user-info" *ngIf="user$ | async as user">
            <span class="data-label">{{ user.role | uppercase }}</span>
            <span>{{ user.name }}</span>
          </div>
          <button class="btn-danger" (click)="logout()">LOGOUT</button>
        </div>
      </header>

      <!-- MAIN GRID -->
      <main class="main-grid">
        <!-- LEFT: Telemetry -->
        <aside class="left-panel">
          <app-telemetry-panel />
        </aside>

        <!-- CENTER: Map -->
        <section class="center-panel">
          <app-map-view />
        </section>

        <!-- RIGHT: Mission -->
        <aside class="right-panel">
          <app-mission-planner />
        </aside>
      </main>

      <!-- BOTTOM: Monitoring / Logs -->
      <footer class="bottom-panel">
        <app-monitoring-panel />
      </footer>
    </div>
  `,
    styles: [`
    .gcs-layout {
      display: grid;
      grid-template-rows: 52px 1fr 180px;
      height: 100vh;
      background: var(--color-bg-deep);
      overflow: hidden;
    }
    .top-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 16px;
      background: var(--color-bg-panel);
      border-bottom: 1px solid var(--color-border);
      z-index: 100;
    }
    .top-bar-left, .top-bar-right { display: flex; align-items: center; gap: 20px; }
    .logo { font-size: 16px; font-weight: 700; letter-spacing: 3px; }
    .uav-selector { display: flex; flex-direction: column; }
    .uav-select {
      background: var(--color-bg-card); border: 1px solid var(--color-border);
      color: var(--color-text-primary); padding: 4px 8px; border-radius: 4px;
      font-family: var(--font-ui); font-size: 12px; cursor: pointer;
      &:focus { outline: none; border-color: var(--color-accent); }
    }
    .top-bar-center { font-family: var(--font-mono); font-size: 12px; color: var(--color-text-secondary); }
    .conn-status {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; letter-spacing: 1px;
      color: var(--color-text-muted);
      &.connected { color: var(--color-success); }
      &.connected .pulse-dot { background: var(--color-success); }
    }
    .user-info { display: flex; flex-direction: column; text-align: right; font-size: 12px; }
    .main-grid {
      display: grid;
      grid-template-columns: 280px 1fr 300px;
      height: 100%;
      overflow: hidden;
      gap: 0;
    }
    .left-panel {
      border-right: 1px solid var(--color-border);
      overflow-y: auto;
      padding: 10px;
      background: var(--color-bg-panel);
    }
    .center-panel { position: relative; overflow: hidden; }
    .right-panel {
      border-left: 1px solid var(--color-border);
      overflow-y: auto;
      padding: 10px;
      background: var(--color-bg-panel);
    }
    .bottom-panel {
      border-top: 1px solid var(--color-border);
      background: var(--color-bg-panel);
      overflow: hidden;
    }
  `]
})
export class ShellComponent implements OnInit, OnDestroy {
    private store = inject(Store);
    private uavService = inject(UAVService);
    private telemetryService = inject(TelemetryService);
    private missionService = inject(MissionService);
    private authService = inject(AuthService);

    uavs$: Observable<UAV[]> = this.store.select((s: any) => s.uav.uavs);
    selected$: Observable<UAV | null> = this.store.select((s: any) => s.uav.selected);
    connected$: Observable<boolean> = this.store.select((s: any) => s.telemetry.connected);
    user$: Observable<any> = this.store.select((s: any) => s.auth.user);
    currentTime = '';
    private timer?: ReturnType<typeof setInterval>;
    private selectedUavId?: number;

    constructor() { }

    ngOnInit() {
        this.updateTime();
        this.timer = setInterval(() => this.updateTime(), 1000);

        this.uavService.loadUAVs().subscribe();
        this.missionService.loadMissions().subscribe();

        this.selected$.subscribe(uav => {
            if (uav && uav.id !== this.selectedUavId) {
                if (this.selectedUavId) this.telemetryService.stop(this.selectedUavId);
                this.selectedUavId = uav.id;
                this.telemetryService.start(uav.id);
            }
        });
    }

    ngOnDestroy() {
        if (this.timer) clearInterval(this.timer);
        if (this.selectedUavId) this.telemetryService.stop(this.selectedUavId);
    }

    updateTime() {
        this.currentTime = new Date().toLocaleTimeString('en-IN', { hour12: false });
    }

    onUavChange(event: Event) {
        const id = parseInt((event.target as HTMLSelectElement).value, 10);
        this.uavs$.subscribe(uavs => {
            const uav = uavs.find(u => u.id === id);
            if (uav) this.uavService.selectUAV(uav);
        }).unsubscribe();
    }

    logout() { this.authService.logout(); }
}
