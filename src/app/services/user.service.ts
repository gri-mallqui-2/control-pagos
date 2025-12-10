import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, setDoc, updateDoc, deleteDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User, UserRole, UserPermissions, getPermissionsByRole } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private firestore = inject(Firestore);
    private usersCollection = collection(this.firestore, 'users');

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    // Obtener usuario por UID
    getUserById(uid: string): Observable<User | null> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        return docData(userDoc, { idField: 'uid' }) as Observable<User | null>;
    }

    // Crear nuevo usuario en Firestore
    async createUser(
        uid: string,
        email: string,
        role: UserRole = 'cliente',
        additionalData?: {
            dni?: string;
            firstName?: string;
            lastName?: string;
            phone?: string;
        }
    ): Promise<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        const newUser: User = {
            uid,
            email,
            role,
            createdAt: new Date(),
            isActive: true,
            ...additionalData
        };
        await setDoc(userDoc, newUser);
        this.currentUserSubject.next(newUser);
    }

    // Actualizar rol de usuario (solo admin)
    async updateUserRole(uid: string, role: UserRole): Promise<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        await updateDoc(userDoc, {
            role,
            updatedAt: new Date()
        });
    }

    // Activar/Desactivar usuario
    async toggleUserStatus(uid: string, isActive: boolean): Promise<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        await updateDoc(userDoc, {
            isActive,
            updatedAt: new Date()
        });
    }

    // Obtener todos los usuarios (solo admin)
    getAllUsers(): Observable<User[]> {
        const q = query(this.usersCollection, orderBy('createdAt', 'desc'));
        return collectionData(q, { idField: 'uid' }) as Observable<User[]>;
    }

    // Obtener usuarios por rol
    getUsersByRole(role: UserRole): Observable<User[]> {
        const q = query(
            this.usersCollection,
            where('role', '==', role)
        );
        return collectionData(q, { idField: 'uid' }) as Observable<User[]>;
    }

    // Establecer usuario actual
    setCurrentUser(user: User | null): void {
        this.currentUserSubject.next(user);
    }

    // Obtener usuario actual
    getCurrentUser(): User | null {
        return this.currentUserSubject.getValue();
    }

    // Verificar si el usuario actual es admin
    isAdmin(): boolean {
        const user = this.currentUserSubject.getValue();
        return user?.role === 'admin';
    }

    // Verificar si el usuario actual es cliente
    isCliente(): boolean {
        const user = this.currentUserSubject.getValue();
        return user?.role === 'cliente';
    }

    // Obtener permisos del usuario actual
    getCurrentUserPermissions(): UserPermissions | null {
        const user = this.currentUserSubject.getValue();
        if (!user) return null;
        return getPermissionsByRole(user.role);
    }

    // Verificar permiso específico
    hasPermission(permission: keyof UserPermissions): boolean {
        const permissions = this.getCurrentUserPermissions();
        return permissions ? permissions[permission] : false;
    }

    // Actualizar perfil de usuario
    async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        await updateDoc(userDoc, {
            ...data,
            updatedAt: new Date()
        });
    }

    // Eliminar usuario (solo admin)
    async deleteUser(uid: string): Promise<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        await deleteDoc(userDoc);
    }
}
