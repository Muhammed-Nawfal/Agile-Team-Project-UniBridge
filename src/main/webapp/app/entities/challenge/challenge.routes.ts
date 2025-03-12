import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ChallengeResolve from './route/challenge-routing-resolve.service';

const challengeRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/challenge.component').then(m => m.ChallengeComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/challenge-detail.component').then(m => m.ChallengeDetailComponent),
    resolve: {
      challenge: ChallengeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/challenge-update.component').then(m => m.ChallengeUpdateComponent),
    resolve: {
      challenge: ChallengeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/challenge-update.component').then(m => m.ChallengeUpdateComponent),
    resolve: {
      challenge: ChallengeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default challengeRoute;
