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
      { value: 'Early Morning', label: 'Early Morning' },
      { value: 'Morning', label: 'Morning' },
      { value: 'Afternoon', label: 'Afternoon' },
      { value: 'Evening', label: 'Evening' },
      { value: 'Night', label: 'Night' },
    ];

    switch (this.buddyType) {
      case 'gym':
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

      case 'study':
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

      case 'sports':
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

      case 'events':
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
      let filteredProfiles = [...this.getAllProfiles()];

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

  // Get all mock profiles (in real app, this would be a database call)
  getAllProfiles(): any[] {
    return [
      {
        id: 1,
        name: 'Alice',
        bio: 'Looking for a gym buddy',
        course: 'Sports Science',
        year: 2,
        imageUrl: 'content/images/alice.jpg',
        gymLocation: 'Sports and Fitness Gym',
        sportType: '',
        society: '',
        preferredTime: 'Evening',
        skillLevel: 'Intermediate',
        eventType: '',
        rating: 4,
      },
      {
        id: 2,
        name: 'Bob',
        bio: 'Need a study partner for Law',
        course: 'Law',
        year: 3,
        imageUrl: 'content/images/bob.jpg',
        gymLocation: '',
        sportType: '',
        society: '',
        preferredTime: 'Afternoon',
        skillLevel: '',
        eventType: '',
        rating: 5,
      },
      {
        id: 3,
        name: 'Charlie',
        bio: 'Looking for football teammates',
        course: '',
        year: 1,
        imageUrl: 'content/images/charlie.jpg',
        gymLocation: '',
        sportType: 'Football',
        society: '',
        preferredTime: 'Morning',
        skillLevel: 'Intermediate',
        eventType: '',
        rating: 3,
      },
      {
        id: 4,
        name: 'David',
        bio: 'Basketball enthusiast',
        course: '',
        year: 2,
        imageUrl: 'content/images/david.jpg',
        gymLocation: '',
        sportType: 'Basketball',
        society: '',
        preferredTime: 'Evening',
        skillLevel: 'Intermediate',
        eventType: '',
        rating: 4,
      },
      {
        id: 5,
        name: 'Emma',
        bio: 'Yoga and mindfulness',
        course: '',
        year: 1,
        imageUrl: 'content/images/emma.jpg',
        gymLocation: 'Tiverton Center',
        sportType: '',
        society: '',
        preferredTime: 'Morning',
        skillLevel: 'Beginner',
        eventType: '',
        rating: 5,
      },
      {
        id: 6,
        name: 'Frank',
        bio: 'Training for triathlon',
        course: '',
        year: 3,
        imageUrl: 'content/images/frank.jpg',
        gymLocation: '',
        sportType: 'Swimming',
        society: '',
        preferredTime: 'Afternoon',
        skillLevel: 'Advanced',
        eventType: '',
        rating: 5,
      },
      {
        id: 7,
        name: 'Grace',
        bio: 'Looking for a study group',
        course: 'Computer Science',
        year: 2,
        imageUrl: 'content/images/grace.jpg',
        gymLocation: '',
        sportType: '',
        society: '',
        preferredTime: 'Evening',
        skillLevel: '',
        eventType: '',
        rating: 4,
      },
      {
        id: 8,
        name: 'Henry',
        bio: 'Football fanatic',
        course: '',
        year: 1,
        imageUrl: 'content/images/henry.jpg',
        gymLocation: '',
        sportType: 'Football',
        society: '',
        preferredTime: 'Afternoon',
        skillLevel: 'Advanced',
        eventType: '',
        rating: 5,
      },
      {
        id: 9,
        name: 'Ivy',
        bio: 'Excited for meet & greet events',
        course: '',
        year: 2,
        imageUrl: 'content/images/ivy.jpg',
        gymLocation: '',
        sportType: '',
        society: 'Computer Science Society',
        preferredTime: '',
        skillLevel: '',
        eventType: 'Meet & Greet',
        rating: 4,
      },
      {
        id: 10,
        name: 'Jack',
        bio: 'Member of the Arab Society',
        course: '',
        year: 3,
        imageUrl: 'content/images/jack.jpg',
        gymLocation: '',
        sportType: '',
        society: 'Arab Society',
        preferredTime: '',
        skillLevel: '',
        eventType: 'Dinner & Dance',
        rating: 5,
      },
      {
        id: 11,
        name: 'Nawfal',
        bio: 'GymRat',
        course: 'Computer Science',
        year: 2,
        imageUrl: 'content/images/5imrkq.jpg',
        gymLocation: 'The Gym Group Selly Oak',
        sportType: 'Football',
        society: 'Computer Science Society',
        preferredTime: 'Evening',
        skillLevel: 'Intermediate',
        eventType: 'Games Night',
        rating: 4,
      },
      {
        id: 12,
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
        id: 13,
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
  }

  // Filter methods based on buddy type
  applyFilter1(profiles: any[], value: string): any[] {
    switch (this.buddyType) {
      case 'gym':
        return profiles.filter(p => !value || p.gymLocation.toLowerCase().includes(value.toLowerCase()));
      case 'study':
        return profiles.filter(p => !value || p.course.toLowerCase().includes(value.toLowerCase()));
      case 'sports':
        return profiles.filter(p => !value || p.sportType.toLowerCase().includes(value.toLowerCase()));
      case 'events':
        return profiles.filter(p => !value || p.society.toLowerCase().includes(value.toLowerCase()));
      default:
        return profiles;
    }
  }

  applyFilter2(profiles: any[], value: string): any[] {
    switch (this.buddyType) {
      case 'gym':
      case 'sports':
        return profiles.filter(p => !value || p.skillLevel.toLowerCase().includes(value.toLowerCase()));
      case 'study':
        return profiles.filter(p => !value || p.university?.toLowerCase().includes(value.toLowerCase()));
      case 'events':
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
