// src/app/auth/auth.state.ts
export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  // Acción para guardar ambos tokens
  setTokens: (token: string, refreshToken: string) => void;
  // Acción para limpiar ambos tokens
  clearTokens: () => void;
}
