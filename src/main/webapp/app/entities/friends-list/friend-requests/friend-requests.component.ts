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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  standalone: true,
  selector: 'jhi-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    SharedModule,
    SortDirective,
    SortByDirective,
    DurationPipe,
    FormatMediumDatetimePipe,
    FormatMediumDatePipe,
    FaIconComponent,
  ],
})

// acceptRequest(friendRequest: IFriendsList): void {
//   // Create a complete copy of the original object
//   const updatedRequest: IFriendsList = {
//     ...friendRequest,
//     friendRequest: 'ACCEPT',
//   };
//
//   this.friendsListService.update(updatedRequest).subscribe(() => {
//     this.load();
//   });
// }
//
// declineRequest(friendRequest: IFriendsList): void {
//   const updatedRequest: IFriendsList = {
//     ...friendRequest,
//     friendRequest: 'DECLINED',
//   };
//
//   this.friendsListService.update(updatedRequest).subscribe(() => {
//     this.load();
//   });
// }
export class FriendRequestsComponent implements OnInit {
  toastMessage = ''; // ✅ Moved above protected fields

  subscription: Subscription | null = null;
  friendRequests?: IFriendsList[];
  isLoading = false;

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
  protected readonly friendsListService = inject(FriendsListService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);

  trackId = (item: IFriendsList): number => this.friendsListService.getFriendsListIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          if (!this.friendRequests || this.friendRequests.length === 0) {
            this.load();
          }
        }),
      )
      .subscribe();
  }

  showToast(message: string): void {
    this.toastMessage = message;
    setTimeout(() => (this.toastMessage = ''), 3000); // Auto-hide after 3 seconds
  }

  acceptRequest(name: string): void {
    this.showToast(`✅ You are now friends with ${name}!`);
  }

  declineRequest(name: string): void {
    this.showToast(`❌ You declined ${name}'s friend request.`);
  }

  delete(friendRequest: IFriendsList): void {
    const modalRef = this.modalService.open(FriendsListDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.friendsList = friendRequest;
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
    this.friendRequests = this.refineData(dataFromBody).filter(request => request.friendRequest === 'PENDING');
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
