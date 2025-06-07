import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, throwError, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

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
  tipo: 'RECARGA_PLATAFORMA';
  monto: number;
}

@Injectable({
  providedIn: 'root',
})
export class CuentaService {
  private baseUrl = environment.apiUrl;

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

    return this.http.get<Cuenta>(
      `${this.baseUrl}/plataforma/cuenta/${usuarioId}`,
      { headers },
    );
  }

  realizarTransaccion(transaccion: Transaccion): Observable<any> {
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
          return this.http.post(
            `${this.baseUrl}/plataforma/cuenta/${usuario.id}/transacciones`,
            transaccion,
            { headers },
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

    return this.http.get<Usuario>(`${this.baseUrl}/plataforma/usuario/actual`, {
      headers,
    });
  }
}
