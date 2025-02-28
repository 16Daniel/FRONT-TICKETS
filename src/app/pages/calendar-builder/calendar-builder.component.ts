import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { TicketsService } from '../../services/tickets.service';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../services/users.service';
import { BranchesService } from '../../services/branches.service';
import { Sucursal } from '../../models/sucursal.model';
import { Usuario } from '../../models/usuario.model';
import { PickListModule } from 'primeng/picklist';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Ticket } from '../../models/ticket.model';
import { Mantenimiento10x10 } from '../../models/mantenimiento-10x10.model';
import { Subscription } from 'rxjs';
import { EditorModule } from 'primeng/editor';
import { Visita } from '../../models/visita';
import { Timestamp } from '@angular/fire/firestore';
import { VisitasService } from '../../services/visitas.service';
@Component({
  selector: 'app-calendar-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PickListModule,
    DropdownModule,
    ToastModule,
    CalendarModule,
    EditorModule
  ],
  providers: [MessageService],  
  templateUrl: './calendar-builder.component.html',
})
export default class CalendarBuilderComponent implements OnInit {
public sucursales:Sucursal[] = [];
public sucursalesSeleccionadas:Sucursal[] = [];  
public usuariosHelp:Usuario[] = [];
public usuarioseleccionado:Usuario|undefined; 
public fecha = new Date();  
public ordenarxmantenimiento:boolean = false; 
public arr_ultimosmantenimientos:Mantenimiento10x10[] = []; 
public tickets: Ticket[] = [];
public todosLosTickets: Ticket[] = [];
public itemtk: Ticket | undefined;
subscriptiontk: Subscription | undefined;
public loading:boolean = false; 
public formComentarios:string=""; 
 constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private visitasService:VisitasService
  ) 
  {
    registerLocaleData(localeEs);
  }
  ngOnInit(): void 
  {
  // this.obtenerSucursales(); 
   this.obtenerUsuariosHelp(); 
   this.fecha.setDate(new Date().getDate() + 1); // Suma 1 día
   }

   showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
async getTicketsResponsable(userid: string): Promise<void> {
    this.loading = true;
    this.subscriptiontk = this.ticketsService
      .getTicketsResponsable(userid)
      .subscribe({
        next: (data) => {
          this.tickets = []; 
          this.tickets = data;
          let arr_temp: Ticket[] = [];
          let temp1: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '1'
          );
          let temp2: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '2'
          );
          let temp3: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '3'
          );
          let temp4: Ticket[] = this.tickets.filter(
            (x) => x.idPrioridadTicket == '4'
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
          this.todosLosTickets = [...arr_temp];
          this.tickets = arr_temp;

          if (this.itemtk != undefined) {
            let temp = this.tickets.filter((x) => x.id == this.itemtk!.id);
            if (temp.length > 0) {
              this.itemtk = temp[0];
            }
          }

          this.sucursales = [...this.usuarioseleccionado!.sucursales];
          this.sucursalesSeleccionadas = []; 
          let sucursalesordenadasticket = this.ordenarSucursalesUser(this.sucursales); 
          if(this.obtenerTicketsPorSucursal(sucursalesordenadasticket[0]).length == 0)
            {
              this.ordenarxmantenimiento = true; 
            } 
          
          this.sucursalesSeleccionadas.push(this.ordenarSucursalesUser(this.sucursales)[0]);
          this.sucursales.shift(); 
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al escuchar los tickets:', error);
        },
      });
  }

  obtenerUsuariosHelp() {
    this.usersService.getusers().subscribe({
      next: (data) => {
        this.usuariosHelp = data;
        this.usuariosHelp = this.usuariosHelp.filter(x => x.idRol == '4'); 
         this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  }

  obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
  } 

  ordenarSucursalesUser(catsucursales: Sucursal[]): Sucursal[] {
    
    return catsucursales.sort((a, b) => {
      if(this.ordenarxmantenimiento)
        {
          const mantenimientoA = this.obtenerPorcentajedeUltimoMantenimiento(a.id);
          const mantenimientoB = this.obtenerPorcentajedeUltimoMantenimiento(b.id);
          return mantenimientoA - mantenimientoB; // Ordena de mayor a menor
        }else
        {
          const ticketsA = this.obtenerTicketsPorSucursal(a.id).length;
          const ticketsB = this.obtenerTicketsPorSucursal(b.id).length;
          return ticketsB - ticketsA; // Ordena de mayor a menor
        }
    });
  }

  obtenerTicketsPorSucursal(idSucursal: number | any) {
    return this.tickets.filter((x) => x.idSucursal == idSucursal);
  }

  obtenerPorcentajedeUltimoMantenimiento(idSucursal:string):number
  {
      let porcentaje = 0; 
      let registro = this.arr_ultimosmantenimientos.filter(x => x.idSucursal == idSucursal); 
      if(registro.length>0)
      {
        porcentaje = this.calcularPorcentaje(registro[0]);
      }
      return porcentaje
  }

  calcularPorcentaje(mantenimiento: Mantenimiento10x10):number {
    let porcentaje = 0;
    mantenimiento.mantenimientoCaja ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoImpresoras ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoRack ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoPuntosVentaTabletas
      ? (porcentaje += 10)
      : porcentaje;
    mantenimiento.mantenimientoContenidosSistemaCable
      ? (porcentaje += 10)
      : porcentaje;
    mantenimiento.mantenimientoInternet ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoCCTV ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoNoBrakes ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoTiemposCocina ? (porcentaje += 10) : porcentaje;
    mantenimiento.mantenimientoConcentradorApps
      ? (porcentaje += 10)
      : porcentaje;

    return porcentaje;
  }

  Consultarusuario()
  {
    this.tickets = []; 
    this.sucursales = []; 
    this.sucursalesSeleccionadas = []; 
    if(this.usuarioseleccionado != undefined)
      {
          this.getTicketsResponsable(this.usuarioseleccionado!.uid); 
      }
  }

  async guardarVisita()
  {
    let visita:Visita =
    {
      idUsuario: this.usuarioseleccionado!.uid, 
      fecha: Timestamp.fromDate(this.fecha),
      sucursales: this.sucursalesSeleccionadas,
      comentarios: this.formComentarios
    }
    
    try {
      await this.visitasService.create(visita); 
      this.showMessage('success', 'Success', 'Enviado correctamente');
      this.formComentarios = ''; 
      this.tickets = []; 
      this.sucursales = []; 
      this.sucursalesSeleccionadas = []; 
      this.usuarioseleccionado = undefined; 
    } catch (error) {
      this.showMessage('error','Error','Error al guardar');
      console.log(error);
    }
     
  }
}
