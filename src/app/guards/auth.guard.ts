import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.getCurrentUser();

    if (currentUser) {
        // Usuario autenticado, permitir acceso
        return true;
    } else {
        // Usuario no autenticado, redirigir al login
        router.navigate(['/login']);
        return false;
    }
};
