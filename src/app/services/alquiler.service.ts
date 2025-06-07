// src/app/services/alquiler.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { AuthService } from '../auth/auth.service';
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
}
