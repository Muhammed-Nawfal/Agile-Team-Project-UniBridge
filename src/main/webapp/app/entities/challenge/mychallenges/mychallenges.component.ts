import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import { ChallengeService } from '../service/challenge.service';
import { ProfileService } from '../../profile/service/profile.service';
import { IChallenge } from '../challenge.model';
import { IProfile } from '../../profile/profile.model';
import SharedModule from 'app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';

interface TrophyMapping {
  type: string;
  color: string;
  minPoints: number;
  maxPoints: number;
}

@Component({
  selector: 'jhi-mychallenges',
  templateUrl: './mychallenges.component.html',
  styleUrls: ['./mychallenges.component.scss'],
  standalone: true,
  imports: [FontAwesomeModule, NgFor, NgIf, RouterLink, CommonModule, RouterModule, SharedModule, FormsModule],
})
export class MyChallengesComponent implements OnInit {
  profile: IProfile | null = null;
  challenges: IChallenge[] = [];
  isLoading = true;
  error = false;

  trophyMappings: TrophyMapping[] = [
    { type: 'Bronze Trophy', color: '#CD7F32', minPoints: 1, maxPoints: 5 },
    { type: 'Silver Trophy', color: '#C0C0C0', minPoints: 6, maxPoints: 10 },
    { type: 'Gold Trophy', color: '#FFD700', minPoints: 11, maxPoints: 15 },
    { type: 'Platinum Trophy', color: '#E5E4E2', minPoints: 16, maxPoints: 20 },
    { type: 'Diamond Trophy', color: '#B9F2FF', minPoints: 21, maxPoints: 100 },
  ];

  constructor(
    private accountService: AccountService,
    private profileService: ProfileService,
    private challengeService: ChallengeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;

    this.profileService.findMyProfile().subscribe({
      next: profileRes => {
        const myProfile = profileRes.body;
        if (!myProfile?.id) {
          this.isLoading = false;
          return;
        }

        this.challengeService.query().subscribe({
          next: res => {
            this.challenges = (res.body ?? []).filter(c => c.createdBy?.id === myProfile.id);
            this.isLoading = false;
          },
          error: () => (this.isLoading = false),
        });
      },
      error: () => (this.isLoading = false),
    });
  }

  trackId(_index: number, item: IChallenge): number {
    return item.id;
  }

  onViewDetails(id: number): void {
    this.router.navigate(['/challenge', id, 'view']);
  }

  onReject(id: number): void {
    this.challengeService.reject(id).subscribe(() => this.load());
  }

  onComplete(id: number): void {
    this.challengeService.complete(id).subscribe(() => this.load());
  }

  getTrophy(points: number | null | undefined): TrophyMapping | null {
    if (!points) return null;
    return this.trophyMappings.find(t => points >= t.minPoints && points <= t.maxPoints) ?? null;
  }
  getCategoryClass(category: string | null | undefined): string {
    const map: Record<string, string> = {
      ACADEMIC: 'primary',
      SOCIAL: 'info',
      SPORTS: 'success',
      CREATIVE: 'warning',
      OTHER: 'secondary',
    };
    return category ? map[category.toUpperCase()] || 'secondary' : 'secondary';
  }

  getCategoryLabel(category: string | null | undefined): string {
    return category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : 'Unknown';
  }

  formatDate(date: dayjs.Dayjs | null | undefined): string {
    return date ? date.format('MMM D, YYYY') : 'No date';
  }

  getCreatorName(): string {
    this.profileService.findMyProfile().subscribe(myProfileRes => {
      const profile = myProfileRes.body;
      if (profile) {
        return profile.login;
      }
      return 'Unknown1';
    });
    return 'Unknown2';
  }

  getTrophyColor(points?: number | null): string {
    switch (points) {
      case 5:
        return '#CD7F32'; // Bronze
      case 10:
        return '#C0C0C0'; // Silver
      case 15:
        return '#FFD700'; // Gold
      case 20:
        return '#E5E4E2'; // Platinum
      case 25:
        return '#B9F2FF'; // Diamond
      default:
        return '#ccc'; // Default fallback
    }
  }

  getTrophyLabel(points?: number | null): string {
    switch (points) {
      case 5:
        return 'Bronze';
      case 10:
        return 'Silver';
      case 15:
        return 'Gold';
      case 20:
        return 'Platinum';
      case 25:
        return 'Diamond';
      default:
        return '';
    }
  }
}
