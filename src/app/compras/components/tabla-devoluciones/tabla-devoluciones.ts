import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ImageModule } from 'primeng/image';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DevolucionesService } from '../../services/devoluciones.service';
import { DevolucionAla } from '../../interfaces/no-conformidad';
import { DevolucionFormComponent } from '../devolucion-form/devolucion-form';
import { Timestamp } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { ProveedorPlaneacion } from '../../interfaces/ProveedorPlaneacion';
import { PlaneacionCatService } from '../../services/planeacion.service';
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from '@angular/forms';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.interface';
import { Usuario } from '../../../usuarios/interfaces/usuario.model';
import { CalendarModule } from 'primeng/calendar';
import { CatalogoProveedoresTickets } from "../../dialogs/catalogo-proveedores-tickets/catalogo-proveedores-tickets";
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs'
import { environment } from '../../../../environments/environments';

// Extraer el VFS de las fuentes importadas
const vfsData = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;

// Asignar vfs de forma segura sin romper la inmutabilidad de ES Modules
if (vfsData) {
  Object.assign(pdfMake, { vfs: vfsData });
}

@Component({
  selector: 'app-tabla-devoluciones',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, ToolbarModule,
    DialogModule, ConfirmDialogModule, ToastModule, ImageModule,
    DevolucionFormComponent, FormsModule, CalendarModule,
    DropdownModule,
    CatalogoProveedoresTickets
],
  providers: [ConfirmationService, MessageService],
  templateUrl: './tabla-devoluciones.html'
})
export default class tablaDevolucionesComponent implements OnInit {
  private devolucionesService = inject(DevolucionesService);
  private confirmationService = inject(ConfirmationService);
  private planeacionService = inject(PlaneacionCatService);
  public catproveedores:ProveedorPlaneacion[] = []; 
  private messageService = inject(MessageService);

  devoluciones: DevolucionAla[] = [];
  displayModal = false;
  selectedDevolucion: DevolucionAla | null = null;
  catStatus:string[] = ['TO DO','WORKING','PAUSE','DONE'];
  public sucursales: Sucursal[] = [];
  public sucursal:string = '';
  public sucursalfiltro: Sucursal | undefined;
  usuario: Usuario;
  fechaini:Date|undefined;
  fechafin:Date|undefined; 
  public estatusfiltro:string = '';
  public modalCatalogoProvs:boolean = false; 
  public urlApiPlaneacion: string = environment.planeacionApiConfig.url;


  constructor(public cdr: ChangeDetectorRef,private branchesService: BranchesService,private http: HttpClient)
  {
    this.usuario = JSON.parse(localStorage.getItem('rwuserdatatk')!);
  }
  ngOnInit(): void {
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
    this.getProveedores(); 
    this.obtenerSucursales(); 
    this.devolucionesService.getDevoluciones().subscribe(data => {
      this.devoluciones = data;
      this.cdr.detectChanges();
      Swal.close(); 
    });
  }

  getProveedores()
  {
     this.planeacionService. getProveedoresPorModulo('nc').subscribe(data => {
      this.catproveedores = data;
      this.cdr.detectChanges();
      Swal.close(); 
    });
  }

