// src/main/webapp/app/entities/challenge/challenge-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IChallenge } from 'app/entities/challenge/challenge.model';
import { NgIf, NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { IProfile } from 'app/entities/profile/profile.model';

@Component({
  selector: 'jhi-challenge-card',
  templateUrl: './challenge-card.component.html',
  styleUrls: ['./challenge-card.component.scss'],
  standalone: true,
  imports: [NgIf, NgClass, RouterLink, FontAwesomeModule, DatePipe],
})
export class ChallengeCardComponent {
  @Input() challenge!: IChallenge;
  @Output() reject = new EventEmitter<number>();
  @Output() complete = new EventEmitter<number>();

  constructor(private router: Router) {}

  // Get the creator's name from profile
  getCreatorName(profile: IProfile | null | undefined): string {
    if (!profile) {
      return 'Unknown';
    }
    // Return the name if available or default to profile ID
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    } else {
      return `User ${profile.id}`;
    }
  }

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

  // Get a formatted label for the category
  getCategoryLabel(category: string | null | undefined): string {
    if (!category) return 'Other';

    // Convert from UPPERCASE_WITH_UNDERSCORES to Title Case
    return category
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  onRejectClick(): void {
    // Add confirmation dialog before rejecting/deleting the challenge
    if (confirm(`Are you sure you want to reject and delete this challenge: "${this.challenge.title}"? This action cannot be undone.`)) {
      this.reject.emit(this.challenge.id);
    }
  }

  onCompleteClick(): void {
    this.complete.emit(this.challenge.id);
  }

  onViewDetailsClick(): void {
    if (this.challenge.id) {
      // Navigate to the challenge detail page
      this.router.navigate(['/challenge', this.challenge.id, 'view']);
    }
  }
}
