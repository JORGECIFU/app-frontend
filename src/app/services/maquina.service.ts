import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from '../auth/auth.service';
import { Maquina } from '../models/maquina.model';
import { AuthRolesService } from './auth-roles.service';

@Injectable({
  providedIn: 'root',
})
export class MaquinaService {
  private baseUrl = `${environment.HOST_BACKEND}/api/maquinas`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authRolesService: AuthRolesService,
  ) {}

  // Métodos para ADMINISTRADOR
  crearMaquina(maquina: Maquina): Observable<Maquina> {
    if (!this.authRolesService.esAdministrador()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.post<Maquina>(this.baseUrl, maquina, { headers });
  }

  actualizarMaquina(id: number, maquina: Maquina): Observable<Maquina> {
    if (!this.authRolesService.esAdministrador()) {
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
    if (!this.authRolesService.esAdministrador()) {
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
    return this.authRolesService.esAdministrador();
  }
}
