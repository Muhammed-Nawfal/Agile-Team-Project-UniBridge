import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendsListService } from '../service/friends-list.service';
import { Decision } from 'app/entities/enumerations/decision.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUserPlus, faUserCheck, faUserClock, faUserMinus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'jhi-follow-button',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, NgbTooltipModule],
  templateUrl: './follow-button.component.html',
  styles: [],
})
export class FollowButtonComponent implements OnInit {
  @Input() targetProfileId!: number;
  @Output() friendshipChanged = new EventEmitter<string>();

  // Icons
  faUserPlus = faUserPlus;
  faUserCheck = faUserCheck;
  faUserClock = faUserClock;
  faUserMinus = faUserMinus;

  friendsListId?: number;
  friendshipStatus = 'NOT_FRIENDS';
  isLoading = false;
  errorMessage = '';

  protected readonly friendsListService = inject(FriendsListService);

  ngOnInit(): void {
    this.checkFriendshipStatus();
  }

  get buttonText(): string {
    switch (this.friendshipStatus) {
      case 'ACCEPTED':
        return 'Following';
      case 'PENDING_SENT':
        return 'Requested';
      case 'PENDING_RECEIVED':
        return 'Accept';
      case 'DECLINED':
        return 'Follow';
      case 'SELF':
        return 'Your Profile';
      default:
        return 'Follow';
    }
  }

  get buttonIcon(): IconDefinition {
    switch (this.friendshipStatus) {
      case 'ACCEPTED':
        return this.faUserCheck;
      case 'PENDING_SENT':
        return this.faUserClock;
      case 'PENDING_RECEIVED':
        return this.faUserPlus;
      case 'DECLINED':
        return this.faUserPlus;
      default:
        return this.faUserPlus;
    }
  }

  get buttonClass(): string {
    switch (this.friendshipStatus) {
      case 'ACCEPTED':
        return 'btn-success';
      case 'PENDING_SENT':
        return 'btn-info';
      case 'PENDING_RECEIVED':
        return 'btn-primary';
      case 'DECLINED':
        return 'btn-outline-primary';
      case 'SELF':
        return 'btn-secondary';
      default:
        return 'btn-outline-primary';
    }
  }

  get tooltipText(): string {
    switch (this.friendshipStatus) {
      case 'ACCEPTED':
        return 'Unfollow';
      case 'PENDING_SENT':
        return 'Cancel request';
      case 'PENDING_RECEIVED':
        return 'Accept friend request';
      case 'DECLINED':
        return 'Follow this profile';
      case 'SELF':
        return 'This is your profile';
      default:
        return 'Follow this profile';
    }
  }

  onButtonClick(): void {
    // Skip if self or loading
    if (this.friendshipStatus === 'SELF' || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    switch (this.friendshipStatus) {
      case 'NOT_FRIENDS':
        this.sendFriendRequest();
        break;
      case 'DECLINED':
        this.sendFriendRequest(); // Treat DECLINED like NOT_FRIENDS
        break;
      case 'PENDING_RECEIVED':
        this.acceptFriendRequest();
        break;
      case 'PENDING_SENT':
        this.cancelFriendRequest();
        break;
      case 'ACCEPTED':
        this.unfollowFriend();
        break;
    }
  }

  checkFriendshipStatus(): void {
    this.isLoading = true;
    this.friendsListService
      .checkFriendshipStatus(this.targetProfileId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: response => {
          this.friendshipStatus = response.status;
          this.friendsListId = response.friendsListId;

          // If this is the current user's own profile, mark it as 'SELF'
          if (response.status === 'SELF') {
            this.friendshipStatus = 'SELF';
          }
        },
        error: err => {
          console.error('Error checking friendship status:', err);
          this.friendshipStatus = 'NOT_FRIENDS';
        },
      });
  }

  private sendFriendRequest(): void {
    this.friendsListService
      .sendFriendRequest(this.targetProfileId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: response => {
          if (response.body) {
            this.friendsListId = response.body.id;

            // If it's an existing relationship, update the status accordingly
            if (response.body.requestStatus === 'PENDING') {
              this.friendshipStatus = 'PENDING_SENT';
            } else if (response.body.requestStatus === 'ACCEPT') {
              this.friendshipStatus = 'ACCEPTED';
            } else if (response.body.requestStatus === 'DECLINED') {
              this.friendshipStatus = 'DECLINED';
            }

            this.friendshipChanged.emit('FRIEND_REQUEST_SENT');
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error sending friend request:', error);
          if (error.error?.title === 'Cannot send friend request to yourself') {
            this.friendshipStatus = 'SELF';
            this.errorMessage = '';
          } else {
            this.errorMessage = 'Failed to send friend request.';
          }
        },
      });
  }

  private acceptFriendRequest(): void {
    if (!this.friendsListId) {
      this.isLoading = false;
      return;
    }

    this.friendsListService
      .respondToFriendRequest(this.friendsListId, Decision.ACCEPT)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.friendshipStatus = 'ACCEPTED';
          this.friendshipChanged.emit('FRIEND_REQUEST_ACCEPTED');
        },
        error: err => {
          console.error('Error accepting friend request:', err);
          this.errorMessage = 'Failed to accept friend request.';
        },
      });
  }

  private cancelFriendRequest(): void {
    if (!this.friendsListId) {
      this.isLoading = false;
      return;
    }

    this.friendsListService
      .respondToFriendRequest(this.friendsListId, Decision.DECLINED)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          // After canceling, reset the UI state
          this.friendshipStatus = 'NOT_FRIENDS';
          this.friendsListId = undefined; // Clear ID to force new request on follow
          this.friendshipChanged.emit('FRIEND_REQUEST_CANCELLED');
        },
        error: err => {
          console.error('Error canceling friend request:', err);
          this.errorMessage = 'Failed to cancel friend request.';
        },
      });
  }

  private unfollowFriend(): void {
    if (!this.friendsListId) {
      this.isLoading = false;
      return;
    }

    this.friendsListService
      .respondToFriendRequest(this.friendsListId, Decision.DECLINED)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          // Reset the button state to "Follow"
          this.friendshipStatus = 'NOT_FRIENDS';
          // Clear the ID to force a new request
          this.friendsListId = undefined;
          // Emit event to update parent component
          this.friendshipChanged.emit('FRIENDSHIP_REMOVED');

          // Force recheck after brief delay
          setTimeout(() => {
            this.checkFriendshipStatus();
          }, 500);
        },
        error: err => {
          console.error('Error unfollowing:', err);
          this.errorMessage = 'Failed to unfollow this profile.';
        },
      });
  }
}
