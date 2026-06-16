import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { ArticuloComboDelivery, CatMarcasDelivery, ComboDelivery, ComboDeliveryDTO } from '../../interfaces/diccionariodelivery';
import { DiccionariodeliveryService } from '../../services/diccionariodelivery.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToolbarModule } from "primeng/toolbar";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { InputNumberModule } from "primeng/inputnumber";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ToastModule } from "primeng/toast";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from "primeng/dropdown";
import { MultiSelectModule } from "primeng/multiselect";
import Swal from 'sweetalert2'
@Component({
  selector: 'app-tab-combos-delivery',
  standalone: true,
  imports: [ToolbarModule, TableModule, DialogModule, InputNumberModule, ConfirmDialogModule, ToastModule, CommonModule, FormsModule, DropdownModule, MultiSelectModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tab-combos-delivery.html',
  styleUrl: './tab-combos-delivery.scss',
})
export class TabCombosDelivery implements OnInit {
  combos: ComboDeliveryDTO[] = [];
  combo!: ComboDelivery;
  comboDialog: boolean = false;
  submitted: boolean = false;

  articulos:any[] = []; 
  articulosel:any = undefined;
  articulosSel:any[] = [];  
  catmarcas:CatMarcasDelivery[] = []; 
  marcasel:CatMarcasDelivery|undefined = undefined;

  constructor(
    private combosService: DiccionariodeliveryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
     public cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarCombos();
    this.cargarMarcas(); 
  }

  cargarCombos() {
    this.combosService.getCombos().subscribe({
      next: (data) => this.combos = data,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los combos', life: 3000 })
    });
  }

  openNew() {
    this.combo = {id:undefined, idcombo: 0, articulos: '', idmarca:0};
    this.submitted = false;
    this.comboDialog = true;
    this.articulosSel = []; 
    this.articulosel = undefined; 
    this.marcasel = undefined; 
  }

  editCombo(combo: ComboDeliveryDTO) {
    this.combo = {id:combo.id, idcombo: combo.idcombo, articulos:'', idmarca: combo.idmarca};
    this.marcasel = this.catmarcas.filter(x=>x.id == combo.idmarca)[0]; 
    this.cargarArticulos();
    this.articulosSel = []; 
    for(let art of combo.articulos)
      {
        this.articulosSel.push({codarticulo:art.codarticulo,descripcion:art.nombre});
      }
    this.comboDialog = true;
  }

  deleteCombo(combo: ComboDelivery) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar el combo con ID Combo: ${combo.idcombo}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        if (combo.id) {
          this.combosService.eliminarCombo(combo.id).subscribe({
            next: () => {
              this.combos = this.combos.filter(val => val.id !== combo.id);
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Combo eliminado', life: 3000 });
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el combo', life: 3000 })
          });
        }
      }
    });
  }

  hideDialog() {
    this.comboDialog = false;
    this.submitted = false;
  }

  saveCombo() {
    this.submitted = true;
    if(this.articulosel == undefined)
      {
         this.messageService.add({ severity: 'info', summary: 'Error', detail: 'Seleccionar articulo combo', life: 3000 })
        return
      }
    
    if(this.articulosSel.length == 0)
      {
        this.messageService.add({ severity: 'info', summary: 'Error', detail: 'Seleccionar articulos del combo', life: 3000 })
        return
      }

     if (this.combo.id) {
        // Actualizar
        this.combo.idmarca = this.marcasel!.id!;
        this.combo.idcombo = this.articulosel.codarticulo;
        let temp = ""
        for(let art of this.articulosSel)
          {
            temp += (art.codarticulo+','); 
          }
        this.combo.articulos = this.eliminarUltimoCaracter(temp); 
        this.combosService.updateCombo(this.combo).subscribe({
          next: () => {
           this.cargarCombos(); 
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Combo actualizado', life: 3000 });
            this.comboDialog = false;
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar', life: 3000 })
        });
      } else {
        // Crear
        this.combo.idmarca = this.marcasel!.id!;
        this.combo.idcombo = this.articulosel.codarticulo;
        let temp = ""
        for(let art of this.articulosSel)
          {
            temp += (art.codarticulo+','); 
          }
        this.combo.articulos = this.eliminarUltimoCaracter(temp); 
        this.combosService.agregarCombo(this.combo).subscribe({
          next: () => {
            this.cargarCombos();
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Combo creado', life: 3000 });
            this.comboDialog = false;
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear', life: 3000 })
        });
      }
  } 

  eliminarUltimoCaracter(texto: string): string {
  if (!texto || texto.length === 0) {
    return texto; // o devolver '' según el caso
  }
  return texto.slice(0, -1);
}

    cargarArticulos()
    { 
      this.articulos = []; 
      this.articulosel = undefined;
      this.articulosSel = []; 
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
      
          this.combosService.getArticulosICG(this.marcasel!.secciones!).subscribe({
            next: (data) => {
              Swal.close();
              this.articulos = data;
              debugger
              if(this.combo.id)
                {
                  this.articulosel = this.articulos.filter(x=> x.codarticulo == this.combo.idcombo)[0]; 
                }
              this.cdr.detectChanges(); 
            },
            error: (err) => 
              {
                console.error('Error al cargar datos', err)
                Swal.close();
              }
          });
    }
  
      cargarMarcas()
      {
      
            this.combosService.getMarcasDelivery().subscribe({
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

      gtenombrearticulos(articulos:ArticuloComboDelivery[]):string
      {
        let str = ''
        for(let item of articulos){ str += item.nombre+',' };
        return this.eliminarUltimoCaracter(str);  
      }
}
