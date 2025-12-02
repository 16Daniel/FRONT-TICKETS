import { CommonModule } from '@angular/common';
import { Component, Input, type OnInit } from '@angular/core';
import { TareasService } from '../../../services/tareas.service';
import { MessageService } from 'primeng/api';
import { Tarea } from '../../../models/tarea.model';
import { TaskCardComponent } from "../task-card/task-card.component";
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskEisenhowerCard } from "../task-eisenhower-card/task-eisenhower-card";
import { StatusTaskService } from '../../../services/status-task.service';
import { EstatusTarea } from '../../../models/estatus-tarea.model';

@Component({
  selector: 'app-eisenhower-matrix',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskEisenhowerCard],
  templateUrl: './eisenhower-matrix.component.html',
  styleUrl: './eisenhower-matrix.component.scss',
})
export class EisenhowerMatrixComponent implements OnInit {
@Input() idSucursal!: string;
tc1:Tarea[] = [];
tc2:Tarea[] = [];
tc3:Tarea[] = [];
tc4:Tarea[] = []; 
loading:boolean = true; 
dropListIds = ['c1', 'c2', 'c3', 'c4'];
 catEstatusTareas: EstatusTarea[] = []; 

   constructor(
      private tareasService: TareasService,
      private messageService: MessageService,
      private statustaskService:StatusTaskService
    ) { 
      this.statustaskService.estatus$.subscribe(catEstatus => this.catEstatusTareas = catEstatus)
     }

  ngOnInit(): void { this.initData() }

    initData() {
      this.tareasService.getBySucursal(this.idSucursal).subscribe((tareas: Tarea[]) => {
        this.tc1 = tareas.filter( x=> x.idEstatus != '4' && x.idEisenhower == '1');
        this.tc2 = tareas.filter( x=> x.idEstatus != '4' && x.idEisenhower == '2');
        this.tc3 = tareas.filter( x=> x.idEstatus != '4' && x.idEisenhower == '3');
        this.tc4 = tareas.filter( x=> x.idEstatus != '4' && x.idEisenhower == '4'); 
        this.loading = false; 
      })
    }

  async drop(event: CdkDragDrop<Tarea[]>) {

    const tareaMovida = event.item.data as Tarea;
    console.log("TAREA MOVIDA:", tareaMovida);

    if (!tareaMovida) {
      console.warn("No se pudo obtener la tarea movida");
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    switch (event.container.id) {
      case 'c1':
        tareaMovida.idEisenhower = '1';
        tareaMovida.urgente = 'URGENTE';
        tareaMovida.importante = 'IMPORTANTE';
        break;
      case 'c2':
        tareaMovida.idEisenhower = '2';
        tareaMovida.urgente = 'NO URGENTE';
        tareaMovida.importante = 'IMPORTANTE';
        break;
      case 'c3':
        tareaMovida.idEisenhower = '3';
        tareaMovida.urgente = 'URGENTE';
        tareaMovida.importante = 'NO IMPORTANTE';
        break;
      case 'c4':
        tareaMovida.idEisenhower = '4';
        tareaMovida.urgente = 'NO URGENTE';
        tareaMovida.importante = 'NO IMPORTANTE';
        break;

    }

   await this.tareasService.update(tareaMovida, tareaMovida.id!);
    this.showMessage('success', 'Success', 'Enviado correctamente');
  }

   showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
