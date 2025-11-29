import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  regEmail: string = '';
  regPassword: string = '';

  constructor(private router: Router) {}

  register() {
    if (this.regEmail === '' || this.regPassword === '') {
      alert('Completa todos los campos');
      return;
    }

    alert('Cuenta creada exitosamente');
    this.router.navigate(['/login']);
  }
}
