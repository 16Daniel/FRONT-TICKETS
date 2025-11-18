import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [DialogModule, FormsModule],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide = () => this.closeEvent.emit(false);

  enviar(form: NgForm) {

  }
}
