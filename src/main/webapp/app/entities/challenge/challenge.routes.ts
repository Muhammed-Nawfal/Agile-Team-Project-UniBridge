import type { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ChallengeResolve from './route/challenge-routing-resolve.service';

export const challengeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/challenge-list.component').then(m => m.ChallengeListComponent),
    data: {
      pageTitle: 'Challenges',
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
    path: 'mytrophies',
    loadComponent: () => import('./mytrophies/trophy.component').then(m => m.TrophyComponent),
    data: {
      pageTitle: 'My Trophies',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'my',
    loadComponent: () => import('./mychallenges/mychallenges.component').then(m => m.MyChallengesComponent),
    data: {
      pageTitle: 'My Challenges',
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

export default challengeRoutes;
