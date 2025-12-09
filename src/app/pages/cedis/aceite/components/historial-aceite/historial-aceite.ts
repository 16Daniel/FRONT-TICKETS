import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { Sucursal } from '../../../../../models/sucursal.model';
import { AceiteService } from '../../../../../services/aceite.service';
import { MessageService } from 'primeng/api';
import { EntregaAceite } from '../../../../../models/aceite.model';
import { Timestamp } from '@angular/fire/firestore';
@Component({
  selector: 'app-historial-aceite',
  standalone: true,
  imports: [CommonModule,TabViewModule, TableModule, CalendarModule, DropdownModule, FormsModule],
  templateUrl: './historial-aceite.html',
  styleUrl: './historial-aceite.scss',
})
export class HistorialAceite implements OnInit {
fechaini:Date = new Date(); 
fechafin:Date = new Date(); 
@Input() sucursales: Sucursal[] = [];
public sucursalSel: Sucursal|undefined;
public loading:boolean = false; 
public entregasH:EntregaAceite[] = []; 
public entregasTAH:EntregaAceite[] = []; 

constructor(public aceiteService:AceiteService,public cdr:ChangeDetectorRef,private messageService: MessageService)
{

}

  ngOnInit(): void { }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }


   buscarRegistros()
  {
    this.loading = true
    let idf = -2;
    if(this.sucursalSel?.idFront != undefined)
      {
        idf = this.sucursalSel!.idFront;
      }
    this.aceiteService.getEntregasCedisH(idf,this.fechaini,this.fechafin).subscribe({
      next: (data) => {
        this.entregasH= data;
        this.loading = false, 
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
      },
    });
  }

  buscarRegistrosTA()
  {
    this.loading = true
    let idf = -2;
    if(this.sucursalSel?.idFront != undefined)
      {
        idf = this.sucursalSel!.idFront;
      }
    this.aceiteService.getEntregasCedisTAH(idf,this.fechaini,this.fechafin).subscribe({
      next: (data) => {
        this.entregasTAH= data;
        this.loading = false, 
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.log(error);
      },
    });
  }

  exportarExcel(estrampa:boolean)
{ 
  debugger
  this.loading = true;
  
  let data = estrampa ? this.entregasTAH : this.entregasH; 

  this.aceiteService.exportarHistorialEntregas(data).subscribe({
    next: data => {
      this.loading = false;
      this.cdr.detectChanges();
      const base64String = data.archivoBase64; // Aquí debes colocar tu cadena base64 del archivo Excel

      // Decodificar la cadena base64
      const binaryString = window.atob(base64String);
  
      // Convertir a un array de bytes
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
  
      // Crear un Blob con los datos binarios
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
      // Crear una URL para el Blob
      const url = window.URL.createObjectURL(blob);
  
      // Crear un enlace para la descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = 'HISTORIAL ENTREGAS DE ACEITE.xlsx'; // Establecer el nombre del archivo
      document.body.appendChild(link);
  
      // Hacer clic en el enlace para iniciar la descarga
      link.click();
  
      // Limpiar la URL y el enlace después de la descarga
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    },
    error: error => {
      this.loading = false; 
      this.showMessage('error','Error','Error al generar el archivo de excel');
      console.log(error);
     
    }
});
}

 obtenerNombreSucursal(idSucursal:number): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.idFront == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

   getDate(tsmp: Timestamp | any): Date {
        try {
          // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
          const firestoreTimestamp = tsmp; // Ejemplo
          const date = firestoreTimestamp.toDate(); // Convierte a Date
          return date;
        } catch {
          return tsmp;
        }
      }

}
