import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { TicketDB } from '../../../models/ticket-db.model';
import { TableModule } from 'primeng/table';
import { Proveedor } from '../../../models/proveedor.model';
import { CommonModule } from '@angular/common';
import { CatalogosService } from '../../../services/catalogs.service';
import { MessageService } from 'primeng/api';
import { Timestamp } from '@angular/fire/firestore';
import { UsuarioDB } from '../../../models/usuario-db.model';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-requester-tickets-list',
  standalone: true,
  imports: [TableModule, CommonModule],
  templateUrl: './requester-tickets-list.component.html',
  styleUrl: './requester-tickets-list.component.scss',
})
export class RequesterTicketsListComponent implements OnInit {
  @Input() tickets: TicketDB[] = [];
  @Output() clickEvent = new EventEmitter<TicketDB>();

  proveedores: Proveedor[] = [];
  ticketSeleccionado: TicketDB | undefined;
  userdata: any;
  usuariosHelp: UsuarioDB[] = [];

  constructor(
    private catalogosService: CatalogosService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.obtenerProveedores();
    this.obtenerUsuariosHelp();
  }

  obtenerNombreProveedor(idProveedor: string): string {
    let nombre = '';
    let proveedor = this.proveedores.filter((x) => x.id == idProveedor);
    if (proveedor.length > 0) {
      nombre = proveedor[0].nombre;
    }
    return nombre;
  }

  obtenerBackgroundColorPrioridad(value: string): string {
    let str = '';

    if (value == 'ALTA') {
      str = '#ff0000';
    }

    if (value == 'MEDIA') {
      str = '#ffe800';
    }

    if (value == 'BAJA') {
      str = '#61ff00';
    }
    return str;
  }

  obtenerProveedores() {
    this.catalogosService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  onClick() {
    this.clickEvent.emit(this.ticketSeleccionado);
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  getdate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
  }

  obtenerNombreResponsable(id: string): string {
    let nombre = '';

    let temp = this.usuariosHelp.filter((x) => x.uid == id);
    if (temp.length > 0) {
      nombre = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return nombre;
  }

  obtenerUsuariosHelp() {
    this.usersService.getusers().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  onPanicoClick(idTicket: string) {
    console.log(idTicket)
  }

  onClickFinalizar() {
    // this.formfinalizar = '';
    // this.modalfinalizar = true;
  }
}
