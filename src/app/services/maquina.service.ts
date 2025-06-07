import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Maquina } from '../interfaces/maquina';
import { AuthRolesService } from './auth-roles.service';

@Injectable({
  providedIn: 'root',
})
export class MaquinaService {
  private apiUrl = `${environment.apiUrl}/maquinas`;

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
    return this.http.post<Maquina>(this.apiUrl, maquina, { headers });
  }

  actualizarMaquina(id: number, maquina: Maquina): Observable<Maquina> {
    if (!this.authRolesService.esAdministrador()) {
      return throwError(() => new Error('No autorizado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.put<Maquina>(`${this.apiUrl}/${id}`, maquina, {
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
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  // Métodos para USUARIO y ADMINISTRADOR
  obtenerMaquina(id: number): Observable<Maquina> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Maquina>(`${this.apiUrl}/${id}`, { headers });
  }

  listarMaquinas(): Observable<Maquina[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Maquina[]>(this.apiUrl, { headers });
  }

  esAdministrador(): boolean {
    return this.authRolesService.esAdministrador();
  }
}
