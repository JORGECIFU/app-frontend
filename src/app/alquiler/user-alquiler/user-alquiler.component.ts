import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { AlquilerService } from '../../services/alquiler.service';
import { PlanService } from '../../services/plan.service';
import { Alquiler } from '../../models/alquiler.model';
import { Plan } from '../../models/plan.model';
import { FechaLocalPipe } from '../../pipes/fecha-local.pipe';
import { RendimientoDetalleComponent } from '../rendimiento-detalle/rendimiento-detalle.component';

@Component({
  selector: 'app-user-alquiler',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FechaLocalPipe,
  ],
  templateUrl: './user-alquiler.component.html',
  styleUrls: ['./user-alquiler.component.scss'],
})
export class UserAlquilerComponent implements OnInit {
  alquileresActivos: Alquiler[] = [];
  alquileresCerrados: Alquiler[] = [];
  planes: Plan[] = [];
  usuarioId?: number;
  cargando = true;
  error: string | null = null;

  constructor(
    private alquilerService: AlquilerService,
    private planService: PlanService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarioYCargarDatos();
  }

  obtenerUsuarioYCargarDatos(): void {
    this.cargando = true;
    this.alquilerService.obtenerUsuarioActual().subscribe({
      next: (usuario) => {
        this.usuarioId = usuario.id;
        this.cargarPlanesYAlquileres();
      },
      error: (error) => {
        console.error('Error al obtener usuario:', error);
        this.error = 'No se pudo obtener la información del usuario';
        this.cargando = false;
      },
    });
  }

  cargarPlanesYAlquileres(): void {
    if (!this.usuarioId) {
      this.error = 'No se pudo identificar al usuario';
      this.cargando = false;
      return;
    }

    forkJoin({
      planes: this.planService.obtenerTodosLosPlanes(),
      activos: this.alquilerService.obtenerAlquileresActivos(this.usuarioId),
      cerrados: this.alquilerService.obtenerAlquileresCerrados(this.usuarioId),
    }).subscribe({
      next: (result) => {
        this.planes = result.planes;
        this.alquileresActivos = result.activos;
        this.alquileresCerrados = result.cerrados;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.error = 'No se pudieron cargar los datos';
        this.cargando = false;
      },
    });
  }

  obtenerNombrePlan(planId: number): string {
    const plan = this.planes.find((p) => p.id === planId);
    return plan ? plan.nombre : 'Plan no encontrado';
  }

  irAPlanes(): void {
    this.router.navigate(['/system/plan']);
  }

  irAPerfil(): void {
    this.router.navigate(['/system/usuario']);
  }

  verDetallesRendimiento(alquiler: Alquiler): void {
    this.dialog.open(RendimientoDetalleComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '80vh',
      maxHeight: '800px',
      data: {
        alquiler,
        maquinaId: alquiler.maquinaId,
      },
    });
  }
}
