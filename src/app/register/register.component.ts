import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;
  hasActiveSession: boolean = false;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      phone: ['', [Validators.pattern(/^\d{9}$/)]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Verificar si hay una sesión activa
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.hasActiveSession = true;
      this.errorMessage = 'Ya tienes una sesión activa. Cierra sesión para registrar una nueva cuenta.';
    }
  }

  logoutAndContinue() {
    this.authService.logout().then(() => {
      this.hasActiveSession = false;
      this.errorMessage = '';
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get dni() {
    return this.registerForm.get('dni');
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get phone() {
    return this.registerForm.get('phone');
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { email, password, dni, firstName, lastName, phone } = this.registerForm.value;

      try {
        // Registrar usuario en Firebase Auth
        const userCredential = await this.authService.register(email, password);

        // Crear documento de usuario en Firestore con datos adicionales
        await this.userService.createUser(
          userCredential.user.uid,
          email,
          {
            dni,
            firstName,
            lastName,
            phone: phone || undefined
          }
        );

        // Redirigir al dashboard (que luego redirigirá al dashboard de cliente)
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.loading = false;
        switch (error.code) {
          case 'auth/email-already-in-use':
            this.errorMessage = 'Este correo ya está registrado';
            break;
          case 'auth/invalid-email':
            this.errorMessage = 'Email inválido';
            break;
          case 'auth/weak-password':
            this.errorMessage = 'La contraseña es muy débil';
            break;
          default:
            this.errorMessage = 'Error al crear la cuenta';
        }
      }
    }
  }
}
