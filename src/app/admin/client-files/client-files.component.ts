import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { PagoService, Pago } from '../../services/pagos.service';
import { User } from '../../models/user.model';
import { forkJoin, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

interface ClienteFile {
    cliente: User;
    pagos: Pago[];
    totalPagos: number;
    totalMonto: number;
    pagosPendientes: number;
    pagosPagados: number;
    ultimoPago?: Pago;
}

@Component({
    selector: 'app-client-files',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './client-files.component.html',
    styleUrls: ['./client-files.component.css']
})
export class ClientFilesComponent implements OnInit {
    private userService = inject(UserService);
    private pagoService = inject(PagoService);
    private router = inject(Router);

    clientFiles: ClienteFile[] = [];
    filteredFiles: ClienteFile[] = [];
    loading = true;
    searchTerm = '';
    sortBy: 'nombre' | 'pagos' | 'monto' = 'nombre';
    selectedClient: ClienteFile | null = null;

    // Filtro por categoría
    categorias: string[] = [];
    selectedCategoria: string = 'todas';

    ngOnInit(): void {
        this.loadClientFiles();
    }

    loadClientFiles(): void {
        console.log('🔵 ClientFiles: Loading client files...');

        // Timeout de seguridad - forzar detener después de 10 segundos
        const safetyTimeout = setTimeout(() => {
            console.warn('⚠️ ClientFiles: Safety timeout reached - stopping load');
            this.loading = false;
            if (this.clientFiles.length === 0) {
                alert('Timeout al cargar clientes. Revisa la consola para más detalles.');
            }
        }, 10000);

        // Obtener todos los clientes
        this.userService.getUsersByRole('cliente').subscribe({
            next: (clientes) => {
                console.log('✅ ClientFiles: Clientes loaded:', clientes.length);
                console.log('📊 ClientFiles: Clientes data:', clientes);

                if (clientes.length === 0) {
                    clearTimeout(safetyTimeout);
                    console.warn('⚠️ ClientFiles: No clients found');
                    this.loading = false;
                    return;
                }

                // Si solo hay 1 cliente, procesarlo directamente
                if (clientes.length === 1) {
                    const cliente = clientes[0];
                    console.log('🔵 ClientFiles: Loading pagos for single client:', cliente.email);

                    this.pagoService.getPagosByUser(cliente.uid).subscribe({
                        next: (pagos: Pago[]) => {
                            clearTimeout(safetyTimeout);
                            console.log('✅ ClientFiles: Pagos loaded for client:', pagos.length);

                            this.clientFiles = [{
                                cliente,
                                pagos,
                                totalPagos: pagos.length,
                                totalMonto: pagos.reduce((sum: number, p: Pago) => sum + (p.monto || 0), 0),
                                pagosPendientes: pagos.filter((p: Pago) => p.estado === 'pendiente').length,
                                pagosPagados: pagos.filter((p: Pago) => p.estado === 'pagado').length,
                                ultimoPago: pagos.sort((a, b) => {
                                    const dateA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
                                    const dateB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
                                    return dateB.getTime() - dateA.getTime();
                                })[0]
                            }];

                            this.extractCategorias();
                            this.filteredFiles = [...this.clientFiles];
                            this.applySorting();
                            this.loading = false;
                            console.log('✅ ClientFiles: Complete!');
                        },
                        error: (error) => {
                            clearTimeout(safetyTimeout);
                            console.error('❌ ClientFiles: Error loading pagos:', error);
                            // Mostrar cliente sin pagos
                            this.clientFiles = [{
                                cliente,
                                pagos: [],
                                totalPagos: 0,
                                totalMonto: 0,
                                pagosPendientes: 0,
                                pagosPagados: 0
                            }];
                            this.filteredFiles = [...this.clientFiles];
                            this.loading = false;
                        }
                    });
                    return;
                }

                // Múltiples clientes - usar forkJoin
                const clientFileObservables = clientes.map(cliente => {
                    console.log('🔵 ClientFiles: Loading pagos for client:', cliente.email);
                    return this.pagoService.getPagosByUser(cliente.uid).pipe(
                        take(1), // Tomar solo la primera emisión y completar
                        catchError((error: any) => {
                            console.error('❌ ClientFiles: Error loading pagos for:', cliente.email, error);
                            return of([] as Pago[]);
                        })
                    );
                });

                console.log('🔵 ClientFiles: Starting forkJoin with', clientFileObservables.length, 'observables');

                forkJoin(clientFileObservables).subscribe({
                    next: (allPagos: Pago[][]) => {
                        clearTimeout(safetyTimeout);
                        console.log('✅ ClientFiles: forkJoin completed successfully');
                        console.log('✅ ClientFiles: All pagos loaded');
                        console.log('📊 ClientFiles: Pagos arrays:', allPagos.map((p: Pago[]) => p.length));

                        this.clientFiles = clientes.map((cliente, index) => {
                            const pagos: Pago[] = allPagos[index];
                            const totalMonto = pagos.reduce((sum: number, p: Pago) => sum + (p.monto || 0), 0);
                            const pagosPendientes = pagos.filter((p: Pago) => p.estado === 'pendiente').length;
                            const pagosPagados = pagos.filter((p: Pago) => p.estado === 'pagado').length;

                            const sortedPagos = [...pagos].sort((a, b) => {
                                const dateA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
                                const dateB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
                                return dateB.getTime() - dateA.getTime();
                            });

                            return {
                                cliente,
                                pagos,
                                totalPagos: pagos.length,
                                totalMonto,
                                pagosPendientes,
                                pagosPagados,
                                ultimoPago: sortedPagos[0]
                            };
                        });

                        this.extractCategorias();
                        this.filteredFiles = [...this.clientFiles];
                        this.applySorting();
                        this.loading = false;
                        console.log('✅ ClientFiles: Complete! Files created:', this.clientFiles.length);
                    },
                    error: (error) => {
                        clearTimeout(safetyTimeout);
                        console.error('❌ ClientFiles: Error in forkJoin:', error);
                        alert('Error al cargar archivos de clientes. Revisa la consola.');
                        this.loading = false;
                    }
                });
            },
            error: (error) => {
                clearTimeout(safetyTimeout);
                console.error('❌ ClientFiles: Error loading clientes:', error);
                alert('Error al cargar clientes. Revisa la consola.');
                this.loading = false;
            }
        });
    }

    extractCategorias(): void {
        const categoriasSet = new Set<string>();

        // Agregar categorías predeterminadas
        const categoriasDefault = [
            'Servicios',
            'Alquiler',
            'Préstamos',
            'Tarjetas',
            'Seguros',
            'Educación',
            'Salud',
            'Otros'
        ];

        categoriasDefault.forEach(cat => categoriasSet.add(cat));

        // Agregar categorías de los pagos existentes
        this.clientFiles.forEach(file => {
            file.pagos.forEach(pago => {
                categoriasSet.add(pago.categoria);
            });
        });

        this.categorias = Array.from(categoriasSet).sort();
        console.log('🏷️ ClientFiles: All categories:', this.categorias);
    }

    onSearchChange(): void {
        this.applyFilters();
    }

    onCategoriaChange(): void {
        this.applyFilters();
    }

    applyFilters(): void {
        const term = this.searchTerm.toLowerCase();

        this.filteredFiles = this.clientFiles.filter(file => {
            // Filtro por nombre o email
            const matchesSearch = !term ||
                (file.cliente.displayName?.toLowerCase().includes(term)) ||
                file.cliente.email.toLowerCase().includes(term);

            // Filtro por categoría
            const matchesCategoria = this.selectedCategoria === 'todas' ||
                file.pagos.some(pago => pago.categoria === this.selectedCategoria);

            return matchesSearch && matchesCategoria;
        });

        this.applySorting();
    }

    onSortChange(): void {
        this.applySorting();
    }

    applySorting(): void {
        switch (this.sortBy) {
            case 'nombre':
                this.filteredFiles.sort((a, b) => {
                    const nameA = a.cliente.displayName || a.cliente.email;
                    const nameB = b.cliente.displayName || b.cliente.email;
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'pagos':
                this.filteredFiles.sort((a, b) => b.totalPagos - a.totalPagos);
                break;
            case 'monto':
                this.filteredFiles.sort((a, b) => b.totalMonto - a.totalMonto);
                break;
        }
    }

    viewClientDetail(clientFile: ClienteFile): void {
        this.selectedClient = clientFile;
    }

    closeClientDetail(): void {
        this.selectedClient = null;
    }

    createPagoForClient(clientFile: ClienteFile): void {
        // Navegar al formulario de pago con el cliente preseleccionado
        this.router.navigate(['/pago/nuevo'], {
            queryParams: { clienteId: clientFile.cliente.uid }
        });
    }

    editPago(pagoId: string): void {
        this.router.navigate(['/pago/editar', pagoId]);
    }

    async deletePago(pago: Pago): Promise<void> {
        if (confirm(`¿Estás seguro de eliminar el pago "${pago.concepto}"?`)) {
            try {
                await this.pagoService.deletePago(pago.id!);
                alert('Pago eliminado exitosamente');
                this.loadClientFiles(); // Recargar datos
            } catch (error) {
                console.error('Error al eliminar pago:', error);
                alert('Error al eliminar el pago');
            }
        }
    }

    getEstadoClass(estado: string): string {
        switch (estado) {
            case 'pagado': return 'estado-pagado';
            case 'pendiente': return 'estado-pendiente';
            case 'vencido': return 'estado-vencido';
            default: return '';
        }
    }

    getEstadoIcon(estado: string): string {
        switch (estado) {
            case 'pagado': return '✓';
            case 'pendiente': return '⏳';
            case 'vencido': return '⚠️';
            default: return '';
        }
    }
}
