// src/app/shared/pipes/duration-label.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'durationLabel' })
export class DurationLabelPipe implements PipeTransform {
  private readonly AVERAGE_MONTH = 30.4369;

  transform(value: number): string {
    if (value === this.AVERAGE_MONTH) {
      return '1 mes';
    }
    const days = Math.round(value);
    return `${days} día${days !== 1 ? 's' : ''}`;
  }
}
