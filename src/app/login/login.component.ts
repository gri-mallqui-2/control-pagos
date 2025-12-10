import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { take } from 'rxjs/operators';

// Credenciales de administrador predefinidas
const ADMIN_CREDENTIALS = {
  email: 'admin@controlpagos.com',
  password: 'Admin123456'
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Verificar y crear cuenta de administrador si no existe
    this.ensureAdminExists();
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  /**
   * Asegura que exista la cuenta de administrador predefinida
   */
  private async ensureAdminExists(): Promise<void> {
    try {
      // Intentar crear la cuenta de administrador
      const userCredential = await this.authService.register(
        ADMIN_CREDENTIALS.email,
        ADMIN_CREDENTIALS.password
      );

      // Crear documento en Firestore con rol admin
      await this.userService.createUser(
        userCredential.user.uid,
        ADMIN_CREDENTIALS.email,
        'admin'
      );

      console.log('✅ Cuenta de administrador creada exitosamente');
    } catch (error: any) {
      // Si el error es que el email ya existe, está bien
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Cuenta de administrador ya existe');
      } else {
        console.log('ℹ️ Verificación de admin completada');
      }
    }
  }

  /**
   * Login rápido como administrador
   */
  async loginAsAdmin(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const userCredential = await this.authService.login(
        ADMIN_CREDENTIALS.email,
        ADMIN_CREDENTIALS.password
      );

      // Verificar/crear documento en Firestore
      this.userService.getUserById(userCredential.user.uid).subscribe(async (user) => {
        if (!user) {
          await this.userService.createUser(
            userCredential.user.uid,
            ADMIN_CREDENTIALS.email,
            'admin'
          );
        }
        this.router.navigate(['/dashboard']);
      });
    } catch (error: any) {
      this.loading = false;
      this.errorMessage = 'Error al iniciar sesión como administrador';
      console.error('Error admin login:', error);
    }
  }

  /**
   * Mostrar formulario para login de cliente
   */
  showClienteLogin(): void {
    // Limpiar el formulario y enfocar el campo de email
    this.loginForm.reset();
    this.errorMessage = '';
    setTimeout(() => {
      document.getElementById('email')?.focus();
    }, 100);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    try {
      // Iniciar sesión con Firebase Auth
      console.log('🔐 Intentando iniciar sesión...');
      const userCredential = await this.authService.login(email, password);
      const uid = userCredential.user.uid;
      console.log('✅ Autenticación exitosa, UID:', uid);

      // Verificar si el usuario tiene documento en Firestore
      console.log('📄 Verificando documento en Firestore...');

      this.userService.getUserById(uid).pipe(
        take(1) // Solo tomar el primer valor y completar
      ).subscribe({
        next: async (user) => {
          console.log('📋 Documento encontrado:', user);

          if (!user) {
            // El usuario no tiene documento en Firestore, crearlo con rol 'cliente'
            console.log('⚠️ Usuario sin documento en Firestore, creando...');
            try {
              await this.userService.createUser(uid, email, 'cliente');
              console.log('✅ Documento de usuario creado exitosamente');

              // Notificar al administrador
              console.log('📧 Nuevo cliente registrado:', email);

              // Redirigir al dashboard
              this.loading = false;
              this.router.navigate(['/dashboard']);
            } catch (error) {
              console.error('❌ Error al crear documento de usuario:', error);
              this.errorMessage = 'Error al configurar tu cuenta. Por favor, contacta al administrador.';
              this.loading = false;
            }
          } else {
            // El usuario ya tiene documento, verificar si está activo
            if (!user.isActive) {
              console.log('⚠️ Usuario inactivo');
              this.errorMessage = 'Tu cuenta ha sido desactivada. Contacta al administrador.';
              await this.authService.logout();
              this.loading = false;
              return;
            }

            // Usuario válido, redirigir al dashboard
            console.log('✅ Usuario válido, redirigiendo...');
            this.loading = false;
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          console.error('❌ Error al obtener documento:', error);
          this.errorMessage = 'Error al verificar tu cuenta. Intenta nuevamente.';
          this.loading = false;
        }
      });
    } catch (error: any) {
      this.loading = false;
      console.error('❌ Error en login:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          this.errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          this.errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/too-many-requests':
          this.errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
          break;
        case 'auth/invalid-credential':
          this.errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña';
          break;
        default:
          this.errorMessage = 'Error al iniciar sesión. Intenta nuevamente';
      }
    }
  }
}
