export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'operator' | 'viewer';
}

export interface AuthState {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export const authInitialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
};
