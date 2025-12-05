import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { PagoService, Pago } from '../services/pagos.service';
import { CurrencySolPipe } from '../pipes/currency-sol.pipe';

@Component({
  selector: 'app-pagos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CurrencySolPipe],
  templateUrl: './pagos-list.component.html',
  styleUrls: ['./pagos-list.component.css']
})
export class PagosListComponent implements OnInit {
  private authService = inject(AuthService);
  private pagoService = inject(PagoService);
  private router = inject(Router);

  pagos: Pago[] = [];
  pagosFiltrados: Pago[] = [];
  loading: boolean = true;
  userEmail: string = '';

  // Filtros
  searchTerm: string = '';
  filterCategoria: string = 'todas';
  filterEstado: string = 'todos';
  sortBy: string = 'fecha-desc';

  categorias: string[] = [];

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
      this.extractCategorias();
      this.applyFilters();
      this.loading = false;
    });
  }

  extractCategorias() {
    const categoriasSet = new Set(this.pagos.map(p => p.categoria));
    this.categorias = Array.from(categoriasSet).sort();
  }

  applyFilters() {
    let filtered = [...this.pagos];

    // Filtro por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.concepto.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term)
      );
    }

    // Filtro por categoría
    if (this.filterCategoria !== 'todas') {
      filtered = filtered.filter(p => p.categoria === this.filterCategoria);
    }

    // Filtro por estado
    if (this.filterEstado !== 'todos') {
      filtered = filtered.filter(p => p.estado === this.filterEstado);
    }

    // Ordenamiento
    switch (this.sortBy) {
      case 'fecha-desc':
        filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        break;
      case 'fecha-asc':
        filtered.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        break;
      case 'monto-desc':
        filtered.sort((a, b) => b.monto - a.monto);
        break;
      case 'monto-asc':
        filtered.sort((a, b) => a.monto - b.monto);
        break;
    }

    this.pagosFiltrados = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  deletePago(id: string) {
    if (confirm('¿Estás seguro de eliminar este pago?')) {
      this.pagoService.deletePago(id).then(() => {
        alert('Pago eliminado exitosamente');
      }).catch(error => {
        alert('Error al eliminar el pago');
        console.error(error);
      });
    }
  }

  viewDetail(id: string) {
    this.router.navigate(['/pagos', id]);
  }

  editPago(id: string) {
    this.router.navigate(['/pagos/editar', id]);
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}