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
      // Crear fecha sin modificar para mantener la hora local de la base de datos
      const fechaLocal = new Date(fecha);

      // Formatear la fecha usando métodos locales (no UTC)
      const dia = fechaLocal.getDate().toString().padStart(2, '0');
      const mes = (fechaLocal.getMonth() + 1).toString().padStart(2, '0');
      const año = fechaLocal.getFullYear();
      const horas = fechaLocal.getHours().toString().padStart(2, '0');
      const minutos = fechaLocal.getMinutes().toString().padStart(2, '0');
      const segundos = fechaLocal.getSeconds().toString().padStart(2, '0');

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
