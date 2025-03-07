import { ChangeDetectorRef, Component, EventEmitter, Input, input, Output, type OnInit } from '@angular/core';
import { ColorUsuario } from '../../../models/ColorUsuario';
import { DocumentsService } from '../../../services/documents.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Usuario } from '../../../models/usuario.model';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-modal-colors',
  standalone: true,
  imports: [CommonModule,ToastModule,ColorPickerModule,FormsModule,DialogModule,DropdownModule,ButtonModule,TableModule],
  providers: [MessageService],  
  templateUrl: './modal-colors.component.html',
})
export class ModalColorsComponent implements OnInit {
public colores:ColorUsuario[] = []; 
public coleccion:string = 'colores-usuarios'; 
public formcolor:string = '';
public usuarioSeleccionado:Usuario|undefined; 
@Input() showModalColors:boolean = false;  
@Input() usuariosHelp:Usuario[] = [];
@Output() closeEvent = new EventEmitter<boolean>();
constructor(private documentService:DocumentsService,private cdr: ChangeDetectorRef,private messageService: MessageService,){}
  ngOnInit(): void
   {
     this.documentService.get(this.coleccion).subscribe({
      next: (data) => {
          this.colores = data;  
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.showMessage('error', 'Error', 'Error al procesar la solicitud');
      },
    });
    }

    showMessage(sev: string, summ: string, det: string) {
      this.messageService.add({ severity: sev, summary: summ, detail: det });
    }
    onHide() {
      this.closeEvent.emit(); // Cerrar modal
    }

    async agregarColor()
    {
      let color:ColorUsuario = 
      {
        idUsuario: this.usuarioSeleccionado!.uid,
        color: this.formcolor
      }

      try {
        await  this.documentService.create(this.coleccion, color); 
        this.showMessage('success','Success','Guardado correctamente')
      } catch (error) {
        
      }
     
    }

    obtenerNombreUsuario(idUsuario:string):string
    {
      let nombre = '';
      let temp = this.usuariosHelp.filter(x => x.uid == idUsuario);
      if(temp.length>0){nombre = temp[0].nombre + ' ' + temp[0].apellidoP; }
      return nombre
    }
  
    async EliminarColor(id:string)
    {
    
      try {
        await  this.documentService.deleteDocument(this.coleccion,id); 
        this.showMessage('success','Success','Eliminado correctamente')
      } catch (error) {
        
      }
     
    }

}
