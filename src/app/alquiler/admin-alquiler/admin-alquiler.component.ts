import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { Alquiler, PreviewPlan } from '../../models/alquiler.model';
import { AlquilerService } from '../../services/alquiler.service';
import { FechaLocalPipe } from '../../pipes/fecha-local.pipe';
import { DurationLabelPipe } from "../../pipes/duration-label.pipe";

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
    FechaLocalPipe,
    DurationLabelPipe
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
    Swal.fire({
      title: '¿Está seguro?',
      text: '¿Desea cerrar este alquiler?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.alquilerService.cerrarAlquiler(id).subscribe({
          next: () => {
            Swal.fire(
              '¡Cerrado!',
              'El alquiler ha sido cerrado correctamente.',
              'success',
            );
            // Emitir el evento para actualizar la lista
            this.alquileresActualizados.emit();
          },
          error: (error) => {
            Swal.fire('Error', 'No se pudo cerrar el alquiler', 'error');
          },
        });
      }
    });
  }
}
