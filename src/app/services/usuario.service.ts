import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  rol?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  obtenerMiPerfil(): Observable<Usuario> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Usuario>(`${this.apiUrl}/me`, { headers });
  }

  actualizarPerfil(id: number, usuario: Usuario): Observable<Usuario> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario, { headers });
  }

  eliminarCuenta(id: number): Observable<void> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  // Nuevos métodos para administradores
  listarUsuarios(): Observable<Usuario[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.get<Usuario[]>(this.apiUrl, { headers });
  }

  crearAdministrador(admin: Usuario): Observable<Usuario> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.post<Usuario>(
      `${this.apiUrl}/admin`,
      { ...admin, rol: 'ADMINISTRADOR' },
      { headers },
    );
  }

  promoverAAdministrador(id: number): Observable<Usuario> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );
    return this.http.put<Usuario>(
      `${environment.apiUrl}/admin/promover/${id}`,
      {},
      { headers },
    );
  }
}
