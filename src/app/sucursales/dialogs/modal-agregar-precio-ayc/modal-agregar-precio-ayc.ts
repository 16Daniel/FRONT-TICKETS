import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { PreciosaycService } from '../../services/preciosayc.service';
import { PreciosAyc, SucursalRegion } from '../../interfaces/sucursalRegion';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-modal-agregar-precio-ayc',
  standalone: true,
  imports: [CommonModule,FormsModule,DialogModule,DropdownModule],
  templateUrl: './modal-agregar-precio-ayc.html',
  styleUrl: './modal-agregar-precio-ayc.scss',
})
export class ModalAgregarPrecioAyc implements OnInit {
@Input() visible:boolean = false; 
@Output() closeEvent = new EventEmitter<boolean>();
@Output() actualizarData = new EventEmitter<void>(); 

public sucursales:SucursalRegion[] = []; 
public sucursalesFiltro:SucursalRegion[] = []; 
public regiones:any[] = []; 
public forRegion:any; 
public formSucursal:SucursalRegion|undefined; 

public formPrecioLunes:number = 0; 
public formPrecioMartes:number = 0; 
public formPrecioMiercoles:number = 0; 
public formPrecioJueves:number = 0; 
public formPrecioViernes:number = 0; 
public formPrecioSabado:number = 0; 
public formPrecioDomingo:number = 0; 

public formColorLunes:string = '#ffffff'; 
public formColorMartes:string = '#ffffff'; 
public formColorMiercoles:string = '#ffffff'; 
public formColorJueves:string = '#ffffff'; 
public formColorViernes:string = '#ffffff'; 
public formColorSabado:string = '#ffffff'; 
public formColorDomingo:string = '#ffffff'; 

constructor(public preciosaycService:PreciosaycService, public cdr: ChangeDetectorRef){}
  ngOnInit(): void { this.obtenerSucursales(); }
onHide = () => this.closeEvent.emit(false);

  obtenerSucursales() {
    this.preciosaycService.getSucursalesRegion().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.obtenerRegiones(); 
        this.cdr.detectChanges();
      },
      error: (error) => {

      },
    });
  }



obtenerRegiones()
{
  this.regiones = []; 
  let nombresUnicos = [...new Set(this.sucursales.map(s => s.region))];
  for(let item of nombresUnicos)
    {
      this.regiones.push({name:item}); 
    }
    console.log(this.regiones); 
  this.cdr.detectChanges(); 
}

cambiarRegion()
{
  if(this.forRegion == undefined)
    {
      this.sucursalesFiltro = []; 
    } else
      {
        let nombreRegion = this.forRegion.name;
        this.sucursalesFiltro = this.sucursales.filter(x=>x.region == nombreRegion); 
      }
}

guardar()
{
  let data:PreciosAyc = 
  {
    ids: this.formSucursal!.id,
    pLunes: this.formPrecioLunes,
    cLunes: this.formColorLunes,
    pMartes: this.formPrecioMartes,
    cMartes: this.formColorMartes,
    pMiercoles: this.formPrecioMiercoles,
    cMiercoles: this.formColorMiercoles,
    pJueves: this.formPrecioJueves,
    cJueves: this.formColorJueves,
    pViernes:this.formPrecioViernes,
    cViernes: this.formColorViernes,
    pSabado: this.formPrecioSabado,
    cSabado: this.formColorSabado,
    pDomingo: this.formPrecioDomingo,
    cDomingo: this.formColorDomingo,
    grupo: this.forRegion.name
  };
  
   this.preciosaycService.agregarPreciosAYC(data).subscribe({
      next: (data) => {
         Swal.fire({
                  position: "top-end",
                  icon: "success",
                  title: "Agregado correctamente",
                  showConfirmButton: false,
                  timer: 1500
                });
        this.actualizarData.emit(); 
         this.onHide(); 
      },
      error: (error) => {
          Swal.fire("Oops...", "Error al procesar la solicitud", "error");
      },
    });

}

}
