// src/app/home/plan.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan } from './plan.model';
import { environment } from '../../enviroments/enviroment';


@Injectable({
  providedIn: 'root',
})
export class PlanService {
  private baseUrl = environment.HOST_BACKEND;

  constructor(private http: HttpClient) {}

  getPlanes(): Observable<Plan[]> {
    // Construimos una URL absoluta, válida tanto en cliente como en SSR
    return this.http.get<Plan[]>(`${this.baseUrl}/api/planes`);
  }
}
