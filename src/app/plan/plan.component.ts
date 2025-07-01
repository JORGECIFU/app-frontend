import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Plan } from '../models/plan.model';
import { PlanService, PlanConPrecios } from '../services/plan.service';
import { AlquilerService } from '../services/alquiler.service';
import { AuthRolesService } from '../services/auth-roles.service';
import { AdminPlanComponent } from './admin-plan/admin-plan.component';
import { UserPlanComponent } from './user-plan/user-plan.component';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminPlanComponent,
    UserPlanComponent,
  ],
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
})
export class PlanComponent implements OnInit {
  planes: PlanConPrecios[] = [];
  planForm: FormGroup;
  esAdmin: boolean = false;
  modoEdicion = false;
  planEnEdicion: Plan | null = null;

  constructor(
    private planService: PlanService,
    private alquilerService: AlquilerService,
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
    this.planService.obtenerPlanesConPrecios().subscribe({
      next: (planes) => {
        this.planes = planes;
      },
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

  async crearAlquiler(plan: Plan) {
    const { value: texto } = await Swal.fire({
      title: 'Confirmar Alquiler',
      text: `Se realizará el cargo de ${this.formatearPrecio(plan.precioAlquiler || 0)} a tu cuenta. ¿Estás seguro?`,
      icon: 'warning',
      input: 'text',
      inputLabel: 'Escribe "ALQUILAR" para confirmar',
      inputPlaceholder: 'ALQUILAR',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Alquiler',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      inputValidator: (value) => {
        if (!value || value.toUpperCase() !== 'ALQUILAR') {
          return 'Debes escribir "ALQUILAR" para confirmar';
        }
        return null;
      },
    });

    if (texto) {
      this.alquilerService.crearAlquiler(plan.id!).subscribe({
        next: (alquiler) => {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Tu alquiler ha sido creado correctamente',
            icon: 'success',
            confirmButtonColor: '#28a745',
          }).then(() => {
            this.router.navigate(['/system/alquiler']);
          });
        },
        error: (error) => {
          if (error.error?.error === 'Fondos insuficientes') {
            Swal.fire({
              title: 'Fondos insuficientes',
              text: 'No tienes suficiente saldo para alquilar este plan',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Recargar Mi Saldo',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#ffd700',
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/system/usuario']);
              }
            });
          } else {
            let mensajeError = 'Ocurrió un error al crear el alquiler';
            if (error.error?.message) {
              mensajeError = error.error.message;
            }
            Swal.fire('Error', mensajeError, 'error');
          }
        },
      });
    }
  }

  private formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(precio);
  }
}
