import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';

export interface Pago {
  id: string;
  userId: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  categoria: string;
  tipo: 'ingreso' | 'egreso';
  metodoPago?: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private readonly STORAGE_KEY = 'pagos';

  constructor() { }

  // Obtener todos los pagos de un usuario
  getPagosByUser(userId: string): Observable<Pago[]> {
    const pagos = this.getPagosFromStorage();
    const userPagos = pagos.filter(p => p.userId === userId);
    return of(userPagos);
  }

  // Obtener un pago por ID
  getPagoById(id: string): Observable<Pago | undefined> {
    const pagos = this.getPagosFromStorage();
    const pago = pagos.find(p => p.id === id);
    return of(pago);
  }

  // Agregar nuevo pago
  async addPago(pago: Omit<Pago, 'id'>): Promise<Pago> {
    const pagos = this.getPagosFromStorage();
    const newPago: Pago = {
      ...pago,
      id: this.generateId()
    };
    pagos.push(newPago);
    this.savePagosToStorage(pagos);
    return newPago;
  }

  // Actualizar pago
  async updatePago(id: string, pagoData: Partial<Pago>): Promise<Pago | null> {
    const pagos = this.getPagosFromStorage();
    const index = pagos.findIndex(p => p.id === id);
    
    if (index === -1) {
      return null;
    }

    pagos[index] = { ...pagos[index], ...pagoData };
    this.savePagosToStorage(pagos);
    return pagos[index];
  }

  // Eliminar pago
  async deletePago(id: string): Promise<boolean> {
    const pagos = this.getPagosFromStorage();
    const filteredPagos = pagos.filter(p => p.id !== id);
    
    if (filteredPagos.length === pagos.length) {
      return false;
    }

    this.savePagosToStorage(filteredPagos);
    return true;
  }

  // Métodos auxiliares privados
  private getPagosFromStorage(): Pago[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    
    const pagos = JSON.parse(data);
    // Convertir fechas de string a Date
    return pagos.map((p: any) => ({
      ...p,
      fecha: new Date(p.fecha)
    }));
  }

  private savePagosToStorage(pagos: Pago[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pagos));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}