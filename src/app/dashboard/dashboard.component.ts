import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  loading = true;

  ngOnInit() {
    this.redirectBasedOnRole();
  }

  redirectBasedOnRole(): void {
    const authUser = this.authService.getCurrentUser();

    if (!authUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Obtener datos completos del usuario desde Firestore
    this.userService.getUserById(authUser.uid).subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        alert('Tu cuenta ha sido desactivada. Contacta al administrador.');
        this.authService.logout();
        this.router.navigate(['/login']);
        return;
      }

      // Redirigir según el rol
      if (user.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (user.role === 'cliente') {
        this.router.navigate(['/cliente/dashboard']);
      } else {
        // Rol desconocido, redirigir al login
        this.router.navigate(['/login']);
      }
    });
  }
}
