import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import TimeSlotResolve from './route/time-slot-routing-resolve.service';

const timeSlotRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/time-slot.component').then(m => m.TimeSlotComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/time-slot-detail.component').then(m => m.TimeSlotDetailComponent),
    resolve: {
      timeSlot: TimeSlotResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/time-slot-update.component').then(m => m.TimeSlotUpdateComponent),
    resolve: {
      timeSlot: TimeSlotResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/time-slot-update.component').then(m => m.TimeSlotUpdateComponent),
    resolve: {
      timeSlot: TimeSlotResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default timeSlotRoute;
