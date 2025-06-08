// src/app/home/plan.model.ts
export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  gananciaMin: number;
  gananciaMax: number;
  duracionDias: number;
  precioBruto?: number;
  precioAlquiler?: number;
  gananciaMaxUsuario?: number;
  gananciaPromedioDiaria?: number;
}
