import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/enviroment';
import { AuthService } from './auth.service';

export interface Maquina {
  id: number;
  serial: string;
  estado: string;
  recursos: string;
}

export interface Rendimiento {
  fechaHora: string;
  valor: number;
}

export interface RendimientoMaquina {
  id: number;
  maquina: Maquina;
  fecha: string;
  rendimientos: Rendimiento[];
}

@Injectable({
  providedIn: 'root',
})
export class RendimientoService {
  private baseUrl = `${environment.HOST_BACKEND}/api/rendimientos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  obtenerRendimientosMaquina(
    maquinaId: number,
    fechaInicio: Date,
    fechaFin: Date,
  ): Observable<RendimientoMaquina[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.authService.getToken()}`,
    );

    // TODO trabajar con fechas en formato ISO
    // Convertir fechas a formato ISO manteniendo la hora local (Colombia)
    // El backend espera las fechas en horario de Colombia, no UTC
    const fechaInicioISO = this.formatearFechaParaBackend(fechaInicio);
    const fechaFinISO = this.formatearFechaParaBackend(fechaFin);


    const params = `fechaInicio=${fechaInicioISO}&fechaFin=${fechaFinISO}`;

    return this.http.get<RendimientoMaquina[]>(
      `${this.baseUrl}/maquina/${maquinaId}?${params}`,
      { headers },
    );
  }

  // TODO trabajar con fechas en formato ISO
  /**
   * Formatea una fecha para enviar al backend en horario de Colombia
   * Evita la conversión automática a UTC que hace toISOString()
   */
  private formatearFechaParaBackend(fecha: Date): string {
    // Obtener componentes de fecha en zona horaria local
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    const milliseconds = String(fecha.getMilliseconds()).padStart(3, '0');

    // Formatear como ISO string sin conversión UTC
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  }
}
