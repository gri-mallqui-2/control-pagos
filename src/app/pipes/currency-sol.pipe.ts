import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'currencySol',
    standalone: true
})
export class CurrencySolPipe implements PipeTransform {
    transform(value: number | null | undefined): string {
        if (value === null || value === undefined) {
            return 'S/ 0.00';
        }

        // Formatear el número con 2 decimales y separador de miles
        const formatted = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        return `S/ ${formatted}`;
    }
}
