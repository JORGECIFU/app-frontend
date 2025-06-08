import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Monedero {
  monederoId: number;
  usuarioId: number;
  alias: string;
  moneda: string;
  saldoActual: number;
}

export interface CrearMonederoRequest {
  alias: string;
  moneda: string;
}

export interface TransaccionMonederoRequest {
  tipo: 'RECARGA_DESDE_PLATAFORMA' | 'PASO_A_PLATAFORMA';
  usdAmount?: number;
  cryptoAmount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MonederoService {
  private apiUrl = `${environment.apiUrl}/monedero`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
  }

  // Crear un nuevo monedero
  crearMonedero(monedero: CrearMonederoRequest): Observable<Monedero> {
    return this.http.post<Monedero>(this.apiUrl, monedero, {
      headers: this.getHeaders(),
    });
  }

  // Listar monederos del usuario
  obtenerMonederos(): Observable<Monedero[]> {
    return this.http.get<Monedero[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  // Realizar transacción en un monedero
  realizarTransaccion(
    monederoId: number,
    transaccion: TransaccionMonederoRequest,
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${monederoId}/transacciones`,
      transaccion,
      {
        headers: this.getHeaders(),
      },
    );
  }

  // Obtener información de criptomonedas soportadas
  getCriptoInfo(): {
    [key: string]: { nombre: string; icono: string; color: string };
  } {
    return {
      BTC: {
        nombre: 'Bitcoin',
        icono: '₿',
        color: '#f7931a',
      },
      ETH: {
        nombre: 'Ethereum',
        icono: 'Ξ',
        color: '#627eea',
      },
    };
  }
}
