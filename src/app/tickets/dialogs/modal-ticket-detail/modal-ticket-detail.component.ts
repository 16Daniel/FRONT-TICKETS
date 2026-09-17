import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';

import { ModalVisorImagenesComponent } from '../../../shared/dialogs/modal-visor-imagenes/modal-visor-imagenes.component';
import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { TicketsService } from '../../services/tickets.service';
import { SeleccionarUsuarioEspecialistaComponent } from '../../../usuarios/dialogs/seleccionar-usuario-especialista-dialog/seleccionar-usuario-especialista-dialog.component';
import Swal from 'sweetalert2';
import { PlaneacionCatService } from '../../../compras/services/planeacion.service';
import { ProveedorPlaneacion } from '../../../compras/interfaces/ProveedorPlaneacion';

@Component({
  selector: 'app-modal-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    AccordionModule,
    SeleccionarUsuarioEspecialistaComponent,
    CardModule,
    ModalVisorImagenesComponent
  ],
  templateUrl: './modal-ticket-detail.component.html',
  styleUrl: './modal-ticket-detail.component.scss',
})
export class ModalTicketDetailComponent {
  @Input() ticket: Ticket | undefined;
  @Input() showModalTicketDetail: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();
  usuario: Usuario;
  mostrarModalEspecialistas: boolean = false;
  mostrarModalImagen: boolean = false;
  idSucursalEspecialista: string = '';
  urlVisorImagen: string = '';
  public catproveedores:ProveedorPlaneacion[] = []; 

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private planeacionService:PlaneacionCatService,
    private cdr: ChangeDetectorRef,
  ) {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

  onClick() {
    this.actualizaTicket(this.ticket);
  }

  ngOnInit() {
   if(this.ticket?.codProveedor != null)
    {
      this.obtenerProveedores(); 
    }
}

    obtenerProveedores()
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

        this.planeacionService.getCatProveedores().subscribe(data => {
         this.catproveedores = data;
         this.cdr.detectChanges();
         Swal.close(); 
       });
     }

  actualizaTicket(ticket: Ticket | any) {
    ticket.idEstatusTicket = '2';
    this.ticketsService
      .update(ticket)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');
      })
      .catch((error) => console.error(error));
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onClickAsignarEspecialista() {
    this.idSucursalEspecialista = this.ticket?.idSucursal;
    this.mostrarModalEspecialistas = true;
  }

  abrirModalImagen(url: string) {
    this.mostrarModalImagen = true;
    this.urlVisorImagen = url;
  }
  obtenerNombreProveedor(codp:number):string
  {
    return this.catproveedores.filter(x=>x.codproveedor == codp)[0].nombre; 
  }

  obtenerRfcProveedor(codp:number):string
  {
    return this.catproveedores.filter(x=>x.codproveedor == codp)[0].rfc; 
  }

}
