// src/app/auth/jwt.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // 1. Obtener el token del store
    const token = this.authService.getState().token;

    // 2. Saltar el token si es la petición a /api/planes
    if (request.url.endsWith('/api/planes')) {
      return next.handle(request);
    }

    // 3. Clonar petición con token si existe
    let authReq = request;
    if (token) {
      authReq = this.addTokenHeader(request, token);
    }

    // 4. Enviar petición y manejar 401 para el resto
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      }),
    );
  }

  // Helper para clonar la petición y agregar el header Authorization
  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Lógica de refresh de token ante un 401
  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getState().refreshToken;
      if (!refreshToken) {
        this.authService.clearTokens();
        this.router.navigate(['/login']);
        return throwError(() => new Error('No hay refresh token'));
      }

      return this.authService.refreshToken().pipe(
        switchMap((res) => {
          this.isRefreshing = false;
          this.authService.getState().setTokens(res.token, res.refreshToken);
          this.refreshTokenSubject.next(res.token);

          return next.handle(this.addTokenHeader(request, res.token));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.clearTokens();
          this.router.navigate(['/login']);
          return throwError(() => err);
        }),
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((t) => t != null),
        take(1),
        switchMap((t) => next.handle(this.addTokenHeader(request, t!))),
      );
    }
  }
}
