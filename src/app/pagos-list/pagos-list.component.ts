import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PagosService, Pago } from '../services/pagos.service';
import { CategoriasService, Categoria } from '../services/categorias.service';

@Component({
  selector: 'app-pagos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos-list.component.html',
  styleUrls: ['./pagos-list.component.css']
})
export class PagosListComponent implements OnInit {
  userEmail: string = '';
  pagos: Pago[] = [];
  pagosFiltrados: Pago[] = [];
  categorias: Categoria[] = [];
  
  // Filtros
  terminoBusqueda: string = '';
  categoriaFiltro: string = '';
  estadoFiltro: string = '';

  constructor(
    private pagosService: PagosService,
    private categoriasService: CategoriasService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.userEmail = localStorage.getItem('userEmail') || 'Usuario';
    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      [this.pagos, this.categorias] = await Promise.all([
        this.pagosService.obtenerTodos(),
        this.categoriasService.obtenerTodas()
      ]);
      this.filtrarPagos();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }

  filtrarPagos() {
    let resultado = [...this.pagos];

    // Filtro por búsqueda
    if (this.terminoBusqueda) {
      const term = this.terminoBusqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term)
      );
    }

    // Filtro por categoría
    if (this.categoriaFiltro) {
      resultado = resultado.filter(p => p.categoriaId === parseInt(this.categoriaFiltro));
    }

    // Filtro por estado
    if (this.estadoFiltro === 'pagado') {
      resultado = resultado.filter(p => p.pagado);
    } else if (this.estadoFiltro === 'pendiente') {
      resultado = resultado.filter(p => !p.pagado);
    }

    this.pagosFiltrados = resultado;
  }

  limpiarFiltros() {
    this.terminoBusqueda = '';
    this.categoriaFiltro = '';
    this.estadoFiltro = '';
    this.filtrarPagos();
  }

  async eliminarPago(pagoId: number) {
    if (confirm('¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer.')) {
      try {
        await this.pagosService.eliminar(pagoId);
        await this.cargarDatos();
        alert('Pago eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el pago');
      }
    }
  }

  async toggleEstado(pago: Pago) {
    try {
      await this.pagosService.actualizar(pago.id, { pagado: !pago.pagado });
      await this.cargarDatos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al actualizar el estado');
    }
  }

  verDetalle(id: number) {
    this.router.navigate(['/pago', id]);
  }

  editarPago(id: number) {
    this.router.navigate(['/pago/editar', id]);
  }

  navegarA(ruta: string) {
    this.router.navigate([ruta]);
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      this.router.navigate(['/login']);
    }
  }

  // Helpers
  getNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  getCategoriaColor(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria?.color || '#667eea';
  }

  getPagosPagados(): number {
    return this.pagos.filter(p => p.pagado).length;
  }

  getPagosPendientes(): number {
    return this.pagos.filter(p => !p.pagado).length;
  }

  getMontoTotal(): number {
    return this.pagos.reduce((sum, p) => sum + p.monto, 0);
  }
}