import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CategoriaService, Categoria } from '../services/categoria.service';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categorias-list.component.html',
  styleUrls: ['./categorias-list.component.css']
})
export class CategoriasListComponent implements OnInit {
  private authService = inject(AuthService);
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);

  categorias: Categoria[] = [];
  categoriasDefault: string[] = [];
  loading: boolean = true;
  userEmail: string = '';
  
  // Formulario nueva categoría
  showForm: boolean = false;
  editingId: string | null = null;
  nuevaCategoria = {
    nombre: '',
    color: '#667eea',
    icono: '📁'
  };

  iconosDisponibles = ['📁', '💡', '🏠', '🚗', '🎓', '🏥', '💳', '📱', '🍔', '⚡', '💰', '🎯'];
  coloresDisponibles = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userEmail = user.email || '';
      this.loadCategorias(user.uid);
      this.categoriasDefault = this.categoriaService.getCategoriasDefault();
    }
  }

  loadCategorias(userId: string) {
    this.categoriaService.getCategoriasByUser(userId).subscribe(categorias => {
      this.categorias = categorias;
      this.loading = false;
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.editingId = null;
    this.nuevaCategoria = {
      nombre: '',
      color: '#667eea',
      icono: '📁'
    };
  }

  editCategoria(categoria: Categoria) {
    this.showForm = true;
    this.editingId = categoria.id!;
    this.nuevaCategoria = {
      nombre: categoria.nombre,
      color: categoria.color,
      icono: categoria.icono
    };
  }

  async saveCategoria() {
    if (!this.nuevaCategoria.nombre.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      alert('Error: Usuario no autenticado');
      return;
    }

    try {
      if (this.editingId) {
        await this.categoriaService.updateCategoria(this.editingId, this.nuevaCategoria);
        alert('Categoría actualizada exitosamente');
      } else {
        await this.categoriaService.addCategoria({
          ...this.nuevaCategoria,
          usuarioId: userId
        });
        alert('Categoría creada exitosamente');
      }
      this.toggleForm();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar la categoría');
    }
  }

  async deleteCategoria(id: string) {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await this.categoriaService.deleteCategoria(id);
        alert('Categoría eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        alert('Error al eliminar la categoría');
      }
    }
  }

  selectIcono(icono: string) {
    this.nuevaCategoria.icono = icono;
  }

  selectColor(color: string) {
    this.nuevaCategoria.color = color;
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}