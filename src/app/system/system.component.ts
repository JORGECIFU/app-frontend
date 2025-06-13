import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { UsuarioService, Usuario } from '../services/usuario.service';
import { CuentaService, Cuenta } from '../services/cuenta.service';
import { PrecioPipe } from '../pipes/precio.pipe';

@Component({
  selector: 'app-system',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatDividerModule,
    PrecioPipe,
  ],
  templateUrl: './system.component.html',
  styleUrl: './system.component.scss',
})
export class SystemComponent implements OnInit {
  isExpanded = true;
  rol: string = '';
  usuario: Usuario | null = null;
  cuenta: Cuenta | null = null;
  cargandoUsuario = true;
  cargandoCuenta = true;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private cuentaService: CuentaService,
  ) {
    // Obtener el rol del token
    const token = this.authService.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.rol = payload.rol;
    }
  }

  ngOnInit() {
    this.cargarPerfilUsuario();
  }

  cargarPerfilUsuario() {
    this.usuarioService.obtenerMiPerfil().subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.cargandoUsuario = false;

        // Si es usuario, cargar también su cuenta para mostrar el saldo
        if (this.rol === 'USUARIO' && usuario.id) {
          this.cargarCuentaUsuario(usuario.id);
        } else {
          this.cargandoCuenta = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
        this.cargandoUsuario = false;
        this.cargandoCuenta = false;
      },
    });
  }

  cargarCuentaUsuario(usuarioId: number) {
    this.cuentaService.obtenerCuenta(usuarioId).subscribe({
      next: (cuenta) => {
        this.cuenta = cuenta;
        this.cargandoCuenta = false;
      },
      error: (error) => {
        console.error('Error al cargar cuenta:', error);
        this.cargandoCuenta = false;
      },
    });
  }

  toggleSidenav() {
    this.isExpanded = !this.isExpanded;
  }
}
