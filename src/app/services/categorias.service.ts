import { Injectable } from '@angular/core';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private categorias: Categoria[] = [
    { id: 1, nombre: 'Alimentación', descripcion: 'Gastos de comida', color: '#667eea' },
    { id: 2, nombre: 'Transporte', descripcion: 'Gastos de movilidad', color: '#f56565' },
    { id: 3, nombre: 'Entretenimiento', descripcion: 'Ocio y diversión', color: '#48bb78' }
  ];

  private nextId = 4;

  async obtenerTodas(): Promise<Categoria[]> {
    return [...this.categorias];
  }

  async crear(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
    const nueva: Categoria = {
      id: this.nextId++,
      ...categoria
    };
    this.categorias.push(nueva);
    return nueva;
  }

  async actualizar(id: number, categoria: Partial<Categoria>): Promise<void> {
    const index = this.categorias.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categorias[index] = { ...this.categorias[index], ...categoria };
    }
  }

  async eliminar(id: number): Promise<void> {
    this.categorias = this.categorias.filter(c => c.id !== id);
  }
}