import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PagoService, Pago } from '../../services/pagos.service';
import { User } from '../../models/user.model';

interface ClienteStats {
  totalPagos: number;
  totalAmount: number;
  pendingPagos: number;
  completedPagos: number;
  averageAmount: number;
}

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-dashboard.html',
  styleUrl: './cliente-dashboard.css',
})
export class ClienteDashboard implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private pagoService = inject(PagoService);
  private router = inject(Router);

  currentUser: User | null = null;
  stats: ClienteStats = {
    totalPagos: 0,
    totalAmount: 0,
    pendingPagos: 0,
    completedPagos: 0,
    averageAmount: 0
  };

  recentPagos: Pago[] = [];
  loading = true;

  ngOnInit(): void {
    console.log('🔵 ClienteDashboard: ngOnInit called');
    this.loadUserData();
  }

  loadUserData(): void {
    const authUser = this.authService.getCurrentUser();
    console.log('🔵 ClienteDashboard: Auth user:', authUser);

    if (!authUser) {
      console.error('❌ ClienteDashboard: No authenticated user found');
      this.router.navigate(['/login']);
      return;
    }

    console.log('🔵 ClienteDashboard: Loading Firestore user data for UID:', authUser.uid);

    // Cargar datos del usuario
    this.userService.getUserById(authUser.uid).subscribe({
      next: (user) => {
        console.log('✅ ClienteDashboard: Firestore user loaded:', user);
        this.currentUser = user;
        if (user) {
          this.loadUserStats(user.uid);
        } else {
          console.error('❌ ClienteDashboard: User data is null');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('❌ ClienteDashboard: Error loading user data:', error);
        this.loading = false;
      }
    });
  }

  loadUserStats(userId: string): void {
    console.log('🔵 ClienteDashboard: Loading pagos for userId:', userId);

    this.pagoService.getPagosByUser(userId).subscribe({
      next: (pagos: Pago[]) => {
        console.log('✅ ClienteDashboard: Pagos loaded:', pagos.length, 'pagos');
        console.log('📊 ClienteDashboard: Pagos data:', pagos);

        this.stats.totalPagos = pagos.length;
        this.stats.totalAmount = pagos.reduce((sum: number, p: Pago) => sum + (p.monto || 0), 0);
        this.stats.pendingPagos = pagos.filter((p: Pago) => p.estado === 'pendiente').length;
        this.stats.completedPagos = pagos.filter((p: Pago) => p.estado === 'pagado').length;
        this.stats.averageAmount = this.stats.totalPagos > 0
          ? this.stats.totalAmount / this.stats.totalPagos
          : 0;

        console.log('📊 ClienteDashboard: Calculated stats:', this.stats);

        // Obtener los 5 pagos más recientes
        this.recentPagos = pagos
          .sort((a, b) => {
            const dateA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
            const dateB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        console.log('📋 ClienteDashboard: Recent pagos:', this.recentPagos.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ ClienteDashboard: Error loading pagos:', error);
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
    this.router.navigate(['/cliente/profile']);
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
}
