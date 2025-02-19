import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Auth } from '@angular/fire/auth';
import { Firestore, Timestamp } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Sucursal } from '../../models/sucursal.model';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Ticket } from '../../models/ticket.model';
import { StatusTicket } from '../../models/status-ticket.model';
import { TicketsService } from '../../services/tickets.service';
import { NotificationsService } from '../../services/notifications.service';
import { DocumentsService } from '../../services/documents.service';
import { Notificacion } from '../../models/notificacion.model';
import { Usuario } from '../../models/usuario.model';
import { SucursalesService } from '../../services/sucursales.service';
import { EstatusTicketService } from '../../services/estatus-ticket.service';
import { AreasService } from '../../services/areas.service';
import { Area } from '../../models/area';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    DialogModule,
    DropdownModule,
    FormsModule,
    EditorModule,
    ToastModule,
    CommonModule,
    TagModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tickets.component.html',
})
export default class TicketsComponent implements OnInit {
  public idt: string = '';
  public itemtk: Ticket | undefined;
  public modalcomentarios: boolean = false;
  public catsucursales: Sucursal[] = [];
  public catAreas: Area[] = [];
  public catStatusT: StatusTicket[] = [];
  public userdata: any;
  public modaladdcomentario: boolean = false;
  public formcomentario: string = '';
  public formstatus: any;
  public formtiposoporte: string = '';
  public modalfinalizar: boolean = false;
  public formfinalizar: string = '';
  public catusuarioshelp: Usuario[] = [];

  constructor(
    private route: ActivatedRoute,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private ticketsService: TicketsService,
    private estatusTicketService: EstatusTicketService,
    private notificationsService: NotificationsService,
    private documentsService: DocumentsService,
    private sucursalesServices: SucursalesService,
    private areasService: AreasService
    
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);

