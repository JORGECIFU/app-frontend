// src/app/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { Observable } from 'rxjs';

import { Plan } from '../models/plan.model';
import { PlanService } from '../services/plan.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatMenuModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  planes$!: Observable<Plan[]>;

  constructor(protected planService: PlanService) {}

  ngOnInit(): void {
    this.planes$ = this.planService.getPlanes();
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(precio);
  }

  // trackBy para *ngFor
  trackById(index: number, plan: Plan): number {
    return plan.id;
  }
}
