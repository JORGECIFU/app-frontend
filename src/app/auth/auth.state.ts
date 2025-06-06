// src/app/auth/auth.state.ts
export interface TokenPayload {
  sub: string;
  rol: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
}
