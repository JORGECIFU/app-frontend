import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatStepper } from '@angular/material/stepper';
import { CuentaService } from '../services/cuenta.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pasarela-pagos',
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatSnackBarModule,
  ],
  templateUrl: './pasarela-pagos.component.html',
  styleUrl: './pasarela-pagos.component.scss',
  standalone: true,
})
export class PasarelaPagosComponent implements OnInit {
  datosPersonalesFormGroup!: FormGroup;
  datosTarjetaFormGroup!: FormGroup;
  pagoCompletado: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private router: Router,
    private cuentaService: CuentaService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.datosPersonalesFormGroup = this._formBuilder.group({
      nombreCtrl: ['', Validators.required],
      emailCtrl: ['', [Validators.required, Validators.email]],
      documentoCtrl: ['', Validators.required],
    });
    this.datosTarjetaFormGroup = this._formBuilder.group({
      montoCtrl: [
        '',
        [
          Validators.required,
          Validators.min(0.01),
          Validators.pattern(/^\d+(\.\d{0,2})?$/),
        ],
      ],
      numeroTarjetaCtrl: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{16}$')],
      ],
      fechaExpiracionCtrl: [
        '',
        [
          Validators.required,
          Validators.pattern('^(0[1-9]|1[0-2])\/?([0-9]{2})$'),
        ],
      ],
      cvvCtrl: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
    });
  }

  procesarPago(stepper: MatStepper) {
    if (this.datosTarjetaFormGroup.valid) {
      const montoStr = this.datosTarjetaFormGroup.get('montoCtrl')?.value;
      const monto = parseFloat(montoStr);

      if (isNaN(monto) || monto <= 0) {
        this.snackBar.open('El monto debe ser mayor a 0', 'Cerrar', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
        return;
      }

      this.cuentaService
        .realizarTransaccion({
          tipo: 'RECARGA_PLATAFORMA',
          monto: Number(monto.toFixed(2)), // Aseguramos 2 decimales y tipo number
        })
        .subscribe({
          next: () => {
            this.pagoCompletado = true;
            stepper.next();
            this.snackBar.open('¡Pago procesado exitosamente!', 'Cerrar', {
              duration: 5000,
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            });
          },
          error: (error) => {
            console.error('Error al procesar el pago:', error);
            let mensajeError =
              'Error al procesar el pago. Por favor, intente nuevamente.';
            if (error.error?.message) {
              mensajeError = error.error.message;
            }
            this.snackBar.open(mensajeError, 'Cerrar', {
              duration: 5000,
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
          },
        });
    }
  }

  formatearMonto(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Si el valor es vacío o no es un número, no hacemos nada
    if (!value || isNaN(Number(value))) return;

    // Limitamos a dos decimales
    if (value.includes('.') && value.split('.')[1]?.length > 2) {
      value = Number(value).toFixed(2);
      this.datosTarjetaFormGroup.patchValue(
        {
          montoCtrl: value,
        },
        { emitEvent: false },
      );
    }
  }

  volverAMiSaldo() {
    this.router.navigate(['/system/usuario']);
  }
}
