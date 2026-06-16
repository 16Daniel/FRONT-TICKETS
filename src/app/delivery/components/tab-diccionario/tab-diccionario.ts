import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { DiccionariodeliveryService } from '../../services/diccionariodelivery.service';
import { Articulo, CatMarcasDelivery, Modificador } from '../../interfaces/diccionariodelivery';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'
import { ButtonModule } from 'primeng/button';
import { ModalModificadores } from "../../dialogs/modal-modificadores/modal-modificadores";
import { ModalAgregarArticuloDiccionario } from "../../dialogs/modal-agregar-articulo-diccionario/modal-agregar-articulo-diccionario";
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from "primeng/toolbar";
@Component({
  selector: 'app-tab-diccionario',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ModalModificadores, ModalAgregarArticuloDiccionario, ToastModule, ConfirmDialogModule, ToolbarModule],
   providers: [MessageService, ConfirmationService],
  templateUrl: './tab-diccionario.html',
  styleUrl: './tab-diccionario.scss',
})
export class TabDiccionario implements OnInit {
    articulos:Articulo[] = []; 
    modalModificadores:boolean = false;
    modalAgregarDiccionario:boolean = false;  
    itemModificadores: Modificador[] = []; 
    itemdetalles:Articulo|undefined; 
    catmarcas:CatMarcasDelivery[] = []; 
   constructor(
      private diccionarioService: DiccionariodeliveryService,
      public cdr: ChangeDetectorRef,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
    ) {
    }
  
  ngOnInit(): void {
    this.cargarMarcas(); 
    this.cargarDatos();
  }

  cargarDatos(): void {

    Swal.fire({
      target: document.body,
      allowOutsideClick: false,
      icon: 'info',
      text: 'Espere por favor...',
      didOpen: () => Swal.showLoading(),
      customClass: {
        container: 'swal-topmost'
      }
    });

    this.diccionarioService.getEstructura().subscribe({
      next: (data) => {
        Swal.close();
        this.articulos = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => 
        {
          console.error('Error al cargar datos', err)
          Swal.close();
        }
    });
  }
 
  mostrarModificadores(item:Articulo)
  {  
     this.itemModificadores = []; 
      this.itemModificadores = item.modificadores; 
      this.modalModificadores = true; 
      this.itemdetalles = item; 
  }

  mostrarmodalAgregar()
  {
    this.modalAgregarDiccionario = true; 
  }

    showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }
      borrarArticulo(id: number) {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: `¿Está seguro que desea eliminar el modificador?`,
      acceptLabel: 'Aceptar', // 🔥 Cambia "Yes" por "Aceptar"
      rejectLabel: 'Cancelar', // 🔥 Cambia "No" por "Cancelar"
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'btn bg-p-b p-3',
      rejectButtonStyleClass: 'btn btn-light me-3 p-3',

      accept: () => {
        this.diccionarioService.deleteItem(id).subscribe({
          next: data => {
            this.articulos = this.articulos.filter(x=> x.id != id); 
            this.showMessage('success', 'Success', 'Eliminado correctamente');
            this.cdr.detectChanges();
          },
          error: error => {
            console.log(error);
          }
        });
      },
      reject: () => { },
    });

  }


    cargarMarcas()
      {
        
            this.diccionarioService.getMarcasDelivery().subscribe({
              next: (data) => {
                this.catmarcas = data;
                this.cdr.detectChanges(); 
              },
              error: (err) => 
                {
                  console.error('Error al cargar datos', err)
                }
            });
      }

  getNombreMarca(id:number):string
  {
    return this.catmarcas.filter(x=> x.id == id)[0].nombre; 
  }
}
