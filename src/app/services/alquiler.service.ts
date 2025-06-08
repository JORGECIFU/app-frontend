// src/app/services/alquiler.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from './auth.service';
import { AuthRolesService } from './auth-roles.service';
import { Alquiler, PreviewPlan } from '../models/alquiler.model';

@Injectable({
  providedIn: 'root',
})
export class AlquilerService {
  private baseUrl = `${environment.HOST_BACKEND}/api/alquileres`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private authRolesService: AuthRolesService,
  ) {}

  // Método para obtener todos los alquileres (solo ADMINISTRADOR)
  obtenerAlquileres(): Observable<Alquiler[]> {
    if (!this.authRolesService.esAdministrador()) {
      throw new Error('No autorizado');
    }
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Alquiler[]>(this.baseUrl, { headers });
  }

  // Método para cerrar un alquiler (solo ADMINISTRADOR)
  cerrarAlquiler(id: number): Observable<void> {
    if (!this.authRolesService.esAdministrador()) {
      throw new Error('No autorizado');
    }
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.put<void>(`${this.baseUrl}/cerrar/${id}`, {}, { headers });
  }

  // Método para obtener preview de un plan específico (solo ADMINISTRADOR)
  obtenerPreviewPlan(planId: number): Observable<PreviewPlan> {
    if (!this.authRolesService.esAdministrador()) {
      throw new Error('No autorizado');
    }
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<PreviewPlan>(
      `${this.baseUrl}/preview?planId=${planId}`,
      {
        headers,
      },
    );
  }

  // Método para obtener preview de todos los planes (solo ADMINISTRADOR)
  obtenerPreviewTodosPlanes(): Observable<PreviewPlan[]> {
    if (!this.authRolesService.esAdministrador()) {
      throw new Error('No autorizado');
    }
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<PreviewPlan[]>(`${this.baseUrl}/preview/all`, {
      headers,
    });
  }

  // Método para obtener los alquileres activos del usuario
  obtenerAlquileresActivos(usuarioId: number): Observable<Alquiler[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Alquiler[]>(
      `${this.baseUrl}/usuario/${usuarioId}/activas`,
      { headers },
    );
  }

  // Método para obtener los alquileres cerrados del usuario
  obtenerAlquileresCerrados(usuarioId: number): Observable<Alquiler[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Alquiler[]>(
      `${this.baseUrl}/usuario/${usuarioId}/cerradas`,
      { headers },
    );
  }

  // Método para obtener el usuario actual
  obtenerUsuarioActual(): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get(`${environment.HOST_BACKEND}/api/usuarios/me`, {
      headers,
    });
  }

  // Método para crear un nuevo alquiler
  crearAlquiler(planId: number): Observable<Alquiler> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.post<Alquiler>(this.baseUrl, { planId }, { headers });
  }
}
