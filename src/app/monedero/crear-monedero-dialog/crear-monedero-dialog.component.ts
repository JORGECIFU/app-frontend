import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-crear-monedero-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './crear-monedero-dialog.component.html',
  styleUrl: './crear-monedero-dialog.component.scss',
})
export class CrearMonederoDialogComponent {
  monederoForm: FormGroup;

  criptomonedas = [
    { codigo: 'BTC', nombre: 'Bitcoin', icono: '₿' },
    { codigo: 'ETH', nombre: 'Ethereum', icono: 'Ξ' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearMonederoDialogComponent>,
  ) {
    this.monederoForm = this.fb.group({
      alias: ['', [Validators.required, Validators.minLength(3)]],
      moneda: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.monederoForm.valid) {
      this.dialogRef.close(this.monederoForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
