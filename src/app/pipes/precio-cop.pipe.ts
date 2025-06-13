import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'precioCop',
  standalone: true,
})
export class PrecioCopPipe implements PipeTransform {
  constructor(private currencyService: CurrencyService) {}

  transform(precio: number | undefined): Observable<string> {
    // Si el valor es undefined, asignamos 0
    const precioValido = precio ?? 0;

    return this.currencyService.convertUsdToCop(precioValido).pipe(
      map((precioEnCop) => {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(precioEnCop);
      }),
      catchError((error) => {
        console.error('Error al convertir precio a COP:', error);
        // En caso de error, mostrar el precio original en USD
        return of(
          new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(precioValido),
        );
      }),
    );
  }
}
