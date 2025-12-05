import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagosListComponent } from './pagos-list/pagos-list.component';
import { PagoFormComponent } from './pago-form/pago-form.component';
import { PagoDetailComponent } from './pago-detail/pago-detail.component';
import { CategoriasListComponent } from './categorias-list/categorias-list.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  // Ruta por defecto - Redirecciona al login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // ========================================
  // RUTAS PÚBLICAS (Solo accesibles sin login)
  // ========================================
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
    title: 'Iniciar Sesión'
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [loginGuard],
    title: 'Registro de Usuario'
  },

  // ========================================
  // RUTAS PROTEGIDAS (Requieren autenticación)
  // ========================================
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    title: 'Panel Principal'
  },

  // Gestión de Pagos
  {
    path: 'pagos',
    component: PagosListComponent,
    canActivate: [authGuard],
    title: 'Lista de Pagos'
  },
  {
    path: 'pago/nuevo',
    component: PagoFormComponent,
    canActivate: [authGuard],
    title: 'Nuevo Pago'
  },
  {
    path: 'pago/editar/:id',
    component: PagoFormComponent,
    canActivate: [authGuard],
    title: 'Editar Pago'
  },
  {
    path: 'pago/:id',
    component: PagoDetailComponent,
    canActivate: [authGuard],
    title: 'Detalle del Pago'
  },

  // Gestión de Categorías
  {
    path: 'categorias',
    component: CategoriasListComponent,
    canActivate: [authGuard],
    title: 'Categorías'
  },

  // Estadísticas (Lazy Loading)
  {
    path: 'estadisticas',
    loadComponent: () => import('./estadisticas/estadisticas.component')
      .then(m => m.EstadisticasComponent),
    canActivate: [authGuard],
    title: 'Estadísticas'
  },

  // ========================================
  // RUTA WILDCARD - 404 Not Found
  // ========================================
  {
    path: '**',
    redirectTo: '/login'
  }
];