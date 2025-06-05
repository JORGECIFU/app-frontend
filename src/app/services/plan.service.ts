import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from '../auth/auth.service';

export interface Plan {
  id?: number;
  nombre: string;
  gananciaMin: number;
  gananciaMax: number;
  duracionDias: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private baseUrl = `${environment.HOST_BACKEND}/api/planes`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // Métodos para ADMINISTRADOR
  crearPlan(plan: Plan): Observable<Plan> {
    if (!this.validarToken()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.post<Plan>(this.baseUrl, plan, { headers });
  }

  actualizarPlan(id: number, plan: Plan): Observable<Plan> {
    if (!this.validarToken()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.put<Plan>(`${this.baseUrl}/${id}`, plan, { headers });
  }

  eliminarPlan(id: number): Observable<void> {
    if (!this.validarToken()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }

  // Métodos para USUARIO y ADMINISTRADOR
  obtenerPlan(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.baseUrl}/${id}`);
  }

  obtenerTodosLosPlanes(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.baseUrl);
  }

  esAdministrador(): boolean {
    try {
      const token = this.authService.getToken();
      if (!token) return false;

      // Decodificar el token (la parte del payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol === 'ADMINISTRADOR';
    } catch {
      return false;
    }
  }

  private validarToken(): boolean {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No hay token disponible');
      return false;
    }

    try {
      // Decodificar el token
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Verificar expiración
      const now = Date.now() / 1000;
      if (payload.exp && payload.exp < now) {
        console.error('Token expirado');
        return false;
      }

      // Verificar rol para operaciones de administrador
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
}
