// src/app/pago-detail/pago-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PagoService, Pago } from '../services/pago.service';

@Component({
  selector: 'app-pago-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pago-detail.component.html',
  styleUrl: './pago-detail.component.css'
})
export class PagoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private pagoService = inject(PagoService);
  
  pago: Pago | null = null;
  loading = true;
  userEmail = '';

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.userEmail = user?.email || '';
    
    const pagoId = this.route.snapshot.paramMap.get('id');
    if (pagoId) {
      this.loadPago(pagoId);
    } else {
      this.router.navigate(['/pagos-list']);
    }
  }

  loadPago(id: string) {
    this.loading = true;
    
    // Obtener todos los pagos y buscar el específico
    const unsubscribe = this.pagoService.getPagosRealtime((pagos) => {
      this.pago = pagos.find(p => p.id === id) || null;
      this.loading = false;
      
      if (!this.pago) {
        this.router.navigate(['/pagos-list']);
      }
    });
  }

  editPago() {
    if (this.pago?.id) {
      this.router.navigate(['/pago-form', this.pago.id]);
    }
  }

  async deletePago() {
    if (!this.pago?.id) return;
    
    if (confirm(`¿Estás seguro de eliminar "${this.pago.nombre}"?`)) {
      try {
        await this.pagoService.deletePago(this.pago.id);
        this.router.navigate(['/pagos-list']);
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el pago');
      }
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Pagado': return 'estado-pagado';
      case 'Pendiente': return 'estado-pendiente';
      case 'Vencido': return 'estado-vencido';
      default: return '';
    }
  }

  async logout() {
    await this.authService.logout();
  }
}