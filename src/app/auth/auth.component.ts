import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth',
  imports: [
    CommonModule, // Habilita @if y pipe async
    FormsModule, // Habilita ngModel
    MatCardModule, // Tarjeta de Material
    MatFormFieldModule, // Form fields
    MatInputModule, // Inputs estilizados
    MatButtonModule, // Botones de Material
    MatIconModule, // Íconos (opcional)
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  username: string = '';
  password: string = '';
  errorMessage: string | null = null;

  /**
   * Llama a AuthService.login en lugar de HttpClient directamente.
   */
  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.authService.getState().setToken(res.token);
        // Redirige si es necesario
      },
      error: (err) => {
        console.error('Error al autenticar:', err);
        this.errorMessage = 'Usuario o contraseña inválidos';
      },
    });
  }
}
