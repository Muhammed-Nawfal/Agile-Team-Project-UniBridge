import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ActivityMatchResolve from './route/activity-match-routing-resolve.service';
import { MatchingComponent } from './matching/matching.component';
import { ActivityMatchComponent } from './list/activity-match.component';

const activityMatchRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/activity-match.component').then(m => m.ActivityMatchComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/activity-match-detail.component').then(m => m.ActivityMatchDetailComponent),
    resolve: {
      activityMatch: ActivityMatchResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/activity-match-update.component').then(m => m.ActivityMatchUpdateComponent),
    resolve: {
      activityMatch: ActivityMatchResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/activity-match-update.component').then(m => m.ActivityMatchUpdateComponent),
    resolve: {
      activityMatch: ActivityMatchResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: '',
    component: ActivityMatchComponent,
  },
  {
    path: 'buddy/:type',
    component: MatchingComponent,
  },
];

export default activityMatchRoute;
