import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { loginSuccess, loginFailure, logout } from '../../store/auth/auth.actions';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(private http: HttpClient, private store: Store, private router: Router) { }

    login(email: string, password: string) {
        return this.http.post<{ token: string; user: any }>(`${API}/auth/login`, { email, password }).pipe(
            tap({
                next: ({ token, user }) => {
                    localStorage.setItem('astra_token', token);
                    this.store.dispatch(loginSuccess({ token, user }));
                    this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                    this.store.dispatch(loginFailure({ error: err.error?.error || 'Login failed' }));
                },
            })
        );
    }

    logout() {
        localStorage.removeItem('astra_token');
        this.store.dispatch(logout());
        this.router.navigate(['/login']);
    }

    restoreSession() {
        const token = localStorage.getItem('astra_token');
        if (token) {
            // Minimal restore: decode payload for user info without an extra round-trip
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.store.dispatch(loginSuccess({
                    token,
                    user: { id: payload['id'], name: 'User', email: '', role: payload['role'] }
                }));
            } catch { /* ignore */ }
        }
    }
}
