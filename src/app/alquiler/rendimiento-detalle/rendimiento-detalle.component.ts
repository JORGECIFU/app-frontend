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

    // Usar las fechas del alquiler como base si están disponibles
    let fechaInicio: Date;
    let fechaFin: Date;

    if (this.data.alquiler.fechaInicio && this.data.alquiler.fechaFin) {
      // Usar las fechas del alquiler
      fechaInicio = new Date(this.data.alquiler.fechaInicio);
      fechaFin = new Date(this.data.alquiler.fechaFin);

      // Asegurar que fechaInicio esté a las 00:00:00
      this.establecerHoraInicio(fechaInicio);

      // Si la fecha fin es posterior al día actual, usar el día actual
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999); // Establecer a las 23:59:59

      if (fechaFin > hoy) {
        fechaFin = new Date(hoy);
        console.log('Fecha fin ajustada al día actual porque era futura');
      } else {
        // Asegurar que fechaFin esté a las 23:59:59
        this.establecerHoraFin(fechaFin);
      }
    } else {
      // Fallback: usar la fecha actual si no hay fechas del alquiler
      const fechaHoy = new Date();

      fechaInicio = new Date(fechaHoy);
      this.establecerHoraInicio(fechaInicio);

      fechaFin = new Date(fechaHoy);
      this.establecerHoraFin(fechaFin);
    }

    // Establecer valores iniciales en el formulario
    this.fechaForm.setValue({
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
    });

    console.log('Alquiler:', this.data.alquiler);
    console.log(
      'Fechas del alquiler:',
      this.data.alquiler.fechaInicio,
      '-',
      this.data.alquiler.fechaFin,
    );
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

  /** Convierte timestamp UTC (segundos) a UTC corregido según hora local */
  private timeToLocal(originalTimeSec: number): number {
    const d = new Date(originalTimeSec * 1000);
    return (
      Date.UTC(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
        d.getMilliseconds(),
      ) / 1000
    );
  }

  /**
   * Inicializa el gráfico de rendimiento.
   *
   * Este método configura el contenedor del gráfico, crea el gráfico y la serie de línea,
   * y establece las opciones necesarias para su correcto funcionamiento.
   *
   * @remarks
   * Se asegura de que el contenedor exista y esté en el DOM antes de proceder con la inicialización.
   * Si no se puede inicializar inmediatamente, reintenta después de un breve delay.
   *
   * @private
   */
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
    element.style.width = '95%';
    element.style.height = '330px';

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
          autoScale: true, // Habilitar auto scaling para el eje Y
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: '#cccccc',
          timeVisible: true,
          secondsVisible: false,
          barSpacing: 8, // Espaciado entre barras
          shiftVisibleRangeOnNewBar: true,
        },
      };

      this.chart = createChart(element, chartOptions);

      // Agregar serie de línea siguiendo la documentación
      this.lineSeries = this.chart.addSeries(LineSeries, {
        color: '#00c6ff',
        lineWidth: 2,
        priceFormat: {
          type: 'custom',
          formatter: (price: number) => {
            return `$${price.toFixed(8)} USD`;
          },
        },
      });

      // Configurar el price scale después de crear la serie
      this.lineSeries.priceScale().applyOptions({
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      });

      // Configurar el time scale después de crear el gráfico
      this.chart.timeScale().applyOptions({
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#cccccc',
        barSpacing: 8,
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

  /**
   * Actualiza la gráfica de rendimiento con los datos disponibles.
   *
   * Este método realiza las siguientes operaciones:
   * 1. Verifica que el gráfico esté inicializado, intentando inicializarlo si no lo está
   * 2. Procesa los datos de rendimiento para adaptarlos al formato requerido por lightweight-charts
   * 3. Convierte las marcas de tiempo para manejar correctamente la visualización
   *
   * @remarks
   * Existe una discrepancia importante entre cómo se almacenan las fechas en la base de datos
   * (en formato local) y cómo la biblioteca lightweight-charts espera los datos (en UTC).
   * Por esto se utiliza el método `timeToLocal()` para realizar la corrección necesaria,
   * asegurando que las fechas se muestren correctamente en el eje horizontal del gráfico.
   *
   * Si no hay datos disponibles o ocurre un error durante la actualización,
   * el método registra los mensajes correspondientes en la consola.
   *
   * @private
   */
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
      console.warn('No hay datos de rendimientos para mostrar');
      return;
    }

    // Preparar datos siguiendo exactamente el formato de la documentación
    // { value: number, time: number (timestamp en segundos) }
    const datos: LineData[] = [];

    // Recorrer los rendimientos y extraer los datos necesarios
    // Asegurarse de que cada rendimiento tenga una fechaHora válida
    this.rendimientos.forEach((rendimiento) => {
      rendimiento.rendimientos.forEach((r) => {
        const fecha = new Date(r.fechaHora);
        const secs = Math.floor(fecha.getTime() / 1000);
        const corrected = this.timeToLocal(secs);
        datos.push({ time: corrected as Time, value: r.valor });
      });
    });

    if (datos.length === 0) {
      console.warn('No se pudieron procesar datos válidos para la gráfica');
      return;
    }

    // Ordenar datos por tiempo (requerido por lightweight-charts)
    datos.sort((a, b) => {
      if (a.time < b.time) return -1;
      if (a.time > b.time) return 1;
      return 0;
    });

    console.log(`Procesados ${datos.length} puntos de datos para la gráfica`);
    console.log('Rango de valores:', {
      min: Math.min(...datos.map((d) => d.value)),
      max: Math.max(...datos.map((d) => d.value)),
      promedio: datos.reduce((sum, d) => sum + d.value, 0) / datos.length,
    });

    try {
      // Establecer los datos en la serie (como en la documentación)
      this.lineSeries.setData(datos);

      // Ajustar la vista para mostrar todos los datos (como en la documentación)
      this.chart.timeScale().fitContent();

      console.log('Gráfica actualizada exitosamente');
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

  /**
   * Calcula el tiempo total de operación basado en los registros
   * Cada registro representa 2 minutos de operación
   * @returns string con formato "X días, Y horas y Z minutos"
   */
  obtenerTiempoOperacion(): string {
    const totalRegistros = this.obtenerTotalRegistros();
    const totalMinutos = totalRegistros * 2; // Cada registro son 2 minutos

    if (totalMinutos === 0) {
      return '0 minutos';
    }

    // Calcular días, horas y minutos
    const dias = Math.floor(totalMinutos / (24 * 60)); // 1440 minutos por día
    const horasRestantes = Math.floor((totalMinutos % (24 * 60)) / 60);
    const minutosRestantes = totalMinutos % 60;

    // Construir el string de resultado
    const partes: string[] = [];

    if (dias > 0) {
      partes.push(`${dias} ${dias === 1 ? 'día' : 'días'}`);
    }

    if (horasRestantes > 0) {
      partes.push(
        `${horasRestantes} ${horasRestantes === 1 ? 'hora' : 'horas'}`,
      );
    }

    if (minutosRestantes > 0) {
      partes.push(
        `${minutosRestantes} ${minutosRestantes === 1 ? 'minuto' : 'minutos'}`,
      );
    }

    // Unir las partes con comas y "y" antes del último elemento
    if (partes.length === 1) {
      return partes[0];
    } else if (partes.length === 2) {
      return partes.join(' y ');
    } else {
      return partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
    }
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
}
