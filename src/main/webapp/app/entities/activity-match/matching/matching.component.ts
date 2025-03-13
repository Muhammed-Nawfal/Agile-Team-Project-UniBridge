import { Component, NgZone, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, SORT } from 'app/config/navigation.constants';
import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchService } from '../service/activity-match.service';

@Component({
  standalone: true,
  selector: 'jhi-matching',
  templateUrl: './matching.component.html',
  styleUrl: 'matching.component.scss',
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    DurationPipe,
    FormatMediumDatetimePipe,
    FormatMediumDatePipe,
  ],
})
export class MatchingComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  activityMatch?: IActivityMatch | null;
  isLoading = false;
  activityMatchId?: number;
  errorMessage?: string;

  // Properties for profile navigation
  currentProfileIndex = 0;
  profiles: any[] = []; // This would store your list of potential matches
  currentProfile: any = null;
  noMoreProfiles = false;

  // Add buddy type property
  buddyType = 'gym'; // Default value

  // Add properties for filter options
  filter1Options: { value: string; label: string }[] = [];
  filter2Options: { value: string; label: string }[] = [];
  filter3Options: { value: string; label: string }[] = [];

  filter1Value = '';
  filter2Value = '';
  filter3Value = '';

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
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
          this.buddyType = type;
          this.setupFilterOptions();
        }

        // Get the activity match ID if available
        const id = params.get('id');
        if (id) {
          this.activityMatchId = +id;
          this.loadActivityMatch(this.activityMatchId);
        } else {
          // If no specific ID, load general matches by buddy type
          this.loadMatchesByType();
        }
      },
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Setup filter options based on buddy type
  setupFilterOptions(): void {
    // Set up location and skill level options based on buddy type
    this.filter3Options = [
      { value: '', label: 'Any Time' },
      { value: 'early-morning', label: 'Early Morning' },
      { value: 'morning', label: 'Morning' },
      { value: 'afternoon', label: 'Afternoon' },
      { value: 'evening', label: 'Evening' },
      { value: 'night', label: 'Night' },
    ];

    switch (this.buddyType) {
      case 'gym':
        this.filter1Options = [
          { value: '', label: 'All Locations' },
          { value: 'sports-and-fitness', label: 'Sports and Fitness Gym' },
          { value: 'tiverton', label: 'Tiverton Center' },
          { value: 'gym-group-selly-oak', label: 'The Gym Group Selly Oak' },
          { value: 'puregym-five-ways', label: 'PureGym Five Ways' },
        ];
        this.filter2Options = [
          { value: '', label: 'Any Skill Level' },
          { value: 'novice', label: 'Novice' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'confident', label: 'Confident' },
          { value: 'professional', label: 'Professional' },
        ];
        break;

      case 'study':
        this.filter1Options = [
          { value: '', label: 'Any Courses' },
          { value: 'computer-science', label: 'Computer Science' },
          { value: 'mechanical-engineering', label: 'Mechanical Engineering' },
          { value: 'law', label: 'Law' },
          { value: 'sports-science', label: 'Sports Science' },
        ];
        this.filter2Options = [
          { value: '', label: 'Any University' },
          { value: 'university-of-birmingham', label: 'University of Birmingham' },
          { value: 'aston-university', label: 'Aston University' },
          { value: 'birmingham-city-university', label: 'Birmingham City University' },
          { value: 'university-of-nottingham', label: 'University of Nottingham' },
        ];
        break;

      case 'sports':
        this.filter1Options = [
          { value: '', label: 'Any Sports' },
          { value: 'football', label: 'Football' },
          { value: 'basketball', label: 'Basket Ball' },
          { value: 'tennis', label: 'Tennis' },
          { value: 'swimming', label: 'Swimming' },
        ];
        this.filter2Options = [
          { value: '', label: 'Any Skill Level' },
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
          { value: 'competitive', label: 'Competitive' },
        ];
        break;

      case 'events':
        this.filter1Options = [
          { value: '', label: 'All Societies' },
          { value: 'computer-science-society', label: 'Computer Science Society' },
          { value: 'tea-society', label: 'Tea Society' },
          { value: 'tamil-society', label: 'Tamil Society' },
          { value: 'arab-society', label: 'Arab Society' },
          { value: 'korean-society', label: 'Korean Society' },
        ];
        this.filter2Options = [
          { value: '', label: 'Any Event Type' },
          { value: 'meet-&-greet', label: 'Meet & Greet' },
          { value: 'games-night', label: 'Games Night' },
          { value: 'religious', label: 'Religious' },
          { value: 'movie-night', label: 'Movie Night' },
          { value: 'dinner-&-dance', label: 'Dinner & Dance' },
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
  loadMatchesByType(): void {
    this.isLoading = true;
    this.errorMessage = undefined;

    // Replace with actual API call to fetch matches
    // For demo/development, using a mock service with timeout
    setTimeout(() => {
      // Mock data - replace with real API call
      this.profiles = [
        {
          id: 1,
          name: 'Nawfal',
          bio: 'My Bio',
          course: 'Computer Science',
          year: 2,
          imageUrl: 'content/images/5imrkq.jpg',
          gymLocation: 'The Gym Group Selly Oak',
          sportType: 'Football',
          society: 'Computer Science Society',
          preferredTime: 'Afternoon',
          skillLevel: 'Intermediate',
          eventType: 'Games Night',
          rating: 4,
        },
        {
          id: 2,
          name: 'Alex',
          bio: 'Student athlete',
          course: 'Sports Science',
          year: 3,
          imageUrl: 'content/images/default-profile.jpg',
          gymLocation: 'Sports and Fitness Gym',
          sportType: 'Basketball',
          society: 'Sports Society',
          preferredTime: 'Evening',
          skillLevel: 'Advanced',
          eventType: 'Meet & Greet',
          rating: 5,
        },
        {
          id: 3,
          name: 'Sam',
          bio: 'Looking for study partners',
          course: 'Law',
          year: 1,
          imageUrl: 'content/images/default-profile.jpg',
          gymLocation: 'PureGym Five Ways',
          sportType: 'Swimming',
          society: 'Law Society',
          preferredTime: 'Morning',
          skillLevel: 'Novice',
          eventType: 'Dinner & Dance',
          rating: 3,
        },
      ];

      // Set the first profile as current
      if (this.profiles.length > 0) {
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
    this.activityMatchService.findByType(this.buddyType).subscribe({
      next: res => {
        this.profiles = res.body || [];
        if (this.profiles.length > 0) {
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
      case 'gym':
        return 'Gym Location';
      case 'study':
        return 'Course';
      case 'sports':
        return 'Sport';
      case 'events':
        return 'Society';
      default:
        return 'Location';
    }
  }

  // Helper method to get proper label for skill level
  getSkillLabel(): string {
    switch (this.buddyType) {
      case 'study':
        return 'University';
      case 'sports':
        return 'Skill Level';
      case 'events':
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
}
