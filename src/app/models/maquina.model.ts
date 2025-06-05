// src/app/models/maquina.model.ts
export interface Maquina {
  id?: number;
  serial: string;
  estado: 'DISPONIBLE' | 'RENTADA' | 'MANTENIMIENTO';
  especificaciones: string;
}
