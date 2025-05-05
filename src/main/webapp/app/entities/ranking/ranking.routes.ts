import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC, DESC } from 'app/config/navigation.constants';
import RankingResolve from './route/ranking-routing-resolve.service';

const rankingRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/ranking.component').then(m => m.RankingComponent),
    data: {
      defaultSort: `starAverage,${DESC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/ranking-detail.component').then(m => m.RankingDetailComponent),
    resolve: {
      ranking: RankingResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/ranking-update.component').then(m => m.RankingUpdateComponent),
    resolve: {
      ranking: RankingResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/ranking-update.component').then(m => m.RankingUpdateComponent),
    resolve: {
      ranking: RankingResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default rankingRoute;
