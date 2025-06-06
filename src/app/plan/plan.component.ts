import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthRolesService } from '../services/auth-roles.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PlanService, Plan } from '../services/plan.service';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.scss',
})
export class PlanComponent implements OnInit {
  planes: Plan[] = [];
  planForm: FormGroup;
  esAdmin: boolean = false;
  modoEdicion = false;
  planEnEdicion: Plan | null = null;

  constructor(
    private planService: PlanService,
    private fb: FormBuilder,
    private authRolesService: AuthRolesService,
  ) {
    this.esAdmin = this.authRolesService.esAdministrador();
    this.planForm = this.fb.group({
      nombre: ['', Validators.required],
      gananciaMin: ['', [Validators.required, Validators.min(0)]],
      gananciaMax: ['', [Validators.required, Validators.min(0)]],
      duracionDias: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.cargarPlanes();
  }

  cargarPlanes() {
    this.planService.obtenerTodosLosPlanes().subscribe({
      next: (planes) => (this.planes = planes),
      error: (error) => console.error('Error al cargar planes:', error),
    });
  }

  onSubmit() {
    if (this.planForm.valid) {
      const plan: Plan = this.planForm.value;

      if (this.modoEdicion && this.planEnEdicion?.id) {
        this.planService.actualizarPlan(this.planEnEdicion.id, plan).subscribe({
          next: () => {
            this.cargarPlanes();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error al actualizar plan:', error);
            if (error.message === 'No autorizado') {
              alert('No tiene permisos para actualizar planes');
            } else {
              alert(
                'Error al actualizar el plan. Verifique su conexión e intente nuevamente.',
              );
            }
          },
        });
      } else {
        this.planService.crearPlan(plan).subscribe({
          next: () => {
            this.cargarPlanes();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error al crear plan:', error);
            if (error.message === 'No autorizado') {
              alert('No tiene permisos para crear planes');
            } else {
              alert(
                'Error al crear el plan. Verifique su conexión e intente nuevamente.',
              );
            }
          },
        });
      }
    }
  }

  editarPlan(plan: Plan) {
    this.modoEdicion = true;
    this.planEnEdicion = plan;
    this.planForm.patchValue(plan);
  }

  eliminarPlan(id: number) {
    if (confirm('¿Está seguro de eliminar este plan?')) {
      this.planService.eliminarPlan(id).subscribe({
        next: () => this.cargarPlanes(),
        error: (error) => console.error('Error al eliminar plan:', error),
      });
    }
  }

  resetForm() {
    this.modoEdicion = false;
    this.planEnEdicion = null;
    this.planForm.reset();
  }
}
