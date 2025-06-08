import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaLocal',
  standalone: true,
})
export class FechaLocalPipe implements PipeTransform {
  transform(
    fecha: string | null | undefined,
    formato: 'short' | 'long' = 'short',
  ): string {
    if (!fecha) return '';

    try {
      // El backend envía fechas con 5 horas de más, necesitamos corregir esto
      const fechaBackend = new Date(fecha);

      // Restar 5 horas (5 * 60 * 60 * 1000 = 18000000 milisegundos)
      const fechaCorrecta = new Date(
        fechaBackend.getTime() - 5 * 60 * 60 * 1000,
      );

      // Formatear la fecha corregida
      const dia = fechaCorrecta.getDate().toString().padStart(2, '0');
      const mes = (fechaCorrecta.getMonth() + 1).toString().padStart(2, '0');
      const año = fechaCorrecta.getFullYear();
      const horas = fechaCorrecta.getHours().toString().padStart(2, '0');
      const minutos = fechaCorrecta.getMinutes().toString().padStart(2, '0');
      const segundos = fechaCorrecta.getSeconds().toString().padStart(2, '0');

      if (formato === 'long') {
        return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
      }

      return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }
}
