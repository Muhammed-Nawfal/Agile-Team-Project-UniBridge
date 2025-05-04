// entity.routes.ts
import { Routes } from '@angular/router';
import profileResolve from './profile/route/profile-routing-resolve.service';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'Authorities' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'profile',
    data: { pageTitle: 'Profile' },
    loadChildren: () => import('./profile/profile.routes'),
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
  {
    path: 'activity-participant',
    data: { pageTitle: 'ActivityParticipants' },
    loadChildren: () => import('./activity-participant/activity-participant.routes'),
  },
  {
    path: 'message-thread',
    data: { pageTitle: 'MessageThreads' },
    loadChildren: () => import('./message-thread/message-thread.routes'),
  },
  {
    path: 'event',
    data: { pageTitle: 'Events' },
    loadChildren: () => import('./event/event.routes'),
  },
  {
    path: 'time-slot',
    data: { pageTitle: 'TimeSlots' },
    loadChildren: () => import('./time-slot/time-slot.routes'),
  },
  {
    path: 'location',
    data: { pageTitle: 'Locations' },
    loadChildren: () => import('./location/location.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
