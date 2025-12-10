import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard para proteger rutas que solo pueden acceder administradores
 */
export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const userService = inject(UserService);
    const router = inject(Router);

    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
        // Usuario no autenticado, redirigir al login
        router.navigate(['/login']);
        return false;
    }

    // Verificar si el usuario es admin
    return userService.getUserById(currentUser.uid).pipe(
        take(1),
        map(user => {
            if (user && user.role === 'admin' && user.isActive) {
                return true;
            } else {
                // Usuario no es admin o está inactivo, redirigir al dashboard
                router.navigate(['/dashboard']);
                return false;
            }
        })
    );
};
