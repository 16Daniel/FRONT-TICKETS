import {
  ChangeDetectorRef,
  Component,
  ViewChild,
  type OnInit,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { Dialog, DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { HttpClient } from '@angular/common/http';
import { Firestore, namedQuery } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { ApiService } from '../../../Services/api.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Sucursal } from '../../../Interfaces/Sucursal';
import { StatusTK, Ticket, TicketDB } from '../../../Interfaces/ticket';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Proveedor } from '../../../Interfaces/Proveedor';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Notificacion } from '../../../Interfaces/Notificacion';
import { UsuarioDB } from '../../../Interfaces/Usuario';
import HistorialTkComponent from '../../components/HistorialTk/HistorialTk.component';
import { Categoria } from '../../../Interfaces/Categoria';
import { AccordionModule } from 'primeng/accordion';
import { GeneradorFoliosService } from './generador-folios.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    EditorModule,
    ToastModule,
    CommonModule,
    TagModule,
    ConfirmDialogModule,
    OverlayPanelModule,
    HistorialTkComponent,
    AccordionModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './Home.component.html',
})
export default class HomeComponent implements OnInit {
  public modalagregart: boolean = false;
  public formdepto: any;
  public formprov: any;
  public formcategoria: any;
  public formnomsolicitante: any;
  public formdescripcion: string = '';
  public formprioridad: any;
  public formstatussuc: any;
  public catsucursales: Sucursal[] = [];
  public catproveedores: Proveedor[] = [];
  public catcategorias: Categoria[] = [];
  public catStatusT: StatusTK[] = [];
  public arr_tickets: TicketDB[] = [];
  public subscriptiontk: Subscription | undefined;
  public modalticket: boolean = false;
  public modalcomentarios: boolean = false;
  public modaladdcomentario: boolean = false;
  public itemtk: TicketDB | undefined;
  public formcomentario: string = '';
  public userdata: any;
  public sucursal: Sucursal | undefined;
  public catusuarioshelp: UsuarioDB[] = [];
  public selectedtk: TicketDB | undefined;
  public all_arr_tickets: TicketDB[] = [];
  public modalfiltros: boolean = false;
  public filterPrioridad: any | undefined;
  public filterarea: any | undefined;
  public filtercategoria: any | undefined;
  public filterstatus: any | undefined;
  public modalhistorial: boolean = false;
  public formtiposoporte: string = '';
  public formstatus: any;

  public modalfinalizar: boolean = false;
  public formfinalizar: string = '';

  public loading: boolean = false;

  @ViewChild('dialogHtk') dialog!: Dialog;

  constructor(
    private http: HttpClient,
    private firestore: Firestore,
    private auth: Auth,
    private apiserv: ApiService,
    public cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private generadorFoliosService: GeneradorFoliosService
  ) {
    this.userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.userdata.uid;
    console.log(this.userdata);

    this.getcatStatust();
    this.getDepartamentos();
    this.getProveedores();
    this.getCategorias();
    this.getusuarioshelp();

    if (this.userdata.idRol == '2') {
      this.getTicketsUser(idu);
    }

    if (this.userdata.idRol == '4') {
      this.getTicketsResponsable(idu);
    }
    this.sucursal = this.userdata.sucursales[0];
    this.formdepto = this.sucursal;
  }
  ngOnInit(): void {}

  openadd() {
    this.modalagregart = true;
  }

