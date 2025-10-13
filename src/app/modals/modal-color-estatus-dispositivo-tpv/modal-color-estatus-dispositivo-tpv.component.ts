import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-modal-color-estatus-dispositivo-tpv',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './modal-color-estatus-dispositivo-tpv.component.html',
  styleUrl: './modal-color-estatus-dispositivo-tpv.component.scss'
})
export class ModalColorEstatusDispositivoTpvComponent {
  @Input() mostrarModal: boolean = false;
  @Output() closeEvent = new EventEmitter<boolean>();

  onHide = () => this.closeEvent.emit();

}
