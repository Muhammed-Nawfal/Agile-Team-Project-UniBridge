// src/main/webapp/app/entities/challenge/challenge-card.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IChallenge } from 'app/entities/challenge/challenge.model';
import { NgIf, NgClass, NgStyle, DatePipe } from '@angular/common'; // Add NgStyle
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { IProfile } from 'app/entities/profile/profile.model';

@Component({
  selector: 'jhi-challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
  standalone: true,
  imports: [NgIf, NgClass, NgStyle, RouterLink, FontAwesomeModule, DatePipe],
})
export class ChallengeCardComponent {
  @Input() challenge!: IChallenge;
  @Input() trophy?: { type: string; icon: string; color: string };

  @Output() reject = new EventEmitter<number>();
  @Output() complete = new EventEmitter<number>();

  constructor(private router: Router) {}

  getCreatorName(profile: IProfile | null | undefined): string {
    if (!profile) return 'Unknown';
    return profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : `User ${profile.id}`;
  }

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

  getCategoryLabel(category: string | null | undefined): string {
    if (!category) return 'Other';
    return category
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  onRejectClick(): void {
    if (confirm(`Are you sure you want to reject and delete this challenge: "${this.challenge.title}"? This action cannot be undone.`)) {
      this.reject.emit(this.challenge.id);
    }
  }

  onCompleteClick(): void {
    this.complete.emit(this.challenge.id);
  }

  onViewDetailsClick(): void {
    if (this.challenge.id) {
      this.router.navigate(['/challenge', this.challenge.id, 'view']);
    }
  }
}
