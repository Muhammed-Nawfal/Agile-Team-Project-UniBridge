import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  { path: 'profile', loadComponent: () => import('./list/profile.component').then(m => m.ProfileComponent) },
  { path: 'profile/:id/view', loadComponent: () => import('./detail/profile-detail.component').then(m => m.ProfileDetailComponent) },
  { path: 'profile/:id/edit', loadComponent: () => import('./update/profile-update.component').then(m => m.ProfileUpdateComponent) },
];
