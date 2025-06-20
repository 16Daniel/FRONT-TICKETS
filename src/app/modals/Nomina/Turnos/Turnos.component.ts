import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { NominaService } from '../../../services/nomina.service';
import { DropdownModule } from 'primeng/dropdown';
import { TurnodbNomina, TurnoNomina } from '../../../models/Nomina';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports:[DialogModule, CommonModule,FormsModule,DropdownModule,TableModule,ToastModule,ConfirmDialogModule],
  providers:[MessageService,ConfirmationService],
  templateUrl: './Turnos.component.html',
  styleUrl: './Turnos.component.scss',
})
export class TurnosComponent implements OnInit {
@Input() mostrarModalTurnos: boolean = false;
@Output() closeEvent = new EventEmitter<boolean>();
 public turnos:TurnoNomina[] = []; 
  public turnosdb:TurnodbNomina[] = []; 
public turnoSel:TurnoNomina|undefined; 
public formnombre:string = 'NOMBRE'

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

   constructor( public cdr: ChangeDetectorRef,public apiserv:NominaService, private messageService: MessageService,private confirmationService: ConfirmationService){}

     showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  ngOnInit(): void 
  {
    this.getTurnos(); 
    this.getTurnosDB();
   }

       getTurnos()
  {
     this.apiserv.getTurnos().subscribe({
      next: data => {
         this.turnos = data;
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });

  }

       getTurnosDB()
  {
     this.apiserv.getTurnosdb().subscribe({
      next: data => {
         this.turnosdb = data;
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });

  }

  cambiarTurno()
  {
    this.formnombre = this.turnoSel!.nombre; 
  }
  

  agregarTurno()
  {
    if(this.formnombre == "")
      {
         this.showMessage('info', 'Error', 'Ingresar el nombre del turno');
        return
      }

     this.apiserv.addTurnodb(this.turnoSel!.idTurno,this.turnoSel!.nombre,this.formnombre).subscribe({
      next: data => {
        this.getTurnosDB(); 
         this.showMessage('success', 'Success', 'Guardado correctamente');
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
  });
  }

 borrarTurno(cla_turno:number)
 {
  this.confirmationService.confirm({
      header: 'Confirmación',
      message: `¿Está seguro que desea eliminar el turno?`,
      acceptLabel: 'Aceptar', // 🔥 Cambia "Yes" por "Aceptar"
      rejectLabel: 'Cancelar', // 🔥 Cambia "No" por "Cancelar"
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {
             this.apiserv.borrarTurno(cla_turno).subscribe({
      next: data => {
        this.getTurnosDB(); 
         this.showMessage('success', 'Success', 'Eliminado correctamente');
         this.cdr.detectChanges();
      },
      error: error => {
         console.log(error);
      }
        });
      },
      reject: () => { },
    });

 }



}
