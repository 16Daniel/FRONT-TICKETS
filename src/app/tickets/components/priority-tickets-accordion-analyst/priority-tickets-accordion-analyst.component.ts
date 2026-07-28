import { Component, EventEmitter, Input, OnInit, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';

import { RequesterTicketsListComponent } from '../requester-tickets-list/requester-tickets-list.component';
import { GraficaTickets30DiasComponent } from '../../../mantenimientos/components/grafica-tickets-30-dias/grafica-tickets-30-dias.component';
import { Ticket } from '../../interfaces/ticket.model';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { TpvsDevicesTableComponent } from "../tpvs-devices-table/tpvs-devices-table.component";
import { TablaTvsBocinasComponent } from "../tabla-tvs-bocinas/tabla-tvs-bocinas.component";
import { FirebaseStorageService } from '../../../shared/services/firebase-storage.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { ModalVisorVariasImagenesComponent } from '../../../shared/dialogs/modal-visor-varias-imagenes/modal-visor-varias-imagenes.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-priority-tickets-accordion-analyst',
  standalone: true,
  imports: [
    CommonModule,
    BadgeModule,
    AccordionModule,
    RequesterTicketsListComponent,
    TooltipModule,
    FormsModule,
    GraficaTickets30DiasComponent,
    TpvsDevicesTableComponent,
    TablaTvsBocinasComponent,
    ModalVisorVariasImagenesComponent
],
  templateUrl: './priority-tickets-accordion-analyst.component.html',
  styleUrl: './priority-tickets-accordion-analyst.component.scss',
})
export class PriorityTicketsAccordionAnalystComponent implements OnInit {
  @Input() tickets: Ticket[] = [];
  @Input() sucursales: Sucursal[] = [];
  @Input() esEspectadorActivo: boolean = false;
  idArea = input.required<string>();

  @Output() clickEvent = new EventEmitter<Ticket>();

  itemtk: Ticket | undefined;
  showModalTicketDetail: boolean = false;
  usuario: Usuario | any;
  mostrarRadiografiaMap: { [idSucursal: string]: boolean } = {};

  mostrarVisorImagenes: boolean = false;
  imagenesVisor: string[] = [];
  sucursalSeleccionada: Sucursal | undefined;

  constructor(
    private firebaseStorage: FirebaseStorageService,
    private branchesService: BranchesService
  ) {}

  ngOnInit(): void {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }

  obtenerColorDeFondoSucursal(value: number): string {
    let str = '';

    if (value >= 5) {
      str = '#ff0000';
    }

    if (value > 0 && value <= 4) {
      str = '#ffe800';
    }

    if (value == 0) {
      str = '#00a312';
    }

    return str;
  }

  obtenerTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  ordenarSucursalesUser(catsucursales: Sucursal[]): Sucursal[] {
    return catsucursales.sort((a, b) => {
      const ticketsA = this.obtenerTicketsPorSucursal(a.id).length;
      const ticketsB = this.obtenerTicketsPorSucursal(b.id).length;
      return ticketsB - ticketsA; // Ordena de mayor a menor
    });
  }

  obtenerColorDeTexto(value: number): string {
    let str = '';

    if (value >= 5) {
      str = '#fff';
    }

    if (value > 0 && value <= 4) {
      str = '#000';
    }

    if (value == 0) {
      str = '#fff';
    }

    return str;
  }

  abrirModalDetalleTicket(ticket: Ticket | any) {
    this.clickEvent.emit(ticket);
  }

  verificarTicketsNuevos(tickets: Ticket[]) {
    let nuevosTickets = tickets.filter(x => x.idEstatusTicket == '1');
    return nuevosTickets.length > 0;
  }

  verificarChatNoLeido(tickets: Ticket[]): boolean {
    return tickets.some(ticket => {
      const participantes = ticket.participantesChat.sort((a, b) => b.ultimoComentarioLeido - a.ultimoComentarioLeido);
      const participante = participantes.find((p) => p.idUsuario === this.usuario.id);

      if (participante) {
        const ultimoComentarioLeido = participante.ultimoComentarioLeido;
        const comentarios = ticket.comentarios;

        return comentarios.length > ultimoComentarioLeido; // Si hay al menos 1 chat sin leer, devuelve true
      }

      return false;
    });
  }

  async onFileSelected(event: any, sucursal: Sucursal) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      Swal.fire({
        title: 'Subiendo imágenes...',
        text: 'Por favor, espera un momento.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const urls = await this.firebaseStorage.cargarImagenesNivelesAudio(fileArray, sucursal.id);
        
        if (!sucursal.imagenesNivelesAudio) {
          sucursal.imagenesNivelesAudio = [];
        }
        
        sucursal.imagenesNivelesAudio.push(...urls);
        await this.branchesService.update(sucursal, sucursal.id);

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Las imágenes se han subido y guardado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al subir imágenes:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al subir las imágenes.'
        });
      }
      event.target.value = ''; // Clear input
    }
  }

  verImagenes(sucursal: Sucursal) {
    if (sucursal.imagenesNivelesAudio && sucursal.imagenesNivelesAudio.length > 0) {
      this.sucursalSeleccionada = sucursal;
      this.imagenesVisor = [...sucursal.imagenesNivelesAudio];
      this.mostrarVisorImagenes = true;
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Sin imágenes',
        text: 'No hay imágenes de Niveles de Audio para esta sucursal.'
      });
    }
  }

  async onImagenEliminada(event: { url: string; titulo: string }) {
    if (this.sucursalSeleccionada && this.sucursalSeleccionada.imagenesNivelesAudio) {
      this.sucursalSeleccionada.imagenesNivelesAudio = this.sucursalSeleccionada.imagenesNivelesAudio.filter(u => u !== event.url);
      try {
        await this.branchesService.update(this.sucursalSeleccionada, this.sucursalSeleccionada.id);
        this.imagenesVisor = [...this.sucursalSeleccionada.imagenesNivelesAudio];
        if (this.imagenesVisor.length === 0) {
          this.mostrarVisorImagenes = false;
        }
      } catch (error) {
        console.error('Error al actualizar sucursal tras eliminar imagen:', error);
      }
    }
  }
}
