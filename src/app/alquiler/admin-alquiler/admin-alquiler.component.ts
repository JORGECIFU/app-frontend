import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Alquiler, PreviewPlan } from '../../models/alquiler.model';
import { AlquilerService } from '../../services/alquiler.service';

@Component({
  selector: 'app-admin-alquiler',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-alquiler.component.html',
  styleUrls: ['./admin-alquiler.component.scss'],
})
export class AdminAlquilerComponent {
  @Input() alquileres: Alquiler[] = [];
  @Input() previewsPlanes: PreviewPlan[] = [];

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
    private snackBar: MatSnackBar,
  ) {}

  @Output() alquileresActualizados = new EventEmitter<void>();

  cerrarAlquiler(id: number): void {
    if (confirm('¿Está seguro de cerrar este alquiler?')) {
      this.alquilerService.cerrarAlquiler(id).subscribe({
        next: () => {
          this.mostrarExito('Alquiler cerrado correctamente');
          this.alquileresActualizados.emit();
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
