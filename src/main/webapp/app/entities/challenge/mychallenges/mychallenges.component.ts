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
import { ChallengeCardComponent } from '../challenge-card.component';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'jhi-mychallenges',
  templateUrl: './mychallenges.component.html',
  styleUrls: ['./mychallenges.component.scss'],
  imports: [FontAwesomeModule, NgFor, NgIf, RouterLink, CommonModule, RouterModule, SharedModule, ChallengeCardComponent, FormsModule],
  standalone: true,
})
export class MyChallengesComponent implements OnInit {
  profile: IProfile | null = null;
  challenges: IChallenge[] = [];
  allChallenges: IChallenge[] = []; // Store all challenges to filter from
  isLoading = true;
  error = false;

  // Properties for the "created by" filter
  selectedCreatorId: number | null = null;
  creatorProfiles: IProfile[] = [];

  constructor(
    private accountService: AccountService,
    private profileService: ProfileService,
    private challengeService: ChallengeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserChallenges();
  }

  // Filter challenges when a creator is selected
  onCreatorChange(): void {
    if (this.selectedCreatorId === null) {
      // Show all challenges assigned to the user
      this.challenges = [...this.allChallenges];
    } else {
      // Filter challenges by creator ID
      this.challenges = this.allChallenges.filter(challenge => challenge.createdBy?.id === this.selectedCreatorId);
    }
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
                this.loadChallenges();
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

  loadChallenges(): void {
    if (!this.profile?.id) {
      this.error = true;
      this.isLoading = false;
      return;
    }

    // Get all challenges assigned to the current user
    this.challengeService
      .query({
        'assignedToId.equals': this.profile.id,
        eagerload: true, // Enable eager loading of relationships
      })
      .subscribe({
        next: (res: HttpResponse<IChallenge[]>) => {
          this.allChallenges = res.body ?? [];
          this.challenges = [...this.allChallenges]; // Make a copy

          // Extract unique creator profiles from challenges
          this.extractCreatorProfiles();

          this.isLoading = false;
        },
        error: () => {
          this.error = true;
          this.isLoading = false;
        },
      });
  }

  extractCreatorProfiles(): void {
    // Extract unique creator IDs
    const uniqueCreatorIds = new Set<number>();
    const uniqueCreators: IProfile[] = [];

    this.allChallenges.forEach(challenge => {
      if (challenge.createdBy?.id && !uniqueCreatorIds.has(challenge.createdBy.id)) {
        uniqueCreatorIds.add(challenge.createdBy.id);
        uniqueCreators.push(challenge.createdBy);
      }
    });

    this.creatorProfiles = uniqueCreators;
  }

  loadAssignedChallenges(): void {
    this.loadChallenges();
  }

  trackId(_index: number, item: IChallenge): number {
    return item.id;
  }

  onViewDetails(id: number): void {
    this.router.navigate(['/challenge', id, 'view']);
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

  getCreatorName(profile: IProfile | null): string {
    if (!profile) {
      return 'Unknown';
    }

    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    } else if (profile.firstName) {
      return profile.firstName;
    } else if (profile.login) {
      return profile.login;
    } else {
      return `User ${profile.id}`;
    }
  }
}
