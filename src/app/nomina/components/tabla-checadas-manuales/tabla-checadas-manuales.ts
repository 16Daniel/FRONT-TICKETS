import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import Swal from 'sweetalert2';
import { NominaService } from '../../services/nomina.service';
import { ChecadaManual } from '../../interfaces/Checadas';
import { TableModule } from 'primeng/table';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-tabla-checadas-manuales',
  standalone: true,
  imports: [CommonModule,CalendarModule, FormsModule,TableModule],
  providers:[DatePipe],
  templateUrl: './tabla-checadas-manuales.html',
  styleUrl: './tabla-checadas-manuales.scss',
})
export class TablaChecadasManuales implements OnInit {
public fechaini:Date = new Date(); 
public fechafin:Date = new Date(); 
public altopantalla = '500px';  
public alldata:ChecadaManual[] = []; 
public datacm:ChecadaManual[] = []; 
public datafiltro:ChecadaManual[] = []; 
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

    this.apiserv.obtenerChecadasManuales(this.fechaini,this.fechafin).subscribe({
      next: (data) => {
        this.datacm = data;
        this.alldata = [...data]; 
        this.datafiltro = [...this.datacm];
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
    XLSX.utils.book_append_sheet(wb, ws, 'CHECADAS MANUALES');

    // Guardar el archivo
    XLSX.writeFile(wb, 'checadas-manuales.xlsx');
  }
  
   private transformarDatos(data: ChecadaManual[]): any[] {
      const datos: any[] = [];
  
      data.forEach(item => {
        datos.push({
          'CLA_UBICACION': item.clA_UBICACION,
          'SUCURSAL': item.noM_UBICACION,
          'FECHA': this.datePipe.transform(item.fecha, 'dd/MM/yyyy') || '',
          'CLA_TRAB': item.clA_TRAB,
          'NOMBRE': item.nombre,
          'ESTATUS': item.statuS_TRAB,
          'ENTRADA': item.entrada,
          'SALIDA': item.salida
        });
      });
  
      return datos;
    }

    getEntradasManuales():string
    {
      let val = 0; 
      val = this.datafiltro.filter(x=> x.entrada == 0).length; 
      return val.toString(); 
    }

     getSalidasManuales():string
    {
      let val = 0; 
       val = this.datafiltro.filter(x=> x.salida == 0).length; 
      return val.toString(); 
    }

    getTotalManules():string
    {
         let val = 0; 
      val = this.datafiltro.filter(x=> x.entrada == 0).length;

      let val2 = 0; 
       val2 = this.datafiltro.filter(x=> x.salida == 0).length; 
       let val3 = val+val2; 
      return val3.toString(); 

    }

    filtrar(event: any)
    {
        this.datafiltro = [...event.filteredValue]; 
    }

    limparfiltrofecha()
    {
      this.filtrofecha = undefined;
      this.datafiltro = [...this.alldata];  this.datacm = [...this.alldata];
    }
    filtrarfecha()
    {  
      debugger
       if(this.filtrofecha != undefined)
        {
          this.datacm = this.datacm.filter(x => {
            const fechaComparar = new Date(x.fecha); // convierte a Date
            return fechaComparar.getDate() === this.filtrofecha!.getDate() &&
                  fechaComparar.getMonth() === this.filtrofecha!.getMonth() &&
                  fechaComparar.getFullYear() === this.filtrofecha!.getFullYear();
          });
          this.datafiltro = [...this.datacm]; 
        } else { this.datafiltro = [...this.alldata];  this.datacm = [...this.alldata]; }
    }
  }
