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
   * initStore define el estado inicial y las acciones.
   */
  initStore(): StateCreator<AuthState> {
    return persist<AuthState>(
      (set) => ({
        token: null,
        setToken: (token: string) => set(() => ({ token })),
        clearToken: () => set(() => ({ token: null })),
      }),
      {
        name: 'authStore',
        storage: createJSONStorage(() => sessionStorage),
      },
    ) as unknown as StateCreator<AuthState>;
  }

  override createStore() {
    return createStore(this.initStore());
  }

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Llama al endpoint /api/auth/login para obtener el token.
   * Usamos environment.HOST_BACKEND para la URL base.
   */
  login(username: string, password: string) {
    const url = `${environment.HOST_BACKEND}/api/auth/login`; // ②
    return this.http.post<{ token: string }>(url, { username, password });
  }

  /**
   * Retorna el token actual almacenado (sin suscribirse).
   */
  getTokenFromStorage(): string | null {
    return this.getState().token;
  }
}
