import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'Authorities' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/list/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'activity',
    data: { pageTitle: 'Activities' },
    loadChildren: () => import('./activity/activity.routes'),
  },
  {
    path: 'activity-match',
    data: { pageTitle: 'ActivityMatches' },
    loadChildren: () => import('./activity-match/activity-match.routes'),
  },
  {
    path: 'booking',
    data: { pageTitle: 'Bookings' },
    loadChildren: () => import('./booking/booking.routes'),
  },
  {
    path: 'notification',
    data: { pageTitle: 'Notifications' },
    loadChildren: () => import('./notification/notification.routes'),
  },
  {
    path: 'friends-list',
    data: { pageTitle: 'FriendsLists' },
    loadChildren: () => import('./friends-list/friends-list.routes'),
  },
  {
    path: 'ranking',
    data: { pageTitle: 'Rankings' },
    loadChildren: () => import('./ranking/ranking.routes'),
  },
  {
    path: 'review',
    data: { pageTitle: 'Reviews' },
    loadChildren: () => import('./review/review.routes'),
  },
  {
    path: 'chat',
    data: { pageTitle: 'Chats' },
    loadChildren: () => import('./chat/chat.routes'),
  },
  {
    path: 'action',
    data: { pageTitle: 'Actions' },
    loadChildren: () => import('./action/action.routes'),
  },

  {
    path: 'challenge',
    data: { pageTitle: 'Challenge' },
    loadChildren: () => import('./challenge/challenge.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
