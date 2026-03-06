import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, first } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const store = inject(Store);
    const router = inject(Router);
    return store.select((s: any) => s.auth.token).pipe(
        first(),
        map(token => {
            if (token) return true;
            return router.createUrlTree(['/login']);
        })
    );
};
