import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthRolesService {
  constructor(private authService: AuthService) {}

  obtenerRolUsuario(): string {
    return this.authService.getRol();
  }

  obtenerEmailUsuario(): string {
    return this.authService.getEmail();
  }

  esAdministrador(): boolean {
    return this.authService.esAdministrador();
  }

  esUsuarioNormal(): boolean {
    return this.authService.esUsuario();
  }
}
