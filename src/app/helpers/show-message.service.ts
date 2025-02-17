import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ShowMessageService {
  constructor(private messageService: MessageService) { }

  /**
   * Método para mostrar una notificación de éxito
   * @param message
   */
  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  /**
   * Método para mostrar una notificación de error
   * @param message
   */
  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }
}
