import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TelemetryFrame } from '../../../store/telemetry/telemetry.state';

@Component({
  selector: 'app-telemetry-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel">
      <div class="panel-header">LIVE TELEMETRY</div>
      
      <div *ngIf="telemetry$ | async as tel; else noTelemetry" class="telemetry-grid">
        <!-- POSITION -->
        <div class="tel-card">
          <span class="data-label">LATITUDE</span>
          <div class="data-value">{{ tel.latitude | number:'1.6-6' }}</div>
        </div>
        <div class="tel-card">
          <span class="data-label">LONGITUDE</span>
          <div class="data-value">{{ tel.longitude | number:'1.6-6' }}</div>
        </div>
        <div class="tel-card">
          <span class="data-label">ALTITUDE</span>
          <div class="data-value">{{ tel.altitude | number:'1.1-1' }}<span class="data-unit">m</span></div>
        </div>
        <div class="tel-card">
          <span class="data-label">AIRSPEED</span>
          <div class="data-value">{{ tel.airspeed | number:'1.1-1' }}<span class="data-unit">m/s</span></div>
        </div>

        <!-- ORIENTATION -->
        <div class="tel-card span-2">
          <span class="data-label">ATTITUDE (R/P/Y)</span>
          <div class="data-value">
            {{ tel.roll | number:'1.1-1' }}° / {{ tel.pitch | number:'1.1-1' }}° / {{ tel.yaw | number:'1.1-1' }}°
          </div>
        </div>

        <!-- SYSTEM -->
        <div class="tel-card">
          <span class="data-label">BATTERY</span>
          <div class="data-value" [style.color]="tel.battery < 20 ? 'var(--color-danger)' : 'var(--color-success)'">
            {{ tel.battery }}<span class="data-unit">%</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" [style.width.%]="tel.battery" 
                 [style.background]="tel.battery < 20 ? 'var(--color-danger)' : 'var(--color-success)'"></div>
          </div>
        </div>
        <div class="tel-card">
          <span class="data-label">SIGNAL</span>
          <div class="data-value">{{ tel.signalStrength }}<span class="data-unit">%</span></div>
        </div>

        <!-- MODE & CPU -->
        <div class="tel-card">
          <span class="data-label">FLIGHT MODE</span>
          <div class="badge badge-active">{{ tel.flightMode }}</div>
        </div>
        <div class="tel-card">
          <span class="data-label">CPU LOAD</span>
          <div class="data-value">{{ tel.cpuUsage }}<span class="data-unit">%</span></div>
        </div>
        <div class="tel-card">
          <span class="data-label">TEMP</span>
          <div class="data-value">{{ tel.temperature }}<span class="data-unit">°C</span></div>
        </div>
      </div>

      <ng-template #noTelemetry>
        <div class="empty-state">
          <div class="pulse-dot" style="background: var(--color-danger)"></div>
          <span>WAITING FOR DATA...</span>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .telemetry-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .tel-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .span-2 { grid-column: span 2; }
    .progress-bar-wrap { margin-top: 6px; }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      height: 200px;
      color: var(--color-text-secondary);
      font-size: 11px;
      letter-spacing: 1px;
    }
  `]
})
export class TelemetryPanelComponent {
  private store = inject(Store);
  telemetry$: Observable<TelemetryFrame | null> = this.store.select((s: any) => s.telemetry.current);
}
