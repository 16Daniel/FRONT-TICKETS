import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Area } from '../../../areas/interfaces/area.model';
import { AreasService } from '../../../areas/services/areas.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-umbral-recurrencias',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './umbral-recurrencias.component.html',
  styleUrl: './umbral-recurrencias.component.scss'
})
export class UmbralRecurrenciasComponent implements OnInit, OnDestroy {
  readonly String = String;
  areas: Area[] = [];
  areaSeleccionadaId: string = '1';

  private subscripcionAreas?: Subscription;

  constructor(
    private areasService: AreasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAreas();
  }

  ngOnDestroy(): void {
    this.subscripcionAreas?.unsubscribe();
  }

  private cargarAreas(): void {
    this.subscripcionAreas = this.areasService.areas$.subscribe((areas: Area[]) => {
      this.areas = areas.filter((a: Area) => !a.eliminado);
      if (this.areas.length > 0 && !this.areas.some((a: Area) => String(a.id) === this.areaSeleccionadaId)) {
        this.areaSeleccionadaId = String(this.areas[0].id);
      }
      this.cdr.detectChanges();
    });
  }

  cambiarArea(areaId: string | number): void {
    this.areaSeleccionadaId = String(areaId);
    this.cdr.detectChanges();
  }
}
