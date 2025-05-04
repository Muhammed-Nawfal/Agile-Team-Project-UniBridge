import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProfileService } from '../service/profile.service';
import { IProfile } from '../profile.model';
import { Account } from 'app/core/auth/account.model';
import { CommonModule } from '@angular/common';
import { FriendsListService } from 'app/entities/friends-list/service/friends-list.service';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private profileService: ProfileService,
    private friendsListService: FriendsListService,
    private router: Router,
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
              return;
            }

            // 2. Not friends — check if current user has already sent a request
            this.friendsListService.getCurrentUserSentFriendRequests().subscribe(sentRes => {
              const sent = sentRes.body ?? [];
              const pending = sent.find(req => req.requestedToProfile?.id === otherId && req.requestStatus === 'PENDING');

              if (pending) {
                this.followState = 'pending';
                return;
              }

              // 3. Not sent — check if the other user sent a pending request to us
              this.friendsListService.getCurrentUserPendingFriendRequests().subscribe(pendingRes => {
                const incoming = pendingRes.body ?? [];
                const reversePending = incoming.find(req => req.requestedByProfile?.id === otherId && req.requestStatus === 'PENDING');

                if (reversePending) {
                  this.followState = 'pending';
                } else {
                  this.followState = 'none';
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
    if (!this.isFollowing) {
      alert('⚠️ You must follow this user to message them.');
    } else {
      alert('📬 Opening message interface...');
    }
  }
}
