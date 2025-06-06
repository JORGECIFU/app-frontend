import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from '../auth/auth.service';
import { AuthRolesService } from './auth-roles.service';

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
    private authRolesService: AuthRolesService,
  ) {}

  // Métodos para ADMINISTRADOR
  crearPlan(plan: Plan): Observable<Plan> {
    if (!this.authRolesService.esAdministrador()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.post<Plan>(this.baseUrl, plan, { headers });
  }

  actualizarPlan(id: number, plan: Plan): Observable<Plan> {
    if (!this.authRolesService.esAdministrador()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.put<Plan>(`${this.baseUrl}/${id}`, plan, { headers });
  }

  eliminarPlan(id: number): Observable<void> {
    if (!this.authRolesService.esAdministrador()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }

  // Métodos para USUARIO y ADMINISTRADOR
  obtenerPlan(id: number): Observable<Plan> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Plan>(`${this.baseUrl}/${id}`, { headers });
  }

  obtenerTodosLosPlanes(): Observable<Plan[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Plan[]>(this.baseUrl, { headers });
  }

  esAdministrador(): boolean {
    return this.authRolesService.esAdministrador();
  }

  esUsuarioNormal(): boolean {
    return this.authRolesService.esUsuarioNormal();
  }
}
