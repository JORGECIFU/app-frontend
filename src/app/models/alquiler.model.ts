// src/app/models/alquiler.model.ts
export interface Alquiler {
  id: number;
  usuarioId: number;
  maquinaId: number;
  planId: number;
  fechaInicio: string;
  fechaFin: string;
  precioAlquiler: number;
  costoTotal: number;
  estado: 'ACTIVO' | 'CERRADO';
  montoDevuelto: number;
  gananciaPlataforma: number;
}

export interface PreviewPlan {
  planId: number;
  planNombre: string;
  duracionDias: number;
  gananciaPromedioDiaria: number;
  precioBruto: number;
  precioAlquiler: number;
  gananciaMaxUsuario: number;
  ingresoPlataforma?: number;
}
