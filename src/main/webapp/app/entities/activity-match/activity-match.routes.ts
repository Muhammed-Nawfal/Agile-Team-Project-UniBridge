import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ActivityMatchResolve from './route/activity-match-routing-resolve.service';
import { MatchingComponent } from './matching/matching.component';
import { MatchesListComponent } from './matches-list/matches-list.component';

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
    path: 'buddy/:type',
    loadComponent: () => import('./matching/matching.component').then(m => m.MatchingComponent),
    resolve: {
      matchingData: ActivityMatchResolve, // <- if you have a resolver
    },
    canActivate: [UserRouteAccessService], // Protect the route
  },
  {
    path: 'upcoming-matches',
    loadComponent: () => import('./matches-list/matches-list.component').then(m => m.MatchesListComponent),
    resolve: {
      matchesData: ActivityMatchResolve,
    },
    canActivate: [UserRouteAccessService], // Protect the route
  },
  {
    path: 'activity-match-requests',
    loadComponent: () => import('./activity-match-requests/activity-match-requests.component').then(m => m.ActivityMatchRequestsComponent),
    resolve: {
      requestsData: ActivityMatchResolve,
    },
    canActivate: [UserRouteAccessService], // Protect the route
  },
];

export default activityMatchRoute;