   obtenerSucursales() {
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.sucursal = this.usuario.sucursales[0].id; 
        this.cdr.detectChanges();
      },
      error: (error) => {

      },
    });
  }

  openNew() {
    this.selectedDevolucion = null;
    this.displayModal = true;
  }

  editDevolucion(dev: DevolucionAla) {
    this.selectedDevolucion = { ...dev };
    this.displayModal = true;
  }

  deleteDevolucion(dev: DevolucionAla) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el reporte de ${dev.proveedor}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.devolucionesService.deleteDevolucion(dev);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro eliminado' });
        } catch (error) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el registro' });
        }
      }
    });
  }

  onSaveCompleted() {
    this.displayModal = false;
    this.filtrar(); 
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Guardado correctamente' });
  }

  getDate(fecha:Timestamp)
  {
    return fecha.toDate(); 
  }

  getNombreProveedor(cod:string):string
  {
    let nombre:string = '';
    let temp = this.catproveedores.filter(x=>x.codproveedor == parseInt(cod)); 
    if(temp.length>0){ nombre = temp[0].nombre;}
    return nombre; 
  }

    getNombreSucursal(id:string):string
  {
    let nombre:string = '';
    let temp = this.sucursales.filter(x=>x.id == id); 
    if(temp.length>0){ nombre = temp[0].nombre;}
    return nombre; 
  }

  abrirModalCatProvs()
  {
    this.modalCatalogoProvs = true; 
  }

  filtrar()
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
    this.devolucionesService.filtrarDevoluciones(this.fechaini,this.fechafin,this.sucursalfiltro?.id,this.estatusfiltro).subscribe(data => {
      this.devoluciones = data;
      this.cdr.detectChanges();
      Swal.close(); 
    });
  }

  // =======================================================
  // MÉTODO PRINCIPAL PARA EXPORTAR EL MODELO A PDF
  // =======================================================
  async exportarPDF(dataDevolucion:DevolucionAla) {
    const vfsData = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;
    // 1. Convertir URLs de fotos a Base64 si existen
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

    const fotosBase64 = await this.cargarFotosBase64(dataDevolucion.fotosUrl || []);

    // 2. Estructura vectorial pura del documento PDF
    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [35, 30, 35, 35],
      content: [
        // BANNER DE INSTRUCCIONES
        {
          table: {
            widths: ['*'],
            body: [[
              {
                fillColor: '#f3f8f3',
                margin: [8, 8, 8, 8],
                stack: [
                  { 
                    text: `FORMATO DEVOLUCIÓN DE ALA DE POLLO A PROVEEDOR (${dataDevolucion.codigoFormato || 'FSUPR-0501'})`, 
                    style: 'bannerTitle' 
                  },
                  { text: '1.- Este formato ha de ser llenado en su totalidad por el receptor de producto y/o quien hace el reclamo.', style: 'bannerSub' },
                  { text: '2.- Se deberá enviar al correo del área de compras con el formato adjunto.', style: 'bannerSub' }
                ]
              }
            ]]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 10]
        },

        // SUCURSAL
        {
          table: {
            widths: ['*'],
            body: [
              [{ text: 'SUCURSAL', style: 'fieldLabel' }],
              [{ text: this.getNombreSucursal(dataDevolucion.sucursal) || 'N/A', style: 'fieldValue' }]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 8]
        },

        // 1. INFORMACIÓN DEL PROVEEDOR
        { text: '1.- INFORMACIÓN DEL PROVEEDOR', style: 'sectionHeader' },
        {
          table: {
            widths: ['65%', '35%'],
            body: [
              [
                { text: 'PROVEEDOR:', style: 'fieldLabel' },
                { text: 'FECHA DEL REPORTE:', style: 'fieldLabel' }
              ],
              [
                { text: this.getNombreProveedor(dataDevolucion.proveedor) || 'N/A', style: 'fieldValue' },
                { text: this.formatTimestamp(dataDevolucion.fechaReporte), style: 'fieldValue' }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 8]
        },

        // 2. DESCRIPCIÓN
        { text: '2.- DESCRIPCIÓN', style: 'sectionHeader' },
        {
          table: {
            widths: ['33%', '33%', '34%'],
            body: [
              [
                { text: 'LOTE:', style: 'fieldLabel' },
                { text: 'FECHA DE ENTREGA:', style: 'fieldLabel' },
                { text: 'No. DE FACTURA O REMISIÓN:', style: 'fieldLabel' }
              ],
              [
                { text: dataDevolucion.lote || 'N/A', style: 'fieldValue' },
                { text: this.formatTimestamp(dataDevolucion.fechaEntrega), style: 'fieldValue' },
                { text: dataDevolucion.noFacturaRemision || 'N/A', style: 'fieldValue' }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 6]
        },
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                { text: 'CANTIDAD ENTREGADA (KG):', style: 'fieldLabel' },
                { text: 'CANTIDAD RECHAZADA (KG):', style: 'fieldLabel' }
              ],
              [
                { text: `${dataDevolucion.cantidadEntregadaKg ?? 0} kg`, style: 'fieldValue' },
                { text: `${dataDevolucion.cantidadRechazadaKg ?? 0} kg`, style: 'fieldValue' }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 10]
        },

        // MOTIVOS DE RECHAZO (ORGANOLÉPTICOS)
        { text: 'MOTIVO DE RECHAZO DE ACUERDO A LA TABLA DE CARACTERÍSTICAS ORGANOLÉPTICAS', style: 'sectionHeader' },
        {
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                { text: 'COLOR:', style: 'fieldLabel' },
                { text: 'TEXTURA:', style: 'fieldLabel' }
              ],
              [
                { text: dataDevolucion.motivosRechazo?.color || 'Sin observaciones', style: 'fieldBox' },
                { text: dataDevolucion.motivosRechazo?.textura || 'Sin observaciones', style: 'fieldBox' }
              ],
              [
                { text: 'CORTE:', style: 'fieldLabel' },
                { text: 'OLOR:', style: 'fieldLabel' }
              ],
              [
                { text: dataDevolucion.motivosRechazo?.corte || 'Sin observaciones', style: 'fieldBox' },
                { text: dataDevolucion.motivosRechazo?.olor || 'Sin observaciones', style: 'fieldBox' }
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 10]
        },

        // FOTOS
        { text: 'FOTOS (3 MÁXIMO)', style: 'sectionHeader' },
        this.renderFotos(fotosBase64),

        // SECCIÓN DE FIRMAS
        {
          margin: [0, 35, 0, 0],
          table: {
            widths: ['45%', '10%', '45%'],
            body: [
              [
                { text: '', border: [false, false, false, true] },
                { text: '' },
                { text: '', border: [false, false, false, true] }
              ],
              [
                { text: 'Firma Receptor / Inspector', alignment: 'center', style: 'fieldLabel', margin: [0, 4, 0, 0] },
                { text: '' },
                { text: 'Firma / Sello Proveedor', alignment: 'center', style: 'fieldLabel', margin: [0, 4, 0, 0] }
              ]
            ]
          },
          layout: 'noBorders'
        }
      ],

      // DEFINICIÓN DE ESTILOS
      styles: {
        bannerTitle: { fontSize: 10.5, bold: true, color: '#1b5e20', margin: [0, 0, 0, 2] },
        bannerSub: { fontSize: 8, color: '#424242' },
        sectionHeader: { fontSize: 8.5, bold: true, fillColor: '#cccccc', color: '#000000', padding: 4, margin: [0, 4, 0, 4] },
        fieldLabel: { fontSize: 8, bold: true, color: '#37474f', margin: [0, 2, 0, 1] },
        fieldValue: { fontSize: 9, color: '#1a237e', margin: [0, 0, 0, 4] },
        fieldBox: { fontSize: 8.5, color: '#212121', margin: [0, 1, 0, 6] }
      }
    };
    pdfMake.createPdf(docDefinition).download(`Devolucion_${dataDevolucion.lote || 'Reporte'}.pdf`)
    Swal.close();
  }

  // =======================================================
  // FUNCIONES AUXILIARES
  // =======================================================

  // Convertir Timestamp de Firebase a fecha legible (DD/MM/YYYY)
  private formatTimestamp(timestamp: any): string {
    if (!timestamp) return 'N/A';
    // Si viene como Timestamp de Firestore
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Renderizar columna de imágenes para pdfmake
  private renderFotos(fotosBase64: string[]): any {
    if (!fotosBase64 || fotosBase64.length === 0) {
      return { text: 'No se incluyeron fotografías en este reporte.', style: 'fieldBox', margin: [0, 4, 0, 10] };
    }

    const columns = fotosBase64.slice(0, 3).map((base64) => ({
      image: base64,
      width: 140,
      alignment: 'center'
    }));

    return { columns: columns, margin: [0, 6, 0, 10] };
  }

  // Método asíncrono para descargar las URLs de las fotos y convertirlas a Base64
private async cargarFotosBase64(urls: string[]): Promise<string[]> {
  if (!urls || urls.length === 0) return [];

  const apiUrl = this.urlApiPlaneacion + 'Media/image-to-base64'; 
  let headers = new HttpHeaders({
      'Accept': 'application/json',
      'X-API-Key': environment.planeacionApiConfig.apiKey
   });

  const promesas = urls.slice(0, 3).map(async (url) => {
    try {
      // Hacer la petición a tu backend .NET Core
      const res = await firstValueFrom(
        this.http.post<{ base64: string }>(apiUrl, { imageUrl: url }, { headers: headers})
      );
      return res.base64;
    } catch (error) {
      console.warn('Error al convertir la imagen mediante la API backend:', error);
      return '';
    }
  });

  const resultados = await Promise.all(promesas);
  return resultados.filter(base64 => base64 !== '');
}

}