import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal-labels-task',
  standalone: true,
  imports: [
    DialogModule,
    FormsModule
  ],
  templateUrl: './modal-labels-task.component.html',
  styleUrl: './modal-labels-task.component.scss'
})
export class ModalLabelsTaskComponent {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide = () => this.closeEvent.emit(false);

  async enviar(form: NgForm) {
  }
}
