import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  filteredUsers: User[] = [];
  loading = true;
  searchTerm = '';
  filterRole: UserRole | 'all' = 'all';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
      this.applyFilters();
      this.loading = false;
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.displayName?.toLowerCase().includes(searchLower));

      const matchesRole = this.filterRole === 'all' || user.role === this.filterRole;
      const matchesStatus = this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && user.isActive) ||
        (this.filterStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  async toggleUserStatus(user: User): Promise<void> {
    try {
      await this.userService.toggleUserStatus(user.uid, !user.isActive);
      user.isActive = !user.isActive;
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      alert('Error al cambiar el estado del usuario');
    }
  }

  async changeUserRole(user: User, newRole: UserRole): Promise<void> {
    if (confirm(`¿Estás seguro de cambiar el rol de ${user.email} a ${newRole}?`)) {
      try {
        await this.userService.updateUserRole(user.uid, newRole);
        user.role = newRole;
      } catch (error) {
        console.error('Error al cambiar rol del usuario:', error);
        alert('Error al cambiar el rol del usuario');
      }
    }
  }

  async deleteUser(user: User): Promise<void> {
    if (confirm(`¿Estás seguro de eliminar al usuario ${user.email}? Esta acción no se puede deshacer.`)) {
      try {
        await this.userService.deleteUser(user.uid);
        this.loadUsers();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar el usuario');
      }
    }
  }

  getUserStats(): { total: number; admins: number; clientes: number; active: number } {
    return {
      total: this.users.length,
      admins: this.users.filter(u => u.role === 'admin').length,
      clientes: this.users.filter(u => u.role === 'cliente').length,
      active: this.users.filter(u => u.isActive).length
    };
  }
}
