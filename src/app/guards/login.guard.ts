import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.getCurrentUser();

    if (currentUser) {
        // Usuario ya autenticado, redirigir al dashboard
        router.navigate(['/dashboard']);
        return false;
    } else {
        // Usuario no autenticado, permitir acceso a login/register
        return true;
    }
};