  async enviartk(): Promise<void> {
    this.apiserv.obtenerSecuencialTickets().then(async (count) => {
      let folio = this.generadorFoliosService.generarFolio(
        this.formdepto.id,
        count
      );

      console.log('Folio:', folio);

      let idu = this.userdata.uid;
      let comtk: any[] = [];
      let tk: Ticket = {
        fecha: new Date(),
        idsucordpto: this.formdepto.id,
        statusSuc: null,
        idproveedor: this.formprov.id,
        idcategoria: this.formcategoria.id,
        decripcion: this.formdescripcion,
        solicitante: this.formnomsolicitante,
        prioridadsuc: this.formprioridad.name,
        prioridadProv: null,
        status: '1',
        responsable: this.getResponsabletk(),
        comentarios: comtk,
        fechafin: null,
        duracion: null,
        tiposoporte: null,
        iduser: idu,
        nombreCategoria: this.formcategoria.nombre,
        folio
      };

      const docid = await this.apiserv.addticket(tk);
      this.showMessage('success', 'Success', 'ENVIADO CORRECTAMENTE');

      let dataNot: Notificacion = {
        titulo: 'NUEVO TICKET',
        mensaje:
          'SE GENERÓ UN NUEVO TICKET PARA LA SUCURSAL: ' +
          this.formdepto.nombre,
        uid: this.getResponsabletk(),
        fecha: new Date(),
        abierta: false,
        idtk: docid,
        notificado: false,
      };

      let idn = this.apiserv.addNotifiacion(dataNot);

      this.modalagregart = false;
      this.formdescripcion = '';
      this.formnomsolicitante = '';
      this.formcategoria = undefined;
      this.formstatussuc = undefined;
      this.formprov = undefined;
      this.formprioridad = undefined;
    });
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  getDepartamentos() {
    this.apiserv.getSucursalesDepto().subscribe({
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

  getCategorias() {
    this.apiserv.getCategorias().subscribe({
      next: (data) => {
        this.catcategorias = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getProveedores() {
    this.apiserv.getProveedores().subscribe({
      next: (data) => {
        this.catproveedores = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getcatStatust() {
    this.apiserv.getCatStatus().subscribe({
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

  changeprov() {
    this.formcategoria = undefined;
    this.cdr.detectChanges();
  }
  getCategoriasProv(): Categoria[] {
    let arr: Categoria[] = [];
    if (this.formprov != undefined) {
      arr = this.catcategorias.filter((x) => x.idprov == this.formprov.id);
    }
    return arr;
  }

  changeprovFilter() {
    if (this.filterarea != undefined) {
      this.apiserv.getCategoriasprov(this.filterarea.id).subscribe({
        next: (data) => {
          this.catcategorias = data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);
          this.showMessage('error', 'Error', 'Error al procesar la solicitud');
        },
      });
    }
  }

  async getTicketsUser(userid: string): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.apiserv
      .getRealTimeTicketsByUserId(userid)
      .subscribe({
        next: (data) => {
          console.log(data)

          this.arr_tickets = data;
          let arr_temp: TicketDB[] = [];
          let temp1: TicketDB[] = this.arr_tickets.filter(
            (x) => x.prioridadsuc == 'PÁNICO'
          );
          let temp2: TicketDB[] = this.arr_tickets.filter(
            (x) => x.prioridadsuc == 'ALTA'
          );
          let temp3: TicketDB[] = this.arr_tickets.filter(
            (x) => x.prioridadsuc == 'MEDIA'
          );
          let temp4: TicketDB[] = this.arr_tickets.filter(
            (x) => x.prioridadsuc == 'BAJA'
          );

          temp1 = temp1.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp2 = temp2.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp3 = temp3.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );

          temp4 = temp4.sort(
            (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
          );
          arr_temp = [...temp1, ...temp2, ...temp3, ...temp4];
          this.all_arr_tickets = [...arr_temp];
          this.arr_tickets = arr_temp;

          if (this.itemtk != undefined) {
            let temp = this.arr_tickets.filter((x) => x.id == this.itemtk!.id);
            if (temp.length > 0) {
              this.itemtk = temp[0];
            }
          }

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  async getTicketsResponsable(userid: string): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.apiserv.getTicketsResponsable(userid).subscribe({
      next: (data) => {
        this.arr_tickets = data;
        let arr_temp: TicketDB[] = [];
        let temp1: TicketDB[] = this.arr_tickets.filter(
          (x) => x.prioridadsuc == 'PÁNICO'
        );
        let temp2: TicketDB[] = this.arr_tickets.filter(
          (x) => x.prioridadsuc == 'ALTA'
        );
        let temp3: TicketDB[] = this.arr_tickets.filter(
          (x) => x.prioridadsuc == 'MEDIA'
        );
        let temp4: TicketDB[] = this.arr_tickets.filter(
          (x) => x.prioridadsuc == 'BAJA'
        );

        temp1 = temp1.sort(
          (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
        );

        temp2 = temp2.sort(
          (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
        );

        temp3 = temp3.sort(
          (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
        );

        temp4 = temp4.sort(
          (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
        );
        arr_temp = [...temp1, ...temp2, ...temp3, ...temp4];
        this.all_arr_tickets = [...arr_temp];
        this.arr_tickets = arr_temp;

        if (this.itemtk != undefined) {
          let temp = this.arr_tickets.filter((x) => x.id == this.itemtk!.id);
          if (temp.length > 0) {
            this.itemtk = temp[0];
          }
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al escuchar los tickets:', error);
      },
    });
  }

  ngOnDestroy() {
    if (this.subscriptiontk != undefined) {
      this.subscriptiontk.unsubscribe();
    }
  }

  getdate(tsmp: Timestamp): Date {
    // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
    const firestoreTimestamp = tsmp; // Ejemplo
    const date = firestoreTimestamp.toDate(); // Convierte a Date
    return date;
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
    str = 'danger';
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

  getBgPrioridad(value: string): string {
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

  showticket(item: any) {
    this.itemtk = this.selectedtk;
    this.modalticket = true;

    setTimeout(() => {
      var accordionItems = document.querySelectorAll('.accordion-collapse');
      accordionItems.forEach(function (item) {
        item.classList.remove('show'); // Cierra todas las secciones del accordion
      });
    }, 50);
  }

  showcomentarios(item: TicketDB) {
    this.itemtk = item;
    this.modalcomentarios = true;
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

    this.apiserv
      .updateTicket(this.itemtk)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');

        let dataNot: Notificacion = {
          titulo: 'NUEVO COMENTARIO',
          mensaje: 'HAY UN NUEVO COMENTARIO PARA EL TICKET: ' + this.itemtk!.id,
          uid: 'jBWVcuCQlRh3EKgSkWCz6JMYA9C2',
          fecha: new Date(),
          abierta: false,
          idtk: this.itemtk!.id,
          notificado: false,
        };

        let idn = this.apiserv.addNotifiacion(dataNot);

        this.formcomentario = '';
        this.modaladdcomentario = false;
      })
      .catch((error) =>
        console.error('Error al actualizar los comentarios:', error)
      );
  }

  esmiuid(id: string): boolean {
    let st = false;
    let userdata = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    let idu = this.userdata.uid;
    if (id == idu) {
      st = true;
    }
    return st;
  }

  getTicketsP(value: string): TicketDB[] {
    let temp = this.arr_tickets.filter(
      (x) => x.prioridadsuc == value && x.statusSuc != 'PÁNICO'
    );
    return temp.sort(
      (a, b) => b.fecha.toDate().getTime() - a.fecha.toDate().getTime()
    );
  }

  getTicketsPanico(): TicketDB[] {
    return this.arr_tickets.filter((x) => x.statusSuc == 'PÁNICO');
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
          uid: this.getResponsabletk(),
          fecha: new Date(),
          abierta: false,
          idtk: id,
          notificado: false,
        };

        let idn = this.apiserv.addNotifiacion(dataNot);
      },
      reject: () => {},
    });
  }

  updatestatusSuc(idt: string) {
    let temp = this.arr_tickets.filter((x) => x.id == idt);
    if (temp.length > 0) {
      let ticket = temp[0];
      ticket.statusSuc = 'PÁNICO';
      ticket.prioridadsuc = 'PÁNICO';

      this.apiserv
        .updateTicket(ticket)
        .then(() => {
          this.showMessage('success', 'Success', 'Enviado correctamente');
        })
        .catch((error) =>
          console.error('Error al actualizar los comentarios:', error)
        );
    }
  }

  getNameProveedor(idp: string): string {
    let str = '';
    let temp = this.catproveedores.filter((x) => x.id == idp);
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

  getusuarioshelp() {
    this.apiserv.getusers().subscribe({
      next: (data) => {
        this.catusuarioshelp = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  getResponsabletk(): string {
    let idr = '';
    for (let item of this.catusuarioshelp) {
      if (item.idRol == '4') {
        const existeSucursal = item.sucursales.some(
          (x) => x.id == this.formdepto.id
        );
        if (existeSucursal) {
          idr = item.uid;
        }
      }
    }

    return idr;
  }

  showModalFiltros() {
    this.modalfiltros = true;
  }

  filtrarT() {
    this.arr_tickets = [...this.all_arr_tickets];
    if (this.filterPrioridad != undefined) {
      this.arr_tickets = this.arr_tickets.filter(
        (x) => x.prioridadsuc == this.filterPrioridad.name
      );
    }

    if (this.filterarea != undefined) {
      this.arr_tickets = this.arr_tickets.filter(
        (x) => x.idproveedor == this.filterarea.id
      );
    }

    if (this.filtercategoria != undefined) {
      this.arr_tickets = this.arr_tickets.filter(
        (x) => x.idcategoria == this.filtercategoria.id
      );
    }
    if (this.filterstatus != undefined) {
      this.arr_tickets = this.arr_tickets.filter(
        (x) => x.status == this.filterstatus.id
      );
    }
    this.modalfiltros = false;
  }

  limpiarfiltro() {
    this.arr_tickets = [...this.all_arr_tickets];
    this.filterPrioridad = undefined;
    this.filterarea = undefined;
    this.filtercategoria = undefined;
    this.filterstatus = undefined;
    this.modalfiltros = false;
  }

  showHistorial() {
    this.modalhistorial = true;
    this.dialog.maximized = true;
  }

  getTicketsSuc(ids: string) {
    return this.arr_tickets.filter((x) => x.idsucordpto == ids);
  }

  updateasistencia() {
    if (this.formtiposoporte != '') {
      this.itemtk!.tiposoporte = this.formtiposoporte;
      this.apiserv
        .updateTicket(this.itemtk)
        .then(() => {
          this.showMessage('success', 'Success', 'Enviado correctamente');
          this.formtiposoporte = '';
        })
        .catch((error) =>
          console.error('Error al actualizar los comentarios:', error)
        );
    }
  }

  updatestatustk() {
    if (this.formstatus != null && this.formstatus != undefined) {
      this.itemtk!.status = this.formstatus.id;
      this.apiserv
        .updateTicket(this.itemtk)
        .then(() => {
          this.showMessage('success', 'Success', 'Enviado correctamente');

          if (this.formstatus.id == '3') {
            let tk = {
              Idtk: this.itemtk!.id,
              Fecha: this.getdate(this.itemtk!.fecha),
              IdSuc: this.itemtk!.idsucordpto,
              Statussuc: this.itemtk!.statusSuc,
              Idprov: this.itemtk!.idproveedor,
              Idcat: this.itemtk!.idcategoria,
              Descripcion: this.itemtk!.decripcion,
              Solicitante: this.itemtk!.solicitante,
              Prioridadsuc: this.itemtk!.prioridadsuc,
              Prioridadprov: this.itemtk!.prioridadProv,
              Status: this.itemtk!.status,
              Responsable: this.itemtk!.responsable,
              FechaFin: new Date(),
              Duracion: '',
              Tiposoporte: this.itemtk!.tiposoporte,
              Iduser: this.itemtk!.iduser,
              Comentarios: JSON.stringify(this.itemtk!.comentarios),
              Nombrecategoria: this.itemtk!.nombreCategoria,
              Comentariosfinales: '',
            };

            this.apiserv.AddTkSQL(tk).subscribe({
              next: (data) => {
                this.apiserv.deleteDocument('tickets', this.itemtk!.id);
                this.itemtk = undefined;
                this.modalticket = false;
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

  getNameResponsable(id: string): string {
    let name = '';

    let temp = this.catusuarioshelp.filter((x) => x.uid == id);
    if (temp.length > 0) {
      name = temp[0].nombre + ' ' + temp[0].apellidoP;
    }
    return name;
  }

  showfinalizar() {
    this.formfinalizar = '';
    this.modalfinalizar = true;
  }

  finalizartk() {
    this.itemtk!.status = '3';
    this.apiserv
      .updateTicket(this.itemtk)
      .then(() => {
        this.showMessage('success', 'Success', 'Enviado correctamente');

        let tk = {
          Idtk: this.itemtk!.id,
          Fecha: this.getdate(this.itemtk!.fecha),
          IdSuc: this.itemtk!.idsucordpto,
          Statussuc: this.itemtk!.statusSuc,
          Idprov: this.itemtk!.idproveedor,
          Idcat: this.itemtk!.idcategoria,
          Descripcion: this.itemtk!.decripcion,
          Solicitante: this.itemtk!.solicitante,
          Prioridadsuc: this.itemtk!.prioridadsuc,
          Prioridadprov: this.itemtk!.prioridadProv,
          Status: '3',
          Responsable: this.itemtk!.responsable,
          FechaFin: new Date(),
          Duracion: '',
          Tiposoporte: this.itemtk!.tiposoporte,
          Iduser: this.itemtk!.iduser,
          Comentarios: JSON.stringify(this.itemtk!.comentarios),
          Nombrecategoria: this.itemtk!.nombreCategoria,
          Comentariosfinales: this.formfinalizar,
        };

        this.apiserv.AddTkSQL(tk).subscribe({
          next: (data) => {
            this.apiserv.deleteDocument('tickets', this.itemtk!.id);
            this.itemtk = undefined;
            this.modalfinalizar = false;
            this.modalticket = false;
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
}
