import { Component, inject } from '@angular/core';
import { CounterService } from './counter.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-counter',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.scss',
})
export class CounterComponent {
  private counterService = inject(CounterService);
  store$ = this.counterService.useStore();
}
