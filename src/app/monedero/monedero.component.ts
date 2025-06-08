import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Monedero, MonederoService } from '../services/monedero.service';
import { CuentaService, Cuenta } from '../services/cuenta.service';

import Swal from 'sweetalert2';
import { CrearMonederoDialogComponent } from './crear-monedero-dialog/crear-monedero-dialog.component';

@Component({
  selector: 'app-monedero',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './monedero.component.html',
  styleUrl: './monedero.component.scss',
})
export class MonederoComponent implements OnInit {
  monederos: Monedero[] = [];
  cuenta: Cuenta | null = null;
  cargando = true;
  error: string | null = null;

  constructor(
    private monederoService: MonederoService,
    private cuentaService: CuentaService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    // Cargar monederos y cuenta en paralelo
    Promise.all([this.cargarMonederos(), this.cargarCuenta()]).finally(() => {
      this.cargando = false;
    });
  }

  private async cargarMonederos(): Promise<void> {
    try {
      this.monederos =
        (await this.monederoService.obtenerMonederos().toPromise()) || [];
    } catch (error) {
      console.error('Error al cargar monederos:', error);
      this.error = 'Error al cargar los monederos';
    }
  }

  private async cargarCuenta(): Promise<void> {
    try {
      // Primero obtenemos el usuario actual
      const usuario = await this.cuentaService
        .obtenerUsuarioActual()
        .toPromise();
      if (usuario?.id) {
        this.cuenta =
          (await this.cuentaService.obtenerCuenta(usuario.id).toPromise()) ||
          null;
      }
    } catch (error) {
      console.error('Error al cargar cuenta:', error);
      this.error = 'Error al cargar la información de la cuenta';
    }
  }

  abrirDialogoCrearMonedero(): void {
    const dialogRef = this.dialog.open(CrearMonederoDialogComponent, {
      width: '400px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.crearMonedero(resultado);
      }
    });
  }

  private crearMonedero(datosMonedero: {
    alias: string;
    moneda: string;
  }): void {
    this.monederoService.crearMonedero(datosMonedero).subscribe({
      next: (monedero) => {
        this.monederos.push(monedero);
        Swal.fire({
          title: '¡Éxito!',
          text: 'Monedero creado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
      },
      error: (error) => {
        console.error('Error al crear monedero:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo crear el monedero',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  verDetalleMonedero(monedero: Monedero): void {
    this.router.navigate(['/system/monedero', monedero.monederoId]);
  }

  getCriptoInfo(moneda: string) {
    return (
      this.monederoService.getCriptoInfo()[moneda] || {
        nombre: moneda,
        icono: '¤',
        color: '#666',
      }
    );
  }
}
