import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Plan } from '../../models/plan.model';
import { PlanConPrecios } from '../../services/plan.service';
import { DurationLabelPipe } from '../../pipes/duration-label.pipe';
import { PrecioPipe } from '../../pipes/precio.pipe';

@Component({
  selector: 'app-user-plan',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DurationLabelPipe,
    PrecioPipe,
  ],
  templateUrl: './user-plan.component.html',
  styleUrls: ['./user-plan.component.scss'],
})
export class UserPlanComponent {
  @Input() planes: PlanConPrecios[] = [];

  @Output() onCrearAlquiler = new EventEmitter<Plan>();

  crearAlquiler(plan: Plan) {
    this.onCrearAlquiler.emit(plan);
  }

  getImagenPlan(nombrePlan: string): string {
    const nombreNormalizado = nombrePlan.toLowerCase().trim();
    if (nombreNormalizado.includes('basic')) {
      return '/basic_img.webp';
    } else if (nombreNormalizado.includes('gold')) {
      return '/gold_img.webp';
    } else if (nombreNormalizado.includes('premium')) {
      return '/premium_img.webp';
    } else if (nombreNormalizado.includes('vip')) {
      return '/vip_img.webp';
    }
    return '/basic_img.webp'; // imagen por defecto
  }
}
