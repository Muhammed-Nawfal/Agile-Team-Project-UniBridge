import { Component, NgZone, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IFriendsList } from '../friends-list.model';
import { EntityArrayResponseType, FriendsListService } from '../service/friends-list.service';
import { FriendsListDeleteDialogComponent } from '../delete/friends-list-delete-dialog.component';
import { FollowButtonComponent } from '../follow-button/follow-button.component';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'jhi-friends-list',
  templateUrl: './friends-list.component.html',
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    DurationPipe,
    FormatMediumDatetimePipe,
    FormatMediumDatePipe,
    FollowButtonComponent,
    FontAwesomeModule,
    CommonModule,
  ],
})
export class FriendsListComponent implements OnInit {
  subscription: Subscription | null = null;
  friendsLists?: IFriendsList[];
  profiles?: IProfile[];
  isLoading = false;
  isLoadingProfiles = false;
  pendingRequestCount = 0; // Add this property

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
  protected readonly friendsListService = inject(FriendsListService);
  protected readonly profileService = inject(ProfileService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);

  trackId = (index: number, item: IFriendsList): number => this.friendsListService.getFriendsListIdentifier(item);
  trackProfileId = (index: number, item: IProfile): number => item.id;

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          if (!this.friendsLists || this.friendsLists.length === 0) {
            this.load();
          }
        }),
      )
      .subscribe();

    // Load profiles for testing the follow button
    this.loadProfiles();
    // Add this line to get the pending request count
    this.getPendingRequestCount();
  }

  getPendingRequestCount(): void {
    this.friendsListService.getCurrentUserPendingFriendRequests().subscribe({
      next: res => {
        this.pendingRequestCount = (res.body ?? []).length;
      },
      error: () => {
        // Handle any errors if needed
        this.pendingRequestCount = 0;
      },
    });
  }

  delete(friendsList: IFriendsList): void {
    const modalRef = this.modalService.open(FriendsListDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.friendsList = friendsList;
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
        this.getPendingRequestCount(); // Add this line
      },
    });
  }

  loadProfiles(): void {
    this.isLoadingProfiles = true;
    this.profileService.query().subscribe({
      next: res => {
        this.isLoadingProfiles = false;
        this.profiles = res.body ?? [];
      },
      error: () => {
        this.isLoadingProfiles = false;
      },
    });
  }

  onFriendshipChanged(event: string, profileId: number): void {
    // Log is removed to avoid eslint error
    // Instead of using console.log, we'll just perform the action
    this.load();
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.friendsLists = this.refineData(dataFromBody);
  }

  protected refineData(data: IFriendsList[]): IFriendsList[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IFriendsList[] | null): IFriendsList[] {
    return data ?? [];
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.friendsListService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
