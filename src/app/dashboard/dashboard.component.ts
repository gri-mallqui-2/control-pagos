import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { PagoService, Pago } from '../services/pagos.service';
import { User } from '../models/user.model';

interface UserStats {
  totalPagos: number;
  totalAmount: number;
  pendingPagos: number;
  completedPagos: number;
  averageAmount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private pagoService = inject(PagoService);
  private router = inject(Router);

  currentUser: User | null = null;
  stats: UserStats = {
    totalPagos: 0,
    totalAmount: 0,
    pendingPagos: 0,
    completedPagos: 0,
    averageAmount: 0
  };

  recentPagos: Pago[] = [];
  loading = true;

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData(): void {
    const authUser = this.authService.getCurrentUser();

    if (!authUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Cargar datos del usuario desde Firestore
    this.userService.getUserById(authUser.uid).subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        alert('Tu cuenta ha sido desactivada. Contacta al soporte.');
        this.authService.logout();
        this.router.navigate(['/login']);
        return;
      }

      this.currentUser = user;
      this.loadUserStats(user.uid);
    });
  }

  loadUserStats(userId: string): void {
    this.pagoService.getPagosByUser(userId).subscribe({
      next: (pagos: Pago[]) => {
        // Calcular estadísticas
        this.stats.totalPagos = pagos.length;
        this.stats.totalAmount = pagos.reduce((sum: number, p: Pago) => sum + (p.monto || 0), 0);
        this.stats.pendingPagos = pagos.filter((p: Pago) => p.estado === 'pendiente').length;
        this.stats.completedPagos = pagos.filter((p: Pago) => p.estado === 'pagado').length;
        this.stats.averageAmount = this.stats.totalPagos > 0
          ? this.stats.totalAmount / this.stats.totalPagos
          : 0;

        // Obtener los 5 pagos más recientes
        this.recentPagos = pagos
          .sort((a, b) => {
            const dateA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
            const dateB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pagos:', error);
        this.loading = false;
      }
    });
  }

  navigateToNewPago(): void {
    this.router.navigate(['/pago/nuevo']);
  }

  navigateToMyPagos(): void {
    this.router.navigate(['/pagos']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToStats(): void {
    this.router.navigate(['/estadisticas']);
  }

  navigateToCategories(): void {
    this.router.navigate(['/categorias']);
  }

  navigateToPagoDetail(pagoId: string | undefined): void {
    if (pagoId) {
      this.router.navigate(['/pago', pagoId]);
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pagado':
        return 'estado-pagado';
      case 'pendiente':
        return 'estado-pendiente';
      case 'vencido':
        return 'estado-vencido';
      default:
        return '';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'pagado':
        return '✓';
      case 'pendiente':
        return '⏳';
      case 'vencido':
        return '⚠️';
      default:
        return '';
    }
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
