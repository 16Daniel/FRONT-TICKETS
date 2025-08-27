import { ChangeDetectorRef, Component, Input, type OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Sucursal } from '../../../../../models/sucursal.model';
import { AdministracionCompra } from '../../../../../models/AdministracionCompra';
@Component({
  selector: 'app-grafica-admin-compras',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './grafica-admin-compras.component.html',
  styleUrl: './grafica-admin-compras.component.css',
})
export class GraficaAdminComprasComponent implements OnInit {
 @Input() sucursales:Sucursal[] = []; 
 @Input() registros:AdministracionCompra[] = []; 
  public single: any[] = [];
  // options
  gradient: boolean = false;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;

 public colorScheme:any = {
  domain: [
    '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
    '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
    '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
    '#795548', '#9E9E9E', '#607D8B', '#F44336', '#E57373',
    '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7',
    '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775',
    '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65', '#A1887F',
    '#90A4AE', '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
    '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA',
    '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740'
  ]
};

constructor(
    private cdr: ChangeDetectorRef
    ){ }

  ngOnInit(): void 
  {
      for(let idsuc of this.getDistinctSucursalIds())
        {
          let data = this.registros.filter(x => x.idsucursal == idsuc); 
          let total = 0; 
          for(let item of data)
            {
              for(let art of item.articulos)
                {
                  total = total + (art.precio * art.uds); 
                }
            }

            this.single.push({name:this.obtenerNombreSucursal(idsuc),value:total})
        }     
   }

   getDistinctSucursalIds(): string[] {
  const distinctIds = Array.from(new Set(this.registros.map(registro => registro.idsucursal)));
  return distinctIds;
}

  obtenerNombreSucursal(idSucursal:string):string
{
    let nombre = "";
    let sucursal = this.sucursales.filter(x=> x.id == idSucursal)[0]; 
    
    if(sucursal != undefined){ nombre = sucursal.nombre; }
    return nombre; 
}

}
