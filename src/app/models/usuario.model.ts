export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  rol?: string;
  photoFileName?: string; // Nombre del archivo de la foto de perfil
}
