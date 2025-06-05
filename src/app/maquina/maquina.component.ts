import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MaquinaService } from '../services/maquina.service';
import { Maquina } from '../models/maquina.model';

@Component({
  selector: 'app-maquina',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './maquina.component.html',
  styleUrl: './maquina.component.scss',
})
export class MaquinaComponent implements OnInit {
  maquinas: Maquina[] = [];
  maquinaForm: FormGroup;
  esAdmin: boolean = false;
  modoEdicion = false;
  maquinaEnEdicion: Maquina | null = null;

  constructor(
    private maquinaService: MaquinaService,
    private fb: FormBuilder,
  ) {
    this.esAdmin = this.maquinaService.esAdministrador();
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
    this.maquinaService.obtenerTodasLasMaquinas().subscribe({
      next: (maquinas) => (this.maquinas = maquinas),
      error: (error) => {
        console.error('Error al cargar máquinas:', error);
        alert('Error al cargar las máquinas. Por favor, intente nuevamente.');
      },
    });
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
    if (confirm('¿Está seguro de eliminar esta máquina?')) {
      this.maquinaService.eliminarMaquina(id).subscribe({
        next: () => this.cargarMaquinas(),
        error: (error) => {
          console.error('Error al eliminar máquina:', error);
          if (error.message === 'No autorizado') {
            alert('No tiene permisos para eliminar máquinas');
          } else {
            alert(
              'Error al eliminar la máquina. Verifique su conexión e intente nuevamente.',
            );
          }
        },
      });
    }
  }

  resetForm() {
    this.modoEdicion = false;
    this.maquinaEnEdicion = null;
    this.maquinaForm.reset({
      estado: 'DISPONIBLE',
    });
  }
}
