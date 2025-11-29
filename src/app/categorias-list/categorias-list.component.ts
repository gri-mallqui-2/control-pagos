import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoriasService, Categoria } from '../services/categorias.service';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './categorias-list.component.html',
  styleUrls: ['./categorias-list.component.css']
})
export class CategoriasListComponent implements OnInit {
  categorias: Categoria[] = [];
  editingId: number | null = null;
  isEditing = false;
  
  formData = {
    nombre: '',
    descripcion: '',
    color: '#667eea'
  };

  constructor(private categoriasService: CategoriasService) {}

  async ngOnInit() {
    await this.cargarCategorias();
  }

  async cargarCategorias() {
    try {
      this.categorias = await this.categoriasService.obtenerTodas();
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  editarCategoria(categoria: Categoria) {
    this.isEditing = true;
    this.editingId = categoria.id;
    this.formData = {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      color: categoria.color || '#667eea'
    };
  }

  async guardarCategoria() {
    if (!this.formData.nombre) {
      alert('El nombre es requerido');
      return;
    }

    try {
      if (this.editingId) {
        await this.categoriasService.actualizar(this.editingId, this.formData);
      } else {
        await this.categoriasService.crear(this.formData);
      }
      
      this.cancelarEdicion();
      await this.cargarCategorias();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  }

  async eliminarCategoria(id: number) {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await this.categoriasService.eliminar(id);
        await this.cargarCategorias();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  }

  cancelarEdicion() {
    this.isEditing = false;
    this.editingId = null;
    this.formData = {
      nombre: '',
      descripcion: '',
      color: '#667eea'
    };
  }
}