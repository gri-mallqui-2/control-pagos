import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { PagoService, Pago } from '../../services/pagos.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface GlobalStats {
  totalUsers: number;
  activeUsers: number;
  totalPagos: number;
  totalAmount: number;
  pendingPagos: number;
  completedPagos: number;
  averageAmount: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private userService = inject(UserService);
  private pagosService = inject(PagoService);
  private router = inject(Router);

  stats: GlobalStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalPagos: 0,
    totalAmount: 0,
    pendingPagos: 0,
    completedPagos: 0,
    averageAmount: 0
  };

  recentUsers: User[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadGlobalStats();
    this.loadRecentUsers();
  }

  loadGlobalStats(): void {
    // Cargar estadísticas de usuarios
    this.userService.getAllUsers().subscribe(users => {
      this.stats.totalUsers = users.length;
      this.stats.activeUsers = users.filter(u => u.isActive).length;
    });

    // Cargar estadísticas de pagos
    this.pagosService.getAllPagos().subscribe((pagos: Pago[]) => {
      this.stats.totalPagos = pagos.length;
      this.stats.totalAmount = pagos.reduce((sum: number, p: Pago) => sum + (p.monto || 0), 0);
      this.stats.pendingPagos = pagos.filter((p: Pago) => p.estado === 'pendiente').length;
      this.stats.completedPagos = pagos.filter((p: Pago) => p.estado === 'pagado').length;
      this.stats.averageAmount = this.stats.totalPagos > 0
        ? this.stats.totalAmount / this.stats.totalPagos
        : 0;
      this.loading = false;
    });
  }

  loadRecentUsers(): void {
    this.userService.getAllUsers().pipe(
      map(users => users.slice(0, 5))
    ).subscribe(users => {
      this.recentUsers = users;
    });
  }

  navigateToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  navigateToAllPagos(): void {
    this.router.navigate(['/admin/pagos']);
  }

  navigateToStats(): void {
    this.router.navigate(['/estadisticas']);
  }

  navigateToCategories(): void {
    this.router.navigate(['/categorias']);
  }

  navigateToClientFiles(): void {
    this.router.navigate(['/admin/client-files']);
  }
}
