// src/main/webapp/app/entities/challenge/challenge-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IChallenge } from 'app/entities/challenge/challenge.model';
import { NgIf, NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'jhi-challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
  standalone: true,
  imports: [NgIf, NgClass, RouterLink, FontAwesomeModule, DatePipe],
})
export class ChallengeCardComponent {
  @Input() challenge!: IChallenge;
  @Output() accept = new EventEmitter<number>();
  @Output() reject = new EventEmitter<number>();
  @Output() complete = new EventEmitter<number>();

  // Map category names to Bootstrap contextual classes
  getCategoryClass(category: string | null | undefined): string {
    if (!category) return 'secondary';

    const categoryMap: Record<string, string> = {
      ACADEMIC: 'primary',
      SOCIAL: 'info',
      SPORTS: 'success',
      CREATIVE: 'warning',
      OTHER: 'secondary',
    };

    return categoryMap[category.toUpperCase()] || 'secondary';
  }

  onAcceptClick(): void {
    this.accept.emit(this.challenge.id);
  }

  onRejectClick(): void {
    this.reject.emit(this.challenge.id);
  }

  onCompleteClick(): void {
    this.complete.emit(this.challenge.id);
  }
}
