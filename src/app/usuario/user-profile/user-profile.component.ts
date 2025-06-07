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
import { Usuario } from '../../models/usuario.model';
import { CuentaService, Cuenta } from '../../services/cuenta.service';
import { Router, RouterModule } from '@angular/router';

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
  ],
  providers: [CuentaService],
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

  constructor(
    private cuentaService: CuentaService,
    private router: Router,
  ) {
    if (!this.cuentaService) {
      console.error('CuentaService no está inyectado correctamente');
    }
    if (!this.router) {
      console.error('Router no está inyectado correctamente');
    }
  }

  ngOnInit(): void {
    if (this.usuario) {
      this.cargarCuenta();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && changes['usuario'].currentValue) {
      this.cargarCuenta();
    }
  }

  cargarCuenta() {
    if (!this.usuario?.id) {
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
        this.cargandoCuenta = false;
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
}
