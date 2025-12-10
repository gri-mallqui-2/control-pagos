// Tipos de roles disponibles en el sistema
export type UserRole = 'admin' | 'cliente';

// Interfaz de usuario
export interface User {
    uid: string;
    email: string;
    role: UserRole;
    displayName?: string;
    photoURL?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;

    // Información personal
    dni?: string;           // DNI del cliente
    firstName?: string;     // Nombre
    lastName?: string;      // Apellido
    phone?: string;         // Teléfono
    address?: string;       // Dirección
}

// Interfaz de permisos
export interface UserPermissions {
    // Permisos de pagos
    canCreatePago: boolean;
    canEditOwnPago: boolean;
    canEditAllPagos: boolean;
    canDeleteOwnPago: boolean;
    canDeleteAllPagos: boolean;
    canViewOwnPagos: boolean;
    canViewAllPagos: boolean;

    // Permisos de usuarios
    canManageUsers: boolean;
    canViewAllUsers: boolean;
    canAssignRoles: boolean;
    canActivateDeactivateUsers: boolean;

    // Permisos de estadísticas
    canViewOwnStats: boolean;
    canViewGlobalStats: boolean;

    // Permisos de categorías
    canManageCategories: boolean;
    canViewCategories: boolean;

    // Permisos de configuración
    canAccessSystemConfig: boolean;
}

// Definición de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
    admin: {
        // Permisos de pagos - Administrador tiene acceso completo
        canCreatePago: true,
        canEditOwnPago: true,
        canEditAllPagos: true,
        canDeleteOwnPago: true,
        canDeleteAllPagos: true,
        canViewOwnPagos: true,
        canViewAllPagos: true,

        // Permisos de usuarios - Solo admin puede gestionar usuarios
        canManageUsers: true,
        canViewAllUsers: true,
        canAssignRoles: true,
        canActivateDeactivateUsers: true,

        // Permisos de estadísticas - Admin ve todo
        canViewOwnStats: true,
        canViewGlobalStats: true,

        // Permisos de categorías - Admin puede gestionar
        canManageCategories: true,
        canViewCategories: true,

        // Permisos de configuración - Solo admin
        canAccessSystemConfig: true
    },
    cliente: {
        // Permisos de pagos - Cliente solo sus propios pagos
        canCreatePago: true,
        canEditOwnPago: true,
        canEditAllPagos: false,
        canDeleteOwnPago: true,
        canDeleteAllPagos: false,
        canViewOwnPagos: true,
        canViewAllPagos: false,

        // Permisos de usuarios - Cliente no puede gestionar usuarios
        canManageUsers: false,
        canViewAllUsers: false,
        canAssignRoles: false,
        canActivateDeactivateUsers: false,

        // Permisos de estadísticas - Cliente solo sus propias estadísticas
        canViewOwnStats: true,
        canViewGlobalStats: false,

        // Permisos de categorías - Cliente solo puede ver
        canManageCategories: false,
        canViewCategories: true,

        // Permisos de configuración - Cliente no tiene acceso
        canAccessSystemConfig: false
    }
};

// Función helper para obtener permisos por rol
export function getPermissionsByRole(role: UserRole): UserPermissions {
    return ROLE_PERMISSIONS[role];
}

// Función helper para verificar si un usuario tiene un permiso específico
export function hasPermission(user: User | null, permission: keyof UserPermissions): boolean {
    if (!user) return false;
    const permissions = getPermissionsByRole(user.role);
    return permissions[permission];
}
