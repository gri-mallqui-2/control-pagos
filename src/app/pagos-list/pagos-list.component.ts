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
  pagos: Pago[] = [];
  pagosFiltrados: Pago[] = [];
  categorias: Categoria[] = [];
  terminoBusqueda: string = '';
  categoriaFiltro: string = '';

  constructor(
    private pagosService: PagosService,
    private categoriasService: CategoriasService,
    private router: Router
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
      this.filtrarPagos();
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }

  filtrarPagos() {
    let resultado = this.pagos;

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

    this.pagosFiltrados = resultado;
  }

  async eliminarPago(pagoId: number) {
    if (confirm('¿Estás seguro de eliminar este pago?')) {
      try {
        await this.pagosService.eliminar(pagoId);
        await this.cargarDatos();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  }

  verDetalle(id: number) {
    this.router.navigate(['/pago', id]);
  }

  editarPago(id: number) {
    this.router.navigate(['/pago/editar', id]);
  }

  nuevoPago() {
    this.router.navigate(['/pago/nuevo']);
  }

  getNombreCategoria(categoriaId: number): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  }
}