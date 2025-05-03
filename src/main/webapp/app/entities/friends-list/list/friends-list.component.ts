import { Component, OnInit, ViewChild, TemplateRef, inject, ElementRef, Renderer2 } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { FollowButtonComponent } from '../follow-button/follow-button.component';
import { FriendsListService } from '../service/friends-list.service';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { IFriendsList } from '../friends-list.model';
import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: true,
  selector: 'jhi-friends-list',
  templateUrl: './friends-list.component.html',
  styleUrls: ['./friends-list.component.scss'],
  imports: [RouterModule, CommonModule, FormsModule, FontAwesomeModule, SharedModule, FollowButtonComponent],
})
export class FriendsListComponent implements OnInit {
  // Friends you follow
  profiles: IProfile[] = [];
  friendsLists: IFriendsList[] = [];

  // People you may know
  suggestedProfiles: IProfile[] = [];
  filteredSuggestedProfiles: IProfile[] = [];

  // Search
  searchTerm = '';

  // Nickname editing
  currentEditingFriendship?: IFriendsList;
  editingNickname = '';

  @ViewChild('nicknameModal') nicknameModal!: TemplateRef<any>;

  isLoadingProfiles = false;
  isLoadingSuggestions = false;
  pendingRequestCount = 0;
  profileToFriendshipMap = new Map<number, IFriendsList>();
  followedProfileIds = new Set<number>();
  currentUsername = '';
  currentProfileId?: number;
  isFontSizeLarge = false;
  protected readonly renderer = inject(Renderer2);
  protected readonly elementRef = inject(ElementRef);

  protected readonly friendsListService = inject(FriendsListService);
  protected readonly profileService = inject(ProfileService);
  protected readonly accountService = inject(AccountService);
  protected readonly modalService = inject(NgbModal);
  protected readonly router = inject(Router);

  ngOnInit(): void {
    this.getCurrentUserInfo();
    this.loadAcceptedFriends();
    this.getPendingRequestCount();

    // Check for saved font size preference specifically for this component
    const savedFontPreference = localStorage.getItem('friendsListFontPreference');
    if (savedFontPreference === 'true') {
      this.isFontSizeLarge = true;
      this.renderer.addClass(this.elementRef.nativeElement, 'large-font-mode');
    }
  }

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

  toggleFontSize(): void {
    this.isFontSizeLarge = !this.isFontSizeLarge;

    if (this.isFontSizeLarge) {
      this.renderer.addClass(this.elementRef.nativeElement, 'large-font-mode');
      localStorage.setItem('friendsListFontPreference', 'true');
    } else {
      this.renderer.removeClass(this.elementRef.nativeElement, 'large-font-mode');
      localStorage.setItem('friendsListFontPreference', 'false');
    }
  }

  trackProfileId = (index: number, item: IProfile): number => item.id;

  loadAcceptedFriends(): void {
    this.isLoadingProfiles = true;

    this.friendsListService.getCurrentUserAcceptedFriends().subscribe({
      next: res => {
        this.isLoadingProfiles = false;
        this.friendsLists = res.body ?? [];

        if (this.friendsLists.length > 0) {
          this.extractProfilesFromFriendships();
        } else {
          // If no friendships, load suggestions directly
          this.loadSuggestedProfiles();
        }
      },
      error: () => {
        this.isLoadingProfiles = false;
        this.loadSuggestedProfiles();
      },
    });
  }

  extractProfilesFromFriendships(): void {
    // Load all profile IDs we need to fetch
    const profileIds: number[] = [];
    this.profileToFriendshipMap.clear();
    this.followedProfileIds.clear();

    this.friendsLists.forEach(friendship => {
      if (friendship.requestedByProfile && friendship.requestedToProfile) {
        // Add both profiles
        profileIds.push(friendship.requestedByProfile.id);
        profileIds.push(friendship.requestedToProfile.id);

        // Map both profiles to this friendship for easy lookup
        this.profileToFriendshipMap.set(friendship.requestedByProfile.id, friendship);
        this.profileToFriendshipMap.set(friendship.requestedToProfile.id, friendship);

        // Keep track of followed profiles
        this.followedProfileIds.add(friendship.requestedByProfile.id);
        this.followedProfileIds.add(friendship.requestedToProfile.id);
      }
    });

    // Remove duplicates
    const uniqueProfileIds = [...new Set(profileIds)];

    // Fetch all these profiles
    if (uniqueProfileIds.length > 0) {
      this.loadProfiles(uniqueProfileIds);
    }

    // After loading followed profiles, load suggested ones
    this.loadSuggestedProfiles();
  }

