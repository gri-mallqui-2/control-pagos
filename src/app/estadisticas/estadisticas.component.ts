import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PagoService, Pago } from '../services/pago.service';

interface EstadisticaCategoria {
  nombre: string;
  total: number;
  cantidad: number;
}

interface EstadisticaMensual {
  mes: string;
  total: number;
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {
  private authService = inject(AuthService);
  private pagoService = inject(PagoService);
  private router = inject(Router);

  pagos: Pago[] = [];
  loading: boolean = true;
  userEmail: string = '';

  // Estadísticas generales
  totalPagos: number = 0;
  totalMonto: number = 0;
  promedioPago: number = 0;
  pagosPagados: number = 0;
  pagosPendientes: number = 0;
  pagosVencidos: number = 0;

  // Estadísticas por categoría
  estadisticasCategorias: EstadisticaCategoria[] = [];
  
  // Estadísticas mensuales
  estadisticasMensuales: EstadisticaMensual[] = [];

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
      this.calculateStatistics();
      this.loading = false;
    });
  }

  calculateStatistics() {
    // Estadísticas generales
    this.totalPagos = this.pagos.length;
    this.totalMonto = this.pagos.reduce((sum, p) => sum + p.monto, 0);
    this.promedioPago = this.totalPagos > 0 ? this.totalMonto / this.totalPagos : 0;
    
    this.pagosPagados = this.pagos.filter(p => p.estado === 'pagado').length;
    this.pagosPendientes = this.pagos.filter(p => p.estado === 'pendiente').length;
    this.pagosVencidos = this.pagos.filter(p => p.estado === 'vencido').length;

    // Por categoría
    this.calculateCategoryStats();
    
    // Por mes
    this.calculateMonthlyStats();
  }

  calculateCategoryStats() {
    const categoriaMap = new Map<string, { total: number, cantidad: number }>();

    this.pagos.forEach(pago => {
      const existing = categoriaMap.get(pago.categoria) || { total: 0, cantidad: 0 };
      categoriaMap.set(pago.categoria, {
        total: existing.total + pago.monto,
        cantidad: existing.cantidad + 1
      });
    });

    this.estadisticasCategorias = Array.from(categoriaMap.entries())
      .map(([nombre, data]) => ({
        nombre,
        total: data.total,
        cantidad: data.cantidad
      }))
      .sort((a, b) => b.total - a.total);
  }

  calculateMonthlyStats() {
    const monthMap = new Map<string, number>();
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    this.pagos.forEach(pago => {
      const fecha = pago.fecha.toDate ? pago.fecha.toDate() : new Date(pago.fecha);
      const mesKey = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
      const existing = monthMap.get(mesKey) || 0;
      monthMap.set(mesKey, existing + pago.monto);
    });

    this.estadisticasMensuales = Array.from(monthMap.entries())
      .map(([mes, total]) => ({ mes, total }))
      .slice(-6); // Últimos 6 meses
  }

  getCategoryPercentage(total: number): number {
    return this.totalMonto > 0 ? (total / this.totalMonto) * 100 : 0;
  }

  getMaxMonthlyAmount(): number {
    return Math.max(...this.estadisticasMensuales.map(e => e.total), 1);
  }

  getMonthlyBarHeight(total: number): number {
    const max = this.getMaxMonthlyAmount();
    return (total / max) * 100;
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}