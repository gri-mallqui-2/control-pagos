import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Categoria {
  id?: string;
  nombre: string;
  color: string;
  icono: string;
  usuarioId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private firestore = inject(Firestore);
  private categoriasCollection = collection(this.firestore, 'categorias');

  getCategoriasByUser(userId: string): Observable<Categoria[]> {
    const q = query(
      this.categoriasCollection,
      where('usuarioId', '==', userId)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Categoria[]>;
  }

  addCategoria(categoria: Omit<Categoria, 'id'>) {
    return addDoc(this.categoriasCollection, categoria);
  }

  updateCategoria(id: string, categoria: Partial<Categoria>) {
    const categoriaDoc = doc(this.firestore, `categorias/${id}`);
    return updateDoc(categoriaDoc, { ...categoria });
  }

  deleteCategoria(id: string) {
    const categoriaDoc = doc(this.firestore, `categorias/${id}`);
    return deleteDoc(categoriaDoc);
  }

  // Categorías predeterminadas
  getCategoriasDefault(): string[] {
    return [
      'Servicios',
      'Alquiler',
      'Préstamos',
      'Tarjetas',
      'Seguros',
      'Educación',
      'Salud',
      'Otros'
    ];
  }
}