  loadProfiles(profileIds: number[]): void {
    // Using query to fetch specific profiles
    this.profileService.query().subscribe({
      next: res => {
        const allProfiles = res.body ?? [];

        // Filter to only include the profiles in our list AND exclude the current user's profile
        this.profiles = allProfiles.filter(profile => profileIds.includes(profile.id) && profile.id !== this.currentProfileId);
      },
      error() {
        // Handle error
      },
    });
  }

  loadSuggestedProfiles(): void {
    this.isLoadingSuggestions = true;

    // Get all profiles
    this.profileService.query().subscribe({
      next: res => {
        const allProfiles = res.body ?? [];
        this.isLoadingSuggestions = false;

        // Filter out profiles the user is already following AND the current user's own profile
        this.suggestedProfiles = allProfiles.filter(
          profile => !this.followedProfileIds.has(profile.id) && profile.id !== this.currentProfileId,
        );

        // Initialize filtered suggestions with all suggestions
        this.filteredSuggestedProfiles = [...this.suggestedProfiles];
      },
      error: () => {
        this.isLoadingSuggestions = false;
      },
    });
  }

  searchProfiles(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // If search is empty, show all suggested profiles
      this.filteredSuggestedProfiles = [...this.suggestedProfiles];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();

    // Filter profiles based on search term
    this.filteredSuggestedProfiles = this.suggestedProfiles.filter(profile => {
      const firstName = (profile.firstName ?? '').toLowerCase();
      const lastName = (profile.lastName ?? '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const id = profile.id.toString() || '';
      const login = (profile.login ?? '').toLowerCase();

      // Search in first name, last name, full name, login, or ID
      return (
        firstName.includes(searchTermLower) ||
        lastName.includes(searchTermLower) ||
        fullName.includes(searchTermLower) ||
        login.includes(searchTermLower) ||
        id === searchTermLower
      );
    });
  }

  getFriendshipForProfile(profileId: number): IFriendsList | undefined {
    return this.profileToFriendshipMap.get(profileId);
  }

  getPendingRequestCount(): void {
    this.friendsListService.getCurrentUserPendingFriendRequests().subscribe({
      next: res => {
        this.pendingRequestCount = (res.body ?? []).length;
      },
      error: () => {
        this.pendingRequestCount = 0;
      },
    });
  }

  refreshList(): void {
    this.loadAcceptedFriends();
  }

  onFriendshipChanged(event: string, profileId: number): void {
    // Reload profiles after friendship status changes
    this.loadAcceptedFriends();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchProfiles();
  }

  // Nickname editing functionality
  editNickname(friendship?: IFriendsList): void {
    if (!friendship) {
      return;
    }

    this.currentEditingFriendship = friendship;
    this.editingNickname = friendship.nickname ?? '';

    // Open the nickname modal
    this.modalService.open(this.nicknameModal, { centered: true });
  }

  saveNickname(): void {
    if (!this.currentEditingFriendship) {
      return;
    }

    // Update the friendship with the new nickname
    this.currentEditingFriendship.nickname = this.editingNickname;

    // Save to backend
    this.friendsListService.update(this.currentEditingFriendship).subscribe({
      next: () => {
        // Close the modal
        this.modalService.dismissAll();
        // Refresh the list to show updated nickname
        this.loadAcceptedFriends();
      },
      error: () => {
        // Handle error
        this.modalService.dismissAll();
      },
    });
  }
}
