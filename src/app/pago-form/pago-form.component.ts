import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PagoService, Pago } from '../services/pago.service';
import { CategoriaService } from '../services/categoria.service';

@Component({
  selector: 'app-pago-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pago-form.component.html',
  styleUrls: ['./pago-form.component.css']
})
export class PagoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private pagoService = inject(PagoService);
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  pagoForm: FormGroup;
  loading: boolean = false;
  isEditMode: boolean = false;
  pagoId: string | null = null;
  userEmail: string = '';
  categorias: string[] = [];

  constructor() {
    this.pagoForm = this.fb.group({
      concepto: ['', [Validators.required, Validators.minLength(3)]],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      fecha: ['', Validators.required],
      categoria: ['', Validators.required],
      estado: ['pendiente', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userEmail = user.email || '';
      this.loadCategorias();
    }

    this.pagoId = this.route.snapshot.paramMap.get('id');
    if (this.pagoId) {
      this.isEditMode = true;
      this.loadPago(this.pagoId);
    }
  }

  loadCategorias() {
    this.categorias = this.categoriaService.getCategoriasDefault();
  }

  loadPago(id: string) {
    this.loading = true;
    this.pagoService.getPagoById(id).subscribe(pago => {
      const fechaStr = pago.fecha.toDate ? 
        pago.fecha.toDate().toISOString().split('T')[0] : 
        new Date(pago.fecha).toISOString().split('T')[0];

      this.pagoForm.patchValue({
        concepto: pago.concepto,
        monto: pago.monto,
        fecha: fechaStr,
        categoria: pago.categoria,
        estado: pago.estado,
        descripcion: pago.descripcion || ''
      });
      this.loading = false;
    });
  }

  onSubmit() {
    if (this.pagoForm.valid) {
      this.loading = true;
      const userId = this.authService.getUserId();

      if (!userId) {
        alert('Error: Usuario no autenticado');
        this.loading = false;
        return;
      }

      const pagoData = {
        ...this.pagoForm.value,
        fecha: new Date(this.pagoForm.value.fecha),
        usuarioId: userId
      };

      if (this.isEditMode && this.pagoId) {
        this.pagoService.updatePago(this.pagoId, pagoData)
          .then(() => {
            alert('Pago actualizado exitosamente');
            this.router.navigate(['/pagos']);
          })
          .catch(error => {
            alert('Error al actualizar el pago');
            console.error(error);
            this.loading = false;
          });
      } else {
        this.pagoService.addPago(pagoData)
          .then(() => {
            alert('Pago creado exitosamente');
            this.router.navigate(['/pagos']);
          })
          .catch(error => {
            alert('Error al crear el pago');
            console.error(error);
            this.loading = false;
          });
      }
    }
  }

  cancel() {
    this.router.navigate(['/pagos']);
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  get concepto() {
    return this.pagoForm.get('concepto');
  }

  get monto() {
    return this.pagoForm.get('monto');
  }

  get fecha() {
    return this.pagoForm.get('fecha');
  }

  get categoria() {
    return this.pagoForm.get('categoria');
  }
}