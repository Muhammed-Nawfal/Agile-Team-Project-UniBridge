import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import MessageThreadResolve from './route/message-thread-routing-resolve.service';

const messageThreadRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/message-thread.component').then(m => m.MessageThreadComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/message-thread-detail.component').then(m => m.MessageThreadDetailComponent),
    resolve: {
      messageThread: MessageThreadResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/message-thread-update.component').then(m => m.MessageThreadUpdateComponent),
    resolve: {
      messageThread: MessageThreadResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/message-thread-update.component').then(m => m.MessageThreadUpdateComponent),
    resolve: {
      messageThread: MessageThreadResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default messageThreadRoute;
