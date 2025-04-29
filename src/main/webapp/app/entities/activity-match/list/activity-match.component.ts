import { Component, NgZone, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, Subject, combineLatest, filter, tap, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchService, EntityArrayResponseType } from '../service/activity-match.service';
import { ActivityMatchDeleteDialogComponent } from '../delete/activity-match-delete-dialog.component';
import { MatchingComponent } from '../matching/matching.component';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { IProfile } from '../../profile/profile.model';
import { ActivityType } from '../../enumerations/activity-type.model';

@Component({
  standalone: true,
  selector: 'jhi-activity-match',
  templateUrl: './activity-match.component.html',
  styleUrl: 'activity-match.component.scss',
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    DurationPipe,
    FormatMediumDatetimePipe,
    FormatMediumDatePipe,
    MatchingComponent,
  ],
})
export class ActivityMatchComponent implements OnInit, OnDestroy {
  // Public properties first
  account = signal<Account | null>(null);
  activityMatches?: IActivityMatch[];
  isLoading = false;
  sortState = sortStateSignal({});

  profiles: IProfile[] = [];

  // Public injected services
  public readonly router = inject(Router);

  // Subscriptions
  subscription: Subscription | null = null;

  // Protected services
  protected readonly activityMatchService = inject(ActivityMatchService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected readonly accountService = inject(AccountService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);

  protected readonly ActivityType = ActivityType;

  // Private properties
  private readonly destroy$ = new Subject<void>();

  // Class methods
  trackId = (item: IActivityMatch): number => this.activityMatchService.getActivityMatchIdentifier(item);

  ngOnInit(): void {
    // Subscribe to account identity
    this.accountService
      .identity()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        this.account.set(account);
      });

    // Listen for authentication state changes
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        if (account) {
          this.account.set(account);
          this.handleLoginRedirect();
        }
      });

    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          if (!this.activityMatches || this.activityMatches.length === 0) {
            this.load();
          }
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  delete(activityMatch: IActivityMatch): void {
    const modalRef = this.modalService.open(ActivityMatchDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.activityMatch = activityMatch;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  // onButtonClick(): void {
  //   if (!this.account()) {
  //     // If the user is not authenticated, redirect them to the login page
  //     localStorage.setItem('redirectUrl', this.router.url);
  //     this.router.navigate(['/login']);
  //   }
  // }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
  }

  navigateToBuddy(type: ActivityType): void {
    this.router.navigate(['/activity-match/buddy', type]);
  }

  navigateToBooking(): void {
    if (this.account()) {
      this.router.navigate(['/booking']);
    } else {
      // Store the current URL and redirect to the login page
      localStorage.setItem('redirectUrl', this.router.url);
      this.router.navigate(['/login']);
    }
  }

  navigateToUpcomingMatches(): void {
    this.router.navigate(['/activity-match/upcoming-matches']);
  }

  handleLoginRedirect(): void {
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      this.router.navigateByUrl(redirectUrl); // Navigate to the saved URL
      localStorage.removeItem('redirectUrl'); // Remove the redirect URL after using it
    }
  }

  navigateToActivity(): void {
    this.router.navigate(['/activity']);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.activityMatches = this.refineData(dataFromBody);
  }

  protected refineData(data: IActivityMatch[]): IActivityMatch[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IActivityMatch[] | null): IActivityMatch[] {
    return data ?? [];
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.activityMatchService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(sortState: SortState): void {
    const queryParamsObj = {
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }
}