    this.getdataTK();
    this.getcatStatust();
    this.getDepartamentos();
    this.getProveedores();
  }

  ngOnInit(): void {
    this.idt = this.route.snapshot.paramMap.get('idt') || ''; // Obtiene el parámetro
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  getProveedores() {
    this.areasService.get().subscribe({
      next: (data) => {
        this.catAreas = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getcatStatust() {
    this.estatusTicketService.get().subscribe({
      next: (data) => {
        this.catStatusT = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getDepartamentos() {
    this.sucursalesServices.get().subscribe({
      next: (data) => {
        this.catsucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getdataTK() {
    this.ticketsService.getById(this.idt).subscribe({
      next: (data) => {
        this.itemtk = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }
  showcomentarios(item: Ticket) {
    this.itemtk = item;
    this.modalcomentarios = true;
  }

  panico(id: string) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: 'El estado del ticket se cambiará a Pánico ¿Desea continuar?',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',
      accept: () => {
        this.updatestatusSuc(id);

        let dataNot: Notificacion = {
          titulo: 'ALERTA DE PÁNICO',
          mensaje:
            'EL TICKET CON EL ID: ' + id + ' HA CAMBIADO AL ESTATUS DE PÁNICO',
          uid: 'jBWVcuCQlRh3EKgSkWCz6JMYA9C2',
          fecha: new Date(),
          abierta: false,
          idTicket: id,
          notificado: false,
        };

        let idn = this.notificationsService.addNotifiacion(dataNot);
      },
      reject: () => {},
    });
  }

  updatestatusSuc(idt: string) {
    if (this.itemtk != undefined) {
      let ticket = this.itemtk;
      ticket.estatusSucursal = 'PÁNICO';
      ticket.prioridadSucursal = 'PÁNICO';

      this.ticketsService
        .update(ticket)
        .then(() => {
          this.showMessage('success', 'Success', 'Enviado correctamente');
        })
        .catch((error) =>
          console.error('Error al actualizar los comentarios:', error)
        );
    }
  }

  getNameDpto(id: string): string {
    let name = '';
    let temp = this.catsucursales.filter((x) => x.id == id);
    if (temp.length > 0) {
      name = temp[0].nombre;
    }
    return name;
  }

  getseverityp(
    value: string
  ):
    | 'success'
    | 'secondary'
    | 'info'
    | 'warning'
    | 'danger'
    | 'contrast'
    | undefined {
    let str:
      | 'success'
      | 'secondary'
      | 'info'
      | 'warning'
      | 'danger'
      | 'contrast'
      | undefined;
    if (value == 'ALTA') {
      str = 'danger';
    }

    if (value == 'MEDIA') {
      str = 'warning';
    }

    if (value == 'BAJA') {
      str = 'success';
    }
    return str;
  }

  getdate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
  }

  getNameProveedor(idp: string): string {
    let str = '';
    let temp = this.catAreas.filter((x) => x.id == idp);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  getNameStatus(idst: string): string {
    let str = '';
    let temp = this.catStatusT.filter((x) => x.id == idst);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  showaddcomentario() {
    this.modaladdcomentario = true;
  }

  addComentariotk() {
    let idu = this.userdata.uid;

    let data = {
      nombre: this.userdata.nombre + ' ' + this.userdata.apellidoP,
      uid: idu,
      comentario: this.formcomentario,
      fecha: new Date(),
    };
    this.itemtk!.comentarios.push(data);

    this.ticketsService
      .update(this.itemtk)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');

        let dataNot: Notificacion = {
          titulo: 'NUEVO COMENTARIO',
          mensaje: 'HAY UN NUEVO COMENTARIO PARA EL TICKET: ' + this.itemtk!.id,
          uid: 'jBWVcuCQlRh3EKgSkWCz6JMYA9C2',
          fecha: new Date(),
          abierta: false,
          idTicket: this.itemtk!.id,
          notificado: false,
        };

        let idn = this.notificationsService.addNotifiacion(dataNot);

        this.formcomentario = '';
        this.modaladdcomentario = false;
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  esmiuid(id: string): boolean {
    let st = false;
    let idu = this.userdata.uid;
    if (id == idu) {
      st = true;
    }
    return st;
  }

  updatestatustk() {
    if (this.formstatus != null && this.formstatus != undefined) {
      this.itemtk!.estatus = this.formstatus.id;
      this.ticketsService
        .update(this.itemtk)
        .then(() => {
          this.showMessage('success', 'Success', 'Enviado correctamente');

          if (this.formstatus.id == '3') {
            let tk = {
              Idtk: this.itemtk!.id,
              Fecha: this.getdate(this.itemtk!.fecha),
              IdSuc: this.itemtk!.idSucursal,
              Statussuc: this.itemtk!.estatusSucursal,
              Idprov: this.itemtk!.idProveedor,
              Idcat: this.itemtk!.idCategoria,
              Descripcion: this.itemtk!.decripcion,
              Solicitante: this.itemtk!.solicitante,
              Prioridadsuc: this.itemtk!.prioridadSucursal,
              Prioridadprov: this.itemtk!.prioridadProveedor,
              Status: this.itemtk!.estatus,
              Responsable: this.itemtk!.responsable,
              FechaFin: new Date(),
              Duracion: '',
              Tiposoporte: this.itemtk!.tipoSoporte,
              Iduser: this.itemtk!.idUsuario,
              Comentarios: JSON.stringify(this.itemtk!.comentarios),
              Nombrecategoria: this.itemtk!.nombreCategoria,
              Comentariosfinales: '',
            };

            this.ticketsService.AddTkSQL(tk).subscribe({
              next: (data) => {
                this.documentsService.deleteDocument('tickets', this.itemtk!.id);
                this.itemtk = undefined;
              },
              error: (error) => {
                console.log(error);
                this.showMessage(
                  'error',
                  'Error',
                  'Error al procesar la solicitud'
                );
              },
            });
          }

          this.formstatus = undefined;
        })
        .catch((error) =>
          console.error('Error al actualizar los comentarios:', error)
        );
    }
  }

  showfinalizar() {
    this.formfinalizar = '';
    this.modalfinalizar = true;
  }

  finalizartk() {
    this.itemtk!.estatus = 3;
    this.ticketsService
      .update(this.itemtk)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');

        let tk = {
          Idtk: this.itemtk!.id,
          Fecha: this.getdate(this.itemtk!.fecha),
          IdSuc: this.itemtk!.idSucursal,
          Statussuc: this.itemtk!.estatusSucursal,
          Idprov: this.itemtk!.idProveedor,
          Idcat: this.itemtk!.idCategoria,
          Descripcion: this.itemtk!.decripcion,
          Solicitante: this.itemtk!.solicitante,
          Prioridadsuc: this.itemtk!.prioridadSucursal,
          Prioridadprov: this.itemtk!.prioridadProveedor,
          Status: '3',
          Responsable: this.itemtk!.responsable,
          FechaFin: new Date(),
          Duracion: '',
          Tiposoporte: this.itemtk!.tipoSoporte,
          Iduser: this.itemtk!.idUsuario,
          Comentarios: JSON.stringify(this.itemtk!.comentarios),
          Nombrecategoria: this.itemtk!.nombreCategoria,
          Comentariosfinales: this.formfinalizar,
        };

        this.ticketsService.AddTkSQL(tk).subscribe({
          next: (data) => {
            this.documentsService.deleteDocument('tickets', this.itemtk!.id);
            this.itemtk = undefined;
            this.modalfinalizar = false;
          },
          error: (error) => {
            console.log(error);
            this.showMessage(
              'error',
              'Error',
              'Error al procesar la solicitud'
            );
          },
        });
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  updateasistencia() {
    if (this.formtiposoporte != '') {
      this.itemtk!.tipoSoporte = this.formtiposoporte;
      this.ticketsService
        .update(this.itemtk)
        .then(() => {
          this.showMessage('success', 'Success', 'Enviado correctamente');
          this.formtiposoporte = '';
        })
        .catch((error) =>
          console.error('Error al actualizar los comentarios:', error)
        );
    }
  }

  getNameResponsable(id: string): string {
    let name = '';

    let temp = this.catusuarioshelp.filter((x) => x.uid == id);
    if (temp.length > 0) {
      name = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return name;
  }
}
