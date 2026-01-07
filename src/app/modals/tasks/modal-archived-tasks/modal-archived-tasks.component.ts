import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-modal-archived-tasks',
  standalone: true,
  imports: [
    FormsModule,

    DialogModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,

    // NgxAvatarsModule
  ],
  templateUrl: './modal-archived-tasks.component.html',
  styleUrl: './modal-archived-tasks.component.scss'
})
export class ModalArchivedTasksComponent {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide = () => this.closeEvent.emit(false);
}
