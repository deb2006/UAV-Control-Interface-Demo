import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatFormFieldModule],
  template: `
    <div class="login-page">
      <div class="stars"></div>
      <div class="login-card">
        <div class="brand">
          <div class="brand-icon">⬆</div>
          <h1 class="brand-title">ASTRA<span class="glow-text">LINK</span></h1>
          <p class="brand-sub">GROUND CONTROL STATION</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
          <div class="field-group">
            <label class="field-label">Email Address</label>
            <input formControlName="email" type="email" class="field-input" placeholder="admin@astralink.io" autocomplete="email"/>
          </div>
          <div class="field-group">
            <label class="field-label">Password</label>
            <input formControlName="password" type="password" class="field-input" placeholder="••••••••" autocomplete="current-password"/>
          </div>
          <div class="error-msg" *ngIf="error$ | async as err">{{ err }}</div>
          <button type="submit" class="btn-accent login-btn" [disabled]="form.invalid || (loading$ | async)">
            <mat-spinner *ngIf="loading$ | async" diameter="16"></mat-spinner>
            <span>{{ (loading$ | async) ? 'AUTHENTICATING...' : 'ACCESS SYSTEM' }}</span>
          </button>
        </form>

        <div class="demo-creds">
          <span class="data-label">DEMO CREDENTIALS</span>
          <p>admin&#64;astralink.io / Admin&#64;1234</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-deep);
      position: relative;
      overflow: hidden;
    }
    .stars {
      position: absolute; inset: 0;
      background-image: radial-gradient(1px 1px at 20% 30%, rgba(0,212,255,0.4) 0%, transparent 100%),
        radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.3) 0%, transparent 100%),
        radial-gradient(1px 1px at 50% 70%, rgba(0,212,255,0.2) 0%, transparent 100%),
        radial-gradient(2px 2px at 10% 80%, rgba(255,255,255,0.1) 0%, transparent 100%);
    }
    .login-card {
      position: relative;
      z-index: 10;
      width: 380px;
      background: rgba(13, 19, 33, 0.9);
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 40px 36px;
      backdrop-filter: blur(20px);
      box-shadow: 0 0 60px rgba(0,212,255,0.08), 0 25px 50px rgba(0,0,0,0.6);
    }
    .brand { text-align: center; margin-bottom: 32px; }
    .brand-icon { font-size: 32px; color: var(--color-accent); margin-bottom: 8px; }
    .brand-title { font-size: 28px; font-weight: 700; letter-spacing: 6px; color: var(--color-text-primary); }
    .brand-sub { font-size: 9px; letter-spacing: 4px; color: var(--color-text-muted); margin-top: 4px; }
    .login-form { display: flex; flex-direction: column; gap: 16px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--color-text-secondary); }
    .field-input {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 12px 14px;
      color: var(--color-text-primary);
      font-family: var(--font-ui);
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
      &:focus { border-color: var(--color-accent); box-shadow: 0 0 0 2px var(--color-accent-glow); }
    }
    .login-btn { width: 100%; padding: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 4px; }
    .error-msg { color: var(--color-danger); font-size: 12px; }
    .demo-creds { margin-top: 24px; text-align: center; padding-top: 16px; border-top: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: 12px; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private store = inject(Store);

  form = this.fb.group({
    email: ['admin@astralink.io', [Validators.required, Validators.email]],
    password: ['Admin@1234', Validators.required],
  });
  loading$: Observable<boolean> = this.store.select((s: any) => s.auth.loading);
  error$: Observable<string | null> = this.store.select((s: any) => s.auth.error);

  constructor() { }

  submit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.authService.login(email!, password!).subscribe();
    }
  }
}
