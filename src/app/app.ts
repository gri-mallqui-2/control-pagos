import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Payment {
  id: number;
  nombre: string;
  monto: number;
  fecha: string;
  categoria: string;
  estado: string;
  descripcion: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl:'./app.component.css',
})
export class AppComponent {
  title = 'Control de Pagos';
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  isModalOpen = false;
  editingPayment: Payment | null = null;
  searchTerm = '';
  filterCategory = 'all';
  
  formData: Payment = {
    id: 0,
    nombre: '',
    monto: 0,
    fecha: '',
    categoria: 'servicios',
    estado: 'pendiente',
    descripcion: ''
  };

  categories = ['servicios', 'productos', 'suscripciones', 'otros'];
  estados = ['pendiente', 'pagado', 'vencido'];

  ngOnInit(): void {
    this.loadSampleData();
  }

  loadSampleData(): void {
    this.payments = [
      {
        id: 1,
        nombre: 'Pago de luz',
        monto: 150,
        fecha: '2025-11-25',
        categoria: 'servicios',
        estado: 'pendiente',
        descripcion: 'Factura mensual de electricidad'
      },
      {
        id: 2,
        nombre: 'Netflix',
        monto: 12.99,
        fecha: '2025-11-15',
        categoria: 'suscripciones',
        estado: 'pagado',
        descripcion: 'Suscripción mensual'
      },
      {
        id: 3,
        nombre: 'Internet',
        monto: 45.50,
        fecha: '2025-11-20',
        categoria: 'servicios',
        estado: 'pagado',
        descripcion: 'Plan de fibra óptica'
      }
    ];
    this.filterAndSearchPayments();
  }

  filterAndSearchPayments(): void {
    let filtered = this.payments;

    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(p => p.categoria === this.filterCategory);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term)
      );
    }

    this.filteredPayments = filtered;
  }

  onSearchChange(): void {
    this.filterAndSearchPayments();
  }

  onFilterChange(): void {
    this.filterAndSearchPayments();
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.resetForm();
  }

  handleSubmit(): void {
    if (!this.formData.nombre || !this.formData.monto || !this.formData.fecha) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (this.editingPayment) {
      const index = this.payments.findIndex(p => p.id === this.editingPayment!.id);
      if (index !== -1) {
        this.payments[index] = { ...this.formData, id: this.editingPayment.id };
      }
    } else {
      const newPayment: Payment = {
        ...this.formData,
        id: Date.now()
      };
      this.payments.push(newPayment);
    }

    this.filterAndSearchPayments();
    this.resetForm();
  }

  handleEdit(payment: Payment): void {
    this.editingPayment = payment;
    this.formData = { ...payment };
    this.isModalOpen = true;
  }

  handleDelete(id: number): void {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      this.payments = this.payments.filter(p => p.id !== id);
      this.filterAndSearchPayments();
    }
  }

  resetForm(): void {
    this.formData = {
      id: 0,
      nombre: '',
      monto: 0,
      fecha: '',
      categoria: 'servicios',
      estado: 'pendiente',
      descripcion: ''
    };
    this.editingPayment = null;
    this.isModalOpen = false;
  }

  calculateStats() {
    const total = this.payments.reduce((sum, p) => sum + p.monto, 0);
    const pagados = this.payments.filter(p => p.estado === 'pagado')
      .reduce((sum, p) => sum + p.monto, 0);
    const pendientes = this.payments.filter(p => p.estado === 'pendiente')
      .reduce((sum, p) => sum + p.monto, 0);
    
    return { 
      total, 
      pagados, 
      pendientes, 
      cantidad: this.payments.length 
    };
  }

  getEstadoColor(estado: string): string {
    const colors: { [key: string]: string } = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      pagado: 'bg-green-100 text-green-800 border-green-300',
      vencido: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  }
}