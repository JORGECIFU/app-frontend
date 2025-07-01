import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpRequest,
  HttpResponse,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/enviroment';
import { AuthService } from './auth.service';
import { v4 as uuidv4 } from 'uuid';

export interface PhotoUploadResponse {
  fileName: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfilePhotoService {
  private baseUrl = `${environment.apiUrl}/profile-photos`;
  private currentFileName = new BehaviorSubject<string>('');

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  /**
   * Genera un nombre de archivo único con UUID
   * @param file Archivo original
   * @returns Nombre único del archivo con extensión
   */
  private generarNombreUnico(file: File): string {
    const extension = file.name.split('.').pop() || '';
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}.${extension}`;
    this.currentFileName.next(fileName);
    return fileName;
  }

  /**
   * Obtiene los headers de autorización usando el AuthService
   * @returns HttpHeaders con el token Bearer
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Extrae la URL firmada del mensaje de respuesta
   * @param response Respuesta del servidor
   * @returns URL firmada y nombre del archivo
   */
  extraerUrlFirmada(response: string): { url: string; fileName: string } {
    const match = response.match(/URL: (https:\/\/[^\s]+)/);
    return {
      url: match ? match[1] : '',
      fileName: this.currentFileName.value,
    };
  }

  /**
   * Obtiene el último nombre de archivo generado
   * @returns Nombre del archivo
   */
  obtenerNombreArchivo(): string {
    return this.currentFileName.value;
  }

  /**
   * Sube una foto de perfil
   * @param file Archivo de imagen a subir
   * @returns Observable con el progreso de la subida y la URL firmada
   */
  subirFoto(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    const fileName = this.generarNombreUnico(file);

    formData.append('file', file);
    formData.append('fileName', fileName);

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      headers: this.getAuthHeaders(),
      reportProgress: true,
      responseType: 'text',
    });

    return this.http.request(req);
  }

  /**
   * Obtiene los datos binarios de la foto de perfil
   * @param fileName Nombre del archivo
   * @returns Observable con los datos binarios de la imagen
   */
  obtenerUrlFoto(fileName: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${fileName}`, {
      responseType: 'blob',
    });
  }

  /**
   * Elimina una foto de perfil
   * @param fileName Nombre del archivo a eliminar
   * @returns Observable de la operación
   */
  eliminarFoto(fileName: string): Observable<string> {
    this.currentFileName.next('');
    return this.http.delete(`${this.baseUrl}/delete/${fileName}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text',
    });
  }
}
