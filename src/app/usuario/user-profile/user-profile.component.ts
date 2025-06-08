import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Usuario } from '../../models/usuario.model';
import {
  Cuenta,
  CuentaService,
  Transaccion,
} from '../../services/cuenta.service';
import { Router, RouterModule } from '@angular/router';
import { FechaLocalPipe } from '../../pipes/fecha-local.pipe';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatTableModule,
    FechaLocalPipe,
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnChanges {
  @Input() perfilForm!: FormGroup;
  @Input() modoEdicion = false;
  @Input() usuario: Usuario | null = null;

  @Output() editar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  cuenta: Cuenta | null = null;
  cargandoCuenta = true;
  error: string | null = null;
  cargandoTransacciones = false;
  transacciones: Transaccion[] = [];
  columnasTransacciones = [
    'fechaTransaccion',
    'tipo',
    'monto',
    'balancePosterior',
  ];

  constructor(
    private cuentaService: CuentaService,
    private router: Router,
  ) {
    // El constructor se mantiene simple, la inicialización se hace en ngOnInit
  }

  ngOnInit(): void {
    // Retrasar la carga inicial para asegurar que las dependencias estén listas
    setTimeout(() => {
      if (this.usuario) {
        this.cargarCuenta();
        this.cargarTransacciones();
      }
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && changes['usuario'].currentValue) {
      // Asegurarnos de que el servicio está listo antes de cargar
      setTimeout(() => {
        this.cargarCuenta();
        this.cargarTransacciones();
      }, 0);
    }
  }

  cargarCuenta() {
    if (!this.usuario?.id) {
      this.cargandoCuenta = false;
      return;
    }

    this.cargandoCuenta = true;
    this.cuentaService.obtenerCuenta(this.usuario.id).subscribe({
      next: (cuenta) => {
        this.cuenta = cuenta;
        this.cargandoCuenta = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la información de la cuenta';
        console.error('Error al cargar cuenta:', err);
        this.cargandoCuenta = false;
      },
    });
  }

  cargarTransacciones() {
    if (!this.usuario?.id) {
      return;
    }

    this.cargandoTransacciones = true;
    this.cuentaService.obtenerTransacciones(this.usuario.id).subscribe({
      next: (transacciones) => {
        this.transacciones = transacciones;
        this.cargandoTransacciones = false;
      },
      error: (err) => {
        console.error('Error al cargar transacciones:', err);
        this.error = 'Error al cargar el historial de transacciones';
        this.cargandoTransacciones = false;
      },
    });
  }

  iniciarRecarga(): void {
    try {
      // Verificar que tenemos un router válido
      if (!this.router) {
        console.error('Router no está disponible');
        return;
      }

      // Verificar que tenemos una cuenta válida
      if (!this.cuenta?.cuentaId) {
        console.error('No hay información de cuenta disponible');
        return;
      }

      // Intentar la navegación
      this.router
        .navigate(['/system/pasarela-pagos'], {
          state: { cuentaId: this.cuenta.cuentaId },
        })
        .then(() => {
          console.log('Navegación exitosa a la pasarela de pagos');
        })
        .catch((error) => {
          console.error('Error al navegar:', error);
        });
    } catch (error) {
      console.error('Error al iniciar la recarga:', error);
    }
  }

  formatearTipoTransaccion(tipo: string): string {
    const tiposTransaccion: Record<string, string> = {
      RECARGA_PLATAFORMA: 'Recarga',
      PAGO_ALQUILER: 'Pago de alquiler',
      GANANCIA_ALQUILER: 'Ganancia de alquiler',
      RETIRO_WALLET: 'Retiro a wallet',
      CANCELACION_ALQUILER: 'Cancelación de alquiler',
    };
    return tiposTransaccion[tipo] || tipo;
  }

  obtenerIconoTransaccion(tipo: string): string {
    const iconos: Record<string, string> = {
      RECARGA_PLATAFORMA: 'add_circle',
      PAGO_ALQUILER: 'shopping_cart',
      GANANCIA_ALQUILER: 'trending_up',
      RETIRO_WALLET: 'account_balance_wallet',
      CANCELACION_ALQUILER: 'cancel',
    };
    return iconos[tipo] || 'monetization_on';
  }

  obtenerColorTransaccion(tipo: string): string {
    const colores: Record<string, string> = {
      RECARGA_PLATAFORMA: 'accent',
      PAGO_ALQUILER: 'warn',
      GANANCIA_ALQUILER: 'primary',
      RETIRO_WALLET: 'warn',
      CANCELACION_ALQUILER: 'warn',
    };
    return colores[tipo] || '';
  }
}
