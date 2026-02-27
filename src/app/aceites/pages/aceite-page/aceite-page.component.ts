import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';

import ControlAceiteTabComponent from '../../components/control-aceite-tab/control-aceite-tab.component';
import { AgregarRecoleccionComponent } from '../../dialogs/agregar-recoleccion.component/agregar-recoleccion.component';
import { HistorialAceite } from '../../components/historial-aceite/historial-aceite';
import { AceiteService } from '../../services/aceite.service';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { EntregaAceite } from '../../interfaces/aceite.model';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { RegistrosPendientesPageComponent } from '../registros-pendientes-page/registros-pendientes-page';

@Component({
  selector: 'app-aceite-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TabViewModule,
    ToastModule,
    DialogModule,
    CalendarModule,
    DropdownModule,
    ControlAceiteTabComponent,
    AgregarRecoleccionComponent,
    HistorialAceite,
    RegistrosPendientesPageComponent,
    MultiSelectModule
  ],
  providers: [MessageService],
  templateUrl: './aceite-page.component.html',
  styleUrl: './aceite-page.component.scss',
})
export default class AceitPageComponent implements OnInit {
  public entregas: EntregaAceite[] = [];
  public entregasTodo: EntregaAceite[] = [];
  public mostrarModalValidacion: boolean = false;
  public sucursales: Sucursal[] = [];
  public sucursalesSel: Sucursal[] = [];
  public sucursalSel: Sucursal | undefined;
  public formcomentarios: string = "";
  public itemEntrega: EntregaAceite | undefined;
  public tipoActualizacion: number = 0;
  public loading: boolean = false;
  public modalAgregarRecoleccion: boolean = false;

  trampadeAceite: boolean = false;

  constructor(
    public aceiteService: AceiteService,
    public cdr: ChangeDetectorRef,
    private branchesService: BranchesService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.obtenerSucursales();

    setInterval(() => {
      this.consultarEntregas();
    }, 60000);
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  consultarEntregas() {
    this.loading = true;
    this.aceiteService.getEntregasCedis().subscribe({
      next: (data) => {
        this.entregas = data;
        this.entregasTodo = [...data];
        this.filtrar();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      },
    });
  }

  abrirmodalValidacion(item: EntregaAceite, tipo: number) {
    this.tipoActualizacion = tipo;
    this.itemEntrega = item;
    this.mostrarModalValidacion = true;
  }

  getDate(tsmp: Timestamp | any): Date {
    try {
      // Supongamos que tienes un timestamp llamado 'firestoreTimestamp'
      const firestoreTimestamp = tsmp; // Ejemplo
      const date = firestoreTimestamp.toDate(); // Convierte a Date
      return date;
    } catch {
      return tsmp;
    }
  }

  obtenerNombreSucursal(idSucursal: number): string {
    let str = '';
    let temp = this.sucursales.filter((x) => x.idFront == idSucursal);
    if (temp.length > 0) {
      str = temp[0].nombre;
    }
    return str;
  }

  obtenerSucursales() {
    this.loading = true;
    this.branchesService.get().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.sucursales = this.sucursales.filter(x => x.idFront && x.idFront > -1);
        this.sucursalesSel = [...this.sucursales];
        this.loading = false;
        this.consultarEntregas();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
      },
    });
  }

  actualizarEntrega() {
    if (this.formcomentarios == "") {
      this.showMessage('info', 'info', 'Favor de agregar un comentario');
      return;
    }
    if (this.tipoActualizacion == 1) {
      this.loading = true;
      this.aceiteService.ValidacionCedis(this.itemEntrega!.id, this.formcomentarios).subscribe({
        next: (data) => {
          this.mostrarModalValidacion = false;
          this.showMessage('success', 'Success', 'Guardado correctamente');
          this.formcomentarios = "";
          this.consultarEntregas();
          this.cdr.detectChanges();
        },
        error: (error) => {

        },
      });
    } else {
      this.loading = true;
      this.aceiteService.RechazoCedis(this.itemEntrega!.id, this.formcomentarios).subscribe({
        next: (data) => {
          this.mostrarModalValidacion = false;
          this.showMessage('success', 'Success', 'Guardado correctamente');
          this.formcomentarios = "";
          this.consultarEntregas();
          this.cdr.detectChanges();
        },
        error: (error) => {

        },
      });
    }

  }

  abrirModalagregarRecoleccion() {
    this.modalAgregarRecoleccion = true;
    this.trampadeAceite = false;
  }

  abrirModalagregarRecoleccionTA() {
    this.modalAgregarRecoleccion = true;
    this.trampadeAceite = true
  }

  filtrar() {

    this.entregas = [];
    for (let item of this.sucursalesSel) {
      let data = this.entregasTodo.filter(x => x.idSucursal == item.idFront!);
      this.entregas.push(...data);
    }

  }

    exportarExcel(estrampa: boolean) {
    debugger
    this.loading = true;

    let data = this.entregas; 

    this.aceiteService.exportarHistorialEntregas(data).subscribe({
      next: data => {
        this.loading = false;
        this.cdr.detectChanges();
        const base64String = data.archivoBase64; // Aquí debes colocar tu cadena base64 del archivo Excel

        // Decodificar la cadena base64
        const binaryString = window.atob(base64String);

        // Convertir a un array de bytes
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Crear un Blob con los datos binarios
        const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Crear una URL para el Blob
        const url = window.URL.createObjectURL(blob);

        // Crear un enlace para la descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ENTREGAS DE ACEITE POR VALIDAR.xlsx'; // Establecer el nombre del archivo
        document.body.appendChild(link);

        // Hacer clic en el enlace para iniciar la descarga
        link.click();

        // Limpiar la URL y el enlace después de la descarga
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      },
      error: error => {
        this.loading = false;
        this.showMessage('error', 'Error', 'Error al generar el archivo de excel');
        console.log(error);

      }
    });
  }

}
