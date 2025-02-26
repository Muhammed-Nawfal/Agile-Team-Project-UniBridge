import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ProfileResolve from './route/profile-routing-resolve.service';

const profileRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/profile.component').then(m => m.ProfileComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/profile-detail.component').then(m => m.ProfileDetailComponent),
    resolve: {
      profile: ProfileResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/profile-update.component').then(m => m.ProfileUpdateComponent),
    resolve: {
      profile: ProfileResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/profile-update.component').then(m => m.ProfileUpdateComponent),
    resolve: {
      profile: ProfileResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default profileRoute;
