import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import { ChallengeService } from '../service/challenge.service';
import { ProfileService } from '../../profile/service/profile.service';
import { IChallenge } from '../challenge.model';
import { IProfile } from '../../profile/profile.model';
import SharedModule from 'app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChallengeCardComponent } from '../challenge-card.component';
import dayjs from 'dayjs';

@Component({
  selector: 'jhi-mychallenges',
  templateUrl: './mychallenges.component.html',
  styleUrls: ['./mychallenges.component.scss'],
  imports: [FontAwesomeModule, NgFor, NgIf, RouterLink, CommonModule, RouterModule, SharedModule, ChallengeCardComponent],
  standalone: true,
})
export class MyChallengesComponent implements OnInit {
  profile: IProfile | null = null;
  challenges: IChallenge[] = [];
  isLoading = true;
  error = false;

  constructor(
    private accountService: AccountService,
    private profileService: ProfileService,
    private challengeService: ChallengeService,
  ) {}

  ngOnInit(): void {
    this.loadUserChallenges();
  }

  loadUserChallenges(): void {
    this.isLoading = true;
    this.error = false;

    // First get the current user's account
    this.accountService.identity().subscribe({
      next: account => {
        if (!account?.login) {
          this.error = true;
          this.isLoading = false;
          return;
        }

        // Next, find the user's profile
        this.profileService.findUserByLogin(account.login).subscribe({
          next: userResponse => {
            if (!userResponse.body?.id) {
              this.error = true;
              this.isLoading = false;
              return;
            }

            const user = userResponse.body;

            // Get the profile by user id
            this.profileService.find(user.id).subscribe({
              next: profileResponse => {
                this.profile = profileResponse.body;

                // Finally, get the user's challenges
                this.loadAssignedChallenges();
              },
              error: () => {
                this.error = true;
                this.isLoading = false;
              },
            });
          },
          error: () => {
            this.error = true;
            this.isLoading = false;
          },
        });
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
      },
    });
  }

  loadAssignedChallenges(): void {
    if (!this.profile?.id) {
      this.error = true;
      this.isLoading = false;
      return;
    }

    // Get challenges assigned to the current user
    this.challengeService
      .query({
        'assignedToId.equals': this.profile.id,
      })
      .subscribe({
        next: (res: HttpResponse<IChallenge[]>) => {
          this.challenges = res.body ?? [];
          this.isLoading = false;
        },
        error: () => {
          this.error = true;
          this.isLoading = false;
        },
      });
  }

  trackId(_index: number, item: IChallenge): number {
    return item.id;
  }

  onReject(id: number): void {
    this.challengeService.reject(id).subscribe(() => this.loadUserChallenges());
  }

  onComplete(id: number): void {
    this.challengeService.complete(id).subscribe(() => this.loadUserChallenges());
  }

  getCategoryLabel(category: string | null | undefined): string {
    if (!category) return 'Unknown';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  }

  formatDate(date: dayjs.Dayjs | null | undefined): string {
    if (!date) {
      return 'No date';
    }
    return date.format('MMM D, YYYY');
  }
}
