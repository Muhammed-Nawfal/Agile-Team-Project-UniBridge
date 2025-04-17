import { Routes } from '@angular/router';

import { Authority } from 'app/config/authority.constants';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { errorRoute } from './layouts/error/error.route';
import { ActivityMatchComponent } from './entities/activity-match/list/activity-match.component';

const routes: Routes = [
  {
    path: '',
    component: ActivityMatchComponent,
    title: 'home.title',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar.component'),
    outlet: 'navbar',
  },
  {
    path: 'admin',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.route'),
  },
  {
    path: 'no-profile',
    loadComponent: () => import('./entities/profile/no-profile/no-profile.component').then(m => m.NoProfileComponent),
  },

  {
    path: 'gdpr-policy',
    loadComponent: () => import('./gdpr-policy/gdpr-policy.component'),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component'),
    title: 'login.title',
  },
  {
    path: '',
    loadChildren: () => import(`./entities/entity.routes`),
  },
  ...errorRoute,
];

export default routes;
