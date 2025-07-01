import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  LineData,
  LineStyleOptions,
  DeepPartial,
  ChartOptions,
  LineSeries,
} from 'lightweight-charts';
import { Subject, takeUntil } from 'rxjs';
import {
  RendimientoService,
  RendimientoMaquina,
} from '../../services/rendimiento.service';
import { Alquiler } from '../../models/alquiler.model';
export interface RendimientoDialogData {
  alquiler: Alquiler;
  maquinaId: number;
}

@Component({
  selector: 'app-rendimiento-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatTimepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './rendimiento-detalle.component.html',
  styleUrls: ['./rendimiento-detalle.component.scss'],
})
export class RendimientoDetalleComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  private destroy$ = new Subject<void>();
  private chart: IChartApi | null = null;
  private lineSeries: ISeriesApi<'Line'> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  cargando = false;
  error: string | null = null;
  rendimientos: RendimientoMaquina[] = [];
  datosInicializados = false; // Para controlar si se han cargado datos por primera vez
  fechaMaxima: Date = new Date();
  fechaMinima: Date = new Date();

  fechaForm = new FormGroup({
    fechaInicio: new FormControl<Date | null>(null, [Validators.required]),
    fechaFin: new FormControl<Date | null>(null, [Validators.required]),
  });

  constructor(
    public dialogRef: MatDialogRef<RendimientoDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RendimientoDialogData,
    private rendimientoService: RendimientoService,
  ) {}

  ngOnInit(): void {
    // Establecer fecha máxima como hoy
    const ahora = new Date();
    this.fechaMaxima = new Date(ahora);

    // Establecer fecha mínima como hace 1 año
    const haceUnAno = new Date();
    haceUnAno.setFullYear(haceUnAno.getFullYear() - 1);
    this.fechaMinima = new Date(haceUnAno);

    // Usar la fecha actual como base (30 de junio de 2025)
    // En lugar de las fechas del alquiler que pueden estar mal formateadas
    const fechaHoy = new Date();

    // Fecha de inicio: hoy a las 00:00:00
    const fechaInicio = new Date(fechaHoy);
    this.establecerHoraInicio(fechaInicio);

    // Fecha de fin: hoy a las 23:59:59
    const fechaFin = new Date(fechaHoy);
    this.establecerHoraFin(fechaFin);

    // Establecer valores iniciales en el formulario
    this.fechaForm.setValue({
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
    });

    console.log('Fechas inicializadas:');
    console.log('Fecha inicio:', fechaInicio.toLocaleString('es-CO'));
    console.log('Fecha fin:', fechaFin.toLocaleString('es-CO'));

    // NO cargar datos automáticamente - solo cuando el usuario haga clic en "Actualizar"
  }

  private establecerHoraInicio(fecha: Date): void {
    fecha.setHours(0, 0, 0, 0); // 00:00:00.000
  }

  private establecerHoraFin(fecha: Date): void {
    fecha.setHours(23, 59, 59, 999); // 23:59:59.999
  }

  ngAfterViewInit(): void {
    // Esperar múltiples ciclos para asegurar que el DOM esté completamente listo
    setTimeout(() => {
      this.initChart();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.chart) {
      this.chart.remove();
    }
  }

  private initChart(): void {
    // Verificar que el contenedor exista
    if (!this.chartContainer?.nativeElement) {
      console.warn('Contenedor del gráfico no disponible, reintentando...');
      // Reintentar después de un breve delay
      setTimeout(() => this.initChart(), 200);
      return;
    }

    const element = this.chartContainer.nativeElement;

    // Verificar que el elemento esté en el DOM
    if (!document.contains(element)) {
      console.warn('Elemento no está en el DOM, reintentando...');
      setTimeout(() => this.initChart(), 200);
      return;
    }

    // Configurar estilos del contenedor
    element.style.display = 'block';
    element.style.width = '100%';
    element.style.height = '350px';

    try {
      // Limpiar cualquier gráfico anterior
      if (this.chart) {
        this.chart.remove();
        this.chart = null;
        this.lineSeries = null;
      }

      // Configuración del gráfico siguiendo la documentación
      const chartOptions: DeepPartial<ChartOptions> = {
        layout: {
          textColor: 'black',
          background: { color: 'white' },
        },
        width: Math.max(element.clientWidth || 700, 300),
        height: 350,
        grid: {
          vertLines: { color: '#e1e1e1' },
          horzLines: { color: '#e1e1e1' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#cccccc',
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
          secondsVisible: false,
        },
      };

      this.chart = createChart(element, chartOptions);

      // Agregar serie de línea siguiendo la documentación
      this.lineSeries = this.chart.addSeries(LineSeries, {
        color: '#00c6ff',
        lineWidth: 2,
      });

      // Hacer el gráfico responsivo
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }

      this.resizeObserver = new ResizeObserver((entries) => {
        if (this.chart && element) {
          const entry = entries[0];
          if (entry) {
            this.chart.applyOptions({
              width: Math.max(entry.contentRect.width, 300),
            });
          }
        }
      });

      this.resizeObserver.observe(element);

      console.log('Gráfico inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar el gráfico:', error);
    }
  }

  cargarRendimientos(): void {
    if (this.fechaForm.invalid) {
      return;
    }

    const fechaInicio = this.fechaForm.get('fechaInicio')?.value;
    const fechaFin = this.fechaForm.get('fechaFin')?.value;

    if (!fechaInicio || !fechaFin) {
      return;
    }

    // Crear copias de las fechas para no modificar las originales
    const fechaInicioAjustada = new Date(fechaInicio);
    const fechaFinAjustada = new Date(fechaFin);

    // Auto-ajustar horas para búsquedas estándar
    this.ajustarHorasParaBusqueda(fechaInicioAjustada, fechaFinAjustada);

    // Debug: mostrar fechas antes de enviar al backend
    console.log('=== FECHAS PARA ENVIAR AL BACKEND ===');
    console.log('Fecha inicio original:', fechaInicio.toLocaleString('es-CO'));
    console.log('Fecha fin original:', fechaFin.toLocaleString('es-CO'));
    console.log(
      'Fecha inicio ajustada:',
      fechaInicioAjustada.toLocaleString('es-CO'),
    );
    console.log(
      'Fecha fin ajustada:',
      fechaFinAjustada.toLocaleString('es-CO'),
    );
    console.log('=====================================');

    // Validar que fecha inicio sea menor que fecha fin
    if (fechaInicioAjustada >= fechaFinAjustada) {
      this.error = 'La fecha de inicio debe ser menor que la fecha de fin';
      return;
    }

    this.cargando = true;
    this.error = null;

    this.rendimientoService
      .obtenerRendimientosMaquina(
        this.data.maquinaId,
        fechaInicioAjustada,
        fechaFinAjustada,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rendimientos) => {
          console.log('Rendimientos recibidos del backend:', rendimientos);
          this.rendimientos = rendimientos;
          this.datosInicializados = true; // Marcar que los datos se han inicializado
          this.actualizarGrafica();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar rendimientos:', error);
          this.error = 'No se pudieron cargar los rendimientos';
          this.datosInicializados = true; // Marcar como inicializado incluso en caso de error
          this.cargando = false;
        },
      });
  }

  private ajustarHorasParaBusqueda(fechaInicio: Date, fechaFin: Date): void {
    // Si la fecha de inicio no es exactamente medianoche, la ajustamos a 00:00:00
    if (fechaInicio.getHours() !== 0 || fechaInicio.getMinutes() !== 0) {
      this.establecerHoraInicio(fechaInicio);
    }

    // Si la fecha de fin no es exactamente 23:59, la ajustamos a 23:59:59
    if (fechaFin.getHours() !== 23 || fechaFin.getMinutes() !== 59) {
      this.establecerHoraFin(fechaFin);
    }
  }

  private actualizarGrafica(): void {
    // Si el gráfico no está inicializado, intentar inicializarlo
    if (!this.lineSeries || !this.chart) {
      console.warn('Gráfico no inicializado, intentando reinicializar...');
      this.initChart();
      // Esperar un poco y reintentar
      setTimeout(() => {
        if (this.lineSeries && this.chart) {
          this.actualizarGrafica();
        }
      }, 300);
      return;
    }

    if (!this.rendimientos || this.rendimientos.length === 0) {
      return;
    }

    // Preparar datos siguiendo exactamente el formato de la documentación
    // { value: number, time: number (timestamp en segundos) }
    const datos: LineData[] = [];

    this.rendimientos.forEach((rendimiento) => {
      rendimiento.rendimientos.forEach((r) => {
        try {
          // El backend ya envía las fechas en horario de Colombia
          // Tratamos la fecha como local (Colombia) sin conversión UTC
          const fecha = this.parsearFechaComoLocal(r.fechaHora);

          // Debug: mostrar conversión de fechas
          console.log('Fecha original backend:', r.fechaHora);
          console.log('Fecha procesada:', fecha.toLocaleString('es-CO'));
          console.log('Fecha UTC:', new Date(r.fechaHora).toUTCString());
          console.log('---');

          // Verificar que la fecha sea válida
          if (isNaN(fecha.getTime())) {
            console.warn('Fecha inválida encontrada:', r.fechaHora);
            return;
          }

          // Convertir a timestamp en segundos (como requiere lightweight-charts)
          const timestamp = Math.floor(fecha.getTime() / 1000) as Time;

          datos.push({
            value: r.valor,
            time: timestamp,
          });
        } catch (error) {
          console.error('Error procesando punto de datos:', error, r);
        }
      });
    });

    if (datos.length === 0) {
      return;
    }

    // Ordenar datos por tiempo (requerido por lightweight-charts)
    datos.sort((a, b) => {
      if (a.time < b.time) return -1;
      if (a.time > b.time) return 1;
      return 0;
    });

    try {
      // Establecer los datos en la serie (como en la documentación)
      this.lineSeries.setData(datos);

      // Ajustar la vista para mostrar todos los datos (como en la documentación)
      this.chart.timeScale().fitContent();
    } catch (error) {
      console.error('Error al actualizar la gráfica:', error);
    }
  }

  obtenerSerialMaquina(): string {
    if (this.rendimientos.length > 0 && this.rendimientos[0].maquina) {
      return this.rendimientos[0].maquina.serial;
    }
    return `ID: ${this.data.maquinaId}`;
  }

  obtenerTotalRendimiento(): number {
    let total = 0;
    this.rendimientos.forEach((rendimiento) => {
      rendimiento.rendimientos.forEach((r) => {
        total += r.valor;
      });
    });
    return total;
  }

  obtenerTotalRegistros(): number {
    return this.rendimientos.reduce((acc, r) => acc + r.rendimientos.length, 0);
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  onDateChange(): void {
    // Método simplificado para manejar cambios en las fechas
    // Se puede agregar lógica adicional si es necesaria
  }

  resetearFechasAlquiler(): void {
    // Resetear a las fechas originales del alquiler con horas estándar
    const fechaInicio = new Date(this.data.alquiler.fechaInicio);
    const fechaFin = new Date(this.data.alquiler.fechaFin);

    // Establecer horas estándar
    this.establecerHoraInicio(fechaInicio);
    this.establecerHoraFin(fechaFin);

    // Actualizar el formulario
    this.fechaForm.setValue({
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
    });

    // Cargar automáticamente los rendimientos
    setTimeout(() => {
      this.cargarRendimientos();
    }, 100);
  }

  /**
   * Parsea una fecha ISO string como fecha local (Colombia)
   * sin aplicar conversión UTC automática de JavaScript
   */
  private parsearFechaComoLocal(fechaISO: string): Date {
    // El backend envía: "2025-06-30T20:12:09.553308351"
    // Método más simple: agregar el sufijo de zona horaria de Colombia
    // para que JavaScript no lo interprete como UTC

    // Si la fecha no tiene zona horaria, agregar -05:00 (Colombia)
    let fechaConZona = fechaISO;
    if (
      !fechaISO.includes('+') &&
      !fechaISO.includes('Z') &&
      !fechaISO.includes('-', 10)
    ) {
      // Truncar microsegundos a 3 dígitos (milisegundos) si es necesario
      if (fechaISO.includes('.')) {
        const partes = fechaISO.split('.');
        const milisegundos = partes[1].substring(0, 3);
        fechaConZona = `${partes[0]}.${milisegundos}-05:00`;
      } else {
        fechaConZona = `${fechaISO}-05:00`;
      }
    }

    return new Date(fechaConZona);
  }
}
