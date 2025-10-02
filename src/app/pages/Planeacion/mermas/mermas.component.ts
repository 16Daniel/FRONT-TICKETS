import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { Sucursal } from '../../../models/sucursal.model';
import { BranchesService } from '../../../services/branches.service';
import { PlaneacionService } from '../../../services/Planeacion.service';
import { Merma } from '../../../models/Merma';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { InputSwitchModule } from 'primeng/inputswitch';
import * as XLSX from 'xlsx';
import { Usuario } from '../../../models/usuario.model';
import { environment } from '../../../../environments/environments';
@Component({
  selector: 'app-mermas',
  standalone: true,
  imports: [CommonModule,FormsModule,CalendarModule,MultiSelectModule,TableModule,InputSwitchModule],
  templateUrl: './mermas.component.html',
  styleUrl: './mermas.component.css',
})
export default class MermasComponent implements OnInit {
public fechaini:Date = new Date(); 
public fechafin:Date = new Date(); 
public sucursales: Sucursal[] = [];
public sucursalesSel: Sucursal[] = [];
public mermas:Merma[] =[]; 

public dataTabR:any[] = []; 
public dataTabD:any[] = []; 
public resumido:boolean = true; 
public usuario:Usuario;
public idServicio:string = environment.idServicio; 
constructor(private branchesService:BranchesService,
  private cdr: ChangeDetectorRef,
  private apiserv: PlaneacionService
)
{
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
}

  ngOnInit(): void 
  {
     this.obtenerSucursales(); 
  }

   obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data; 
         if(this.usuario.idRol == "2" && this.usuario.id != this.idServicio)
          {
            let suc = this.sucursales.filter(x => x.id == this.usuario.sucursales[0].id); 
            if(suc.length >0){ this.sucursalesSel.push(suc[0]);  } 
          }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        // this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerMermas()
  {   

    Swal.fire({
          target: document.body,
          allowOutsideClick: false,
          icon: 'info',
          text: 'Espere por favor...',
          didOpen: () => Swal.showLoading(),
          customClass: {
            container: 'swal-topmost'
          }
        });

    this.mermas = []; 
    this.dataTabR = [];
    this.dataTabD = []; 
    let sucursales:number[] = []
    for(let suc of this.sucursalesSel)
      {
        sucursales.push(suc.idFront!); 
      }
    let data = new FormData(); 
    data.append("fechaini",this.fechaini.toISOString());
    data.append("fechafin",this.fechafin.toISOString());
    data.append("jdataSuc",JSON.stringify(sucursales));

      this.apiserv.getMermas(data).subscribe({
      next: (data) => {
        this.mermas = data;
        
        for(let suc of this.sucursalesSel)
          {
            let datasuc = this.mermas.filter(x => x.codSucursal == suc.idFront);
            // resumido 

            let totalDineroMO = datasuc.filter(x => x.justificacion == "MERMA OPERATIVA").reduce((acum, item) => { return acum + (item.unidades * item.precio);}, 0);  
            let totalDineroMP = datasuc.filter(x => x.justificacion == "MERMA PROVEEDOR").reduce((acum, item) => { return acum + (item.unidades * item.precio);}, 0);  
  
            let totalr = totalDineroMO + totalDineroMP; 
   
            let pmor = (totalDineroMO/totalr)*100;
            let pmpr = (totalDineroMP/totalr)*100; 
            
            this.dataTabR.push(
              {
                sucursal: suc.nombre,
                mermaoperativa: totalDineroMO,
                pmo: pmor,
                mermaproveedor: totalDineroMP,
                pmp: pmpr
              });

            // detalles 
            let articulos = this.getDistinctCodArticulo(datasuc);
            
            for(let codart of articulos)
              {  
                let precio = 0;
                let nombreart = "";  
                let temp = datasuc.filter(x=> x.codArticulo == codart && x.justificacion == "MERMA OPERATIVA"); 
                let mermaoperativa = temp.length == 0 ? 0 : temp.reduce((acum, item) => { return acum + (item.unidades);}, 0);
                precio = temp[0].precio;
                nombreart = temp[0].articulo; 
                    temp = datasuc.filter(x=> x.codArticulo == codart && x.justificacion == "MERMA PROVEEDOR"); 
                let mermaproveedor = temp.length == 0 ? 0 : temp.reduce((acum, item) => { return acum + (item.unidades);}, 0);  
                precio = temp[0].precio;
                nombreart = temp[0].articulo;

                let total = mermaoperativa + mermaproveedor; 
                let pmo = (mermaoperativa/total)*100;
                let pmp = (mermaproveedor/total)*100; 
                this.dataTabD.push({
                  sucursal: suc.nombre,
                  articulo: nombreart,
                  mermaoperativa: mermaoperativa*precio,
                  mermaproveedor: mermaproveedor*precio,
                  pmo: pmo,
                  pmp:pmp,
                  precio:precio,
                  umo:mermaoperativa,
                  ump:mermaproveedor
                });
              }

          }

          Swal.close();
        this.cdr.detectChanges();
      },
      error: (error) => {
        Swal.close();
        console.log(error);

        Swal.fire({
  icon: "error",
  title: "Error",
  text: "Error al procesar la solicitud!",
});

      },
    });
  }

getDistinctCodArticulo(mermas: Merma[]): number[] {
  const distinctCodes = [...new Set(mermas.map(merma => merma.codArticulo))];
  return distinctCodes;
}

  exportToExcel() {

  // Obtener la tabla del DOM
  let tabla = document.getElementById('tablaD');
  
  if(this.resumido)
    {
      tabla = document.getElementById('tablaR');
    }
  // Convertir tabla HTML a hoja de trabajo
  const ws = XLSX.utils.table_to_sheet(tabla);
  
  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tabla HTML');
  
  // Exportar
  XLSX.writeFile(wb, 'Mermas.xlsx');
  }

}
