// friend-requests/friend-requests.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FriendsListService } from '../service/friends-list.service';
import { IFriendsList } from '../friends-list.model';
import { Decision } from 'app/entities/enumerations/decision.model';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import SharedModule from 'app/shared/shared.module';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'jhi-friend-requests',
  templateUrl: './friend-requests.component.html',
  imports: [CommonModule, RouterModule, FontAwesomeModule, NgbTooltipModule, FormatMediumDatetimePipe, SharedModule],
})
export class FriendRequestsComponent implements OnInit {
  pendingRequests: IFriendsList[] = [];
  sentRequests: IFriendsList[] = [];
  isLoading = false;
  activeTab = 'pending';
  pendingRequestCount = 0;

  protected readonly friendsListService = inject(FriendsListService);

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.isLoading = true;
    this.friendsListService
      .getCurrentUserPendingFriendRequests()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: res => {
          this.pendingRequests = res.body ?? [];
          this.pendingRequestCount = this.pendingRequests.length; // Update the count
        },
        error() {
          // Handle error here
        },
      });
  }

  loadSentRequests(): void {
    this.isLoading = true;
    this.friendsListService
      .getCurrentUserSentFriendRequests()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: res => {
          this.sentRequests = res.body ?? [];
        },
        error() {
          // Handle error here
        },
      });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'pending') {
      this.loadPendingRequests();
    } else if (tab === 'sent') {
      this.loadSentRequests();
    }
  }

  acceptRequest(friendsListId: number): void {
    this.isLoading = true;
    this.friendsListService
      .respondToFriendRequest(friendsListId, Decision.ACCEPT)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.loadPendingRequests();
        },
      });
  }

  declineRequest(friendsListId: number): void {
    this.isLoading = true;
    this.friendsListService
      .respondToFriendRequest(friendsListId, Decision.DECLINED)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.loadPendingRequests();
        },
      });
  }

  cancelRequest(friendsListId: number): void {
    this.isLoading = true;
    this.friendsListService
      .delete(friendsListId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.loadSentRequests();
        },
      });
  }
}
