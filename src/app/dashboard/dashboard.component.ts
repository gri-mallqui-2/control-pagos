import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PagosService, Pago } from '../services/pagos.service';
import { CategoriasService, Categoria } from '../services/categorias.service';

interface CategoriaSummary {
  nombre: string;
  color?: string;
  cantidad: number;
  total: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userEmail: string = '';
  pagos: Pago[] = [];
  ultimosPagos: Pago[] = [];
  categorias: Categoria[] = [];
  categoriasSummary: CategoriaSummary[] = [];
  
  // Estadísticas
  totalPagos: number = 0;
  pagosPagados: number = 0;
  pagosPendientes: number = 0;
  montoTotal: number = 0;

  constructor(
    private router: Router,
    private pagosService: PagosService,
    private categoriasService: CategoriasService
  ) {}

  async ngOnInit() {
    // Obtener email del usuario
    this.userEmail = localStorage.getItem('userEmail') || 'Usuario';
    
    // Cargar datos
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      // Cargar pagos y categorías en paralelo
      [this.pagos, this.categorias] = await Promise.all([
        this.pagosService.obtenerTodos(),
        this.categoriasService.obtenerTodas()
      ]);
      
      // Calcular estadísticas
      this.calcularEstadisticas();
      
      // Obtener últimos 5 pagos
      this.ultimosPagos = this.pagos
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 6);
      
      // Calcular resumen por categoría
      this.calcularResumenCategorias();
        
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }

  calcularEstadisticas() {
    this.totalPagos = this.pagos.length;
    this.pagosPagados = this.pagos.filter(p => p.pagado).length;
    this.pagosPendientes = this.totalPagos - this.pagosPagados;
    this.montoTotal = this.pagos.reduce((sum, p) => sum + p.monto, 0);
  }

  calcularResumenCategorias() {
    const categoriaMap = new Map<number, { total: number; cantidad: number }>();

    // Agrupar pagos por categoría
    this.pagos.forEach(pago => {
      const current = categoriaMap.get(pago.categoriaId) || { total: 0, cantidad: 0 };
      current.total += pago.monto;
      current.cantidad += 1;
      categoriaMap.set(pago.categoriaId, current);
    });

    // Convertir a array con información de categoría
    this.categoriasSummary = Array.from(categoriaMap.entries())
      .map(([categoriaId, data]) => {
        const categoria = this.categorias.find(c => c.id === categoriaId);
        return {
          nombre: categoria?.nombre || 'Sin categoría',
          color: categoria?.color,
          cantidad: data.cantidad,
          total: data.total
        };
      })
      .sort((a, b) => b.total - a.total); // Ordenar por monto descendente
  }

  getPercentage(monto: number): number {
    if (this.montoTotal === 0) return 0;
    return (monto / this.montoTotal) * 100;
  }

  getInitials(): string {
    const email = this.userEmail;
    return email.charAt(0).toUpperCase();
  }

  verDetalle(id: number) {
    this.router.navigate(['/pago', id]);
  }

  logout() {
    if (confirm('¿Estás segura de cerrar sesión?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      this.router.navigate(['/login']);
    }
  }
}