import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagosService, Pago } from '../services/pagos.service';
import { CategoriasService, Categoria } from '../services/categorias.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {
  pagos: Pago[] = [];
  categorias: Categoria[] = [];
  totalGastos: number = 0;
  gastosPagados: number = 0;
  gastosPendientes: number = 0;

  constructor(
    private pagosService: PagosService,
    private categoriasService: CategoriasService
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      [this.pagos, this.categorias] = await Promise.all([
        this.pagosService.obtenerTodos(),
        this.categoriasService.obtenerTodas()
      ]);
      this.calcularEstadisticas();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }

  calcularEstadisticas() {
    this.totalGastos = this.pagos.reduce((sum, p) => sum + p.monto, 0);
    this.gastosPagados = this.pagos
      .filter(p => p.pagado)
      .reduce((sum, p) => sum + p.monto, 0);
    this.gastosPendientes = this.totalGastos - this.gastosPagados;
  }

  calcularPorCategoria() {
    const categorias = new Map<number, { total: number; cantidad: number }>();

    this.pagos.forEach(pago => {
      const cat = categorias.get(pago.categoriaId) || { total: 0, cantidad: 0 };
      cat.total += pago.monto;
      cat.cantidad += 1;
      categorias.set(pago.categoriaId, cat);
    });

    // Convertir Map a array para mostrar
    return Array.from(categorias.entries()).map(([id, data]) => ({
      categoriaId: id,
      nombreCategoria: this.getNombreCategoria(id),
      total: data.total,
      cantidad: data.cantidad
    }));
  }

  getNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  obtenerEstadisticasPorCategoria() {
    return this.calcularPorCategoria();
  }
}