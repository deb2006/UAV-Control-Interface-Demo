import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { TelemetryFrame } from '../../../store/telemetry/telemetry.state';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'critical';
  msg: string;
}

@Component({
  selector: 'app-monitoring-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monitor-container">
      <div class="health-side">
        <div class="panel-header">SENSOR HEALTH</div>
        <div class="health-grid">
          <div class="health-item">
            <span class="data-label">GPS</span>
            <span class="badge badge-active">LOCKED (12 sats)</span>
          </div>
          <div class="health-item">
            <span class="data-label">IMU</span>
            <span class="badge badge-active">CALIBRATED</span>
          </div>
          <div class="health-item">
            <span class="data-label">RADIO</span>
            <span class="badge marker-active" [class.badge-warning]="(telemetry$ | async)?.signalStrength! < 50">LINK ACTIVE</span>
          </div>
          <div class="health-item">
            <span class="data-label">DATALINK</span>
            <span class="badge" [class.badge-active]="connected$ | async" [class.badge-offline]="!(connected$ | async)">
              {{ (connected$ | async) ? 'CONNECTED' : 'DISCONNECTED' }}
            </span>
          </div>
        </div>
      </div>

      <div class="logs-side">
        <div class="panel-header">SYSTEM LOGS</div>
        <div class="log-console" #logConsole>
          <div *ngFor="let log of logs" class="log-line">
            <span class="log-time">[{{ log.timestamp }}]</span>
            <span class="log-level" [class]="'lvl-' + log.level">{{ log.level | uppercase }}</span>
            <span class="log-msg">{{ log.msg }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .monitor-container {
      display: grid; grid-template-columns: 280px 1fr; height: 100%; gap: 10px; padding: 10px;
    }
    .health-side { border-right: 1px solid var(--color-border); padding-right: 10px; }
    .health-grid { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
    .health-item { display: flex; justify-content: space-between; align-items: center; }
    
    .logs-side { display: flex; flex-direction: column; }
    .log-console {
      flex-grow: 1; background: #05080f; border: 1px solid var(--color-border);
      border-radius: 4px; padding: 8px; font-family: var(--font-mono);
      font-size: 11px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
    }
    .log-line { display: flex; gap: 10px; line-height: 1.4; border-bottom: 1px solid rgba(255,255,255,0.02); padding-bottom: 2px; }
    .log-time { color: var(--color-text-muted); min-width: 65px; }
    .log-level { font-weight: 700; min-width: 60px; }
    .lvl-info { color: var(--color-accent); }
    .lvl-warn { color: var(--color-warning); }
    .lvl-error { color: var(--color-danger); }
    .lvl-critical { color: var(--color-danger); text-decoration: underline; }
    .log-msg { color: var(--color-text-primary); }
  `]
})
export class MonitoringPanelComponent implements OnInit, OnDestroy {
  private store = inject(Store);

  telemetry$: Observable<TelemetryFrame | null> = this.store.select((s: any) => s.telemetry.current);
  connected$: Observable<boolean> = this.store.select((s: any) => s.telemetry.connected);
  logs: LogEntry[] = [];
  private sub = new Subscription();

  constructor() { }

  ngOnInit() {
    this.addLog('info', 'GCS System Initialized');
    this.addLog('info', 'Connecting to UAV bridge...');

    this.sub.add(this.connected$.subscribe(conn => {
      this.addLog(conn ? 'info' : 'warn', conn ? 'UAV Data Link Established' : 'UAV Data Link Lost');
    }));

    this.sub.add(this.telemetry$.subscribe(tel => {
      if (tel) {
        if (tel.battery < 20) this.addLog('warn', `Low Battery Warning: ${tel.battery}%`);
        if (tel.signalStrength < 40) this.addLog('warn', `Weak Signal: ${tel.signalStrength}%`);
        if (tel.flightMode === 'RTL') this.addLog('critical', 'Emergency Return-To-Launch Triggered');
      }
    }));
  }

  ngOnDestroy() { this.sub.unsubscribe(); }

  private addLog(level: LogEntry['level'], msg: string) {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      level,
      msg
    };
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();
  }
}
