import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  Monedero,
  MonederoService,
  TransaccionMonederoRequest,
} from '../../services/monedero.service';
import { CuentaService, Cuenta } from '../../services/cuenta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-monedero-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './monedero-detalle.component.html',
  styleUrl: './monedero-detalle.component.scss',
})
export class MonederoDetalleComponent implements OnInit {
  monederoId!: number;
  monedero: Monedero | null = null;
  cuenta: Cuenta | null = null;
  cargando = true;
  error: string | null = null;

  // Formularios
  formRecargaDesdeP: FormGroup;
  formPasoAP: FormGroup;

  // Estado de las transacciones
  procesandoRecarga = false;
  procesandoPaso = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private monederoService: MonederoService,
    private cuentaService: CuentaService,
    private fb: FormBuilder,
  ) {
    // Inicializar formularios
    this.formRecargaDesdeP = this.fb.group({
      usdAmount: [
        '',
        [Validators.required, Validators.min(1), Validators.max(10000)],
      ],
    });

    this.formPasoAP = this.fb.group({
      cryptoAmount: [
        '',
        [Validators.required, Validators.min(0.000001), Validators.max(1000)],
      ],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.monederoId = +params['id'];
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    Promise.all([this.cargarMonederos(), this.cargarCuenta()]).finally(() => {
      this.cargando = false;
    });
  }

  private async cargarMonederos(): Promise<void> {
    try {
      const monederos =
        (await this.monederoService.obtenerMonederos().toPromise()) || [];
      this.monedero =
        monederos.find((m) => m.monederoId === this.monederoId) || null;

      if (!this.monedero) {
        this.error = 'Monedero no encontrado';
      }
    } catch (error) {
      console.error('Error al cargar monedero:', error);
      this.error = 'Error al cargar el monedero';
    }
  }

  private async cargarCuenta(): Promise<void> {
    try {
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
    }
  }

  recargarDesdeP(): void {
    if (!this.formRecargaDesdeP.valid || !this.monedero) return;

    const transaccion: TransaccionMonederoRequest = {
      tipo: 'RECARGA_DESDE_PLATAFORMA',
      usdAmount: this.formRecargaDesdeP.value.usdAmount,
    };

    this.procesandoRecarga = true;

    this.monederoService
      .realizarTransaccion(this.monederoId, transaccion)
      .subscribe({
        next: () => {
          Swal.fire({
            title: '¡Éxito!',
            text: `Se transfirieron $${transaccion.usdAmount} USD desde tu cuenta de plataforma al monedero`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
          this.formRecargaDesdeP.reset();
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error en recarga:', error);
          Swal.fire({
            title: 'Error',
            text: error.error?.message || 'No se pudo realizar la transacción',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
        complete: () => {
          this.procesandoRecarga = false;
        },
      });
  }

  pasarAP(): void {
    if (!this.formPasoAP.valid || !this.monedero) return;

    const transaccion: TransaccionMonederoRequest = {
      tipo: 'PASO_A_PLATAFORMA',
      cryptoAmount: this.formPasoAP.value.cryptoAmount,
    };

    this.procesandoPaso = true;

    this.monederoService
      .realizarTransaccion(this.monederoId, transaccion)
      .subscribe({
        next: () => {
          Swal.fire({
            title: '¡Éxito!',
            text: `Se transfirieron ${transaccion.cryptoAmount} ${this.monedero?.moneda} desde el monedero a tu cuenta de plataforma`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
          this.formPasoAP.reset();
          this.cargarDatos();
        },
        error: (error) => {
          console.error('Error en paso a plataforma:', error);
          Swal.fire({
            title: 'Error',
            text: error.error?.message || 'No se pudo realizar la transacción',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        },
        complete: () => {
          this.procesandoPaso = false;
        },
      });
  }

  volver(): void {
    this.router.navigate(['/system/monedero']);
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
