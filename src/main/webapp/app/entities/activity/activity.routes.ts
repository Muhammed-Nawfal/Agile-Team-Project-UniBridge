import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ActivityResolve from './route/activity-routing-resolve.service';

const activityRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/activity.component').then(m => m.ActivityComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/activity-detail.component').then(m => m.ActivityDetailComponent),
    resolve: {
      activity: ActivityResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/activity-update.component').then(m => m.ActivityUpdateComponent),
    resolve: {
      activity: ActivityResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/activity-update.component').then(m => m.ActivityUpdateComponent),
    resolve: {
      activity: ActivityResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default activityRoute;
