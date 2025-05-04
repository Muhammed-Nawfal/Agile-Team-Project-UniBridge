import { Component, OnInit, inject, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FriendsListService } from '../service/friends-list.service';
import { IFriendsList } from '../friends-list.model';
import { IProfile } from 'app/entities/profile/profile.model';
import { Decision } from 'app/entities/enumerations/decision.model';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import SharedModule from 'app/shared/shared.module';
import { finalize } from 'rxjs';
import { ProfileService } from 'app/entities/profile/service/profile.service';

@Component({
  standalone: true,
  selector: 'jhi-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
  imports: [CommonModule, RouterModule, FontAwesomeModule, NgbTooltipModule, FormatMediumDatetimePipe, SharedModule],
})
export class FriendRequestsComponent implements OnInit {
  pendingRequests: IFriendsList[] = [];
  sentRequests: IFriendsList[] = [];
  isLoading = false;
  activeTab = 'pending';
  pendingRequestCount = 0;
  isFontSizeLarge = false;

  // Full profiles from the profile service
  profiles: IProfile[] = [];
  profilesMap = new Map<number, IProfile>();

  protected readonly friendsListService = inject(FriendsListService);
  protected readonly profileService = inject(ProfileService);
  protected readonly renderer = inject(Renderer2);
  protected readonly elementRef = inject(ElementRef);

  ngOnInit(): void {
    this.loadAllProfiles();
    this.loadPendingRequests();

    // Check for saved font size preference
    const savedFontPreference = localStorage.getItem('friendRequestsFontPreference');
    if (savedFontPreference === 'true') {
      this.isFontSizeLarge = true;
      this.renderer.addClass(this.elementRef.nativeElement, 'large-font-mode');
    }
  }

  loadAllProfiles(): void {
    this.profileService.query().subscribe({
      next: res => {
        this.profiles = res.body ?? [];
        // Create a map for faster lookups
        this.profiles.forEach(profile => {
          if (profile.id) {
            this.profilesMap.set(profile.id, profile);
          }
        });
      },
    });
  }

  toggleFontSize(): void {
    this.isFontSizeLarge = !this.isFontSizeLarge;

    if (this.isFontSizeLarge) {
      this.renderer.addClass(this.elementRef.nativeElement, 'large-font-mode');
      localStorage.setItem('friendRequestsFontPreference', 'true');
    } else {
      this.renderer.removeClass(this.elementRef.nativeElement, 'large-font-mode');
      localStorage.setItem('friendRequestsFontPreference', 'false');
    }
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
          this.pendingRequestCount = this.pendingRequests.length;
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

  getProfileId(request: IFriendsList, type: 'pending' | 'sent'): number {
    if (type === 'pending') {
      return request.requestedByProfile?.id ?? 0;
    } else {
      return request.requestedToProfile?.id ?? 0;
    }
  }

  getProfileName(request: IFriendsList, type: 'pending' | 'sent'): string {
    let profile: IProfile | null | undefined;

    if (type === 'pending') {
      // Try to get from the map first
      const profileId = request.requestedByProfile?.id;
      if (profileId && this.profilesMap.has(profileId)) {
        profile = this.profilesMap.get(profileId);
      } else {
        // Fall back to the embedded profile if not in the map
        profile = request.requestedByProfile;
      }
    } else {
      const profileId = request.requestedToProfile?.id;
      if (profileId && this.profilesMap.has(profileId)) {
        profile = this.profilesMap.get(profileId);
      } else {
        profile = request.requestedToProfile;
      }
    }

    if (!profile) {
      return 'Anonymous User';
    }

    const firstName = profile.firstName ?? '';
    const lastName = profile.lastName ?? '';

    if (!firstName && !lastName) {
      return 'Anonymous User';
    }

    return `${firstName} ${lastName}`;
  }

  getProfileLogin(request: IFriendsList, type: 'pending' | 'sent'): string {
    let profile: IProfile | null | undefined;

    if (type === 'pending') {
      const profileId = request.requestedByProfile?.id;
      if (profileId && this.profilesMap.has(profileId)) {
        profile = this.profilesMap.get(profileId);
      } else {
        profile = request.requestedByProfile;
      }
    } else {
      const profileId = request.requestedToProfile?.id;
      if (profileId && this.profilesMap.has(profileId)) {
        profile = this.profilesMap.get(profileId);
      } else {
        profile = request.requestedToProfile;
      }
    }

    return profile?.login ?? '';
  }

  getProfilePicture(request: IFriendsList, type: 'pending' | 'sent'): boolean {
    let profile: IProfile | null | undefined;

    if (type === 'pending') {
      const profileId = request.requestedByProfile?.id;
      if (profileId && this.profilesMap.has(profileId)) {
        profile = this.profilesMap.get(profileId);
      } else {
        profile = request.requestedByProfile;
      }
    } else {
      const profileId = request.requestedToProfile?.id;
      if (profileId && this.profilesMap.has(profileId)) {
        profile = this.profilesMap.get(profileId);
      } else {
        profile = request.requestedToProfile;
      }
    }

    return !!profile?.profilePicture;
  }

  getProfileImageSrc(request: IFriendsList, type: 'pending' | 'sent'): string {
    let profile: IProfile | null | undefined;

    if (type === 'pending') {
      const profileId = request.requestedByProfile?.id;
      if (profileId && this.profilesMap.has(profileId)) {
        profile = this.profilesMap.get(profileId);
      } else {
        profile = request.requestedByProfile;
      }
    } else {
      const profileId = request.requestedToProfile?.id;
      if (profileId && this.profilesMap.has(profileId)) {
        profile = this.profilesMap.get(profileId);
      } else {
        profile = request.requestedToProfile;
      }
    }

    if (profile?.profilePicture && profile.profilePictureContentType) {
      return `data:${profile.profilePictureContentType};base64,${profile.profilePicture}`;
    }

    return '';
  }

  formatEnumSafe(value: string | undefined): string {
    if (!value) return '';

    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
