import { Component } from '@angular/core';
import { Articulo, DiccionarioItem } from '../../interfaces/diccionariodelivery';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DiccionariodeliveryService } from '../../services/diccionariodelivery.service';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { TabDiccionario } from "../../components/tab-diccionario/tab-diccionario";
import { TabClientesDelivery } from "../../components/tab-clientes-delivery/tab-clientes-delivery";
import { TabCombosDelivery } from "../../components/tab-combos-delivery/tab-combos-delivery";
import { TabCatMarcasDelivery } from "../../components/tab-cat-marcas-delivery/tab-cat-marcas-delivery";
@Component({
  selector: 'app-diccionario-delivery-page',
  standalone: true,
   imports: [CommonModule, FormsModule, TabViewModule, TabDiccionario, TabClientesDelivery, TabCombosDelivery, TabCatMarcasDelivery],
  templateUrl: './diccionario-delivery-page.component.html',
  styleUrl: './diccionario-delivery-page.component.scss'
})
export default class DiccionarioDeliveryPageComponent {
  constructor(
    private diccionarioService: DiccionariodeliveryService,
  ) {
  }

  ngOnInit(): void {
  }

}