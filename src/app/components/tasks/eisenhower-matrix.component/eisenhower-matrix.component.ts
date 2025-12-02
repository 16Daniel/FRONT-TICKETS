import { CommonModule } from '@angular/common';
import { Component, Input, type OnInit } from '@angular/core';
import { TareasService } from '../../../services/tareas.service';
import { MessageService } from 'primeng/api';
import { Tarea } from '../../../models/tarea.model';
import { TaskCardComponent } from "../task-card/task-card.component";
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-eisenhower-matrix',
  standalone: true,
  imports: [CommonModule, TaskCardComponent,DragDropModule],
  templateUrl: './eisenhower-matrix.component.html',
  styleUrl: './eisenhower-matrix.component.scss',
})
export class EisenhowerMatrixComponent implements OnInit {
@Input() idSucursal!: string;
tc1:Tarea[] = [];
tc2:Tarea[] = [];
tc3:Tarea[] = [];
tc4:Tarea[] = []; 

dropListIds = ['c1', 'c2', 'c3', 'c4'];


   constructor(
      private tareasService: TareasService,
      private messageService: MessageService,
    ) { }

  ngOnInit(): void { this.initData() }

    initData() {
      this.tareasService.getBySucursal(this.idSucursal).subscribe((tareas: Tarea[]) => {
        console.log(tareas)
        this.tc1 = tareas.filter( x=> x.idEstatus != '4' && x.idEstatusEisenhower == '1');
        this.tc2 = tareas.filter( x=> x.idEstatus != '4' && x.idEstatusEisenhower == '2');
        this.tc3 = tareas.filter( x=> x.idEstatus != '4' && x.idEstatusEisenhower == '3');
        this.tc4 = tareas.filter( x=> x.idEstatus != '4' && x.idEstatusEisenhower == '4'); 
      })
    }

  async drop(event: CdkDragDrop<Tarea[]>) {
    console.log("ORIGEN:", event.previousContainer.id, event.previousContainer.data);
    console.log("DESTINO:", event.container.id, event.container.data);

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
        tareaMovida.idEstatusEisenhower = '1';
        break;
      case 'c2':
        tareaMovida.idEstatusEisenhower = '2';
        break;
      case 'c3':
        tareaMovida.idEstatusEisenhower = '3';
        break;
      case 'c4':
        tareaMovida.idEstatusEisenhower = '4';
        break;

    }

   await this.tareasService.update(tareaMovida, tareaMovida.id!);
    this.showMessage('success', 'Success', 'Enviado correctamente');
  }

   showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
}
