import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { AlquilerService } from '../services/alquiler.service';
import { Alquiler, PreviewPlan } from '../models/alquiler.model';
import { AuthRolesService } from '../services/auth-roles.service';

@Component({
  selector: 'app-alquiler',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatTabsModule,
  ],
  templateUrl: './alquiler.component.html',
  styleUrl: './alquiler.component.scss',
})
export class AlquilerComponent implements OnInit {
  alquileres: Alquiler[] = [];
  previewsPlanes: PreviewPlan[] = [];
  esAdmin: boolean = false;

  // Columnas para la tabla de alquileres
  columnasAlquileres: string[] = [
    'id',
    'usuarioId',
    'maquinaId',
    'planId',
    'fechaInicio',
    'fechaFin',
    'precioAlquiler',
    'costoTotal',
    'estado',
    'montoDevuelto',
    'gananciaPlataforma',
    'acciones',
  ];

  // Columnas para la tabla de previews
  columnasPreviews: string[] = [
    'planId',
    'planNombre',
    'duracionDias',
    'gananciaPromedioDiaria',
    'precioBruto',
    'precioAlquiler',
    'gananciaMaxUsuario',
    'ingresoPlataforma',
  ];

  constructor(
    private alquilerService: AlquilerService,
    private authRolesService: AuthRolesService,
    private snackBar: MatSnackBar,
  ) {
    this.esAdmin = this.authRolesService.esAdministrador();
  }

  ngOnInit(): void {
    if (this.esAdmin) {
      this.cargarAlquileres();
      this.cargarPreviewsPlanes();
    }
  }

  cargarAlquileres(): void {
    this.alquilerService.obtenerAlquileres().subscribe({
      next: (data) => {
        this.alquileres = data;
      },
      error: (error) => {
        this.mostrarError('Error al cargar los alquileres');
      },
    });
  }

  cargarPreviewsPlanes(): void {
    this.alquilerService.obtenerPreviewTodosPlanes().subscribe({
      next: (data) => {
        this.previewsPlanes = data;
      },
      error: (error) => {
        this.mostrarError('Error al cargar la información de los planes');
      },
    });
  }

  cerrarAlquiler(id: number): void {
    if (confirm('¿Está seguro de cerrar este alquiler?')) {
      this.alquilerService.cerrarAlquiler(id).subscribe({
        next: () => {
          this.mostrarExito('Alquiler cerrado correctamente');
          this.cargarAlquileres(); // Recargar la lista
        },
        error: (error) => {
          this.mostrarError('Error al cerrar el alquiler');
        },
      });
    }
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
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
