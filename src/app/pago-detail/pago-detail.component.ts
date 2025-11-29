import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PagosService, Pago } from '../services/pagos.service';

@Component({
  selector: 'app-pago-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pago-detail.component.html',
  styleUrls: ['./pago-detail.component.css']
})
export class PagoDetailComponent implements OnInit {
  pago: Pago | null = null;

  constructor(
    private pagosService: PagosService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      try {
        const id = parseInt(idParam, 10);
        const pagoEncontrado = await this.pagosService.obtenerPorId(id);
        this.pago = pagoEncontrado || null;
      } catch (error) {
        console.error('Error al cargar pago:', error);
      }
    }
  }

  async eliminar() {
    if (!this.pago) return;

    if (confirm('¿Estás seguro de eliminar este pago?')) {
      try {
        await this.pagosService.eliminar(this.pago.id);
        this.router.navigate(['/pagos']);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  }

  editar() {
    if (this.pago) {
      this.router.navigate(['/pago/editar', this.pago.id]);
    }
  }

  volver() {
    this.router.navigate(['/pagos']);
  }
}