import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from '../auth/auth.service';
import { Maquina } from '../models/maquina.model';

@Injectable({
  providedIn: 'root',
})
export class MaquinaService {
  private baseUrl = `${environment.HOST_BACKEND}/api/maquinas`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // Validación de token y rol de administrador
  private validarToken(): boolean {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token disponible');
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;

      if (payload.exp && payload.exp < now) {
        console.error('Token expirado');
        return false;
      }

      if (payload.rol !== 'ADMINISTRADOR') {
        console.error('Usuario no es administrador');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al validar el token:', error);
      return false;
    }
  }

  // Métodos para ADMINISTRADOR
  crearMaquina(maquina: Maquina): Observable<Maquina> {
    if (!this.validarToken()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.post<Maquina>(this.baseUrl, maquina, { headers });
  }

  actualizarMaquina(id: number, maquina: Maquina): Observable<Maquina> {
    if (!this.validarToken()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.put<Maquina>(`${this.baseUrl}/${id}`, maquina, {
      headers,
    });
  }

  eliminarMaquina(id: number): Observable<void> {
    if (!this.validarToken()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }

  // Métodos para USUARIO y ADMINISTRADOR
  obtenerMaquina(id: number): Observable<Maquina> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Maquina>(`${this.baseUrl}/${id}`, { headers });
  }

  obtenerTodasLasMaquinas(): Observable<Maquina[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Maquina[]>(this.baseUrl, { headers });
  }

  esAdministrador(): boolean {
    try {
      const token = this.authService.getToken();
      if (!token) return false;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol === 'ADMINISTRADOR';
    } catch {
      return false;
    }
  }
}
