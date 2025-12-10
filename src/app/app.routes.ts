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
import { adminGuard } from './guards/admin.guard';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { UserManagement } from './admin/user-management/user-management';
import { ClienteDashboard } from './cliente/cliente-dashboard/cliente-dashboard';

export const routes: Routes = [
  // Ruta por defecto - Redirecciona al dashboard
  {
    path: '',
    redirectTo: '/dashboard',
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

  // ========================================
  // RUTAS DE ADMINISTRADOR (Solo admin)
  // ========================================
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboard,
        title: '📊 Panel de Administración'
      },
      {
        path: 'users',
        component: UserManagement,
        title: '👥 Gestión de Usuarios'
      },
      {
        path: 'client-files',
        loadComponent: () => import('./admin/client-files/client-files.component')
          .then(m => m.ClientFilesComponent),
        title: '📁 Archivos de Clientes'
      },
      {
        path: 'pagos',
        component: PagosListComponent,
        title: '💳 Todos los Pagos'
      }
    ]
  },

  // ========================================
  // RUTAS DE CLIENTE
  // ========================================
  {
    path: 'cliente',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: ClienteDashboard,
        title: '👤 Mi Panel'
      },
      {
        path: 'profile',
        loadComponent: () => import('./cliente/cliente-profile/cliente-profile')
          .then(m => m.ClienteProfile),
        title: '👤 Mi Perfil'
      }
    ]
  },

  // ========================================
  // GESTIÓN DE PAGOS (Accesible para todos los usuarios autenticados)
  // ========================================
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

  // ========================================
  // GESTIÓN DE CATEGORÍAS (Solo admin puede editar)
  // ========================================
  {
    path: 'categorias',
    component: CategoriasListComponent,
    canActivate: [authGuard],
    title: 'Categorías'
  },

  // ========================================
  // ESTADÍSTICAS (Lazy Loading)
  // ========================================
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
    redirectTo: '/dashboard'
  }
];
