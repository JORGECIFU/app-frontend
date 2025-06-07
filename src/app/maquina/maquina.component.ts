import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MaquinaService } from '../services/maquina.service';
import { Maquina } from '../interfaces/maquina';
import { MatTableDataSource } from '@angular/material/table';
import { AuthRolesService } from '../services/auth-roles.service';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-maquina',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [AuthService, AuthRolesService, FormBuilder],
  templateUrl: './maquina.component.html',
  styleUrls: ['./maquina.component.scss'],
})
export class MaquinaComponent implements OnInit {
  maquinas: Maquina[] = [];
  maquinaForm: FormGroup;
  esAdmin: boolean = false;
  modoEdicion = false;
  maquinaEnEdicion: Maquina | null = null;
  filtroEstado: string = '';
  maquinasFiltradas: Maquina[] = [];
  dataSource!: MatTableDataSource<Maquina>;
  displayedColumns: string[] = ['serial', 'especificaciones', 'estado'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private maquinaService: MaquinaService,
    private fb: FormBuilder,
    private authRolesService: AuthRolesService,
    private authService: AuthService,
  ) {
    this.esAdmin = this.authRolesService.esAdministrador();
    if (this.esAdmin) {
      this.displayedColumns.push('acciones');
    }
    this.maquinaForm = this.fb.group({
      serial: ['', Validators.required],
      estado: ['DISPONIBLE', Validators.required],
      especificaciones: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.cargarMaquinas();
  }

  cargarMaquinas() {
    this.maquinaService.listarMaquinas().subscribe({
      next: (maquinas: Maquina[]) => {
        this.maquinas = maquinas;
        this.maquinasFiltradas = maquinas;
        this.aplicarFiltro();
      },
      error: (error: any) => {
        console.error('Error al obtener máquinas:', error);
      },
    });
  }

  aplicarFiltro() {
    if (!this.filtroEstado) {
      this.maquinasFiltradas = this.maquinas;
    } else {
      this.maquinasFiltradas = this.maquinas.filter(
        (maquina) => maquina.estado === this.filtroEstado,
      );
    }
    this.dataSource = new MatTableDataSource(this.maquinasFiltradas);
    this.dataSource.paginator = this.paginator;
  }

  onSubmit() {
    if (this.maquinaForm.valid) {
      const maquina: Maquina = this.maquinaForm.value;

      if (this.modoEdicion && this.maquinaEnEdicion?.id) {
        this.maquinaService
          .actualizarMaquina(this.maquinaEnEdicion.id, maquina)
          .subscribe({
            next: () => {
              this.cargarMaquinas();
              this.resetForm();
            },
            error: (error) => {
              console.error('Error al actualizar máquina:', error);
              if (error.message === 'No autorizado') {
                alert('No tiene permisos para actualizar máquinas');
              } else {
                alert(
                  'Error al actualizar la máquina. Verifique su conexión e intente nuevamente.',
                );
              }
            },
          });
      } else {
        this.maquinaService.crearMaquina(maquina).subscribe({
          next: () => {
            this.cargarMaquinas();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error al crear máquina:', error);
            if (error.message === 'No autorizado') {
              alert('No tiene permisos para crear máquinas');
            } else {
              alert(
                'Error al crear la máquina. Verifique su conexión e intente nuevamente.',
              );
            }
          },
        });
      }
    }
  }

  editarMaquina(maquina: Maquina) {
    this.modoEdicion = true;
    this.maquinaEnEdicion = maquina;
    this.maquinaForm.patchValue(maquina);
  }

  eliminarMaquina(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esta acción!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.maquinaService.eliminarMaquina(id).subscribe({
          next: () => {
            this.cargarMaquinas();
            Swal.fire(
              '¡Eliminado!',
              'La máquina ha sido eliminada correctamente.',
              'success',
            );
          },
          error: (error) => {
            console.error('Error al eliminar máquina:', error);
            Swal.fire({
              title: 'Error',
              text:
                error.message === 'No autorizado'
                  ? 'No tiene permisos para eliminar máquinas'
                  : 'Error al eliminar la máquina. Verifique su conexión e intente nuevamente.',
              icon: 'error',
            });
          },
        });
      }
    });
  }

  resetForm() {
    this.modoEdicion = false;
    this.maquinaEnEdicion = null;
    this.maquinaForm.reset({
      estado: 'DISPONIBLE',
    });
  }
}
