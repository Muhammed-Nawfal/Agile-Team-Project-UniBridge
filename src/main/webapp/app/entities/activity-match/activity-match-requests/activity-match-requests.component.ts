import { Component, OnInit, OnDestroy, inject, ViewChildren, QueryList, ElementRef, signal } from '@angular/core';
import { Subject, switchMap, take, takeUntil } from 'rxjs';
import SharedModule from 'app/shared/shared.module';
import { RouterLink } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchService } from '../service/activity-match.service';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { Decision } from 'app/entities/enumerations/decision.model';
import dayjs from 'dayjs/esm';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCalendarAlt, faClock, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { SpeechService } from 'app/core/speech/speech.service';
import { A11yModule } from 'app/shared/a11y/a11y.module';

@Component({
  standalone: true,
  selector: 'jhi-activity-match-requests',
  templateUrl: './activity-match-requests.component.html',
  styleUrls: ['./activity-match-requests.component.scss'],
  imports: [CommonModule, SharedModule, RouterLink, A11yModule],
})
export class ActivityMatchRequestsComponent implements OnInit, OnDestroy {
  @ViewChildren('readReqBtn', { read: ElementRef })
  readButtons!: QueryList<ElementRef<HTMLButtonElement>>;
  /** Currently authenticated user */
  account = signal<Account | null>(null);
  Decision = Decision;

  /** Incoming match requests (status = PENDING) */
  matchRequests: IActivityMatch[] = [];
  isLoading = false;

  private accountService = inject(AccountService);
  private activityMatchService = inject(ActivityMatchService);
  private profileService = inject(ProfileService);
  private destroy$ = new Subject<void>();
  private speechService = inject(SpeechService);
  /** After fetching, focus the first read button */

  constructor(private library: FaIconLibrary) {
    // Make these icons available to all <fa-icon> in this component
    this.library.addIcons(faCalendarAlt, faClock, faMapMarkerAlt);
  }

  ngOnInit(): void {
    this.accountService
      .identity()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        this.account.set(account);
        if (account) {
          this.loadMatchRequests();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Fetch all pending match requests for the current user
   */
  loadMatchRequests(): void {
    this.isLoading = true;
    this.accountService
      .identity()
      .pipe(
        take(1),
        switchMap(account => this.profileService.query({ 'userLogin.equals': account?.login }).pipe(take(1))),
        take(1),
      )
      .subscribe({
        next: resp => {
          const me = resp.body?.[0];
          if (!me?.id) {
            this.matchRequests = [];
            this.isLoading = false;
            return;
          }
          this.activityMatchService
            .query({
              'userDetailsId.equals': me.id,
              'status.equals': Decision.PENDING,
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: listRes => {
                this.matchRequests = (listRes.body ?? []).filter(r => r.matchRequestor?.id !== me.id);
                this.isLoading = false;
                this.focusFirstReadButton();
              },
              error: () => {
                this.isLoading = false;
              },
            });
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  /**
   * Accept or decline a match request.
   * Decline operations prompt for confirmation.
   */
  onRespond(req: IActivityMatch, decision: keyof typeof Decision): void {
    // Confirm if declining
    if (decision === Decision.DECLINED) {
      const ok = window.confirm('Are you sure you want to decline this match request?');
      if (!ok) {
        return;
      }
    }

    this.isLoading = true;
    // Prepare updated record with Dayjs responseAt
    const updated: IActivityMatch = {
      ...req,
      status: decision,
      responseAt: dayjs(),
    };

    this.activityMatchService
      .update(updated)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove the handled request from the list
          this.matchRequests = this.matchRequests.filter(r => r.id !== req.id);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  /** Manually refresh the pending requests list */
  onRefresh(): void {
    this.loadMatchRequests();
  }

  /** Read out the details of a pending request */
  readRequest(req: IActivityMatch): void {
    const who = req.matchRequestor;
    const loc = req.location ?? 'TBD';
    const dateStr = req.matchDate != null ? req.matchDate.format('DD MMMM YYYY') : 'unknown date';
    const timeStr = req.matchTime != null ? dayjs(req.matchTime).format('HH:mm') : 'unknown time';

    const text =
      `Request from ${who?.firstName} ${who?.lastName}, ` +
      `for ${req.activityType?.toLowerCase()} on ${dateStr} at ${timeStr}, ` +
      `location ${loc}.`;
    this.speechService.speak(text);
  }
  private focusFirstReadButton(): void {
    setTimeout(() => {
      const first = this.readButtons.first;
      first.nativeElement.focus();
    }, 0);
  }
}
