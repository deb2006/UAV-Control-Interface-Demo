import { createAction, props } from '@ngrx/store';
import { AuthUser } from './auth.state';

export const loginSuccess = createAction('[Auth] Login Success', props<{ user: AuthUser; token: string }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());
export const logout = createAction('[Auth] Logout');
export const loginRequest = createAction('[Auth] Login Request', props<{ email: string; password: string }>());
