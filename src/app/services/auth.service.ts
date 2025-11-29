import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarioActual: any = { email: 'test@example.com' };

  constructor() { }

  getCurrentUser() {
    return this.usuarioActual;
  }

  async login(email: string, password: string) {
    this.usuarioActual = { email };
    return this.usuarioActual;
  }

  async logout() {
    this.usuarioActual = null;
  }
}
