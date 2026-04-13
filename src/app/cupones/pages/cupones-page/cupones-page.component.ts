import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CuponesService } from '../../services/cupones.service';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-cupones-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, DropdownModule, TableModule],
  templateUrl: './cupones-page.component.html',
  styleUrls: ['./cupones-page.component.css']
})
export default class CuponesPageComponent {

  private cuponesService = inject(CuponesService);

}
