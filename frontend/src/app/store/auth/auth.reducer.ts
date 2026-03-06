import { createReducer, on } from '@ngrx/store';
import { authInitialState } from './auth.state';
import { loginRequest, loginSuccess, loginFailure, logout } from './auth.actions';

export const authReducer = createReducer(
    authInitialState,
    on(loginRequest, (s) => ({ ...s, loading: true, error: null })),
    on(loginSuccess, (s, { user, token }) => ({ ...s, user, token, loading: false, error: null })),
    on(loginFailure, (s, { error }) => ({ ...s, loading: false, error })),
    on(logout, () => authInitialState)
);
