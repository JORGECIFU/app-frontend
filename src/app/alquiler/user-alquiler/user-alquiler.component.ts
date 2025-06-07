import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-alquiler',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './user-alquiler.component.html',
  styleUrls: ['./user-alquiler.component.scss'],
})
export class UserAlquilerComponent {
  // El componente se mantendrá simple hasta que se implementen las funcionalidades
}
