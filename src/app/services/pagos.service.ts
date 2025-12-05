import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Pago {
  id?: string;
  userId: string;
  concepto: string;
  monto: number;
  fecha: any; // Firestore Timestamp or Date
  categoria: string;
  estado: 'pendiente' | 'pagado' | 'vencido';
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private firestore = inject(Firestore);
  private pagosCollection = collection(this.firestore, 'pagos');

  // Obtener todos los pagos de un usuario
  getPagosByUser(userId: string): Observable<Pago[]> {
    const q = query(
      this.pagosCollection,
      where('userId', '==', userId)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Pago[]>;
  }

  // Obtener un pago por ID
  getPagoById(id: string): Observable<Pago> {
    const pagoDoc = doc(this.firestore, `pagos/${id}`);
    return docData(pagoDoc, { idField: 'id' }) as Observable<Pago>;
  }

  // Agregar nuevo pago
  addPago(pago: Omit<Pago, 'id'>) {
    return addDoc(this.pagosCollection, pago);
  }

  // Actualizar pago
  updatePago(id: string, pagoData: Partial<Pago>) {
    const pagoDoc = doc(this.firestore, `pagos/${id}`);
    return updateDoc(pagoDoc, { ...pagoData });
  }

  // Eliminar pago
  deletePago(id: string) {
    const pagoDoc = doc(this.firestore, `pagos/${id}`);
    return deleteDoc(pagoDoc);
  }
}
