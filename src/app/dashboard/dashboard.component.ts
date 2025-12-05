import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PagoService, Pago } from '../services/pagos.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private pagoService = inject(PagoService);
  private router = inject(Router);

  pagos: Pago[] = [];
  userEmail: string = '';
  totalPagos: number = 0;
  totalPagado: number = 0;
  totalPendiente: number = 0;
  totalVencido: number = 0;
  loading: boolean = true;

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userEmail = user.email || '';
      this.loadPagos(user.uid);
    }
  }

  loadPagos(userId: string) {
    this.pagoService.getPagosByUser(userId).subscribe(pagos => {
      this.pagos = pagos;
      this.calculateStats();
      this.loading = false;
    });
  }

  calculateStats() {
    this.totalPagos = this.pagos.length;
    this.totalPagado = this.pagos
      .filter(p => p.estado === 'pagado')
      .reduce((sum, p) => sum + p.monto, 0);
    this.totalPendiente = this.pagos
      .filter(p => p.estado === 'pendiente')
      .reduce((sum, p) => sum + p.monto, 0);
    this.totalVencido = this.pagos
      .filter(p => p.estado === 'vencido')
      .reduce((sum, p) => sum + p.monto, 0);
  }

  getRecentPagos() {
    return this.pagos.slice(0, 5);
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}