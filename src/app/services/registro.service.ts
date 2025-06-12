import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class RegistroService {
  private baseUrl = `${environment.HOST_BACKEND}/api/usuarios`;

  constructor(private http: HttpClient) {}

  registrarUsuario(usuario: Usuario): Observable<any> {
    return this.http.post(this.baseUrl, usuario);
  }
}
