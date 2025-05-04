import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import { ChallengeService } from '../../challenge/service/challenge.service';
import { ProfileService } from '../../profile/service/profile.service';
import { IChallenge } from '../../challenge/challenge.model';
import { IProfile } from '../../profile/profile.model';
import SharedModule from 'app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

interface TrophyCount {
  type: string;
  points: number;
  count: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'jhi-trophy',
  templateUrl: './trophy.component.html',
  styleUrls: ['./trophy.component.scss'],
  imports: [FontAwesomeModule, NgFor, NgIf, RouterLink, CommonModule, RouterModule, SharedModule],
  standalone: true,
})
export class TrophyComponent implements OnInit {
  profile: IProfile | null = null;
  challenges: IChallenge[] = [];
  trophyCounts: TrophyCount[] = [];
  loading = true;
  error = false;

  constructor(
    private accountService: AccountService,
    private profileService: ProfileService,
    private challengeService: ChallengeService,
  ) {}

  ngOnInit(): void {
    this.loadUserTrophies();
  }

  loadUserTrophies(): void {
    this.loading = true;
    this.error = false;

    // First get the current user's account
    this.accountService.identity().subscribe({
      next: account => {
        if (!account?.login) {
          this.error = true;
          this.loading = false;
          return;
        }

        // Next, find the user's profile
        this.profileService.findUserByLogin(account.login).subscribe({
          next: userResponse => {
            if (!userResponse.body?.id) {
              this.error = true;
              this.loading = false;
              return;
            }

            const user = userResponse.body;

            // Get the profile by user id
            this.profileService.find(user.id).subscribe({
              next: profileResponse => {
                this.profile = profileResponse.body;

                // Finally, get the user's completed challenges
                this.loadCompletedChallenges();
              },
              error: () => {
                this.error = true;
                this.loading = false;
              },
            });
          },
          error: () => {
            this.error = true;
            this.loading = false;
          },
        });
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  loadCompletedChallenges(): void {
    if (!this.profile?.id) {
      this.error = true;
      this.loading = false;
      return;
    }

    // Get challenges assigned to the current user that are completed
    this.challengeService
      .query({
        'assignedToId.equals': this.profile.id,
        'completed.equals': true,
      })
      .subscribe({
        next: (res: HttpResponse<IChallenge[]>) => {
          this.challenges = res.body ?? [];
          this.calculateTrophyCounts();
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        },
      });
  }

  calculateTrophyCounts(): void {
    // Initialize trophy counts
    const trophies: TrophyCount[] = [
      { type: 'Bronze', points: 5, count: 0, icon: 'trophy', color: '#CD7F32' },
      { type: 'Silver', points: 10, count: 0, icon: 'trophy', color: '#C0C0C0' },
      { type: 'Gold', points: 15, count: 0, icon: 'trophy', color: '#FFD700' },
      { type: 'Platinum', points: 20, count: 0, icon: 'trophy', color: '#E5E4E2' },
      { type: 'Diamond', points: 25, count: 0, icon: 'trophy', color: '#B9F2FF' },
    ];

    // Count completed challenges by points
    this.challenges.forEach(challenge => {
      const trophy = trophies.find(t => t.points === challenge.points);
      if (trophy) {
        trophy.count++;
      }
    });

    this.trophyCounts = trophies;
  }

  getTotalTrophies(): number {
    return this.trophyCounts.reduce((sum, trophy) => sum + trophy.count, 0);
  }
}
