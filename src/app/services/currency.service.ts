// src/app/services/currency.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

/** Modelo de la respuesta parcial de open.er-api.com */
interface OpenErApiResponse {
  result: string;
  base_code: string;
  rates: { [currency: string]: number };
}

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private apiUrl = 'https://open.er-api.com/v6/latest/USD';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la tasa actual USD → COP
   * devuelve, por ejemplo, 4186.167776
   */
  getUsdToCopRate(): Observable<number> {
    return this.http.get<OpenErApiResponse>(this.apiUrl).pipe(
      map((response) => {
        if (response.result !== 'success') {
          throw new Error('Error al obtener la tasa');
        }
        const rate = response.rates['COP'];
        if (rate == null) {
          throw new Error('Tasa COP no encontrada en la respuesta');
        }
        return rate;
      }),
    );
  }

  /**
   * Convierte un monto en USD a COP multiplicando por la tasa actual.
   */
  convertUsdToCop(amount: number): Observable<number> {
    return this.getUsdToCopRate().pipe(map((rate) => amount * rate));
  }
}
