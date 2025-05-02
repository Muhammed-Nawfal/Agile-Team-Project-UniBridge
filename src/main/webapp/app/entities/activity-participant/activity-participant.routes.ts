import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ActivityParticipantResolve from './route/activity-participant-routing-resolve.service';

const activityParticipantRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/activity-participant.component').then(m => m.ActivityParticipantComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/activity-participant-detail.component').then(m => m.ActivityParticipantDetailComponent),
    resolve: {
      activityParticipant: ActivityParticipantResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/activity-participant-update.component').then(m => m.ActivityParticipantUpdateComponent),
    resolve: {
      activityParticipant: ActivityParticipantResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/activity-participant-update.component').then(m => m.ActivityParticipantUpdateComponent),
    resolve: {
      activityParticipant: ActivityParticipantResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default activityParticipantRoute;
