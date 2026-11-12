import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ModalComiteCreateComponent } from '../../dialogs/modal-comite-create/modal-comite-create.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Comite } from '../../interfaces/comite';
import { ComitesService } from '../../services/comites.service';
import { AreasService } from '../../../areas/services/areas.service';
import { ResponsablesService } from '../../../usuarios/services/responsables.service';
import { AvatarComponent } from 'ngx-avatars';

@Component({
  selector: 'app-comites-page',
  standalone: true,
  imports: [ FormsModule,
      CommonModule,
      ButtonModule,
      TableModule,
      ToastModule,
      TooltipModule,
      InputTextModule,
      ConfirmDialogModule,
      AvatarComponent,
      ModalComiteCreateComponent,
      PageHeaderComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './comites-page.html',
  styleUrl: './comites-page.scss',
})
export class ComitesPage {
 
   esNuevoComite: boolean = false;
   mostrarModalComite: boolean = false;
   comiteSeleccionado: Comite = new Comite();
 
   constructor(
     private confirmationService: ConfirmationService,
     public comitesService: ComitesService,
     public areasService: AreasService,
     public responsablesService: ResponsablesService,
     private messageService: MessageService,
   ) { }

   obtenerNombreArea(idArea: string): string {
     const area = this.areasService.areas.find(
       (item) => String(item.id) === String(idArea),
     );
     return area?.nombre ?? idArea;
   }

   obtenerNombreResponsable(idResponsable: string): string {
     const responsable = this.responsablesService.responsables.find(
       (item) => String(item.id) === String(idResponsable),
     );
     return responsable?.nombre ?? idResponsable;
   }

   obtenerResponsables(comite: Comite) {
     const idsSeleccionados = new Set(comite.idsResponsables ?? []);
     return this.responsablesService.responsables.filter(
       (responsable) => responsable.id && idsSeleccionados.has(responsable.id),
     );
   }
 
   abrirModalCrearComite() {
     this.esNuevoComite = true;
     this.comiteSeleccionado = new Comite();
     this.mostrarModalComite = true;
   }
 
   abrirModalEditarComite(comite: Comite) {
     this.esNuevoComite = false;
     this.comiteSeleccionado = comite;
     this.mostrarModalComite = true;
   }
 
   confirmaEliminacion(id: string | undefined) {
     if (!id) {
       this.showMessage('error', 'Error', 'No se encontró el ID del comité.');
       return;
     }

     this.confirmationService.confirm({
       header: 'Confirmación',
       message: '¿Está seguro que desea eliminar?',
       acceptIcon: 'pi pi-check mr-2',
       rejectIcon: 'pi pi-times mr-2',
       acceptButtonStyleClass: 'btn bg-p-b p-3',
       rejectButtonStyleClass: 'btn btn-light me-3 p-3',
       accept: () => {
         void this.eliminarComite(id);
       },
       reject: () => { },
     });
   }
 
   async eliminarComite(idComite: string) {
     try {
       await this.comitesService.delete(idComite);
       this.showMessage('success', 'Éxito', 'Comité eliminado correctamente');
     } catch (error) {
       this.showMessage(
         'error',
         'Error',
         error instanceof Error ? error.message : 'No se pudo eliminar el comité.',
       );
     }
   }
 
   cerrarModalComite() {
     this.mostrarModalComite = false;
     this.comiteSeleccionado = new Comite();
   }
 
   showMessage(sev: string, summ: string, det: string) {
     this.messageService.add({ severity: sev, summary: summ, detail: det });
   }
}
