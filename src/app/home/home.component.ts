// src/app/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { Observable } from 'rxjs';

import { Plan } from '../models/plan.model';
import { PlanService } from '../services/plan.service';
import { DurationLabelPipe } from '../pipes/duration-label.pipe';
import { PrecioPipe } from '../pipes/precio.pipe';
import { PrecioCopPipe } from '../pipes/precio-cop.pipe';

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
    DurationLabelPipe,
    PrecioPipe,
    PrecioCopPipe,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  planes$!: Observable<Plan[]>;

  constructor(
    protected planService: PlanService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.planes$ = this.planService.getPlanes();
  }

  goToPlan() {
    this.router.navigate(['/system/plan']);
  }

  // trackBy para *ngFor
  trackById(index: number, plan: Plan): number {
    return plan.id;
  }
}
