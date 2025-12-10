import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-cliente-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cliente-profile.html',
  styleUrl: './cliente-profile.css',
})
export class ClienteProfile implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser: User | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const authUser = this.authService.getCurrentUser();
    if (!authUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserById(authUser.uid).subscribe(user => {
      this.currentUser = user;
      this.loading = false;
    });
  }

  goBack(): void {
    this.router.navigate(['/cliente/dashboard']);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
