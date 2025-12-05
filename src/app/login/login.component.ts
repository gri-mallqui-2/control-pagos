import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getters para facilitar el acceso en el template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    // Simulación de autenticación (reemplazar con tu servicio real)
    setTimeout(() => {
      // Aquí deberías llamar a tu servicio de autenticación
      // Por ahora, simulamos un login exitoso
      
      // Guardar usuario en localStorage (temporal)
      const userId = 'user_' + Date.now();
      localStorage.setItem('currentUser', JSON.stringify({
        id: userId,
        email: email
      }));

      this.loading = false;
      this.router.navigate(['/dashboard']);
    }, 1000);
  }
}