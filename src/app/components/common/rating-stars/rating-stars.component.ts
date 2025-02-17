import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-stars.component.html',
  styleUrl: './rating-stars.component.scss',
})
export class RatingStarsComponent implements OnChanges {
  @Input() rating: number = 0; // Calificación inicial
  @Input() editable: boolean = false;
  stars: boolean[] = [false, false, false, false, false]; // Estrellas desmarcadas
  @Output() ratingChange = new EventEmitter<number>(); // Emite el cambio de la calificación

  ngOnChanges(changes: SimpleChanges): void {
    this.updateStars();
  }

  updateStars() {
    this.stars = this.stars.map((_, index) => index < this.rating);
  }

  setRating(index: number) {
    this.rating = index + 1;
    this.ratingChange.emit(this.rating);
    this.updateStars();
  }
}
