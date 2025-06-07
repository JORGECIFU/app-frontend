// src/app/auth/auth-guard.service.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    // 1. Obtener el token actual
    const token = this.authService.getToken();
    if (!token) {
      return this.router.parseUrl('/login');
    }

    // 2. Verificar si el token está expirado
    if (!this.authService.tokenEstaExpirado()) {
      return true; // Token aún válido
    }

    // Token expirado o inválido
    this.authService.logout();
    return this.router.parseUrl('/login');
  }
}
