import { Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

const trophyRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/trophy.component').then(m => m.TrophyComponent),
    data: {
      pageTitle: 'My Trophies',
    },
    canActivate: [UserRouteAccessService],
  },
];

export default trophyRoute;
