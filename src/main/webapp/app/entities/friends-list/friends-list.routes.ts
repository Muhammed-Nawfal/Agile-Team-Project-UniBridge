import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import FriendsListResolve from './route/friends-list-routing-resolve.service';

const friendsListRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/friends-list.component').then(m => m.FriendsListComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'requests',
    loadComponent: () => import('./friend-requests/friend-requests.component').then(m => m.FriendRequestsComponent),
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/friends-list-detail.component').then(m => m.FriendsListDetailComponent),
    resolve: {
      friendsList: FriendsListResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/friends-list-update.component').then(m => m.FriendsListUpdateComponent),
    resolve: {
      friendsList: FriendsListResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/friends-list-update.component').then(m => m.FriendsListUpdateComponent),
    resolve: {
      friendsList: FriendsListResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default friendsListRoute;
