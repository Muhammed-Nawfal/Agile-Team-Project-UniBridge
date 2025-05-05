import { Component, NgZone, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IReview } from '../review.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { EntityArrayResponseType, ReviewService } from '../service/review.service';
import { ReviewDeleteDialogComponent } from '../delete/review-delete-dialog.component';
import { AccountService } from '../../../core/auth/account.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: true,
  selector: 'jhi-review',
  templateUrl: './review.component.html',
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
export class ReviewComponent implements OnInit {
  subscription: Subscription | null = null;
  reviews?: IReview[];
  profiles: IProfile[] = [];
  isLoading = false;
  profileToReviewsMap = new Map<number, IReview>();
  currentUsername: string | null | undefined = '';
  currentProfileId?: number;
  public selectedReviews: IReview[] | undefined;

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
  protected readonly reviewService = inject(ReviewService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected readonly profileService = inject(ProfileService);
  protected readonly accountService = inject(AccountService);
  protected readonly cdr = inject(ChangeDetectorRef);

  getCurrentUserInfo(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.currentUsername = account.login;
        this.findCurrentProfileId();
      }
    });
  }

  findCurrentProfileId(): void {
    this.profileService.query().subscribe({
      next: res => {
        const profiles = res.body ?? [];
        const currentProfile = profiles.find(profile => profile.login === this.currentUsername);
        if (currentProfile) {
          this.currentProfileId = currentProfile.id;
        }
      },
    });
  }

  getDataForReview(reviewId: number): IReview | undefined {
    return this.profileToReviewsMap.get(reviewId);
  }

  loadAllProfiles(): void {
    this.profileService.query().subscribe({
      next: res => {
        this.profiles = res.body ?? [];
      },
    });
  }

  getReviewsForID(profileID: number | undefined): IReview[] | undefined {
    this.reviewService.getUserReviews(profileID).subscribe({
      next: res => {
        this.reviews = res.body ?? [];
      },
    });
    return this.reviews;
  }

  extractIDsFromReviews(): void {
    // Load all review IDs we need to fetch
    const reviewIds: number[] = [];
    this.profileToReviewsMap.clear();
    if (this.reviews) {
      this.reviews.forEach(review => {
        reviewIds.push(review.id);
        if (review.aboutUser) {
          this.profileToReviewsMap.set(review.aboutUser.id, review);
        } else {
          this.profileToReviewsMap.set(-1, review);
        }
      });
    }
  }

  changeUserView(selectedProfile: IProfile): void {
    this.currentUsername = selectedProfile.login;
    this.cdr.detectChanges();
    this.selectedReviews = this.getReviewsForID(this.currentProfileId);
    this.load();
  }

  trackProfileId = (item: IProfile): number => this.profileService.getProfileIdentifier(item);

  trackReviewId = (index: number, item: IReview): number => item.id;

  trackProfiles = (index: number, item: IProfile): number => item.id;

  trackId = (item: IReview): number => this.reviewService.getReviewIdentifier(item);

  ngOnInit(): void {
    this.getCurrentUserInfo();
    this.loadAllProfiles();
    this.selectedReviews = this.getReviewsForID(this.currentProfileId);
    this.load();
  }

  delete(review: IReview): void {
    const modalRef = this.modalService.open(ReviewDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.review = review;
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

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.reviews = this.refineData(dataFromBody);
  }

  protected refineData(data: IReview[]): IReview[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IReview[] | null): IReview[] {
    return data ?? [];
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.reviewService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
