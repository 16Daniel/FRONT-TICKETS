import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { OrganizationChartModule } from 'primeng/organizationchart';

@Component({
  selector: 'app-umbral-arbol',
  standalone: true,
  imports: [CommonModule, OrganizationChartModule],
  templateUrl: './umbral-arbol.component.html',
  styleUrl: './umbral-arbol.component.scss'
})
export class UmbralArbolComponent implements OnChanges {
  @Input() dataArbol: TreeNode[] = [];
  @Input() hasCategories: boolean = false;

  zoomLevel: number = 1;
  @ViewChild('panContainer') panContainer?: ElementRef<HTMLElement>;

  isDragging = false;
  startX = 0;
  startY = 0;
  scrollLeft = 0;
  scrollTop = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataArbol']) {
      this.centrarScroll();
    }
  }

  centrarScroll(): void {
    setTimeout(() => {
      if (this.panContainer && this.panContainer.nativeElement) {
        const el = this.panContainer.nativeElement;
        if (el.scrollWidth > el.clientWidth) {
          el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        }
      }
    }, 100);
  }

  zoomIn(): void {
    if (this.zoomLevel < 2) {
      this.zoomLevel += 0.1;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.3) {
      this.zoomLevel -= 0.1;
    }
  }

  onMouseDown(e: MouseEvent, container: HTMLElement): void {
    if (e.button !== 0) return;
    this.isDragging = true;
    this.startX = e.pageX - container.offsetLeft;
    this.startY = e.pageY - container.offsetTop;
    this.scrollLeft = container.scrollLeft;
    this.scrollTop = container.scrollTop;
  }

  onMouseLeave(): void {
    this.isDragging = false;
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  onMouseMove(e: MouseEvent, container: HTMLElement): void {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    const walkX = (x - this.startX) * 1.5;
    const walkY = (y - this.startY) * 1.5;
    container.scrollLeft = this.scrollLeft - walkX;
    container.scrollTop = this.scrollTop - walkY;
  }

  onWheel(e: WheelEvent): void {
    e.preventDefault();
    if (e.deltaY < 0) {
      this.zoomIn();
    } else if (e.deltaY > 0) {
      this.zoomOut();
    }
  }
}
