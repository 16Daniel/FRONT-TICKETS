import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, input, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { PreciosaycService } from '../../services/preciosayc.service';
import { colorPrecioayc, PreciosAyc, SucursalRegion } from '../../interfaces/sucursalRegion';
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
@Input() itemReg:PreciosAyc|undefined; 
public dataColores:colorPrecioayc[] = []; 
public sucursales:SucursalRegion[] = []; 
public sucursalesFiltro:SucursalRegion[] = []; 
public regiones:any[] = []; 
public forRegion:any; 
public formSucursal:SucursalRegion|undefined; 

public formColorLunes:colorPrecioayc|undefined; 
public formColorMartes:colorPrecioayc|undefined; 
public formColorMiercoles:colorPrecioayc|undefined; 
public formColorJueves:colorPrecioayc|undefined; 
public formColorViernes:colorPrecioayc|undefined; 
public formColorSabado:colorPrecioayc|undefined; 
public formColorDomingo:colorPrecioayc|undefined; 

constructor(public preciosaycService:PreciosaycService, public cdr: ChangeDetectorRef){}
  ngOnInit(): void 
  {
     this.obtenerSucursales(); this.obtenerColores(); 
 }
onHide = () => this.closeEvent.emit(false);

  obtenerSucursales() {
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

    this.preciosaycService.getSucursalesRegion().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.obtenerRegiones();
        Swal.close();  
        this.cdr.detectChanges();
      },
      error: (error) => {

      },
    });
  }


obtenerColores()
{
   this.preciosaycService.getColoresPreciosAYC().subscribe({
        next: (data) => {
          this.dataColores = data; 
          this.cdr.detectChanges();
        },
        error: (error) => {
            console.log(error);
            Swal.fire("Oops...", "Error al procesar la solicitud", "error");
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
    
     if(this.itemReg != undefined)
      {
        let temp = this.regiones.filter(x=>x.name == this.itemReg!.grupo); 
        if(temp.length>0){ this.forRegion = temp[0];}

        if(this.forRegion == undefined)
        {
          this.sucursalesFiltro = []; 
        } else
          {
            let nombreRegion = this.forRegion.name;
            this.sucursalesFiltro = this.sucursales.filter(x=>x.region == nombreRegion); 
          }

        temp = this.sucursalesFiltro.filter(x=> x.id == this.itemReg!.ids);
        if(temp.length>0){this.formSucursal = temp[0];}

        temp = this.dataColores.filter(x=> x.id! == this.itemReg!.cLunes); 
        if(temp.length>0){ this.formColorLunes = temp[0];}

        temp = this.dataColores.filter(x=> x.id! == this.itemReg!.cMartes); 
        if(temp.length>0){ this.formColorMartes = temp[0];}

        temp = this.dataColores.filter(x=> x.id! == this.itemReg!.cMiercoles); 
        if(temp.length>0){ this.formColorMiercoles = temp[0];}

        temp = this.dataColores.filter(x=> x.id! == this.itemReg!.cJueves); 
        if(temp.length>0){ this.formColorJueves = temp[0];}

        temp = this.dataColores.filter(x=> x.id! == this.itemReg!.cViernes); 
        if(temp.length>0){ this.formColorViernes = temp[0];}

        temp = this.dataColores.filter(x=> x.id! == this.itemReg!.cSabado); 
        if(temp.length>0){ this.formColorSabado = temp[0];}

        temp = this.dataColores.filter(x=> x.id! == this.itemReg!.cDomingo); 
        if(temp.length>0){ this.formColorDomingo = temp[0];}
      }

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
    cLunes: this.formColorLunes!.id!,
    cMartes: this.formColorMartes!.id!,
    cMiercoles: this.formColorMiercoles!.id!,
    cJueves: this.formColorJueves!.id!,
    cViernes: this.formColorViernes!.id!,
    cSabado: this.formColorSabado!.id!,
    cDomingo: this.formColorDomingo!.id!,
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

 getTextColor(hexColor: string): string {
    // Convertir HEX a RGB
    let r, g, b;
    if (hexColor.startsWith('#')) {
      const hex = hexColor.substring(1);
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      } else {
        return '#000000'; // fallback
      }
    } else {
      // Si no es HEX, asumimos que ya es RGB o nombre de color; podrías ampliar el parser
      return '#000000';
    }

    // Calcular brillo (fórmula de luminancia)
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  actualizar()
  { 
    let data:PreciosAyc = 
  {
    id: this.itemReg!.id,
    ids: this.formSucursal!.id,
    cLunes: this.formColorLunes!.id!,
    cMartes: this.formColorMartes!.id!,
    cMiercoles: this.formColorMiercoles!.id!,
    cJueves: this.formColorJueves!.id!,
    cViernes: this.formColorViernes!.id!,
    cSabado: this.formColorSabado!.id!,
    cDomingo: this.formColorDomingo!.id!,
    grupo: this.forRegion.name
  };
  
   this.preciosaycService.actualizarPreciosAYC(data).subscribe({
      next: (data) => {
         Swal.fire({
                  position: "top-end",
                  icon: "success",
                  title: "Actualizado correctamente",
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
