import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { BarChartModule } from "@swimlane/ngx-charts";
import { TableModule } from "primeng/table";
import { MessageService } from 'primeng/api';
import { ToastModule } from "primeng/toast";
import { DropdownModule } from "primeng/dropdown";
import { RadioButtonModule } from 'primeng/radiobutton';
import { BranchesService } from '../../../sucursales/services/branches.service';
import { NominaService } from '../../services/nomina.service';
import { Sucursal } from '../../../sucursales/interfaces/sucursal.model';
import { HistorailPersonal, Marcajes, PuestoNomina } from '../../interfaces/Nomina';

@Component({
  selector: 'app-historial-personal-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectModule, CalendarModule, BarChartModule, TableModule, ToastModule, DropdownModule, RadioButtonModule],
  providers: [MessageService],
  templateUrl: './historial-personal-page.component.html',
})
export default class HistorialPersonalPageComponent implements OnInit {
  public sucursales: Sucursal[] = [];
  public sucursalSel: Sucursal | undefined;
  public loading: boolean = false;
  public fechaini: Date = new Date();
  public fechafin: Date = new Date();
  public data: HistorailPersonal[] = [];
  public datag: any[] = [];
  public departamentos: PuestoNomina[] = [];
  public maxDate: Date = new Date();
  public vista: number = 1;

  public porcentajeFSR: number = 0;
  public porcentajeFR: number = 0;
  public porcentajeasistencias: number = 0;
  colorScheme: any = {
    domain: ['#198754', '#ffc107', '#dc3545', '#AAAAAA']
  };


  constructor(private branchesService: BranchesService,
    public cdr: ChangeDetectorRef,
    public apiserv: NominaService,
    private messageService: MessageService,
  ) {
    const hoy = new Date();
    this.maxDate.setDate(hoy.getDate() - 1);
    this.fechafin = this.maxDate;
    this.fechaini = this.maxDate;

  }
  ngOnInit(): void {
    this.obtenerSucursales();
    this.getDepartamentos();
  }

  async obtenerSucursales() {

    this.loading = true;
    try {
      this.sucursales = await this.branchesService.getOnce();
      this.loading = false;
      this.cdr.detectChanges();
    } catch (error) {
    }
  }
  getDepartamentos() {
    this.apiserv.getDepartamentos().subscribe({
      next: data => {
        this.departamentos = data;
        this.cdr.detectChanges();
      },
      error: error => {
        console.log(error);
      }
    });
  }

  consultar() {
    this.porcentajeFR = 0;
    this.porcentajeFSR = 0;
    this.porcentajeasistencias = 0;

    let totalFR = 0;
    let totalfsr = 0;
    let totalasistencias = 0;
    if (this.sucursalSel == undefined) {
      this.showMessage('info', 'Info', "Seleccione una sucursal");
      return;
    }
    this.loading = true;
    let arr_suc: number[] = [];
    arr_suc.push(this.sucursalSel!.claUbicacion!);
    this.apiserv.obtnerHistorialPersonal(this.fechaini, this.fechafin, JSON.stringify(arr_suc)).subscribe({
      next: data => {
        this.data = data;
        console.log(data)
        this.datag = [];
        for (let item of data) {

          for (let dia of item.data) {
            let incidenciasResultas = dia.incidencias.filter((x: any) => x.regbitacora != null && x.regbitacora.status == true).length;
            let incidenciasSinResolver = dia.incidencias.length - incidenciasResultas;
            let empleadosAsistencia = dia.empleadosrequeridos - dia.incidencias.length;


            let series: any[] = [];

            series.push({ name: "ASISTENCIA", value: empleadosAsistencia });
            series.push({ name: "FALTAS RESUELTAS", value: incidenciasResultas });
            series.push({ name: "FALTAS SIN RESOLVER", value: incidenciasSinResolver });

            this.datag.push({ name: dia.fecha, series: series });

            totalFR = totalFR + incidenciasResultas;
            totalfsr = totalfsr + incidenciasSinResolver
            totalasistencias = totalasistencias + empleadosAsistencia;
          }

          let totalRegistros = totalFR + totalfsr + totalasistencias;
          if (totalRegistros > 0) {
            this.porcentajeFR = (totalFR / totalRegistros) * 100;
            this.porcentajeFSR = (totalfsr / totalRegistros) * 100;
            this.porcentajeasistencias = (totalasistencias / totalRegistros) * 100;
          }
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.log(error);
        this.showMessage('error', 'Error', 'Error al consultar');
        this.loading = false;
      }
    });
  }

  obtenerNombrePuesto(idPuesto: number): string {
    let temp = this.departamentos.filter(x => x.idpuesto == idPuesto);
    let nombre = temp.length > 0 ? temp[0].nombre : '';
    return nombre;
  }

  obtenerFondo(item: Marcajes): string {
    let fondo = "";
    if (item.regbitacora == null) {
      fondo = 'bg-danger';
    } else {
      if (item.regbitacora.status) {
        fondo = 'bg-warning'
      } else {
        fondo = 'bg-danger';
      }
    }
    return fondo;
  }

  ontenerNombreSucursal(claUbicacion: number): string {
    let nombre = '';
    let sucursal = this.sucursales.filter(x => x.claUbicacion == claUbicacion)[0];
    nombre = sucursal == undefined ? '' : sucursal.nombre;
    return nombre;
  }

  showMessage(sev: string, summ: string, det: string) {
    this.messageService.add({ severity: sev, summary: summ, detail: det });
  }

  obtenerdataopcion(): Marcajes[] {
    let data: Marcajes[] = [];
    if (this.vista == 1) {
      for (let dia of this.data[0].data) {
        let temp = dia.incidencias.filter(x => x.regbitacora == null || (x.regbitacora != null && x.regbitacora.status == false));
        data.push(...temp);
      }
    }

    if (this.vista == 2) {
      for (let dia of this.data[0].data) {
        let temp = dia.incidencias.filter(x => x.regbitacora != null && x.regbitacora.status);
        data.push(...temp);
      }
    }

    if (this.vista == 3) {
      for (let dia of this.data[0].data) {
        let temp = dia.asistencias;
        data.push(...temp);
      }
    }

    return data;
  }

}
