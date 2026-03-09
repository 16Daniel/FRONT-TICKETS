import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';

import { Tarea } from '../../interfaces/tarea.interface';
import { ResponsableTarea } from '../../interfaces/responsable-tarea.interface';
import { TareasService } from '../../services/tareas.service';

@Component({
  selector: 'app-cosmic-chechbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cosmic-chechbox.component.html',
  styleUrl: './cosmic-chechbox.component.scss'
})
export class CosmicChechboxComponent implements OnInit {
  @Input() tarea: Tarea | undefined;
  responsable: ResponsableTarea | undefined;
  tareasService = inject(TareasService);
  checkRevision: boolean = false;

  ngOnInit() {
    this.responsable = JSON.parse(localStorage.getItem('responsable-tareas')!);
    this.checkRevision = this.obtenerRevision();
  }

  obtenerRevision(): boolean {
    let revisiones = this.tarea!.revisiones;
    if (revisiones == undefined) { revisiones = []; }
    let temp: boolean = revisiones.filter(x => x.idUsuario == this.responsable!.pin && x.ultimafecha >= Timestamp.fromDate(new Date())).length > 0
      ? this.tarea!.revisiones.filter(x => x.idUsuario == this.responsable!.pin)[0].revisado : false;
    return temp;
  }

  async atualizarRevision() {
    let nuevafecha = new Date();
    nuevafecha.setDate(nuevafecha.getDate() + 1);
    nuevafecha.setHours(2, 0, 0, 0);
    let revisiones = this.tarea!.revisiones;
    if (revisiones == undefined) { revisiones = []; }
    if (revisiones.filter(x => x.idUsuario == this.responsable!.pin).length == 0) {
      revisiones.push({ idUsuario: this.responsable!.pin, revisado: this.checkRevision, ultimafecha: Timestamp.fromDate(nuevafecha) });
    } else {
      for (let item of revisiones) {
        if (item.idUsuario == this.responsable!.pin) {
          item.ultimafecha = Timestamp.fromDate(nuevafecha);
          item.revisado = this.checkRevision;
        }
      }
    }
    this.tarea!.revisiones = revisiones;
    await this.tareasService.update(this.tarea!, this.tarea!.id!);
  }
}
