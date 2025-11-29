import { Injectable } from '@angular/core';

export interface Pago {
  id: number;
  fecha: Date;
  monto: number;
  nombre: string;
  categoriaId: number;
  descripcion?: string;
  pagado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private pagos: Pago[] = [
    { 
      id: 1, 
      fecha: new Date('2024-01-15'), 
      monto: 150.50, 
      nombre: 'Supermercado',
      categoriaId: 1, 
      descripcion: 'Compras del mes',
      pagado: true 
    },
    { 
      id: 2, 
      fecha: new Date('2024-01-20'), 
      monto: 50.00, 
      nombre: 'Taxi',
      categoriaId: 2, 
      descripcion: 'Transporte al trabajo',
      pagado: false 
    }
  ];

  private nextId = 3;

  async obtenerTodos(): Promise<Pago[]> {
    return [...this.pagos];
  }

  async obtenerPorId(id: number): Promise<Pago | undefined> {
    return this.pagos.find(p => p.id === id);
  }

  async crear(pago: Omit<Pago, 'id'>): Promise<Pago> {
    const nuevo: Pago = {
      id: this.nextId++,
      ...pago
    };
    this.pagos.push(nuevo);
    return nuevo;
  }

  async actualizar(id: number, pago: Partial<Pago>): Promise<void> {
    const index = this.pagos.findIndex(p => p.id === id);
    if (index !== -1) {
      this.pagos[index] = { ...this.pagos[index], ...pago };
    }
  }

  async eliminar(id: number): Promise<void> {
    this.pagos = this.pagos.filter(p => p.id !== id);
  }
}