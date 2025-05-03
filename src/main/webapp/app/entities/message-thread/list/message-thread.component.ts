import { Component, NgZone, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap, take, switchMap } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IMessageThread } from '../message-thread.model';
import { EntityArrayResponseType, MessageThreadService } from '../service/message-thread.service';
import { MessageThreadDeleteDialogComponent } from '../delete/message-thread-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { ProfileService, EntityArrayResponseType as ProfileResponseType } from 'app/entities/profile/service/profile.service';

@Component({
  standalone: true,
  selector: 'jhi-message-thread',
  templateUrl: './message-thread.component.html',
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
export class MessageThreadComponent implements OnInit {
  subscription: Subscription | null = null;
  messageThreads?: IMessageThread[];
  isLoading = false;
  currentUserProfileId?: number;

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
  protected readonly messageThreadService = inject(MessageThreadService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);
  protected ngZone = inject(NgZone);
  protected accountService = inject(AccountService);
  protected profileService = inject(ProfileService);

  trackId = (_index: number, item: IMessageThread): number => this.messageThreadService.getMessageThreadIdentifier(item);

  ngOnInit(): void {
    // 1) First resolve my profile ID
    this.accountService
      .identity()
      .pipe(
        take(1),
        switchMap(account => this.profileService.query({ 'userLogin.equals': account?.login }).pipe(take(1))),
      )
      .subscribe(resp => {
        const me = resp.body?.[0];
        if (me?.id) {
          this.currentUserProfileId = me.id;

          // 2) Now that we have my profile ID, continue with initialization
          this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
            .pipe(
              tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
              tap(() => {
                if (!this.messageThreads || this.messageThreads.length === 0) {
                  this.load();
                }
              }),
            )
            .subscribe();
        } else {
          console.error('Could not find my profile');
        }
      });
  }

  delete(messageThread: IMessageThread): void {
    const modalRef = this.modalService.open(MessageThreadDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.messageThread = messageThread;
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

  openChat(messageThread: IMessageThread): void {
    this.router.navigate(['/chat'], {
      queryParams: { threadId: messageThread.id },
    });
  }

  getOtherParticipant(thread: IMessageThread): string {
    if (thread.isGroup) {
      return thread.name ?? 'Group Chat';
    }

    // For friend chats, find the other participant using profile ID
    if (thread.friendChat) {
      if (thread.friendChat.requestedByProfile?.id === this.currentUserProfileId) {
        return `${thread.friendChat.requestedToProfile?.firstName} ${thread.friendChat.requestedToProfile?.lastName}`;
      } else {
        return `${thread.friendChat.requestedByProfile?.firstName} ${thread.friendChat.requestedByProfile?.lastName}`;
      }
    }

    return 'Unknown User';
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.messageThreads = this.refineData(dataFromBody);
  }

  protected refineData(data: IMessageThread[]): IMessageThread[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IMessageThread[] | null): IMessageThread[] {
    return data ?? [];
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject: any = {
      eagerload: true,
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.messageThreadService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
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
