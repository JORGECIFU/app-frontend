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
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-pasarela-pagos',
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './pasarela-pagos.component.html',
  styleUrl: './pasarela-pagos.component.scss',
  standalone: true,
})
export class PasarelaPagosComponent implements OnInit {
  datosPersonalesFormGroup!: FormGroup;
  datosTarjetaFormGroup!: FormGroup;
  pagoCompletado: boolean = false;

  constructor(private _formBuilder: FormBuilder) {}

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
      // Simulamos un tiempo de procesamiento
      setTimeout(() => {
        this.pagoCompletado = true;
        stepper.next();
      }, 1000);
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
}
