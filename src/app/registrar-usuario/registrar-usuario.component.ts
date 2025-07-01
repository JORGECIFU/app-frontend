import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RegistroService } from '../services/registro.service';


@Component({
  selector: 'app-registrar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDividerModule,
    RouterModule,
  ],
  templateUrl: './registrar-usuario.component.html',
  styleUrl: './registrar-usuario.component.scss',
})
export class RegistrarUsuarioComponent implements OnInit {
  registroForm!: FormGroup;
  hidePassword = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/), // Al menos una mayúscula, una minúscula y un número
        ],
      ],
    });
  }

  onSubmit() {
    if (this.registroForm.valid) {
      this.registroService.registrarUsuario(this.registroForm.value).subscribe({
        next: () => {
          // Registro exitoso, redirigir al login
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error en el registro:', error);
          this.errorMessage =
            'Error al registrar el usuario. Por favor, intente nuevamente.';
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          }
        },
      });
    }
  }
}
