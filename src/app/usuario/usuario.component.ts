import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthRolesService } from '../services/auth-roles.service';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdminProfileComponent } from './admin-profile/admin-profile.component';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, UserProfileComponent, AdminProfileComponent],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss',
})
export class UsuarioComponent implements OnInit {
  perfilForm: FormGroup;
  adminForm: FormGroup;
  usuario: Usuario | null = null;
  usuarios = new MatTableDataSource<Usuario>([]);
  modoEdicion = false;
  esAdmin = false;
  displayedColumns = ['id', 'nombre', 'apellido', 'email', 'rol', 'acciones'];

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private authRolesService: AuthRolesService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.esAdmin = this.authRolesService.esAdministrador();

    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.adminForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
    this.cargarPerfil();
    if (this.esAdmin) {
      this.cargarUsuarios();
    }
  }

  cargarPerfil() {
    this.usuarioService.obtenerMiPerfil().subscribe({
      next: (usuario: Usuario) => {
        this.usuario = usuario;
        this.perfilForm.patchValue({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
        });
      },
      error: (error: unknown) => {
        console.error('Error al cargar perfil:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la información del perfil',
          icon: 'error',
        });
      },
    });
  }

  toggleEdicion() {
    this.modoEdicion = !this.modoEdicion;
    if (!this.modoEdicion) {
      this.cargarPerfil(); // Recargar datos originales si se cancela la edición
    }
  }

  guardarCambios() {
    if (this.perfilForm.valid && this.usuario?.id) {
      const usuarioActualizado = this.perfilForm.value;
      this.usuarioService
        .actualizarPerfil(this.usuario.id, usuarioActualizado)
        .subscribe({
          next: (response: Usuario) => {
            this.usuario = response;
            this.modoEdicion = false;
            Swal.fire({
              title: '¡Éxito!',
              text: 'Perfil actualizado correctamente',
              icon: 'success',
            });
          },
          error: (error: unknown) => {
            console.error('Error al actualizar perfil:', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo actualizar el perfil',
              icon: 'error',
            });
          },
        });
    }
  }

  iniciarProcesoEliminacion() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará permanentemente tu cuenta. Escribe ELIMINAR para confirmar.',
      input: 'text',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar cuenta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      showLoaderOnConfirm: true,
      preConfirm: (texto) => {
        if (texto !== 'ELIMINAR') {
          Swal.showValidationMessage(
            'Por favor escribe ELIMINAR para confirmar',
          );
          return false;
        }
        return true;
      },
    }).then((result) => {
      if (result.isConfirmed && this.usuario?.id) {
        this.eliminarCuenta();
      }
    });
  }

  private eliminarCuenta() {
    if (this.usuario?.id) {
      this.usuarioService.eliminarCuenta(this.usuario.id).subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/']);
          Swal.fire({
            title: 'Cuenta eliminada',
            text: 'Tu cuenta ha sido eliminada correctamente',
            icon: 'success',
          });
        },
        error: (error: unknown) => {
          console.error('Error al eliminar cuenta:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar la cuenta',
            icon: 'error',
          });
        },
      });
    }
  }

  cargarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios.data = usuarios;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los usuarios',
          icon: 'error',
        });
      },
    });
  }

  crearAdministrador() {
    if (this.adminForm.valid) {
      this.usuarioService.crearAdministrador(this.adminForm.value).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Administrador creado correctamente',
            icon: 'success',
          });
          this.adminForm.reset();
          this.cargarUsuarios();
        },
        error: (error: unknown) => {
          console.error('Error al crear administrador:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear el administrador',
            icon: 'error',
          });
        },
      });
    }
  }

  promoverAAdministrador(usuario: Usuario) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Al promover a este usuario a administrador, su cuenta de fondos será eliminada. Asegúrate de que no tenga fondos pendientes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, promover',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed && usuario.id) {
        this.usuarioService.promoverAAdministrador(usuario.id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Promovido!',
              text: 'El usuario ha sido promovido a administrador',
              icon: 'success',
            });
            this.cargarUsuarios();
          },
          error: (error: unknown) => {
            console.error('Error al promover usuario:', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo promover al usuario',
              icon: 'error',
            });
          },
        });
      }
    });
  }
}
