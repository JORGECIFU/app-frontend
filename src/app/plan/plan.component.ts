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
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Plan } from '../models/plan.model';
import { PlanService } from '../services/plan.service';

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
    MatCardModule,
  ],
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
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
    private router: Router,
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
      next: (planes: Plan[]) => (this.planes = planes),
      error: (error: unknown) => {
        console.error('Error al cargar planes:', error);
        Swal.fire('Error', 'No se pudieron cargar los planes', 'error');
      },
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
            Swal.fire('¡Éxito!', 'Plan actualizado correctamente', 'success');
          },
          error: (error: unknown) => {
            console.error('Error al actualizar plan:', error);
            if ((error as any).message === 'No autorizado') {
              Swal.fire(
                'Error',
                'No tiene permisos para actualizar planes',
                'error',
              );
            } else {
              Swal.fire(
                'Error',
                'Error al actualizar el plan. Verifique su conexión e intente nuevamente.',
                'error',
              );
            }
          },
        });
      } else {
        this.planService.crearPlan(plan).subscribe({
          next: () => {
            this.cargarPlanes();
            this.resetForm();
            Swal.fire('¡Éxito!', 'Plan creado correctamente', 'success');
          },
          error: (error: unknown) => {
            console.error('Error al crear plan:', error);
            if ((error as any).message === 'No autorizado') {
              Swal.fire(
                'Error',
                'No tiene permisos para crear planes',
                'error',
              );
            } else {
              Swal.fire(
                'Error',
                'Error al crear el plan. Verifique su conexión e intente nuevamente.',
                'error',
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
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.planService.eliminarPlan(id).subscribe({
          next: () => {
            this.cargarPlanes();
            Swal.fire(
              '¡Eliminado!',
              'El plan ha sido eliminado correctamente.',
              'success',
            );
          },
          error: (error) => {
            console.error('Error al eliminar plan:', error);
            Swal.fire(
              'Error',
              'No se pudo eliminar el plan. Por favor, intente nuevamente.',
              'error',
            );
          },
        });
      }
    });
  }

  resetForm() {
    this.modoEdicion = false;
    this.planEnEdicion = null;
    this.planForm.reset();
  }

  irAAlquiler(plan: Plan) {
    this.router.navigate(['/system/alquiler'], {
      queryParams: { planId: plan.id },
    });
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
