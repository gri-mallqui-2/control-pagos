// Interfaz de usuario simplificada para control de pagos personal
export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;

    // Información personal
    dni?: string;           // DNI del usuario
    firstName?: string;     // Nombre
    lastName?: string;      // Apellido
    phone?: string;         // Teléfono
    address?: string;       // Dirección
}
