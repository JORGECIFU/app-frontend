import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { AdminAlquilerComponent } from './admin-alquiler/admin-alquiler.component';
import { UserAlquilerComponent } from './user-alquiler/user-alquiler.component';
import { AlquilerService } from '../services/alquiler.service';
import { AuthRolesService } from '../services/auth-roles.service';
import { Alquiler, PreviewPlan } from '../models/alquiler.model';

@Component({
  selector: 'app-alquiler',
  standalone: true,
  imports: [CommonModule, AdminAlquilerComponent, UserAlquilerComponent],
  template: `
    @if (esAdmin) {
      <app-admin-alquiler
        [alquileres]="alquileres"
        [previewsPlanes]="previewsPlanes"
      >
      </app-admin-alquiler>
    } @else {
      <app-user-alquiler> </app-user-alquiler>
    }
  `,
})
export class AlquilerComponent implements OnInit {
  alquileres: Alquiler[] = [];
  previewsPlanes: PreviewPlan[] = [];
  esAdmin: boolean = false;
  planId?: number;

  constructor(
    private alquilerService: AlquilerService,
    private authRolesService: AuthRolesService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.esAdmin = this.authRolesService.esAdministrador();
  }

  ngOnInit(): void {
    if (this.esAdmin) {
      this.cargarDatosAdmin();
    } else {
      this.procesarQueryParams();
    }
  }

  private cargarDatosAdmin(): void {
    this.alquilerService.obtenerAlquileres().subscribe({
      next: (alquileres) => {
        this.alquileres = alquileres;
      },
      error: (error) => {
        this.mostrarError('Error al cargar los alquileres');
      },
    });

    this.alquilerService.obtenerPreviewTodosPlanes().subscribe({
      next: (previews) => {
        this.previewsPlanes = previews;
      },
      error: (error) => {
        this.mostrarError('Error al cargar la información de los planes');
      },
    });
  }

  private procesarQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      const planIdParam = params['planId'];
      this.planId = planIdParam ? Number(planIdParam) : undefined;
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }
}
