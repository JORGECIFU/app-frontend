// src/app/auth/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/enviroment';
import { AuthState, TokenPayload } from '../auth/auth.state';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_REFRESH_KEY = 'auth_refresh_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private state = new BehaviorSubject<AuthState>({
    token: null,
    refreshToken: null,
  });

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const refreshToken = localStorage.getItem(AUTH_REFRESH_KEY);

      if (token) {
        this.state.next({ token, refreshToken });
      }
    }
  }

  private saveToStorage(state: AuthState) {
    if (isPlatformBrowser(this.platformId)) {
      if (state.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, state.token);
        if (state.refreshToken) {
          localStorage.setItem(AUTH_REFRESH_KEY, state.refreshToken);
        }
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_REFRESH_KEY);
      }
    }
    this.state.next(state);
  }

  private decodeToken(token: string): TokenPayload | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('[AuthService] Error al decodificar token:', error);
      return null;
    }
  }

  getAuthState(): Observable<AuthState> {
    return this.state.asObservable();
  }

  getToken(): string | null {
    return this.state.value.token;
  }

  getRefreshToken(): string | null {
    return this.state.value.refreshToken;
  }

  getRol(): string {
    const token = this.getToken();
    if (!token) {
      return '';
    }

    const payload = this.decodeToken(token);
    return payload?.rol || '';
  }

  esAdministrador(): boolean {
    const rol = this.getRol();
    return rol === 'ADMINISTRADOR';
  }

  esUsuario(): boolean {
    const rol = this.getRol();
    return rol === 'USUARIO';
  }

  logout(): void {
    this.clearState();
  }

  getEmail(): string {
    const token = this.getToken();
    if (!token) return '';

    const payload = this.decodeToken(token);
    return payload?.sub || '';
  }

  tokenEstaExpirado(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const payload = this.decodeToken(token);
    if (!payload) {
      return true;
    }

    const ahora = Math.floor(Date.now() / 1000);
    return payload.exp < ahora;
  }

  login(
    username: string,
    password: string,
  ): Observable<{ token: string; refreshToken: string }> {
    this.clearState();
    return this.http.post<{ token: string; refreshToken: string }>(
      `${environment.HOST_BACKEND}/api/auth/login`,
      { username, password },
    );
  }

  setTokens(token: string, refreshToken: string): void {
    this.saveToStorage({ token, refreshToken });
  }

  private clearState(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_REFRESH_KEY);
    }
    this.state.next({ token: null, refreshToken: null });
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    const rt = this.getRefreshToken();
    return this.http.post<{ token: string; refreshToken: string }>(
      `${environment.HOST_BACKEND}/api/auth/refresh`,
      { refreshToken: rt },
    );
  }
}
