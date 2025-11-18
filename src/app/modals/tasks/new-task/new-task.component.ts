import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [DialogModule, FormsModule, CommonModule],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.scss'
})
export class NewTaskComponent {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide = () => this.closeEvent.emit(false);

  enviar(form: NgForm) {

  }
}
