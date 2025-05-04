import { Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

const chatRoutes: Routes = [
  // NEW: conversation view
  {
    path: 'thread/:threadId',
    loadComponent: () => import('./list/chat.component').then(m => m.ChatComponent),
    canActivate: [UserRouteAccessService],
  },
  // list / CRUD views follow...
  {
    path: '',
    loadComponent: () => import('./list/chat.component').then(m => m.ChatComponent),
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/chat-detail.component').then(m => m.ChatDetailComponent),
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/chat-update.component').then(m => m.ChatUpdateComponent),
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/chat-update.component').then(m => m.ChatUpdateComponent),
    canActivate: [UserRouteAccessService],
  },
];

export default chatRoutes;
