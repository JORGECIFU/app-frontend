import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule, MatTabGroup } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Usuario } from '../../models/usuario.model';
import { CuentaService, Cuenta } from '../../services/cuenta.service';
import { Router } from '@angular/router';
import { TabService } from '../../services/tab.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit, OnChanges {
  @Input() perfilForm!: FormGroup;
  @Input() modoEdicion = false;
  @Input() usuario: Usuario | null = null;

  @Output() editar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  cuenta: Cuenta | null = null;
  cargandoCuenta = true;
  error: string | null = null;

  constructor(
    private cuentaService: CuentaService,
    private router: Router,
    public tabService: TabService,
  ) {}

  ngOnInit() {
    if (this.usuario) {
      this.cargarCuenta();
    }

    // Suscribirse a los cambios del índice de pestaña
    this.tabService.selectedTabIndex$.subscribe((index) => {
      if (this.matTabGroup) {
        this.matTabGroup.selectedIndex = index;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['usuario'] && changes['usuario'].currentValue) {
      this.cargarCuenta();
    }
  }

  @ViewChild(MatTabGroup) matTabGroup!: MatTabGroup;

  cargarCuenta() {
    if (!this.usuario?.id) {
      return;
    }

    this.cargandoCuenta = true;
    this.cuentaService.obtenerCuenta(this.usuario.id).subscribe({
      next: (cuenta) => {
        this.cuenta = cuenta;
        this.cargandoCuenta = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la información de la cuenta';
        this.cargandoCuenta = false;
      },
    });
  }

  iniciarRecarga() {
    this.router.navigate(['/system/pasarela-pagos'], {
      state: { cuentaId: this.cuenta?.cuentaId },
    });
  }
}
