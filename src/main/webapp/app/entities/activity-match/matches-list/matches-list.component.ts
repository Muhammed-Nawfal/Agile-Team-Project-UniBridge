import { Component, ElementRef, inject, OnDestroy, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, switchMap, take, takeUntil } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchService } from '../service/activity-match.service';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { ActivityType } from 'app/entities/enumerations/activity-type.model';
import dayjs from 'dayjs/esm';
import { faCalendarAlt, faChevronDown, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { SpeechService } from '../../../core/speech/speech.service';
import { A11yModule } from 'app/shared/a11y/a11y.module';

library.add(faSlidersH, faChevronDown, faCalendarAlt);

type MatchWithParsedTime = IActivityMatch & { matchTime: Date | null };

@Component({
  standalone: true,
  selector: 'jhi-matches-list',
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.scss'],
  imports: [FormsModule, SharedModule, RouterLink, A11yModule],
})
export class MatchesListComponent implements OnInit, OnDestroy {
  @ViewChildren('readMatchBtn', { read: ElementRef })
  readButtons!: QueryList<ElementRef<HTMLButtonElement>>;
  account = signal<Account | null>(null);
  upcomingMatches: MatchWithParsedTime[] = [];
  activityTypes = Object.values(ActivityType);
  selectedMonth = new Date();
  selectedType = '';
  isLoading = false;

  private router = inject(Router);
  private accountService = inject(AccountService);
  private activityMatchService = inject(ActivityMatchService);
  private profileService = inject(ProfileService);
  private destroy$ = new Subject<void>();
  private speechService = inject(SpeechService);

  ngOnInit(): void {
    this.accountService
      .identity()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        this.account.set(account);
        if (account) this.loadUpcomingMatches();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUpcomingMatches(): void {
    this.isLoading = true;
    this.accountService
      .identity()
      .pipe(
        take(1),
        switchMap(account => this.profileService.query({ 'userLogin.equals': account?.login })),
        take(1),
      )
      .subscribe({
        next: resp => {
          const me = resp.body?.[0];
          if (!me?.id) {
            this.isLoading = false;
            return;
          }
          this.activityMatchService.forUser(me.id).subscribe({
            next: res => {
              this.upcomingMatches = (res.body ?? [])
                .filter(m => {
                  const d = dayjs(m.matchDate);
                  const sameMonth = d.month() === dayjs(this.selectedMonth).month();
                  const typeMatch = this.selectedType ? m.activityType === this.selectedType : true;
                  return sameMonth && typeMatch;
                })
                .map(
                  m =>
                    ({
                      ...m,
                      matchTime: m.matchTime ? dayjs(m.matchTime).toDate() : null,
                    }) as MatchWithParsedTime,
                );
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

  onFilterChange(): void {
    this.loadUpcomingMatches();
  }

  /** Read out the key details of a displayed match */
  readMatch(match: IActivityMatch): void {
    const partner = match.userDetails;
    const dateStr = match.matchDate ? dayjs(match.matchDate).format('DD MMMM YYYY') : 'unknown date';
    const timeStr = match.matchTime ? dayjs(match.matchTime).format('HH:mm') : 'unknown time';
    const activity = match.activityType?.toLowerCase();
    const loc = match.location ?? 'TBD';
    const text = `Upcoming ${activity} with ${partner?.firstName} ${partner?.lastName}, ` + `on ${dateStr} at ${timeStr}, location ${loc}.`;
    this.speechService.speak(text);
  }

  getActivityImage(type: 'SOCIAL' | 'ACADEMIC' | 'SPORTS' | 'GYM' | 'OTHER' | null | undefined): string {
    switch (type) {
      case ActivityType.ACADEMIC:
        return 'content/images/ACADEMIC.jpg';
      case ActivityType.GYM:
        return 'content/images/GYM.jpg';
      case ActivityType.SOCIAL:
        return 'content/images/SOCIAL.jpg';
      case ActivityType.SPORTS:
        return 'content/images/SPORTS.jpg';
      default:
        return 'assets/placeholder.jpg'; // fallback
    }
  }

  private focusFirstReadButton(): void {
    setTimeout(() => {
      const first = this.readButtons.first;
      first.nativeElement.focus();
    }, 0);
  }
}
