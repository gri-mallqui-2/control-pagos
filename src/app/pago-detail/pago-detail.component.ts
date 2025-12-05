import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PagoService, Pago } from '../services/pagos.service';

@Component({
  selector: 'app-pago-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pago-detail.component.html',
  styleUrls: ['./pago-detail.component.css']
})
export class PagoDetailComponent implements OnInit {
  private authService = inject(AuthService);
  private pagoService = inject(PagoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  pago: Pago | null = null;
  loading: boolean = true;
  userEmail: string = '';

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userEmail = user.email || '';
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPago(id);
    }
  }

  loadPago(id: string) {
    this.pagoService.getPagoById(id).subscribe(
      pago => {
        this.pago = pago;
        this.loading = false;
      },
      error => {
        console.error('Error al cargar el pago:', error);
        alert('No se pudo cargar el pago');
        this.router.navigate(['/pagos']);
      }
    );
  }

  editPago() {
    if (this.pago?.id) {
      this.router.navigate(['/pagos/editar', this.pago.id]);
    }
  }

  deletePago() {
    if (this.pago?.id && confirm('¿Estás seguro de eliminar este pago?')) {
      this.pagoService.deletePago(this.pago.id)
        .then(() => {
          alert('Pago eliminado exitosamente');
          this.router.navigate(['/pagos']);
        })
        .catch(error => {
          alert('Error al eliminar el pago');
          console.error(error);
        });
    }
  }

  goBack() {
    this.router.navigate(['/pagos']);
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  formatDate(date: any): string {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString('es-PE');
    }
    return new Date(date).toLocaleDateString('es-PE');
  }
}