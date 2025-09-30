import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITproducto } from '../../../../../models/Planecion';
import { PlaneacionService } from '../../../../../services/Planeacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-agregar-medida',
  standalone: true,
  imports: [CommonModule,DialogModule,FormsModule],
  templateUrl: './Modal-agregar-medida.component.html',
})
export class ModalAgregarMedidaComponent implements OnInit {
@Input() visible:boolean = false; 
@Input() itemumedidaupdate: ITproducto | undefined; 
@Output() closeEvent = new EventEmitter<boolean>();

constructor(public apiserv:PlaneacionService, public cdr: ChangeDetectorRef)
{

}

  ngOnInit(): void 
  { 
    
  }
  onHide() {
    this.closeEvent.emit(false); // Cerrar modal
  }    

  actualizarDiccionario()
{   
  if(this.itemumedidaupdate != undefined)
    { 
      this.visible = false;  
      let formdata = new FormData(); 
  
        formdata.append("rfc",this.itemumedidaupdate!.rfc); 
        formdata.append("numid",this.itemumedidaupdate!.noIdentificacion);
        formdata.append("uds",this.itemumedidaupdate!.uds);
        formdata.append("umedida",this.itemumedidaupdate!.umedida);
        formdata.append("puds",this.itemumedidaupdate!.p_uds);
        formdata.append("pumedida",this.itemumedidaupdate!.p_umedida);
        formdata.append("iuds",this.itemumedidaupdate!.i_uds);
        formdata.append("iumedida",this.itemumedidaupdate!.i_umedida);
      
          Swal.showLoading(); 
          this.apiserv.actualizarDiccionario(formdata).subscribe({
            next: data => { 
              Swal.close(); 
              Swal.fire("OK", "¡ACTUALIZADO CORRECTAMENTE!", "success");
              this.closeEvent.emit(false); // Cerrar modal
            },
            error: error => { 
              Swal.close(); 
              console.log(error);
            }
        });
    }
}


}
