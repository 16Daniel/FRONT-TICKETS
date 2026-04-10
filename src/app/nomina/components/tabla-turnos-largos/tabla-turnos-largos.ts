import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { TurnoLargo } from '../../interfaces/Checadas';
import { NominaService } from '../../services/nomina.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-tabla-turnos-largos',
  standalone: true,
  imports: [CommonModule,CalendarModule, FormsModule,TableModule],
  providers:[DatePipe],
  templateUrl: './tabla-turnos-largos.html',
  styleUrl: './tabla-turnos-largos.scss',
})
export class TablaTurnosLargos implements OnInit {
public fechaini:Date = new Date(); 
public fechafin:Date = new Date(); 
public altopantalla = '500px';  
public alldata:TurnoLargo[] = []; 
public datatl:TurnoLargo[] = []; 
public datafiltro:TurnoLargo[] = []; 
public filtrofecha:Date|undefined; 
  constructor(
    public cdr: ChangeDetectorRef,
    public apiserv: NominaService,
    private datePipe: DatePipe
  ) { }

ngOnInit(): void 
{
 }

 ngAfterViewInit(): void {
  let alto = window.innerHeight;
  this.altopantalla = parseInt((alto*.6).toString())+'px';
  this.cdr.detectChanges(); 
 }

consultar()
{
  Swal.fire({
        target: document.body,
        allowOutsideClick: false,
        icon: 'info',
        text: 'cargando...',
        didOpen: () => Swal.showLoading(),
        customClass: { container: 'swal-topmost' }
      });

    this.apiserv.obtenerTurnosLargos(this.fechaini,this.fechafin).subscribe({
      next: (data) => {
        this.datatl = data;
        this.alldata = [...data]; 
        this.datafiltro = [...this.datatl];
        Swal.close(); 
      },
      error: (error) => {
        Swal.close(); 
        console.log(error); 
      },
    });
}


  exportToExcel(): void {
    // Transformar los datos para tener una fila por artículo
    const datosExportar = this.transformarDatos(this.datafiltro);

    // Crear libro de trabajo y hoja
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExportar);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TURNOS LARGOS');

    // Guardar el archivo
    XLSX.writeFile(wb, 'turnos-largos.xlsx');
  }
  
   private transformarDatos(data: TurnoLargo[]): any[] {
      const datos: any[] = [];
  
      data.forEach(item => {
        datos.push({
          'CLA_UBICACION': item.clA_UBICACION,
          'SUCURSAL': item.noM_UBICACION,
          'FECHA': this.datePipe.transform(item.fecha, 'dd/MM/yyyy') || '',
          'CLA_TRAB': item.clA_TRAB,
          'NOMBRE': item.nombre,
          'ESTATUS': item.statuS_TRAB
        });
      });
  
      return datos;
    }

    filtrar(event: any)
    {
        this.datafiltro = [...event.filteredValue]; 
    }

    limparfiltrofecha()
    {
      this.filtrofecha = undefined;
      this.datafiltro = [...this.alldata];  this.datatl = [...this.alldata];
    }
    filtrarfecha()
    {  
       if(this.filtrofecha != undefined)
        {
          this.datatl = this.datatl.filter(x => {
            const fechaComparar = new Date(x.fecha); // convierte a Date
            return fechaComparar.getDate() === this.filtrofecha!.getDate() &&
                  fechaComparar.getMonth() === this.filtrofecha!.getMonth() &&
                  fechaComparar.getFullYear() === this.filtrofecha!.getFullYear();
          });
          this.datafiltro = [...this.datatl]; 
        } else { this.datafiltro = [...this.alldata];  this.datatl = [...this.alldata]; }
    }
  }
