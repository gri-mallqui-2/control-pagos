import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, docData, setDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

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
            createdAt: new Date(),
            isActive: true,
            ...additionalData
        };
        await setDoc(userDoc, newUser);
        this.currentUserSubject.next(newUser);
    }

    // Establecer usuario actual
    setCurrentUser(user: User | null): void {
        this.currentUserSubject.next(user);
    }

    // Obtener usuario actual
    getCurrentUser(): User | null {
        return this.currentUserSubject.getValue();
    }

    // Actualizar perfil de usuario
    async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
        const userDoc = doc(this.firestore, `users/${uid}`);
        await updateDoc(userDoc, {
            ...data,
            updatedAt: new Date()
        });
    }
}
