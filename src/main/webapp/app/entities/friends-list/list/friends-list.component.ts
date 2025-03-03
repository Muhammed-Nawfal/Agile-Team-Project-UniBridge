import { Component, OnInit, inject } from '@angular/core';
import { FriendsListService } from '../service/friends-list.service';
import { IFriendsList } from '../friends-list.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'jhi-friends-list',
  templateUrl: './friends-list.component.html',
  imports: [CommonModule, FormsModule],
})
export class FriendsListComponent implements OnInit {
  friendsLists: IFriendsList[] = [];
  isLoading = false;
  searchQuery = '';
  pendingRequests = 2; // Mock value for friend requests count

  // Array of sample friend names
  friendNames: string[] = [
    'John Doe',
    'Jane Smith',
    'Michael Johnson',
    'Emily Davis',
    'Robert Wilson',
    'Sarah Brown',
    'David Miller',
    'Jessica Taylor',
  ];

  private readonly friendsListService = inject(FriendsListService);

  ngOnInit(): void {
    this.loadFriends();
  }

  loadFriends(): void {
    this.isLoading = true;
    this.friendsListService.query({ eagerload: true }).subscribe({
      next: res => {
        this.friendsLists = res.body ?? [];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  get filteredFriends(): IFriendsList[] {
    if (!this.searchQuery.trim()) {
      return this.friendsLists;
    }
    return this.friendsLists.filter(friend => this.getFriendName(friend).toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  // Returns friend name or a placeholder if missing
  getFriendName(friend: IFriendsList | null | undefined, index = 0): string {
    if (friend?.friend?.login) {
      return String(friend.friend.login);
    }
    return this.friendNames[index % this.friendNames.length];
  }

  // Displays a message alert
  messageFriend(friend: any): void {
    alert(`Messaging ${this.getFriendName(friend)}`);
  }

  // Shows friend requests alert
  viewFriendRequests(): void {
    alert(`Viewing friend requests`);
  }

  // Placeholder avatar URLs
  getAvatarUrl(index: number): string {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=Avatar${index}`;
  }
}
