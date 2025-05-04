import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProfileService } from '../service/profile.service';
import { IProfile } from '../profile.model';
import { Account } from 'app/core/auth/account.model';
import { CommonModule } from '@angular/common';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';
import { MessageThreadService } from 'app/entities/message-thread/service/message-thread.service';

type FollowState = 'none' | 'pending' | 'friends';

@Component({
  standalone: true,
  selector: 'jhi-profile-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-detail.component.html',
})
export class ProfileDetailComponent implements OnInit {
  profile: IProfile | null = null;
  isFollowing = false;
  showFollowTip = false;
  account: Account | null = null;
  fullName = '';
  followState: FollowState = 'none';
  canMessage = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private friendsListService: FriendsListService,
    private router: Router,
    private messageThreadService: MessageThreadService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      const id = +params['id'];
      this.profileService.find(id).subscribe(profileRes => {
        this.profile = profileRes.body ?? null;
        if (!this.profile) return;

        this.profileService.findMyProfile().subscribe(myProfileRes => {
          const myProfile = myProfileRes.body;
          if (!myProfile) return;

          const myId = myProfile.id;
          const otherId = this.profile!.id;
          // check the profile doesnt belong to this user
          if (myId === otherId) {
            this.router.navigate(['/profile']);
          }

          // 1. Check if they are already friends
          this.friendsListService.getCurrentUserAcceptedFriends().subscribe(friendsRes => {
            const accepted = friendsRes.body ?? [];
            const isFriend = accepted.some(
              f =>
                (f.requestedByProfile?.id === myId && f.requestedToProfile?.id === otherId) ||
                (f.requestedByProfile?.id === otherId && f.requestedToProfile?.id === myId),
            );

            if (isFriend) {
              this.followState = 'friends';
              this.canMessage = true;
              return;
            }

            // 2. Not friends — check if current user has already sent a request
            this.friendsListService.getCurrentUserSentFriendRequests().subscribe(sentRes => {
              const sent = sentRes.body ?? [];
              const pending = sent.find(req => req.requestedToProfile?.id === otherId && req.requestStatus === 'PENDING');

              if (pending) {
                this.followState = 'pending';
                this.canMessage = false;
                return;
              }

              // 3. Not sent — check if the other user sent a pending request to us
              this.friendsListService.getCurrentUserPendingFriendRequests().subscribe(pendingRes => {
                const incoming = pendingRes.body ?? [];
                const reversePending = incoming.find(req => req.requestedByProfile?.id === otherId && req.requestStatus === 'PENDING');

                if (reversePending) {
                  this.followState = 'pending';
                  this.canMessage = false;
                } else {
                  this.followState = 'none';
                  this.canMessage = false;
                }
              });
            });
          });
        });
      });
    });
  }

  dismissTip(): void {
    this.showFollowTip = false;
    sessionStorage.setItem('followTipDismissed', 'true');
  }

  toggleFollow(): void {
    this.profileService.findMyProfile().subscribe(myProfileRes => {
      const myProfileId = myProfileRes.body?.id;
      const targetProfileId = this.profile?.id;

      if (!myProfileId || !targetProfileId) return;

      if (this.followState === 'none') {
        this.friendsListService.sendFriendRequest(targetProfileId).subscribe(() => {
          this.followState = 'pending';
        });
      } else if (this.followState === 'friends') {
        // Optional: remove friendship (not implemented here)
      }
    });
  }

  onMessage(): void {
    const profileId = Number(this.activatedRoute.snapshot.params['id']);

    this.friendsListService.checkFriendshipStatus(profileId).subscribe({
      next: res => {
        const status = res.status;
        const friendsListId = res.friendsListId;

        if (status !== 'ACCEPTED' || !friendsListId) {
          alert('You must be friends to send a message.');
          return;
        }

        this.messageThreadService.getOrCreateThreadForFriends(friendsListId).subscribe({
          next: threadRes => {
            const thread = threadRes.body!;
            this.router.navigate(['/chat', 'thread', thread.id]);
          },
          error(err) {
            console.error('Could not open thread', err);
          },
        });
      },
      error(err) {
        console.error('Failed to check friendship status', err);
      },
    });
  }
}
