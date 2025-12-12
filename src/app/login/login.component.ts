import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { take } from 'rxjs/operators';

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
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  async loginWithGoogle() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.loginWithGoogle();
      const user = result.user;

      // Verificar si el usuario ya existe en Firestore
      this.userService.getUserById(user.uid).pipe(
        take(1)
      ).subscribe({
        next: async (existingUser) => {
          if (!existingUser) {
            // Crear documento de usuario con datos de Google
            await this.userService.createUser(
              user.uid,
              user.email || '',
              {
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              }
            );
          }

          // Redirigir al dashboard
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error checking user:', error);
          this.loading = false;
          this.errorMessage = 'Error al verificar usuario';
        }
      });
    } catch (error: any) {
      this.loading = false;
      console.error('Error with Google login:', error);

      if (error.code === 'auth/popup-closed-by-user') {
        this.errorMessage = 'Inicio de sesión cancelado';
      } else if (error.code === 'auth/popup-blocked') {
        this.errorMessage = 'Popup bloqueado. Permite popups para este sitio';
      } else {
        this.errorMessage = 'Error al iniciar sesión con Google';
      }
    }
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
            // El usuario no tiene documento en Firestore, crearlo
            console.log('⚠️ Usuario sin documento en Firestore, creando...');
            try {
              await this.userService.createUser(uid, email);
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
