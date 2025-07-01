import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Plan } from '../../models/plan.model';
import { PlanConPrecios } from '../../services/plan.service';
import { DurationLabelPipe } from '../../pipes/duration-label.pipe';

@Component({
  selector: 'app-admin-plan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    DurationLabelPipe,
  ],
  templateUrl: './admin-plan.component.html',
  styleUrls: ['./admin-plan.component.scss'],
})
export class AdminPlanComponent {
  @Input() planes: PlanConPrecios[] = [];
  @Input() planForm!: FormGroup;
  @Input() modoEdicion: boolean = false;

  @Output() onSubmit = new EventEmitter<void>();
  @Output() onEditarPlan = new EventEmitter<Plan>();
  @Output() onEliminarPlan = new EventEmitter<number>();
  @Output() onResetForm = new EventEmitter<void>();

  submitForm() {
    this.onSubmit.emit();
  }

  editarPlan(plan: Plan) {
    this.onEditarPlan.emit(plan);
  }

  eliminarPlan(id: number) {
    this.onEliminarPlan.emit(id);
  }

  resetForm() {
    this.onResetForm.emit();
  }
}
