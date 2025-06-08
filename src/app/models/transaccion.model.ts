export type TipoTransaccion =
  | 'RECARGA_PLATAFORMA'
  | 'PAGO_ALQUILER'
  | 'GANANCIA_ALQUILER'
  | 'RETIRO_WALLET'
  | 'CANCELACION_ALQUILER';

export interface Transaccion {
  id: number;
  tipo: TipoTransaccion;
  monto: number;
  fechaTransaccion: string;
  balancePosterior: number;
}
