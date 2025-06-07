// src/app/services/plan.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { Plan } from '../models/plan.model';
import { environment } from '../../enviroments/enviroment';

interface PlanPreview {
  planId: number;
  planNombre: string;
  duracionDias: number;
  gananciaPromedioDiaria: number;
  precioBruto: number;
  precioAlquiler: number;
  gananciaMaxUsuario: number;
}

export type PlanConPrecios = Plan & {
  precioBruto?: number;
  precioAlquiler?: number;
  gananciaMaxUsuario?: number;
  gananciaPromedioDiaria?: number;
};

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private baseUrl = environment.HOST_BACKEND;

  constructor(private http: HttpClient) {}

  obtenerTodosLosPlanes(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.baseUrl}/api/planes`);
  }

  private obtenerPreviewPlanes(): Observable<PlanPreview[]> {
    return this.http.get<PlanPreview[]>(
      `${this.baseUrl}/api/alquileres/preview/all`,
    );
  }

  obtenerPlanesConPrecios(): Observable<PlanConPrecios[]> {
    return forkJoin({
      planes: this.obtenerTodosLosPlanes(),
      precios: this.obtenerPreviewPlanes(),
    }).pipe(
      map(({ planes, precios }) => {
        return planes.map((plan) => {
          const preview = precios.find((p) => p.planId === plan.id);
          return {
            ...plan,
            precioBruto: preview?.precioBruto,
            precioAlquiler: preview?.precioAlquiler,
            gananciaMaxUsuario: preview?.gananciaMaxUsuario,
            gananciaPromedioDiaria: preview?.gananciaPromedioDiaria,
          };
        });
      }),
    );
  }

  getPlanes(): Observable<Plan[]> {
    return this.obtenerTodosLosPlanes();
  }

  crearPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(`${this.baseUrl}/api/planes`, plan);
  }

  actualizarPlan(id: number, plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.baseUrl}/api/planes/${id}`, plan);
  }

  eliminarPlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/planes/${id}`);
  }
}
