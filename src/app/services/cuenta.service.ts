import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/enviroment';
import { Observable, throwError, switchMap, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export interface Cuenta {
  cuentaId: number;
  usuarioId: number;
  balance: number;
}

export interface Transaccion {
  fechaTransaccion: string;
  tipo: string;
  monto: number;
  balancePosterior: number;
}

export interface CrearTransaccionRequest {
  tipo: 'RECARGA_PLATAFORMA';
  monto: number;
}

@Injectable({
  providedIn: 'root',
})
export class CuentaService {
  private baseUrl = environment.apiUrl;
  private saldoSubject = new BehaviorSubject<number | null>(null);
  saldo$ = this.saldoSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  obtenerCuenta(usuarioId: number): Observable<Cuenta> {
    const token = this.authService.getToken();

    if (!token) {
      return throwError(() => new Error('No hay token de autenticación'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .get<Cuenta>(`${this.baseUrl}/plataforma/cuenta/${usuarioId}`, {
        headers,
      })
      .pipe(
        tap((cuenta: Cuenta) => {
          this.saldoSubject.next(cuenta.balance);
        }),
      );
  }

  realizarTransaccion(transaccion: CrearTransaccionRequest): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('No hay token de autenticación'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Primero obtenemos el usuario actual
    return this.http
      .get<Usuario>(`${this.baseUrl}/usuarios/me`, { headers })
      .pipe(
        switchMap((usuario) => {
          // Luego realizamos la transacción con el ID del usuario
          return this.http
            .post(
              `${this.baseUrl}/plataforma/cuenta/${usuario.id}/transacciones`,
              transaccion,
              { headers },
            )
            .pipe(
              tap(() => {
                // Actualizar el saldo después de la transacción
                this.obtenerCuenta(usuario.id).subscribe();
              }),
            );
        }),
      );
  }

  obtenerUsuarioActual(): Observable<Usuario> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('No hay token de autenticación'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Usuario>(`${this.baseUrl}/usuarios/me`, {
      headers,
    });
  }

  obtenerTransacciones(usuarioId: number): Observable<Transaccion[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('No hay token de autenticación'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Transaccion[]>(
      `${this.baseUrl}/plataforma/cuenta/${usuarioId}/transacciones`,
      { headers },
    );
  }
}
