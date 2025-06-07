// src/app/services/plan.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan } from '../models/plan.model';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private baseUrl = environment.HOST_BACKEND;

  constructor(private http: HttpClient) {}

  obtenerTodosLosPlanes(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.baseUrl}/api/planes`);
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
