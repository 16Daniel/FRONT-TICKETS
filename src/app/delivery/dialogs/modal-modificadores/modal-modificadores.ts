import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, type OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DiccionariodeliveryService } from '../../services/diccionariodelivery.service';
import { Articulo, DiccionarioItem, Modificador, ModificadorArt } from '../../interfaces/diccionariodelivery';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'
@Component({
  selector: 'app-modal-modificadores',
  standalone: true,
    imports: [DialogModule, CommonModule, TableModule, ToastModule, ConfirmDialogModule,DropdownModule,FormsModule],
    providers: [MessageService, ConfirmationService],
  templateUrl: './modal-modificadores.html',
  styleUrl: './modal-modificadores.scss',
})
export class ModalModificadores implements OnInit {
 @Input() visible:boolean = false; 
 @Input() data:Modificador[] = []; 
 @Output() closeEvent = new EventEmitter<boolean>(); 
 @Input() itemDetalles:Articulo|undefined = undefined; 
 @Output() UpdateEvent = new EventEmitter<void>();
   catmarcas:any[] = []; 
   marcasel:any = undefined;
   formnombreapp:string =""
 modificadoresart:ModificadorArt[] = [];
 modificadorSel:ModificadorArt|undefined = undefined;  
  constructor(
    public cdr: ChangeDetectorRef,
    public apiserv: DiccionariodeliveryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService) { }

    ngOnInit(): void {
      if(this.itemDetalles != undefined)
        {
          this.cargarMarcas(); 
          this.formnombreapp = this.itemDetalles.nombre; 
          this.consultarModificadores();
        }
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  onHide() {
    this.closeEvent.emit(); // Cerrar modal
  }

    borrarmodifcador(id: number) {
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
        this.apiserv.deleteItem(id).subscribe({
          next: data => {
            this.data = this.data.filter(x=> x.id != id); 
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
      
          this.apiserv.getMarcasDelivery().subscribe({
            next: (data) => {
              this.catmarcas = data;

              this.marcasel = this.catmarcas.filter(x=> x.id == this.itemDetalles!.tienda)[0]

              Swal.close()
              this.cdr.detectChanges(); 
            },
            error: (err) => 
              {
                console.error('Error al cargar datos', err)
                Swal.close();
              }
          });
    }

  actualizarM(item:Modificador)
  {
    if(item.nombre == '')
      {
        this.showMessage('info','Error','El nombre no puede ir vacío')
        return; 
      }
    let data:DiccionarioItem = 
    {
      id:item.id,
      tienda: item.tienda,
      nombre: item.nombre,
      codIcg: item.codIcg,
      esModificador:true, 
      codModificador: item.codModificador,
      idMenu:item.idMenu, 
    }; 
   
     this.apiserv.updateItem(data).subscribe({
          next: data => { 
            this.showMessage('success', 'Success', 'Actualizado correctamente');
            this.cdr.detectChanges();
          },
          error: error => {
            console.log(error);
          }
        });

  }

   actualizarA()
  { 
    if(this.formnombreapp == '')
      {
        this.showMessage('info','Error','El nombre no puede ir vacío')
        return; 
      }
    let data:DiccionarioItem = 
    {
      id:this.itemDetalles!.id,
      tienda: this.marcasel.id,
      nombre: this.formnombreapp,
      codIcg: this.itemDetalles!.codIcg,
      esModificador:false, 
      codModificador: this.itemDetalles!.codModificador,
      idMenu:this.itemDetalles!.idMenu, 
    }; 
   
     this.apiserv.updateItem(data).subscribe({
          next: data => { 
            this.showMessage('success', 'Success', 'Actualizado correctamente');
            this.cdr.detectChanges();
          },
          error: error => {
            console.log(error);
          }
        });

  }
  getNombreMarca(id:number):string
  {
    return this.catmarcas.filter(x=> x.id == id)[0].nombre; 
  }


    consultarModificadores()
    {
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
      
          this.apiserv.getModificadoresArt(this.itemDetalles!.codIcg).subscribe({
            next: (data) => {
              Swal.close();
              this.modificadoresart = data;
              this.cdr.detectChanges(); 
            },
            error: (err) => 
              {
                console.error('Error al cargar datos', err)
                Swal.close();
              }
          });
    }


    agregarModificador()
    {  
      let data = []; 
      let itm =
              {
                Id: 0,
                Tienda: this.marcasel!.id,
                Nombre: this.modificadorSel!.nombreapp,
                Codicg: this.modificadorSel!.codarticulo,
                Esmodificador: true,
                Codmodificador: this.modificadorSel!.codmodificador,
                Idmenu: this.itemDetalles!.codIcg
              }; 
              data.push(itm);

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
          
              this.apiserv.createItem(data).subscribe({
                next: (data) => {
                  Swal.close(); 
                  this.showMessage('success','Success','Agregado correctamente'); 
                   setTimeout(() => {
                    this.onHide(); 
                    this.UpdateEvent.emit(); 
                    }, 1500);
                    this.cdr.detectChanges(); 
                },
                error: (err) => 
                  {
                    console.error('Error al cargar datos', err)
                    Swal.close();
                  }
              });
    }

}
