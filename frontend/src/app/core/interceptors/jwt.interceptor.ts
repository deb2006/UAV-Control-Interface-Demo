import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { first, switchMap } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const store = inject(Store);
    return store.select((s: any) => s.auth.token).pipe(
        first(),
        switchMap(token => {
            if (token) {
                const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
                return next(cloned);
            }
            return next(req);
        })
    );
};
