// src/app/auth/auth.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  username: string = '';
  password: string = '';
  errorMessage: string | null = null;
  hidePassword: boolean = true;

  login() {
    // Limpiar mensaje de error anterior
    this.errorMessage = null;

    // Validar campos
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor complete todos los campos';
      return;
    }

    // Realizar el login (el servicio limpiará el estado anterior automáticamente)
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        // Guardar los nuevos tokens
        this.authService.setTokens(response.token, response.refreshToken);

        // Verificar el rol asignado
        const rol = this.authService.getRol();

        // Redirigir a la página principal
        this.router.navigate(['/system']);
      },
      error: (error) => {
        this.errorMessage = 'Usuario o contraseña inválidos';
        this.authService.logout(); // Limpiar el estado por seguridad
      },
    });
  }
}
