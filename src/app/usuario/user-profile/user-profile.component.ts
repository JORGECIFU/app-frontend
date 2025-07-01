import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ElementRef,
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { FechaLocalPipe } from '../../pipes/fecha-local.pipe';
import { PrecioPipe } from '../../pipes/precio.pipe';
import { PrecioCopPipe } from '../../pipes/precio-cop.pipe';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { Usuario } from '../../models/usuario.model';
import { ProfilePhotoService } from '../../services/profile-photo.service';
import {
  Cuenta,
  CuentaService,
  Transaccion,
} from '../../services/cuenta.service';

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
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    RouterModule,
    FechaLocalPipe,
    PrecioPipe,
    PrecioCopPipe,
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnChanges, OnDestroy {
  @Input() perfilForm!: FormGroup;
  @Input() modoEdicion = false;
  @Input() usuario: Usuario | null = null;

  @Output() actualizarFoto = new EventEmitter<{
    fileName: string | null;
    url: string | null;
  }>();
  @Output() editar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();

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

  // Propiedades para la gestión de fotos de perfil
  uploadProgress: number = 0;
  photoUrl: string | null = null;
  currentPhotoName: string | null = null;
  uploading: boolean = false;

  @ViewChild('inputFile', { static: false }) inputFile!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Propiedades para la foto de perfil
  fotoSeleccionada: File | null = null;
  progreso: number = 0;
  subiendoFoto = false;
  urlFoto: string | null = null;

  // Propiedad para manejar la URL temporal actual
  private currentPhotoUrl: string | null = null;

  constructor(
    private cuentaService: CuentaService,
    private router: Router,
    private photoService: ProfilePhotoService,
  ) {
    // El constructor se mantiene simple, la inicialización se hace en ngOnInit
  }

  ngOnInit(): void {
    // Retrasar la carga inicial para asegurar que las dependencias estén listas
    setTimeout(() => {
      if (this.usuario) {
        this.cargarCuenta();
        this.cargarTransacciones();
        this.cargarFotoPerfilDesdeUsuario();
      }
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && changes['usuario'].currentValue) {
      // Asegurarnos de que el servicio está listo antes de cargar
      setTimeout(() => {
        this.cargarCuenta();
        this.cargarTransacciones();
        this.cargarFotoPerfilDesdeUsuario();
      }, 0);
    }
  }

  /**
   * Carga la foto de perfil usando el photoFileName del usuario
   */
  private cargarFotoPerfilDesdeUsuario(): void {
    if (
      this.usuario?.photoFileName &&
      (!this.currentPhotoName ||
        this.currentPhotoName !== this.usuario.photoFileName)
    ) {
      this.currentPhotoName = this.usuario.photoFileName;
      this.cargarFotoPerfil();
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

  cargarFotoPerfil(): void {
    if (this.currentPhotoName) {
      this.photoService.obtenerUrlFoto(this.currentPhotoName).subscribe({
        next: (blob: Blob) => {
          // Limpiar la URL anterior si existe
          if (this.currentPhotoUrl) {
            URL.revokeObjectURL(this.currentPhotoUrl);
          }
          // Crear una nueva URL para el blob
          this.currentPhotoUrl = URL.createObjectURL(blob);
          this.photoUrl = this.currentPhotoUrl;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar la foto de perfil:', error);
          this.photoUrl = null;
          this.currentPhotoName = null;
          this.actualizarFoto.emit({ fileName: null, url: null });
        },
      });
    }
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

  /**
   * Maneja la subida de una nueva foto de perfil
   * @param event Evento del input file
   */
  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        // TODO: Mostrar mensaje de error
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        // TODO: Mostrar mensaje de error
        return;
      }

      this.uploading = true;
      this.uploadProgress = 0;

      this.photoService.subirFoto(file).subscribe({
        next: (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              if (event.total) {
                this.uploadProgress = Math.round(
                  (100 * event.loaded) / event.total,
                );
              }
              break;
            case HttpEventType.Response:
              if (event instanceof HttpResponse) {
                const { url, fileName } = this.photoService.extraerUrlFirmada(
                  event.body,
                );
                if (url && fileName) {
                  this.currentPhotoName = fileName;
                  if (this.currentPhotoUrl) {
                    URL.revokeObjectURL(this.currentPhotoUrl);
                  }
                  // Para la foto recién subida, usamos la URL firmada directamente
                  this.photoUrl = url;

                  // Actualizar el usuario con el nuevo nombre de archivo
                  if (this.usuario) {
                    this.usuario.photoFileName = fileName;
                  }

                  // Emitir el evento para actualizar en el padre
                  this.actualizarFoto.emit({ fileName, url });
                }
              }
              this.uploading = false;
              break;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al subir la foto:', error);
          this.uploading = false;
          // TODO: Mostrar mensaje de error
        },
      });
    }
  }

  /**
   * Elimina la foto de perfil actual
   */
  eliminarFoto(): void {
    if (this.currentPhotoName) {
      this.photoService.eliminarFoto(this.currentPhotoName).subscribe({
        next: () => {
          if (this.currentPhotoUrl) {
            URL.revokeObjectURL(this.currentPhotoUrl);
          }
          this.currentPhotoUrl = null;
          this.photoUrl = null;
          this.currentPhotoName = null;

          // Actualizar el usuario eliminando la referencia a la foto
          if (this.usuario) {
            this.usuario.photoFileName = undefined;
          }

          this.actualizarFoto.emit({ fileName: null, url: null });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al eliminar la foto:', error);
          // TODO: Mostrar mensaje de error
        },
      });
    }
  }

  // Limpiar recursos al destruir el componente
  ngOnDestroy(): void {
    // Limpiar las URLs temporales al destruir el componente
    if (this.currentPhotoUrl) {
      URL.revokeObjectURL(this.currentPhotoUrl);
    }
  }
}
