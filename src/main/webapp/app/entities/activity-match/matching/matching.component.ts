import { Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { SortService, sortStateSignal } from 'app/shared/sort';
import { FormsModule } from '@angular/forms';
import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchService } from '../service/activity-match.service';
import { IProfile } from '../../profile/profile.model';
import { ActivityType } from '../../enumerations/activity-type.model';

@Component({
  standalone: true,
  selector: 'jhi-matching',
  templateUrl: './matching.component.html',
  styleUrl: 'matching.component.scss',
  imports: [RouterModule, FormsModule, SharedModule],
})
export class MatchingComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  activityMatch?: IActivityMatch | null;
  isLoading = false;
  activityMatchId?: number;
  errorMessage?: string;

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
  }

  loadBuddies(): void {
    this.isLoading = true;
    this.activityMatchService.getProfilesByPreferredActivity(this.buddyType).subscribe({
      next: res => {
        this.isLoading = false;
        this.profiles = res.body ?? [];
        if (this.profiles.length > 0) {
          this.currentProfile = this.profiles[this.currentProfileIndex];
        } else {
          this.noMoreProfiles = true;
        }
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = 'Error loading profiles';
      },
    });
  }

  // loadGymBuddies(): void {
  //   this.isLoading = true;
  //   this.activityMatchService.getProfilesByPreferredActivity(this.buddyType).subscribe({
  //     next: res => {
  //       this.isLoading = false;
  //       this.profiles = res.body ?? [];
  //       if (this.profiles.length > 0) {
  //         this.currentProfile = this.profiles[this.currentProfileIndex];
  //       } else {
  //         this.noMoreProfiles = true;
  //       }
  //     },
  //     error: () => {
  //       this.isLoading = false;
  //     },
  //   });
  // }

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
    this.filter3Options = [
      { value: '', label: 'Any Time' },
      { value: 'Early Morning', label: 'Early Morning' },
      { value: 'Morning', label: 'Morning' },
      { value: 'Afternoon', label: 'Afternoon' },
      { value: 'Evening', label: 'Evening' },
      { value: 'Night', label: 'Night' },
    ];

    switch (this.buddyType) {
      case ActivityType.GYM:
        this.filter1Options = [
          { value: '', label: 'All Locations' },
          { value: 'Sports And Fitness', label: 'Sports and Fitness Gym' },
          { value: 'Tiverton Center', label: 'Tiverton Center' },
          { value: 'Gym Group Selly Oak', label: 'The Gym Group Selly Oak' },
          { value: 'PureGym Five Ways', label: 'PureGym Five Ways' },
        ];
        this.filter2Options = [
          { value: '', label: 'Any Skill Level' },
          { value: 'Novice', label: 'Novice' },
          { value: 'Intermediate', label: 'Intermediate' },
          { value: 'Confident', label: 'Confident' },
          { value: 'Professional', label: 'Professional' },
        ];
        break;

      case ActivityType.ACADEMIC:
        this.filter1Options = [
          { value: '', label: 'Any Courses' },
          { value: 'Computer Science', label: 'Computer Science' },
          { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
          { value: 'Law', label: 'Law' },
          { value: 'Sports Science', label: 'Sports Science' },
        ];
        this.filter2Options = [
          { value: '', label: 'Any University' },
          { value: 'University of Birmingham', label: 'University of Birmingham' },
          { value: 'Aston University', label: 'Aston University' },
          { value: 'Birmingham City University', label: 'Birmingham City University' },
          { value: 'University of Nottingham', label: 'University of Nottingham' },
        ];
        break;

      case ActivityType.SPORTS:
        this.filter1Options = [
          { value: '', label: 'Any Sports' },
          { value: 'Football', label: 'Football' },
          { value: 'Basket Ball', label: 'Basket Ball' },
          { value: 'Tennis', label: 'Tennis' },
          { value: 'Swimming', label: 'Swimming' },
        ];
        this.filter2Options = [
          { value: '', label: 'Any Skill Level' },
          { value: 'Beginner', label: 'Beginner' },
          { value: 'Intermediate', label: 'Intermediate' },
          { value: 'Advanced', label: 'Advanced' },
          { value: 'Competitive', label: 'Competitive' },
        ];
        break;

      case ActivityType.SOCIAL:
        this.filter1Options = [
          { value: '', label: 'All Societies' },
          { value: 'Computer Science Society', label: 'Computer Science Society' },
          { value: 'Tea Society', label: 'Tea Society' },
          { value: 'Tamil Society', label: 'Tamil Society' },
          { value: 'Arab Society', label: 'Arab Society' },
          { value: 'Korean Society', label: 'Korean Society' },
        ];
        this.filter2Options = [
          { value: '', label: 'Any Event Type' },
          { value: 'Meet & Greet', label: 'Meet & Greet' },
          { value: 'Games Night', label: 'Games Night' },
          { value: 'Religious', label: 'Religious' },
          { value: 'Movie Night', label: 'Movie Night' },
          { value: 'Dinner & Dance', label: 'Dinner & Dance' },
        ];
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
  acceptProfile(): void {
    if (!this.currentProfile) return;

    // Add animation class
    const card = document.querySelector('.card');
    if (card) card.classList.add('accepting');

    // Wait for animation, then proceed
    setTimeout(() => {
      this.isLoading = true;

      // Mock service call - replace with real API call
      setTimeout(() => {
        this.showNextProfile();
        // Remove animation class after small delay
        setTimeout(() => {
          const newCard = document.querySelector('.card');
          if (newCard) newCard.classList.remove('accepting');
        }, 50);
      }, 500);

      // When implementing real service, use:
      /*
      this.activityMatchService.saveMatch({
        targetUserId: this.currentProfile.id,
        buddyType: this.buddyType,
        action: 'ACCEPT'
      }).subscribe({
        next: () => {
          this.showNextProfile();
          setTimeout(() => {
            const newCard = document.querySelector('.card');
            if (newCard) newCard.classList.remove('accepting');
          }, 50);
        },
        error: error => {
          console.error('Error accepting profile:', error);
          this.showNextProfile();
          setTimeout(() => {
            const newCard = document.querySelector('.card');
            if (newCard) newCard.classList.remove('accepting');
          }, 50);
        }
      });
      */
    }, 300); // Match this time with your CSS transition duration
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
  getLocationLabel(): string {
    switch (this.buddyType) {
      case ActivityType.GYM:
        return 'Gym Location';
      case ActivityType.ACADEMIC:
        return 'Course';
      case ActivityType.SPORTS:
        return 'Sport';
      case ActivityType.SOCIAL:
        return 'Society';
      default:
        return 'Location';
    }
  }

  // Helper method to get proper label for skill level
  getSkillLabel(): string {
    switch (this.buddyType) {
      case ActivityType.ACADEMIC:
        return 'University';
      case ActivityType.SPORTS:
        return 'Skill Level';
      case ActivityType.SOCIAL:
        return 'Event Type';
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
}
