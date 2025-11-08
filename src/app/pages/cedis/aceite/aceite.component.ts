import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { EntregaAceite } from '../../../models/aceite.model';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AceiteService } from '../../../services/aceite.service';
import { ModalAgregarEntregaComponent } from "../../../modals/modal-agregar-entrega/modal-agregar-entrega.component";
import { Timestamp } from '@angular/fire/firestore';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import ControlAceiteTabComponent from '../../branch/components/control-aceite-tab/control-aceite-tab.component';
import { AgregarRecoleccionComponent } from "./dialogs/agregar-recoleccion.component/agregar-recoleccion.component";

@Component({
  selector: 'app-aceite',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TabViewModule, ToastModule, DialogModule, CalendarModule, DropdownModule, ControlAceiteTabComponent, AgregarRecoleccionComponent],
    providers:[MessageService],
  templateUrl: './aceite.component.html',
  styleUrl: './aceite.component.scss',
})
export default class AceiteComponent implements OnInit {
public entregas:EntregaAceite[] = []; 
public entregasH:EntregaAceite[] = []; 
public mostrarModalValidacion:boolean = false; 
public sucursales: Sucursal[] = [];
public sucursalSel: Sucursal|undefined;
public formcomentarios:string = ""; 
public itemEntrega:EntregaAceite|undefined; 
public tipoActualizacion:number = 0;  
public loading:boolean = false; 
public modalAgregarRecoleccion:boolean = false; 
fechaini:Date = new Date(); 
fechafin:Date = new Date(); 
constructor(public aceiteService:AceiteService,public cdr:ChangeDetectorRef,private branchesService: BranchesService,private messageService: MessageService)
{

}
  ngOnInit(): void 
  {
    this.obtenerSucursales(); 

    setInterval(() => {
      this.consultarEntregas(); 
    }, 60000);
   }
 
     showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  consultarEntregas()
  {
    this.loading = true; 
    this.aceiteService.getEntregasCedis().subscribe({
      next: (data) => {
        this.entregas= data;
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.loading = false; 
      },
    });
  }
  abrirmodalValidacion(item:EntregaAceite,tipo:number)
  {
    this.tipoActualizacion = tipo; 
    this.itemEntrega = item; 
    this.mostrarModalValidacion = true; 
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

   obtenerNombreSucursal(idSucursal:number): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.idFront == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

     obtenerSucursales() {
      this.loading = true; 
    this.branchesService.get().subscribe({
      next: (data) => {
        let sucursalTodas:Sucursal = { id:'-1',nombre:'TODAS',idFront:-1,eliminado:false}
        this.sucursales = data;
        this.sucursales.unshift(sucursalTodas); 
        this.sucursalSel = sucursalTodas; 
        this.loading = false; 
        this.consultarEntregas(); 
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false; 
      },
    });
  }

    actualizarEntrega()
  {   
    if(this.formcomentarios == "")
      {
        this.showMessage('info','info','Favor de agregar un comentario');
        return; 
      }
    if(this.tipoActualizacion == 1)
      {
                    this.loading = true; 
              this.aceiteService.ValidacionCedis(this.itemEntrega!.id,this.formcomentarios).subscribe({
              next: (data) => {
                this.mostrarModalValidacion = false; 
                this.showMessage('success','Success','Guardado correctamente');
                this.formcomentarios = ""; 
                this.consultarEntregas(); 
                this.cdr.detectChanges();
              },
              error: (error) => {
                
              },
            });
      } else
      {
               this.loading = true; 
              this.aceiteService.RechazoCedis(this.itemEntrega!.id,this.formcomentarios).subscribe({
              next: (data) => {
                this.mostrarModalValidacion = false; 
                this.showMessage('success','Success','Guardado correctamente');
                this.formcomentarios = ""; 
                this.consultarEntregas(); 
                this.cdr.detectChanges();
              },
              error: (error) => {
                
              },
            });
      }
    
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

  exportarExcel()
{ 
  this.loading = true;
  let data = JSON.stringify(this.entregasH);
  this.aceiteService.exportarHistorialEntregas(this.entregasH).subscribe({
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

abrirModalagregarRecoleccion()
{
  this.modalAgregarRecoleccion = true; 
}

}
