import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'precio',
  standalone: true,
})
export class PrecioPipe implements PipeTransform {
  transform(precio: number | undefined): string {
    // Si el valor es undefined, asignamos 0
    const precioValido = precio ?? 0;

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(precioValido);
  }
}
