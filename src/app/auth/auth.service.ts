// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { ZustandBaseService } from 'ngx-zustand';
import { StateCreator, createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthState } from './auth.state';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ZustandBaseService<AuthState> {
  /**
   * Definimos el estado inicial y las acciones.
   */
  initStore(): StateCreator<AuthState> {
    return persist<AuthState>(
      (set) => ({
        token: null,
        refreshToken: null,
        setTokens: (token: string, refreshToken: string) =>
          set(() => ({ token: token, refreshToken })),
        clearTokens: () => set(() => ({ token: null, refreshToken: null })),
      }),
      {
        name: 'authStore', // clave en sessionStorage
        storage: createJSONStorage(() => sessionStorage),
      },
    ) as unknown as StateCreator<AuthState>;
  }

  /**
   * Forzamos usar el store persistido.
   */
  override createStore() {
    return createStore(this.initStore());
  }

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Llama a /api/auth/login, retorna { token, refreshToken }.
   * Luego quien se suscriba (p. ej. AuthComponent) usará setTokens().
   */
  login(username: string, password: string) {
    const url = `${environment.HOST_BACKEND}/api/auth/login`;
    return this.http.post<{ token: string; refreshToken: string }>(url, {
      username,
      password,
    });
  }

  /**
   * Llama a /api/auth/refresh con el refreshToken actual en el store.
   * Devuelve el nuevo { token, refreshToken }.
   */
  refreshToken() {
    const rt = this.getState().refreshToken;
    return this.http.post<{ token: string; refreshToken: string }>(
      `${environment.HOST_BACKEND}/api/auth/refresh`,
      { refreshToken: rt },
    );
  }

  /**
   * Obtiene el token actual sin suscribirse.
   */
  getToken(): string | null {
    return this.getState().token;
  }

  /**
   * Obtiene el refreshToken actual sin suscribirse.
   */
  getRefreshToken(): string | null {
    return this.getState().refreshToken;
  }

  /**
   * Limpia ambos tokens del store (usado en logout o al expirar).
   */
  clearTokens() {
    this.getState().clearTokens();
  }
}
