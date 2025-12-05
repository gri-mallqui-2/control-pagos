# Control de Pagos 💰

Aplicación web desarrollada en Angular para gestionar y controlar pagos personales. Permite a los usuarios registrar, editar, eliminar y visualizar sus pagos de manera organizada, con filtros avanzados, estadísticas y categorización.

## 🚀 Tecnologías y Herramientas Utilizadas

- **Angular 18** - Framework principal (Standalone Components)
- **TypeScript 5.4** - Lenguaje de programación
- **Firebase Authentication** - Autenticación de usuarios
- **Cloud Firestore** - Base de datos en tiempo real
- **AngularFire 18** - Librería oficial de Firebase para Angular
- **RxJS 7.8** - Programación reactiva con Observables
- **CSS3** - Estilos personalizados y diseño responsivo
- **Firebase Hosting** - Despliegue en la nube

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm (versión 9 o superior)
- Angular CLI (versión 18 o superior)
- Cuenta de Firebase

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/ivansoriasolis/control-pagos.git
cd control-pagos
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Authentication** (Email/Password)
3. Crear una base de datos **Firestore**
4. Copiar la configuración de Firebase en `src/app/app.config.ts`

### 4. Ejecutar la aplicación

```bash
npm start
# o
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`

### 5. Compilar para producción

```bash
ng build
```

Los archivos compilados estarán en el directorio `dist/`

## 🏗️ Arquitectura del Proyecto

### Componentes Principales

| Componente | Descripción | Ruta |
|------------|-------------|------|
| **LoginComponent** | Inicio de sesión de usuarios | `/login` |
| **RegisterComponent** | Registro de nuevos usuarios | `/register` |
| **DashboardComponent** | Panel principal con resumen | `/dashboard` |
| **PagosListComponent** | Lista de pagos con filtros y búsqueda | `/pagos` |
| **PagoFormComponent** | Formulario para crear/editar pagos | `/pago/nuevo`, `/pago/editar/:id` |
| **PagoDetailComponent** | Vista detallada de un pago | `/pago/:id` |
| **CategoriasListComponent** | Gestión de categorías | `/categorias` |
| **EstadisticasComponent** | Estadísticas y gráficos (Lazy Loading) | `/estadisticas` |

### Servicios

- **AuthService** - Manejo de autenticación con Firebase
  - `register()` - Registro de usuarios
  - `login()` - Inicio de sesión
  - `logout()` - Cierre de sesión
  - `getCurrentUser()` - Obtener usuario actual

- **PagoService** - Operaciones CRUD de pagos en Firestore
  - `getPagosByUser()` - Obtener pagos del usuario
  - `getPagoById()` - Obtener pago por ID
  - `addPago()` - Crear nuevo pago
  - `updatePago()` - Actualizar pago existente
  - `deletePago()` - Eliminar pago

- **CategoriaService** - Gestión de categorías en Firestore
  - `getCategoriasByUser()` - Obtener categorías del usuario
  - `addCategoria()` - Crear nueva categoría
  - `updateCategoria()` - Actualizar categoría
  - `deleteCategoria()` - Eliminar categoría

### Guards

- **authGuard** - Protege rutas que requieren autenticación
- **loginGuard** - Previene acceso a login/register si ya está autenticado

### Pipes Personalizados

- **CurrencySolPipe** - Formatea números como moneda peruana (S/)

### Directivas

- Directivas estructurales: `*ngFor`, `*ngIf`
- Directivas atributivas: `ngClass`, `ngStyle`, `routerLinkActive`

## 🌐 Deployment

### URL de Firebase Hosting

🔗 **[https://control-pagos-9baed.web.app](https://control-pagos-9baed.web.app)**

### Comandos de Deployment

```bash
# Compilar para producción
ng build --configuration production

# Desplegar a Firebase Hosting
firebase deploy
```

## 🎥 Video Demostrativo

📹 **URL del Video**: [Pendiente de subir]

El video incluye:
- Demostración de funcionalidades principales
- Flujo completo de autenticación (registro, login, logout)
- Operaciones CRUD (crear, leer, actualizar, eliminar pagos)
- Filtros y búsqueda en tiempo real
- Vista de estadísticas
- Explicación del código (componentes, servicios, guards)

## 📖 Manual de Usuario

### 1. Registro e Inicio de Sesión

1. **Registrarse**: 
   - Acceder a `/register`
   - Ingresar email y contraseña (mínimo 6 caracteres)
   - Click en "Registrarse"

2. **Iniciar Sesión**:
   - Acceder a `/login`
   - Ingresar credenciales
   - Click en "Iniciar Sesión"

### 2. Panel Principal (Dashboard)

- Vista general de tus pagos
- Resumen de estadísticas
- Acceso rápido a todas las secciones

### 3. Gestión de Pagos

#### Crear un Pago

1. Click en "Nuevo Pago" o navegar a `/pago/nuevo`
2. Completar el formulario:
   - **Concepto**: Descripción del pago (mínimo 3 caracteres)
   - **Monto**: Cantidad en soles (mayor a 0)
   - **Fecha**: Fecha del pago
   - **Categoría**: Seleccionar de la lista
   - **Estado**: Pendiente, Pagado o Vencido
   - **Descripción** (opcional): Notas adicionales
3. Click en "Guardar"

#### Listar y Filtrar Pagos

1. Navegar a `/pagos`
2. Usar los filtros disponibles:
   - **Búsqueda**: Por concepto o descripción
   - **Categoría**: Filtrar por categoría específica
   - **Estado**: Filtrar por estado (pendiente, pagado, vencido)
   - **Ordenamiento**: Por fecha o monto (ascendente/descendente)

#### Editar un Pago

1. En la lista de pagos, click en "Editar"
2. Modificar los campos necesarios
3. Click en "Guardar"

#### Eliminar un Pago

1. En la lista de pagos, click en "Eliminar"
2. Confirmar la eliminación

#### Ver Detalle de un Pago

1. En la lista de pagos, click en "Ver"
2. Se mostrará toda la información del pago

### 4. Gestión de Categorías

1. Navegar a `/categorias`
2. Crear, editar o eliminar categorías personalizadas
3. Las categorías se usan para organizar los pagos

### 5. Estadísticas

1. Navegar a `/estadisticas`
2. Visualizar:
   - Total de pagos y monto total
   - Promedio de pago
   - Distribución por estado (pendiente, pagado, vencido)
   - Estadísticas por categoría
   - Gráficos mensuales

### 6. Cerrar Sesión

- Click en "Cerrar Sesión" en la barra de navegación

## 🔒 Características de Seguridad

- Autenticación obligatoria con Firebase
- Rutas protegidas con Guards
- Datos aislados por usuario
- Validaciones en formularios
- Reglas de seguridad en Firestore

## 📱 Características Destacadas

✅ Diseño responsivo (móvil, tablet, desktop)  
✅ Filtros y búsqueda en tiempo real  
✅ Ordenamiento dinámico  
✅ Validaciones de formularios  
✅ Mensajes de confirmación y error  
✅ Lazy Loading para optimización  
✅ Pipes personalizados  
✅ Arquitectura Standalone Components  
✅ Integración completa con Firebase  

## 👨‍💻 Autor

**[Tu Nombre]**  
Proyecto desarrollado como parte del curso de Desarrollo Web Avanzado

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**Última actualización**: Diciembre 2025
