// src/app/auth/auth.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
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
  hidePassword: boolean = true; // Controla la visibilidad de la contraseña

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        // ① Guardar ambos tokens en el store
        this.authService.getState().setTokens(res.token, res.refreshToken);
        // ② Redirigir (por ejemplo a /system)
        this.router.navigate(['/system']);
      },
      error: (err) => {
        console.error('Error al autenticar:', err);
        this.errorMessage = 'Usuario o contraseña inválidos';
      },
    });
  }
}
