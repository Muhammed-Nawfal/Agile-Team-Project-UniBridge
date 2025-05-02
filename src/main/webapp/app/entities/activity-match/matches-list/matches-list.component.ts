import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSlidersH, faChevronDown, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(faSlidersH, faChevronDown, faCalendarAlt);

@Component({
  standalone: true,
  selector: 'jhi-matches-list',
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.scss'],
  imports: [FormsModule, SharedModule, RouterLink],
})
export class MatchesListComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);
  upcomingMatches: IActivityMatch[] = [];
  activityTypes = Object.values(ActivityType);
  selectedMonth = new Date();
  selectedType = '';
  isLoading = false;

  private router = inject(Router);
  private accountService = inject(AccountService);
  private activityMatchService = inject(ActivityMatchService);
  private profileService = inject(ProfileService);
  private destroy$ = new Subject<void>();

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
              // filter by month and type
              this.upcomingMatches = (res.body ?? []).filter(m => {
                const d = dayjs(m.matchDate);
                const sameMonth = d.month() === dayjs(this.selectedMonth).month();
                const typeMatch = this.selectedType ? m.activityType === this.selectedType : true;
                return sameMonth && typeMatch;
              });
              this.isLoading = false;
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
}
