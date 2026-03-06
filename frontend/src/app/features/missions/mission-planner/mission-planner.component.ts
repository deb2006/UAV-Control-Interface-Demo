import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { Waypoint, Mission } from '../../../store/mission/mission.state';
import { removeWaypoint, clearWaypoints } from '../../../store/mission/mission.actions';
import { MissionService } from '../../../core/services/mission.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { WebSocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-mission-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel">
      <div class="tabs-header">
        <button [class.active]="activeTab === 'PLAN'" (click)="activeTab = 'PLAN'">PLAN</button>
        <button [class.active]="activeTab === 'LIVE'" (click)="activeTab = 'LIVE'">LIVE</button>
      </div>

      <!-- PLAN TAB -->
      <div *ngIf="activeTab === 'PLAN'">
        <div class="mission-meta">
          <span class="data-label">MISSION NAME</span>
          <input type="text" [(ngModel)]="missionName" class="meta-input" placeholder="Alpha Pattern 1">
        </div>

        <div class="waypoint-list">
          <div class="panel-header" style="border:none; margin: 15px 0 5px 0; font-size: 10px;">WAYPOINTS ({{ (waypoints$ | async)?.length }})</div>
          
          <div *ngIf="(waypoints$ | async)?.length === 0" class="empty-wps">
            CLICK ON MAP TO ADD WAYPOINTS
          </div>

          <div class="wp-items">
            <div *ngFor="let wp of (waypoints$ | async); let i = index" class="wp-item">
              <div class="wp-index">{{ i + 1 }}</div>
              <div class="wp-details">
                <span class="wp-coord">{{ wp.latitude | number:'1.4-4' }}, {{ wp.longitude | number:'1.4-4' }}</span>
                <div class="wp-params">
                  <span>{{ wp.altitude }}m</span>
                  <span>{{ wp.speed }}m/s</span>
                  <span class="wp-action">{{ wp.actionType | uppercase }}</span>
                </div>
              </div>
              <button class="wp-remove" (click)="removeWp(i)">×</button>
            </div>
          </div>
        </div>

        <div class="mission-actions">
          <button class="btn-danger" (click)="clearAll()" [disabled]="!(waypoints$ | async)?.length">CLEAR</button>
          <button class="btn-accent" (click)="save()" [disabled]="!(waypoints$ | async)?.length || !missionName">SAVE MISSION</button>
        </div>

        <div class="saved-missions">
          <div class="panel-header" style="border:none; margin: 20px 0 5px 0; font-size: 10px;">RECENT MISSIONS</div>
          <div *ngFor="let m of (missions$ | async)" class="saved-item">
            <div class="saved-info">
              <span class="saved-name">{{ m.missionName }}</span>
              <span class="badge" 
                [class.badge-active]="m.status === 'active'" 
                [class.badge-offline]="m.status === 'planned'"
                [class.badge-success]="m.status === 'completed'"
                [class.badge-danger]="m.status === 'aborted'">
                {{ m.status | uppercase }}
              </span>
            </div>
            <div class="saved-actions">
              <button class="btn-accent btn-xs" (click)="activate(m)" *ngIf="m.status === 'planned'">ACTIVATE</button>
              <button class="btn-danger btn-xs" (click)="abort(m.id!)" *ngIf="m.status === 'active'">ABORT</button>
              <button class="btn-icon btn-xs" (click)="deleteMission(m.id!)" style="margin-left: 5px;" title="Delete Mission">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <!-- LIVE TAB -->
      <div *ngIf="activeTab === 'LIVE'" class="live-tab">
        <div *ngIf="!(activeMission$ | async)" class="empty-state">
          NO ACTIVE MISSION
        </div>

        <div *ngIf="activeMission$ | async as am">
          <div class="section-title">MISSION PROGRESS: {{ am.missionName }}</div>
          <div class="wp-progress-list">
            <div *ngFor="let wp of am.waypoints; let i = index" class="progress-wp" 
                 [class.reached]="isReached(i)">
              <div class="check">{{ isReached(i) ? '✓' : i + 1 }}</div>
              <span class="wp-label">WAYPOINT {{ i + 1 }}</span>
              <span class="wp-status">{{ isReached(i) ? 'REACHED' : 'PENDING' }}</span>
            </div>
          </div>

          <div class="tactical-controls">
            <div class="section-title">TACTICAL OVERRIDES</div>
            
            <div class="control-grid">
              <div class="control-item">
                <label>ALTITUDE (m)</label>
                <div class="input-row">
                  <input type="number" [(ngModel)]="manualAlt" class="meta-input">
                  <button class="btn-accent btn-xs" (click)="updateParams()">SET</button>
                </div>
              </div>
              <div class="control-item">
                <label>AIRSPEED (m/s)</label>
                <div class="input-row">
                  <input type="number" [(ngModel)]="manualSpeed" class="meta-input">
                  <button class="btn-accent btn-xs" (click)="updateParams()">SET</button>
                </div>
              </div>
            </div>

            <div class="action-grid">
              <button class="btn-danger" (click)="performAction('FIRE_WEAPON')">FIRE WEAPON</button>
              <button class="btn-warning" (click)="performAction('DROP_PAYLOAD')">DROP PAYLOAD</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tabs-header { display: flex; border-bottom: 1px solid var(--color-border); margin-bottom: 15px; }
    .tabs-header button { 
      flex: 1; background: none; border: none; padding: 10px; color: var(--color-text-muted);
      font-size: 11px; font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    .tabs-header button.active { color: var(--color-accent); border-bottom: 2px solid var(--color-accent); }
    
    .live-tab { display: flex; flex-direction: column; gap: 20px; }
    .section-title { font-size: 10px; color: var(--color-text-muted); letter-spacing: 1px; margin-bottom: 10px; }
    
    .wp-progress-list { max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; }
    .progress-wp { 
      display: flex; align-items: center; gap: 10px; padding: 8px; 
      background: rgba(255,255,255,0.02); border-radius: 4px; border: 1px solid transparent;
    }
    .progress-wp.reached { border-color: var(--color-success); background: rgba(0,255,0,0.05); }
    .progress-wp .check { 
      width: 18px; height: 18px; border-radius: 50%; border: 1px solid var(--color-border);
      display: flex; align-items: center; justify-content: center; font-size: 9px;
    }
    .progress-wp.reached .check { background: var(--color-success); color: black; border: none; }
    .wp-label { flex-grow: 1; font-size: 11px; }
    .wp-status { font-size: 9px; opacity: 0.7; }

    .tactical-controls { border-top: 1px solid var(--color-border); padding-top: 20px; }
    .control-grid { display: grid; grid-gap: 15px; margin-bottom: 20px; }
    .control-item label { display: block; font-size: 10px; margin-bottom: 5px; }
    .input-row { display: flex; gap: 5px; }
    .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    
    .mission-meta { margin-bottom: 20px; }
    .meta-input {
      width: 100%; background: rgba(255,255,255,0.04);
      border: 1px solid var(--color-border); border-radius: 4px;
      padding: 8px 10px; color: var(--color-text-primary);
      font-family: var(--font-ui); font-size: 13px; margin-top: 5px;
      outline: none; &:focus { border-color: var(--color-accent); }
    }
    .empty-wps {
      padding: 30px 10px; border: 1px dashed var(--color-border);
      border-radius: 6px; text-align: center; color: var(--color-text-muted);
      font-size: 11px; letter-spacing: 1px;
    }
    .wp-items { max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
    .wp-item {
      background: var(--color-bg-card); border: 1px solid var(--color-border);
      border-radius: 6px; padding: 8px; display: flex; align-items: center; gap: 10px;
    }
    .wp-index {
      width: 24px; height: 24px; background: var(--color-border);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: var(--color-text-secondary);
    }
    .wp-details { flex-grow: 1; display: flex; flex-direction: column; gap: 2px; }
    .wp-coord { font-family: var(--font-mono); font-size: 11px; color: var(--color-text-primary); }
    .wp-params { display: flex; gap: 10px; font-size: 10px; color: var(--color-text-secondary); }
    .wp-action { color: var(--color-warning); font-weight: 600; }
    .wp-remove {
      background: transparent; border: none; color: var(--color-text-muted);
      font-size: 18px; cursor: pointer; &:hover { color: var(--color-danger); }
    }
    .mission-actions { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 20px; }
    .saved-item {
      background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--color-border);
      padding: 8px; display: flex; justify-content: space-between; align-items: center;
    }
    .saved-info { display: flex; flex-direction: column; gap: 4px; }
    .saved-name { font-size: 13px; font-weight: 500; }
    .btn-xs { font-size: 9px; padding: 4px 8px; }
    .empty-state { text-align: center; padding: 40px 0; color: var(--color-text-muted); font-size: 12px; }
  `]
})
export class MissionPlannerComponent {
  private store = inject(Store);
  private missionService = inject(MissionService);
  private telemetryService = inject(TelemetryService);

  activeTab: 'PLAN' | 'LIVE' = 'PLAN';
  waypoints$: Observable<Waypoint[]> = this.store.select((s: any) => s.mission.waypoints);
  missions$: Observable<Mission[]> = this.store.select((s: any) => s.mission.missions);
  activeMission$: Observable<Mission | null> = this.store.select((s: any) =>
    s.mission.missions.find((m: Mission) => m.status === 'active') || null
  );

  missionName = '';
  selectedUavId?: number;
  reachedWaypoints: number[] = [];

  manualAlt = 100;
  manualSpeed = 15;

  constructor() {
    this.store.select((s: any) => s.uav.selected).subscribe(uav => {
      if (uav) this.selectedUavId = uav.id;
    });

    const ws = inject(WebSocketService);
    ws.missionCompleted$.subscribe(() => {
      console.log('🔄 Auto-refreshing missions...');
      this.missionService.loadMissions().subscribe();
    });

    this.store.select((s: any) => s.telemetry.current).subscribe(tel => {
      if (tel) {
        this.reachedWaypoints = tel.reachedWaypoints || [];
        // Sync manual controls with initial telemetry if not touched? 
        // For now just display
      }
    });
  }

  isReached(index: number): boolean {
    return this.reachedWaypoints.includes(index);
  }

  updateParams() {
    if (!this.selectedUavId) return;
    this.telemetryService.updateParams(this.selectedUavId, {
      altitude: this.manualAlt,
      airspeed: this.manualSpeed
    });
  }

  performAction(action: string) {
    if (!this.selectedUavId) return;
    this.telemetryService.performAction(this.selectedUavId, action);
  }

  removeWp(index: number) {
    this.store.dispatch(removeWaypoint({ index }));
  }

  clearAll() {
    this.store.dispatch(clearWaypoints());
  }

  save() {
    if (!this.selectedUavId || !this.missionName) return;

    this.waypoints$.pipe(
      tap(wps => {
        const payload = {
          uavId: this.selectedUavId,
          missionName: this.missionName,
          waypoints: wps
        };
        this.missionService.createMission(payload).subscribe({
          next: () => {
            this.missionName = '';
            this.missionService.loadMissions().subscribe();
            this.store.dispatch(clearWaypoints());
          },
          error: (err) => console.error('Save mission failed', err)
        });
      })
    ).subscribe().unsubscribe();
  }

  activate(mission: Mission) {
    if (!this.selectedUavId) return;
    this.telemetryService.startMission(this.selectedUavId, mission.id!);
    this.activeTab = 'LIVE';
    setTimeout(() => this.missionService.loadMissions().subscribe(), 500);
  }

  abort(id: number) {
    this.missionService.abortMission(id).subscribe(() => {
      this.missionService.loadMissions().subscribe();
    });
  }

  deleteMission(id: number) {
    this.missionService.deleteMission(id).subscribe(() => {
      this.missionService.loadMissions().subscribe();
    });
  }
}
