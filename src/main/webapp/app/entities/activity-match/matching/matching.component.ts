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

  // Add buddy type property
  buddyType = 'gym'; // Default value

  // Add properties for filter options
  filter1Options: { value: string; label: string }[] = [];
  filter2Options: { value: string; label: string }[] = [];
  filter3Options: { value: string; label: string }[] = [];

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

  // Add method to load matches by buddy type
  loadMatchesByType(): void {
    this.isLoading = true;
    this.errorMessage = undefined;

    // Here you would typically call a service method that filters by buddy type
    // For example:
    // this.activityMatchService.findByType(this.buddyType).subscribe({
    //   next: res => {
    //     this.activityMatches = res.body;
    //     this.isLoading = false;
    //   },
    //   error: error => {
    //     this.isLoading = false;
    //     this.errorMessage = `Failed to load ${this.buddyType} buddies. Please try again.`;
    //     console.error(`Error loading ${this.buddyType} buddies:`, error);
    //   },
    // });

    // For now, just simulate a service call
    setTimeout(() => {
      this.isLoading = false;
      // console.log(`Loaded ${this.buddyType} buddies`);
    }, 1000);
  }

  previousState(): void {
    window.history.back();
  }

  performMatching(): void {
    if (!this.activityMatchId && !this.buddyType) {
      this.errorMessage = 'Cannot perform matching: Required information is not available.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = undefined;

    // Simulate a service call with a timeout
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  // Add method to handle filter submission
  applyFilters(event: Event): void {
    event.preventDefault();
    // console.log(`Applying filters for ${this.buddyType} buddy matches`);
    // Implement your filter logic here
    this.loadMatchesByType();
  }

  // Add method to reset filters
  resetFilters(): void {
    // console.log(`Resetting filters for ${this.buddyType} buddy matches`);
    // Reset your filter form and reload data
    this.loadMatchesByType();
  }

  // Helper method to get proper label for buddy type
  getLocationLabel(): string {
    switch (this.buddyType) {
      case 'gym':
        return 'Gym Location';
      case 'study':
        return 'Library Location';
      case 'sports':
        return 'Sports Facility';
      case 'events':
        return 'Event Location';
      default:
        return 'Location';
    }
  }

  // Helper method to get proper label for skill level
  getSkillLabel(): string {
    switch (this.buddyType) {
      case 'study':
        return 'Subject Level';
      default:
        return 'Skill Level';
    }
  }

  // Helper method to get proper label for timing
  getTimingLabel(): string {
    switch (this.buddyType) {
      case 'gym':
        return 'Preferred Workout Time';
      case 'study':
        return 'Preferred Study Time';
      case 'sports':
        return 'Preferred Training Time';
      case 'events':
        return 'Preferred Event Time';
      default:
        return 'Preferred Time';
    }
  }

  hasMatchData(): boolean {
    return !!this.activityMatch;
  }
}
