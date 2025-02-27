import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-modal-event-detail',
  standalone: true,
  imports: [DialogModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './modal-event-detail.component.html',
})
export default class ModalEventDetailComponent implements OnInit {
@Input() showModalEventeDetail:boolean = false; 
@Output() closeEvent = new EventEmitter<boolean>();
  ngOnInit(): void { }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }
}
