import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module'; // Import shared utilities
import { FriendsListComponent } from './list/friends-list.component';
import { FriendRequestsComponent } from './friend-requests/friend-requests.component';

@NgModule({
  declarations: [
    // Declare FriendsListComponent
    // Declare FriendRequestsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FriendsListComponent,
    FriendRequestsComponent,
    // Add this to use shared pipes, directives, etc.
  ],
  exports: [
    FriendsListComponent, // Export FriendsListComponent
    FriendRequestsComponent, // Export FriendRequestsComponent
  ],
})
export class FriendsListModule {}
