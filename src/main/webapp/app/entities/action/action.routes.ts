import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ActionResolve from './route/action-routing-resolve.service';

const actionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/action.component').then(m => m.ActionComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/action-detail.component').then(m => m.ActionDetailComponent),
    resolve: {
      action: ActionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/action-update.component').then(m => m.ActionUpdateComponent),
    resolve: {
      action: ActionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/action-update.component').then(m => m.ActionUpdateComponent),
    resolve: {
      action: ActionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default actionRoute;
