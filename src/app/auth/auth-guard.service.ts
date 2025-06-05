// src/app/auth/auth-guard.service.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    // 1. Obtener el token desde el store
    const token = this.authService.getState().token;
    if (!token) {
      return this.router.parseUrl('/login');
    }

    // 2. Decodificar payload para extraer "exp"
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      const nowInSecs = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp > nowInSecs) {
        return true; // Token aún válido
      } else {
        // Token expirado: limpiar store y redirigir
        this.authService.clearTokens();
        return this.router.parseUrl('/login');
      }
    } catch (err) {
      // Token mal formado: limpiar y redirigir
      this.authService.clearTokens();
      return this.router.parseUrl('/login');
    }
  }
}
