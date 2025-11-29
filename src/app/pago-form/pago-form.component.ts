import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PagosService } from '../services/pagos.service';
import { CategoriasService, Categoria } from '../services/categorias.service';

@Component({
  selector: 'app-pago-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago-form.component.html',
  styleUrls: ['./pago-form.component.css']
})
export class PagoFormComponent implements OnInit {
  pagoId: number | null = null;
  categorias: Categoria[] = [];
  
  formData = {
    fecha: new Date(),
    monto: 0,
    nombre: '',
    categoriaId: 0,
    descripcion: '',
    pagado: false
  };

  constructor(
    private pagosService: PagosService,
    private categoriasService: CategoriasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.categorias = await this.categoriasService.obtenerTodas();
    
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.pagoId = parseInt(idParam, 10);
      const pagoExistente = await this.pagosService.obtenerPorId(this.pagoId);
      if (pagoExistente) {
        this.formData = {
          fecha: pagoExistente.fecha,
          monto: pagoExistente.monto,
          nombre: pagoExistente.nombre,
          categoriaId: pagoExistente.categoriaId,
          descripcion: pagoExistente.descripcion || '',
          pagado: pagoExistente.pagado
        };
      }
    }
  }

  async guardarPago() {
    if (!this.formData.nombre || this.formData.monto <= 0) {
      alert('Completa todos los campos requeridos');
      return;
    }

    try {
      const pagoData = {
        fecha: this.formData.fecha,
        monto: this.formData.monto,
        nombre: this.formData.nombre,
        categoriaId: this.formData.categoriaId,
        descripcion: this.formData.descripcion,
        pagado: this.formData.pagado
      };

      if (this.pagoId) {
        await this.pagosService.actualizar(this.pagoId, pagoData);
      } else {
        await this.pagosService.crear(pagoData);
      }
      
      this.router.navigate(['/pagos']);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  }

  cancelar() {
    this.router.navigate(['/pagos']);
  }
}