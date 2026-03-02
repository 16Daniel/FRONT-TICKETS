import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AvatarModule } from 'ngx-avatars';
import { TooltipModule } from 'primeng/tooltip';

import { TareasService } from '../../services/tareas.service';
import { LabelsTasksService } from '../../services/labels-tasks.service';
import { TaskResponsibleService } from '../../services/task-responsible.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Tarea } from '../../interfaces/tarea.interface';
import { EtiquetaTarea } from '../../interfaces/etiqueta-tarea.interface';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { EstatusTarea } from '../../interfaces/estatus-tarea.interface';
import { StatusTaskService } from '../../services/status-task.service';
import { AvataresResponsablesTareaComponent } from "../avatares-responsables-tarea/avatares-responsables-tarea.component";
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-tarjeta-tareas',
  standalone: true,
  imports: [CommonModule, DragDropModule, NgxChartsModule, AvatarModule, TooltipModule, AvataresResponsablesTareaComponent,FormsModule],
  providers: [MessageService],
  templateUrl: './tarjeta-tareas.component.html',
  styleUrls:[
    './tarjeta-tareas.component.scss',
    './tarjeta-tareas-checkbox.component.scss'
  ]

})
export class TarjetaTareasComponent implements OnInit {

  @Input() tarea!: Tarea;
  @Output() seleccionarTarea = new EventEmitter<Tarea>();
  @Input() nombreSucursal: string = '';
  @Input() esOtraSucursal: boolean = false;
  etiquetas: EtiquetaTarea[] = [];
  responsables: ResponsableTarea[] = [];
  sucursales: Sucursal[] = [];
  estatusTareas: EstatusTarea[] = [];
  estatusMap = new Map<string, string>();

  tareasService = inject(TareasService);
  messageService = inject(MessageService);
  labelsTasksService = inject(LabelsTasksService);
  taskResponsibleService = inject(TaskResponsibleService);
  sucursalesService = inject(BranchesService);
  estatusService = inject(StatusTaskService);
  usuario: Usuario;
  checkRevision:boolean = false;
  responsable:ResponsableTarea;
   constructor(public cdr:ChangeDetectorRef){
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
    this.responsable = JSON.parse(localStorage.getItem('responsable-tareas')!);
  }

  ngOnInit(): void {
    this.estatusService.estatus$.subscribe(estatus => {
      this.estatusTareas = estatus;

      this.estatusMap.clear();
      estatus.forEach(x => this.estatusMap.set(x.id!, x.nombre));
    });

    this.sucursalesService.get().subscribe(sucursales => this.sucursales = sucursales);

    this.labelsTasksService.etiquetas$.subscribe(et => {
      this.etiquetas = et;
    });

    this.taskResponsibleService.responsables$.subscribe(responsable => {
      this.responsables = responsable;
      this.responsables = this.taskResponsibleService.filtrarPorSucursal(this.tarea.idSucursal);
    });

    this.checkRevision = this.obtenerRevision();
  }

  onClick() {
    this.seleccionarTarea.emit(this.tarea);
  }

  async archivarTarea(tarea: Tarea) {
    const result = await Swal.fire({
      title: '¿Archivar tarea?',
      text: 'Esta tarea pasará al estatus ARCHIVADO.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, archivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    try {
      tarea.idEstatus = '5';
      tarea.fechaFin = new Date;
      await this.tareasService.update(tarea, tarea.id!);
      this.showMessage('success', 'Success', 'Archivado correctamente');
    } catch (error) {
      this.showMessage('error', 'Error', 'No se pudo archivar la tarea');
    }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  getProgressColor(porcentaje: number) {
    if (porcentaje < 40) return 'bg-danger';
    if (porcentaje < 70) return 'bg-warning';
    return 'bg-success';
  }

  getEtiquetaColor(id: string) {
    const et = this.etiquetas.find(e => e.id === id);
    return et ? et.color : '#ccc';
  }

  getEtiquetaNombre(id: string) {
    const et = this.etiquetas.find(e => e.id === id);
    return et ? et.nombre : '';
  }

  getPorcentajeUsado(tarea: Tarea): number {
    if (!tarea.fecha || !tarea.deathline) return 0;

    const inicio = new Date(tarea.fecha);
    inicio.setHours(0, 0, 0, 0);

    const fin = this.parseFechaLocal(tarea.deathline);
    fin.setHours(0, 0, 0, 0);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const totalDias =
      (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);

    if (totalDias <= 0) return 100;

    const diasUsados = Math.min(
      Math.max(
        (hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24),
        0
      ),
      totalDias
    );

    return Math.round((diasUsados / totalDias) * 100);
  }

  parseFechaLocal(fecha: any): Date {
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  getDiasRestantes(tarea: Tarea): number {
    if (!tarea.deathline) return 0;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fin = this.parseFechaLocal(tarea.deathline);
    fin.setHours(0, 0, 0, 0);

    const diff =
      (fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);

    return Math.max(Math.ceil(diff), 0);
  }

  getResponsablesDeTarea(tarea: Tarea) {
    return this.responsables.filter(r =>
      tarea.idsResponsables?.includes(r.id!)
    );
  }

  getSubtareasCompletadas(tarea: any): number {
    return tarea.subtareas?.filter((s: any) => s.terminado).length ?? 0;
  }

  obtenerNombreSucursal(idSucursal?: string): string {
    if (!idSucursal) return '';
    return this.sucursales.find(x => x.id == idSucursal)?.nombre ?? '';
  }

girar(id:string)
{
 let card = document.getElementById(id);
  if(card != null)
    {
       let front = document.getElementById('front-task-'+id);
      card!.classList.toggle('flipped');
      if(card.classList.contains('flipped'))
        {
          let front = document.getElementById('front-task-'+id);
          let back = document.getElementById('back-task-'+id);
          back!.style.height = (front!.offsetHeight-95)+'px';

        }
    }
}

async guardarNotas()
{
   this.girar(this.tarea.id!);
   setTimeout(() => {
      this.tareasService.update(this.tarea, this.tarea.id!);
      this.showMessage('success', 'Success', 'Guardado correctamente');
   }, 600);
}

obtenerRevision():boolean
{
  let revisiones = this.tarea.revisiones;
    if(revisiones == undefined){ revisiones = [];}
  let temp:boolean =revisiones.filter(x =>x.idUsuario == this.responsable.pin && x.ultimafecha >= Timestamp.fromDate(new Date())).length>0
  ? this.tarea.revisiones.filter(x =>x.idUsuario == this.responsable.pin)[0].revisado : false;
  return temp;
}

async atualizarRevision()
{
   let nuevafecha = new Date();
   nuevafecha.setDate(nuevafecha.getDate()+1);
    nuevafecha.setHours(2,0,0,0);
    let revisiones = this.tarea.revisiones;
    if(revisiones == undefined){ revisiones = [];}
  if(revisiones.filter(x=>x.idUsuario == this.responsable.pin).length == 0)
    {
        revisiones.push({idUsuario:this.responsable.pin,revisado:this.checkRevision,ultimafecha:Timestamp.fromDate(nuevafecha)});
    } else
      {
          for(let item of revisiones)
            {
              if(item.idUsuario == this.responsable.pin)
                {
                  item.ultimafecha = Timestamp.fromDate(nuevafecha);
                  item.revisado = this.checkRevision;
                }
            }
      }
  this.tarea.revisiones = revisiones;
  await this.tareasService.update(this.tarea, this.tarea.id!);
}

}
