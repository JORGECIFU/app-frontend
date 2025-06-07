import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export function JwtInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Helper para clonar la petición y agregar el header Authorization
  const addTokenHeader = (req: HttpRequest<any>, token: string) => {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Lógica de refresh de token ante un 401
  const handle401Error = (
    req: HttpRequest<any>,
  ): Observable<HttpEvent<any>> => {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.getAuthState().pipe(
        take(1),
        switchMap((authState) => {
          if (!authState?.refreshToken) {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => new Error('No hay refresh token'));
          }

          return authService.refreshToken().pipe(
            switchMap((res) => {
              isRefreshing = false;
              refreshTokenSubject.next(res.token);
              return next(addTokenHeader(req, res.token));
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => err);
            }),
          );
        }),
      );
    }

    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(addTokenHeader(req, token!))),
    );
  };

  // Flujo principal del interceptor
  return authService.getAuthState().pipe(
    take(1),
    switchMap((authState) => {
      if (authState?.token) {
        request = addTokenHeader(request, authState.token);
      }

      return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return handle401Error(request);
          }
          return throwError(() => error);
        }),
      );
    }),
  );
}
