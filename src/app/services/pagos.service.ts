import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Pago {
  id?: string;
  userId: string;
  concepto: string;
  monto: number;
  fecha: any; // Firestore Timestamp or Date
  categoria: string;
  estado: 'pendiente' | 'pagado' | 'vencido';
  descripcion?: string;
  metodoPago?: 'yape' | 'tarjeta' | 'efectivo' | 'transferencia' | 'otro';
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private firestore = inject(Firestore);
  private pagosCollection = collection(this.firestore, 'pagos');

  // Obtener todos los pagos de un usuario
  getPagosByUser(userId: string): Observable<Pago[]> {
    console.log('🔵 PagoService: getPagosByUser called with userId:', userId);
    const q = query(
      this.pagosCollection,
      where('userId', '==', userId)
    );
    console.log('🔵 PagoService: Query created, fetching data...');

    return (collectionData(q, { idField: 'id' }) as Observable<Pago[]>).pipe(
      map((pagos: Pago[]) => {
        console.log('✅ PagoService: Pagos received:', pagos.length, 'pagos');
        console.log('📊 PagoService: Pagos data:', pagos);
        return pagos;
      }),
      catchError((error) => {
        console.error('❌ PagoService: Error fetching pagos:', error);
        return of([]); // Retornar array vacío en caso de error
      })
    );
  }

  // Obtener todos los pagos (solo para admin)
  getAllPagos(): Observable<Pago[]> {
    return collectionData(this.pagosCollection, { idField: 'id' }) as Observable<Pago[]>;
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
