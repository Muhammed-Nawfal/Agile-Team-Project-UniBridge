import { Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { combineLatest, Subscription, switchMap } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { SortService, sortStateSignal } from 'app/shared/sort';
import { FormsModule } from '@angular/forms';
import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchService } from '../service/activity-match.service';
import { IProfile } from '../../profile/profile.model';
import { ActivityType } from '../../enumerations/activity-type.model';
import { GymLocation } from '../../enumerations/gym-location.model';
import { Skill } from '../../enumerations/skill.model';
import { PreferredTime } from '../../enumerations/preferred-time.model';
import { Course } from '../../enumerations/course.model';
import { University } from '../../enumerations/university.model';
import { Sports } from '../../enumerations/sports.model';
import { Society } from '../../enumerations/society.model';
import { PreferredEvents } from '../../enumerations/preferred-events.model';

import dayjs from 'dayjs/esm';
import { take } from 'rxjs/operators';
import { AccountService } from 'app/core/auth/account.service';
import { Decision } from 'app/entities/enumerations/decision.model';
import { NewActivityMatch } from 'app/entities/activity-match/activity-match.model';
import { ProfileService } from '../../profile/service/profile.service';
import { MatchRequestDialogComponent } from '../match-request-dialog/match-request-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'jhi-matching',
  templateUrl: './matching.component.html',
  styleUrl: 'matching.component.scss',
  imports: [RouterModule, FormsModule, SharedModule, MatchRequestDialogComponent],
})
export class MatchingComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  activityMatch?: IActivityMatch | null;
  isLoading = false;
  activityMatchId?: number;
  errorMessage?: string;

  currentUserProfileId?: number;

  // Properties for profile navigation
  currentProfileIndex = 0;
  profiles: IProfile[] = []; // This will store the list of potential matches
  currentProfile: IProfile | null = null;
  noMoreProfiles = false;

  // Add buddy type property
  buddyType = ActivityType.OTHER;

  // Add properties for filter options
  filter1Options: { value: string; label: string }[] = [];
  filter2Options: { value: string; label: string }[] = [];
  filter3Options: { value: string; label: string }[] = [];

  filter1Value = '';
  filter2Value = '';
  filter3Value = '';

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
  protected readonly ActivityType = ActivityType;
  protected readonly activityMatchService = inject(ActivityMatchService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected ngZone = inject(NgZone);
  private accountService = inject(AccountService);
  private profileService = inject(ProfileService);
  private modalService = inject(NgbModal);

  ngOnInit(): void {
    // Subscribe to both id and type parameters
    this.subscription = combineLatest([this.activatedRoute.paramMap, this.activatedRoute.queryParamMap]).subscribe(
      ([params, queryParams]) => {
        // Get the buddy type from route parameters
        const type = params.get('type');
        if (type) {
          this.buddyType = ActivityType[type as keyof typeof ActivityType];
          this.setupFilterOptions();
          this.loadBuddies();
        }

        // Get the activity match ID if available
        const id = params.get('id');
        if (id) {
          this.activityMatchId = +id;
          this.loadActivityMatch(this.activityMatchId);
        }
      },
    );
    this.accountService
      .identity()
      .pipe(
        take(1),
        switchMap(account => this.profileService.query({ 'userLogin.equals': account?.login })),
        take(1),
      )
      .subscribe(resp => {
        const prof = resp.body?.[0];
        if (prof?.id) {
          this.currentUserProfileId = prof.id;
        } else {
          console.error('Could not find my profile');
        }
      });
  }

  loadBuddies(): void {
    this.isLoading = true;
    this.errorMessage = undefined;
    this.activityMatchService.getProfilesByPreferredActivity(this.buddyType).subscribe({
      next: res => {
        this.isLoading = false;
        this.profiles = res.body ?? [];
        if (this.profiles.length > 0) {
          this.currentProfileIndex = 0;
          this.currentProfile = this.profiles[this.currentProfileIndex];
          this.noMoreProfiles = false;
        } else {
          this.currentProfile = null;
          this.noMoreProfiles = true;
        }
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = `Failed to load ${this.buddyType} profiles. Please try again.`;
        console.error(`Error loading ${this.buddyType} profiles:`, error);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Fetch profiles by activity type
  // fetchProfilesByActivity(activityType: string): void {
  //   this.isLoading = true;
  //   this.errorMessage = undefined;
  //
  //   this.activityMatchService.getProfilesByPreferredActivity(activityType).subscribe({
  //     next: (profiles: IProfile[]) => {
  //       this.profiles = profiles; // Assign fetched profiles to the component property
  //       if (this.profiles.length > 0) {
  //         this.currentProfileIndex = 0;
  //         this.currentProfile = this.profiles[this.currentProfileIndex];
  //         this.noMoreProfiles = false;
  //       } else {
  //         this.currentProfile = null;
  //         this.noMoreProfiles = true;
  //       }
  //       this.isLoading = false;
  //     },
  //     error: error => {
  //       this.isLoading = false;
  //       this.errorMessage = `Failed to load ${activityType} profiles. Please try again.`;
  //       console.error(`Error loading ${activityType} profiles:`, error);
  //     },
  //   });
  // }

  // Setup filter options based on buddy type
  setupFilterOptions(): void {
    // Set up location and skill level options based on buddy type
    this.filter3Options = this.enumToOptions(PreferredTime, 'Any Time');

    switch (this.buddyType) {
      case ActivityType.GYM:
        this.filter1Options = this.enumToOptions(GymLocation, 'All Locations');
        this.filter2Options = this.enumToOptions(Skill, 'Any Skill Level');
        break;

      case ActivityType.ACADEMIC:
        this.filter1Options = this.enumToOptions(Course, 'All Courses');
        this.filter2Options = this.enumToOptions(University, 'Any University');
        break;

      case ActivityType.SPORTS:
        this.filter1Options = this.enumToOptions(Sports, 'Any Sports');
        this.filter2Options = this.enumToOptions(Skill, 'Any Skill Level');
        break;

      case ActivityType.SOCIAL:
        this.filter1Options = this.enumToOptions(Society, 'All Societies');
        this.filter2Options = this.enumToOptions(PreferredEvents, 'Any Event Type');
        break;
    }
  }

  loadActivityMatch(id: number): void {
    this.isLoading = true;
    this.errorMessage = undefined;

    this.activityMatchService.find(id).subscribe({
      next: res => {
        this.activityMatch = res.body;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load activity match data. Please try again.';
        console.error('Error loading activity match:', error);
      },
    });
  }

  // Method to load matches by buddy type
  // loadMatchesByType(): void {
  //   this.isLoading = true;
  //   this.errorMessage = undefined;
  //
  //   // Replace with actual API call to fetch matches
  //   // For demo/development, using a mock service with timeout
  //   setTimeout(() => {
  //     // Mock data - replace with real API call
  //     this.profiles = [
  //
  //
  //     // Set the first profile as current
  //     if (this.profiles.length > 0) {
  //       this.currentProfile = this.profiles[this.currentProfileIndex];
  //       this.noMoreProfiles = false;
  //     } else {
  //       this.currentProfile = null;
  //       this.noMoreProfiles = true;
  //     }
  //
  //     this.isLoading = false;
  //   }, 1000);
  //
  //   // When implementing the real service, use something like:
  //   /*
  //   this.activityMatchService.findByType(this.buddyType).subscribe({
  //     next: res => {
  //       this.profiles = res.body || [];
  //       if (this.profiles.length > 0) {
  //         this.currentProfile = this.profiles[this.currentProfileIndex];
  //         this.noMoreProfiles = false;
  //       } else {
  //         this.currentProfile = null;
  //         this.noMoreProfiles = true;
  //       }
  //       this.isLoading = false;
  //     },
  //     error: error => {
  //       this.isLoading = false;
  //       this.errorMessage = `Failed to load ${this.buddyType} buddies. Please try again.`;
  //       console.error(`Error loading ${this.buddyType} buddies:`, error);
  //     },
  //   });
  //   */
  // }

  loadMatchesByType(): void {
    this.isLoading = true;
    this.errorMessage = undefined;

    // In a real implementation, you would send these filter values to your API
    const filters = {
      filter1: this.filter1Value, // Location/Course/Sport/Society
      filter2: this.filter2Value, // Skill/University/Event Type
      filter3: this.filter3Value, // Timing
    };

    // For demo/development, using a mock service with timeout
    setTimeout(() => {
      // Start with all profiles
      let filteredProfiles = [...this.profiles];

      // Apply filters
      if (this.filter1Value) {
        filteredProfiles = this.applyFilter1(filteredProfiles, this.filter1Value);
      }

      if (this.filter2Value) {
        filteredProfiles = this.applyFilter2(filteredProfiles, this.filter2Value);
      }

      if (this.filter3Value) {
        filteredProfiles = this.applyFilter3(filteredProfiles, this.filter3Value);
      }

      // Set the filtered profiles
      this.profiles = filteredProfiles;

      // Set the first profile as current
      if (this.profiles.length > 0) {
        this.currentProfileIndex = 0;
        this.currentProfile = this.profiles[this.currentProfileIndex];
        this.noMoreProfiles = false;
      } else {
        this.currentProfile = null;
        this.noMoreProfiles = true;
      }

      this.isLoading = false;
    }, 1000);

    // When implementing the real service, use something like:
    /*
    this.activityMatchService.findByTypeWithFilters(
      this.buddyType,
      filters
    ).subscribe({
      next: res => {
        this.profiles = res.body || [];
        if (this.profiles.length > 0) {
          this.currentProfileIndex = 0;
          this.currentProfile = this.profiles[this.currentProfileIndex];
          this.noMoreProfiles = false;
        } else {
          this.currentProfile = null;
          this.noMoreProfiles = true;
        }
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = `Failed to load ${this.buddyType} buddies. Please try again.`;
        console.error(`Error loading ${this.buddyType} buddies:`, error);
      },
    });
    */
  }

  // Filter methods based on buddy type
  applyFilter1(profiles: any[], value: string): any[] {
    switch (this.buddyType) {
      case ActivityType.GYM:
        return profiles.filter(p => !value || p.gymLocation.toLowerCase().includes(value.toLowerCase()));
      case ActivityType.ACADEMIC:
        return profiles.filter(p => !value || p.course.toLowerCase().includes(value.toLowerCase()));
      case ActivityType.SPORTS:
        return profiles.filter(p => !value || p.sportType.toLowerCase().includes(value.toLowerCase()));
      case ActivityType.SOCIAL:
        return profiles.filter(p => !value || p.society.toLowerCase().includes(value.toLowerCase()));
      default:
        return profiles;
    }
  }

  applyFilter2(profiles: any[], value: string): any[] {
    switch (this.buddyType) {
      case ActivityType.GYM:
        return profiles.filter(p => !value || p.skillLevel.toLowerCase().includes(value.toLowerCase()));
      case ActivityType.SPORTS:
        return profiles.filter(p => !value || p.skillLevel.toLowerCase().includes(value.toLowerCase()));
      case ActivityType.ACADEMIC:
        return profiles.filter(p => !value || p.university?.toLowerCase().includes(value.toLowerCase()));
      case ActivityType.SOCIAL:
        return profiles.filter(p => !value || p.eventType.toLowerCase().includes(value.toLowerCase()));
      default:
        return profiles;
    }
  }

  applyFilter3(profiles: any[], value: string): any[] {
    // Timing filter works the same for all buddy types
    return profiles.filter(p => !value || p.preferredTime.toLowerCase().includes(value.toLowerCase()));
  }

  previousState(): void {
    window.history.back();
  }

  // Accept profile method with animation
  // acceptProfile(): void {
  //   if (!this.currentProfile) return;
  //
  //   // Add animation class
  //   const card = document.querySelector('.card');
  //   if (card) card.classList.add('accepting');
  //
  //   // Wait for animation, then proceed
  //   setTimeout(() => {
  //     this.isLoading = true;
  //
  //     // Mock service call - replace with real API call
  //     setTimeout(() => {
  //       this.showNextProfile();
  //       // Remove animation class after small delay
  //       setTimeout(() => {
  //         const newCard = document.querySelector('.card');
  //         if (newCard) newCard.classList.remove('accepting');
  //       }, 50);
  //     }, 500);
  //
  //     // When implementing real service, use:
  //     /*
  //     this.activityMatchService.saveMatch({
  //       targetUserId: this.currentProfile.id,
  //       buddyType: this.buddyType,
  //       action: 'ACCEPT'
  //     }).subscribe({
  //       next: () => {
  //         this.showNextProfile();
  //         setTimeout(() => {
  //           const newCard = document.querySelector('.card');
  //           if (newCard) newCard.classList.remove('accepting');
  //         }, 50);
  //       },
  //       error: error => {
  //         console.error('Error accepting profile:', error);
  //         this.showNextProfile();
  //         setTimeout(() => {
  //           const newCard = document.querySelector('.card');
  //           if (newCard) newCard.classList.remove('accepting');
  //         }, 50);
  //       }
  //     });
  //     */
  //   }, 300); // Match this time with your CSS transition duration
  // }

  async acceptProfile(): Promise<void> {
    if (!this.currentProfile || this.currentUserProfileId == null) {
      return;
    }
    const toProfileId = this.currentProfile.id;

    // 1. Open the dialog
    const modalRef = this.modalService.open(MatchRequestDialogComponent);

    try {
      // Wait for user to submit or cancel
      const result: { date: string; time: string; notes: string } = await modalRef.result;

      // If they closed without data, do nothing
      // if (!result) {
      //   return;
      // }
      // Build your NewActivityMatch dto, incorporating date/time/notes
      const { date, time, notes } = result;
      const [hours, minutes] = time.split(':').map(t => parseInt(t, 10));
      const matchDateTime = dayjs(date).hour(hours).minute(minutes);

      const newMatch: NewActivityMatch = {
        id: null,
        activityType: this.buddyType,
        status: 'PENDING',
        matchDate: dayjs(date),
        matchTime: matchDateTime,
        createdAt: dayjs(),
        responseAt: dayjs(),
        matchRequestor: { id: this.currentUserProfileId },
        userDetails: { id: toProfileId },
        location: null,
        notes,
        matchedActivity: null,
        ratings: null,
      };

      // Send to backend (auto-unsubscribes after first value)
      await firstValueFrom(this.activityMatchService.create(newMatch));

      // Advance to next profile
      this.showNextProfile();
    } catch (err) {
      // err === 'Cancel click' | 'Cross click' if dismissed, or HTTP error
      if (err !== 'Cancel click' && err !== 'Cross click') {
        console.error('Match request failed', err);
      }
      this.showNextProfile();
    }
  }

  // Reject profile method with animation
  rejectProfile(): void {
    if (!this.currentProfile) return;

    // Add animation class
    const card = document.querySelector('.card');
    if (card) card.classList.add('rejecting');

    // Wait for animation, then proceed
    setTimeout(() => {
      this.isLoading = true;

      // Mock service call - replace with real API call
      setTimeout(() => {
        this.showNextProfile();
        // Remove animation class after small delay
        setTimeout(() => {
          const newCard = document.querySelector('.card');
          if (newCard) newCard.classList.remove('rejecting');
        }, 50);
      }, 500);

      // When implementing real service, use:
      /*
      this.activityMatchService.saveMatch({
        targetUserId: this.currentProfile.id,
        buddyType: this.buddyType,
        action: 'REJECT'
      }).subscribe({
        next: () => {
          this.showNextProfile();
          setTimeout(() => {
            const newCard = document.querySelector('.card');
            if (newCard) newCard.classList.remove('rejecting');
          }, 50);
        },
        error: error => {
          console.error('Error rejecting profile:', error);
          this.showNextProfile();
          setTimeout(() => {
            const newCard = document.querySelector('.card');
            if (newCard) newCard.classList.remove('rejecting');
          }, 50);
        }
      });
      */
    }, 300); // Match this time with your CSS transition duration
  }

  // Method to show the next profile
  showNextProfile(): void {
    this.currentProfileIndex++;

    if (this.currentProfileIndex < this.profiles.length) {
      this.currentProfile = this.profiles[this.currentProfileIndex];
    } else {
      // No more profiles to show
      this.currentProfile = null;
      this.noMoreProfiles = true;
    }

    this.isLoading = false;
  }

  // Method to follow a profile
  followProfile(profileId: number): void {
    // Implement your follow functionality
  }

  // Add method to handle filter submission
  applyFilters(event: Event): void {
    event.preventDefault();
    // Reset the current index and reload with filters
    this.currentProfileIndex = 0;
    this.loadMatchesByType();
  }

  // Add method to reset filters
  resetFilters(): void {
    // Reset filter values
    this.filter1Value = '';
    this.filter2Value = '';
    this.filter3Value = '';
    // Reset the current index and reload
    this.currentProfileIndex = 0;
    this.loadMatchesByType();
  }

  // Helper method to get proper label for buddy type
  getFirstFilterLabel(): string {
    switch (this.buddyType) {
      case ActivityType.GYM:
        return 'Gym Location';
      case ActivityType.ACADEMIC:
        return 'Course';
      case ActivityType.SPORTS:
        return 'Sport';
      case ActivityType.SOCIAL:
        return 'Preferred Society';
      default:
        return 'Location';
    }
  }

  // Helper method to get proper label for skill level
  getSecondFilterLabel(): string {
    switch (this.buddyType) {
      case ActivityType.ACADEMIC:
        return 'University';
      case ActivityType.SPORTS:
        return 'Skill Level';
      case ActivityType.SOCIAL:
        return 'Preferred Event Type';
      default:
        return 'Skill Level';
    }
  }

  // Helper method to get proper label for timing
  getTimingLabel(): string {
    return 'Timing';
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToFriendRequest(): void {
    this.router.navigate(['/friend-request']);
  }

  hasMatchData(): boolean {
    return !!this.activityMatch;
  }

  followUser(): void {
    const popup = document.getElementById('followPopup');
    if (popup) {
      popup.classList.add('show');

      // Hide the popup after 3 seconds
      setTimeout(() => {
        popup.classList.remove('show');
      }, 3000);
    }
  }

  getInitials(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  // Helper method to convert enum to options for select input
  private enumToOptions(enumObj: Record<string, string>, defaultLabel: string): { value: string; label: string }[] {
    const options = Object.values(enumObj).map(value => ({ value, label: value }));
    options.unshift({ value: '', label: defaultLabel });
    return options;
  }
}
