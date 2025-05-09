import { Component, inject, NgZone, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { map, take } from 'rxjs/operators';
import { AccountService } from 'app/core/auth/account.service';
import { NewActivityMatch } from 'app/entities/activity-match/activity-match.model';
import { ProfileService } from '../../profile/service/profile.service';
import { MatchRequestDialogComponent } from '../match-request-dialog/match-request-dialog.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs';
import { Decision } from '../../enumerations/decision.model';
import { SpeechService } from 'app/core/speech/speech.service';
import { A11yModule } from 'app/shared/a11y/a11y.module';
import { AccessibilityService } from '../../../core/Accessibility/accessibility.service';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';

@Component({
  standalone: true,
  selector: 'jhi-matching',
  templateUrl: './matching.component.html',
  styleUrl: 'matching.component.scss',
  imports: [RouterModule, FormsModule, SharedModule, MatchRequestDialogComponent, A11yModule],
})
export class MatchingComponent implements OnInit, OnDestroy {
  liveMessage = '';

  @ViewChild('readProfileBtn', { static: false })
  readProfileBtn!: ElementRef<HTMLButtonElement>;

  subscription: Subscription | null = null;
  activityMatch?: IActivityMatch | null;
  isLoading = false;
  activityMatchId?: number;
  errorMessage?: string;

  currentUserProfileId?: number;
  currentUserLogin?: string | null | undefined;

  // Properties for profile navigation
  currentProfileIndex = 0;
  profiles: IProfile[] = []; // This will store the list of potential matches
  currentProfile: IProfile | null = null;
  noMoreProfiles = false;
  showFollowPopup = false;

  // Add buddy type property
  buddyType = ActivityType.OTHER;

  // Add properties for filter options
  filter1Options: { value: string; label: string }[] = [];
  filter2Options: { value: string; label: string }[] = [];
  filter3Options: { value: string; label: string }[] = [];

  filter1Value = '';
  filter2Value = '';
  filter3Value = '';

  animationClass = '';

  followState: 'none' | 'pending' | 'friends' = 'none'; // Add this

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
  private friendsListService = inject(FriendsListService);

  constructor(
    protected a11y: AccessibilityService, // ← add this
    private speechService: SpeechService, // ← keep your existing injections
  ) {}

  ngOnInit(): void {
    combineLatest([this.accountService.identity().pipe(take(1)), this.activatedRoute.paramMap])
      .pipe(
        switchMap(([account, params]) => {
          const login = account?.login;
          const type = params.get('type');

          if (!login || !type) {
            throw new Error('Missing login or activity type');
          }

          this.buddyType = ActivityType[type as keyof typeof ActivityType];
          this.setupFilterOptions();
          this.filter1Value = '';
          this.filter2Value = '';
          this.filter3Value = '';

          return this.profileService.query({ 'userLogin.equals': login }).pipe(take(1));
        }),
      )
      .subscribe({
        next: resp => {
          const me = resp.body?.[0];
          if (me?.id) {
            this.currentUserProfileId = me.id;
            this.currentUserLogin = me.login;
            this.loadBuddies();
          } else {
            console.error('Could not find my profile');
          }
        },
        error: err => {
          console.error('Error during initialization:', err);
          this.errorMessage = 'Failed to load your profile. Please refresh the page.';
        },
      });
  }

  loadBuddies(): void {
    if (!this.currentUserProfileId) return;

    this.isLoading = true;
    this.errorMessage = undefined;

    this.activityMatchService.getAvailableProfiles(this.buddyType, this.currentUserLogin).subscribe({
      next: profiles => {
        this.isLoading = false;
        this.profiles = profiles.filter(p => p.id !== this.currentUserProfileId); // Exclude self
        this.resetCursor();
      },
      error: err => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = 'Failed to load buddies. Please try again.';
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
    if (!this.currentUserProfileId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = undefined;

    this.activityMatchService
      .getAvailableProfiles(this.buddyType, this.currentUserLogin)
      .pipe(
        map(profiles => {
          let filtered = profiles.filter(p => p.id !== this.currentUserProfileId); // Exclude self
          if (this.filter1Value) {
            filtered = this.applyFilter1(filtered, this.filter1Value);
          }
          if (this.filter2Value) {
            filtered = this.applyFilter2(filtered, this.filter2Value);
          }
          if (this.filter3Value) {
            filtered = this.applyFilter3(filtered, this.filter3Value);
          }
          return filtered;
        }),
      )
      .subscribe({
        next: profiles => {
          this.profiles = profiles;
          // resetProfileIndex logic
          if (profiles.length > 0) {
            this.currentProfileIndex = 0;
            this.currentProfile = profiles[0];
            this.noMoreProfiles = false;
          } else {
            this.currentProfile = null;
            this.noMoreProfiles = true;
          }
          this.isLoading = false;
        },
        error: err => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load buddies. Please try again.';
          console.error('loadMatchesByType error', err);
        },
      });
  }

  // Filter methods based on buddy type
  applyFilter1(profiles: IProfile[], value: string): IProfile[] {
    if (!value) {
      return profiles;
    }
    switch (this.buddyType) {
      case ActivityType.GYM:
        return profiles.filter(p => p.gymLocation === value);
      case ActivityType.ACADEMIC:
        return profiles.filter(p => p.course === value);
      case ActivityType.SPORTS:
        // use the `sports` field, not sportType
        return profiles.filter(p => p.sports === value);
      case ActivityType.SOCIAL:
        return profiles.filter(p => p.preferredSociety === value);
      default:
        return profiles;
    }
  }

  applyFilter2(profiles: IProfile[], value: string): IProfile[] {
    if (!value) {
      return profiles;
    }
    switch (this.buddyType) {
      case ActivityType.GYM:
      case ActivityType.SPORTS:
        // use the sportsSkill field for SPORTS
        return profiles.filter(p => p.sportsSkill === value);
      case ActivityType.ACADEMIC:
        return profiles.filter(p => p.university === value);
      case ActivityType.SOCIAL:
        return profiles.filter(p => p.preferredEvents === value);
      default:
        return profiles;
    }
  }

  applyFilter3(profiles: IProfile[], value: string): IProfile[] {
    if (!value) {
      return profiles;
    }
    switch (this.buddyType) {
      case ActivityType.GYM:
        return profiles.filter(p => p.gymTime === value);
      case ActivityType.ACADEMIC:
        return profiles.filter(p => p.studyTime === value);
      case ActivityType.SPORTS:
        return profiles.filter(p => p.sportsTime === value);
      case ActivityType.SOCIAL:
        return profiles.filter(p => p.eventsTime === value);
      default:
        return profiles;
    }
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
        status: Decision.PENDING,
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
      this.animationClass = 'swipe-right';
      setTimeout(() => this.showNextProfile(), 600); // delay matches CSS animation duration
    } catch (err) {
      // err === 'Cancel click' | 'Cross click' if dismissed, or HTTP error
      if (err !== 'Cancel click' && err !== 'Cross click') {
        console.error('Match request failed', err);
      }
      this.showNextProfile();
    }
  }

  async rejectProfile(): Promise<void> {
    if (!this.currentProfile || this.currentUserProfileId == null) {
      return;
    }

    this.animationClass = 'swipe-left';

    this.isLoading = true;

    // build the exact same DTO you use for Accept, just with DECLINED
    const now = dayjs();
    const newMatch: NewActivityMatch = {
      id: null,
      activityType: this.buddyType,
      status: Decision.DECLINED,
      matchDate: now, // or you could default to today
      matchTime: now, // we need a time—but it’s “the moment you rejected”
      createdAt: now,
      responseAt: now,
      matchRequestor: { id: this.currentUserProfileId },
      userDetails: { id: this.currentProfile.id },
      location: null,
      notes: null,
      matchedActivity: null,
      ratings: null,
    };

    try {
      // send the DECLINED record to your API
      await firstValueFrom(this.activityMatchService.create(newMatch));
    } catch (err) {
      console.error('Error saving decline:', err);
    } finally {
      // advance the carousel
      setTimeout(() => this.showNextProfile(), 600);
      // tear down the animation class
      this.isLoading = false;
    }
  }

  // Method to show the next profile
  showNextProfile(): void {
    this.currentProfileIndex++;

    if (this.currentProfileIndex < this.profiles.length) {
      this.currentProfile = this.profiles[this.currentProfileIndex];
      this.animationClass = 'swipe-in';
    } else {
      // No more profiles to show
      this.currentProfile = null;
      this.noMoreProfiles = true;
    }

    this.isLoading = false;

    setTimeout(() => {
      this.animationClass = '';
      this.readProfileBtn.nativeElement.focus();
    }, 0);
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
    this.loadBuddies();
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
    if (!this.currentProfile?.id) return;
    this.router.navigate(['/profile-detail', this.currentProfile.id]);
  }

  navigateToFriendRequest(): void {
    this.router.navigate(['/friend-request']);
  }

  hasMatchData(): boolean {
    return !!this.activityMatch;
  }

  followUser(): void {
    if (!this.currentProfile?.id) return;

    const targetId = this.currentProfile.id;

    this.profileService.findMyProfile().subscribe(myProfileRes => {
      const myProfileId = myProfileRes.body?.id;
      if (!myProfileId || myProfileId === targetId) return;

      // 1. Check if already friends
      this.friendsListService.getCurrentUserAcceptedFriends().subscribe(friendsRes => {
        const isFriend = (friendsRes.body ?? []).some(
          f =>
            (f.requestedByProfile?.id === myProfileId && f.requestedToProfile?.id === targetId) ||
            (f.requestedByProfile?.id === targetId && f.requestedToProfile?.id === myProfileId),
        );

        if (isFriend) {
          alert('You are already friends!');
          return;
        }

        // 2. Check if follow request already sent
        this.friendsListService.getCurrentUserSentFriendRequests().subscribe(sentRes => {
          const isPending = (sentRes.body ?? []).some(req => req.requestedToProfile?.id === targetId && req.requestStatus === 'PENDING');

          if (isPending) {
            alert('Friend request already pending!');
            return;
          }

          // 3. Send follow request
          this.friendsListService.sendFriendRequest(targetId).subscribe(() => {
            const popup = document.getElementById('followPopup');
            if (popup) {
              popup.classList.add('show');
              this.showFollowPopup = true;
              setTimeout(() => {
                popup.classList.remove('show');
                this.showFollowPopup = false;
              }, 3000);
            }
          });
        });
      });
    });
  }

  getInitials(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  /** Read out the current profile summary via TTS */
  readProfile(): void {
    if (!this.a11y.isEnabled()) {
      return;
    }
    if (!this.currentProfile) {
      return;
    }
    const p = this.currentProfile;
    const summary =
      `Matched buddy: ${p.firstName} ${p.lastName}, ` +
      `studying ${p.course}, year ${p.courseYear}, ` +
      `interested in ${this.buddyType.toLowerCase()}.`;
  }

  // Helper method to convert enum to options for select input
  private enumToOptions(enumObj: Record<string, string>, defaultLabel: string): { value: string; label: string }[] {
    const options = Object.values(enumObj).map(value => ({ value, label: value }));
    options.unshift({ value: '', label: defaultLabel });
    return options;
  }

  private announce(msg: string): void {
    if (!this.a11y.isEnabled()) {
      return;
    }
    this.liveMessage = msg;
  }

  private resetCursor(): void {
    if (!this.profiles.length) {
      this.currentProfile = null;
      this.noMoreProfiles = true;
      return;
    }
    this.currentProfileIndex = 0;
    this.currentProfile = this.profiles[0];
    this.noMoreProfiles = false;

    // announce only when enabled
    if (this.a11y.isEnabled()) {
      this.liveMessage =
        `Profile ${this.currentProfileIndex + 1} of ${this.profiles.length}: ` +
        `${this.currentProfile.firstName} ${this.currentProfile.lastName}.`;
    }

    setTimeout(() => {
      this.readProfileBtn.nativeElement.focus();

      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          if (this.a11y.isEnabled()) {
            this.readProfile();
          }
        });
      } else {
        requestAnimationFrame(() => {
          if (this.a11y.isEnabled()) {
            this.readProfile();
          }
        });
      }
    }, 0);
  }
}
