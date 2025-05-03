import { Routes } from '@angular/router';
import profileResolve from './route/profile-routing-resolve.service';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ProfileDeleteDialogComponent } from './delete/profile-delete-dialog.component';

const profileRoutes: Routes = [
  { path: '', loadComponent: () => import('./list/profile.component').then(m => m.ProfileComponent) },
  {
    path: ':id/view',
    resolve: { profile: profileResolve },
    loadComponent: () => import('./detail/profile-detail.component').then(m => m.ProfileDetailComponent),
  },
  {
    path: 'my/edit',
    resolve: { profile: profileResolve },
    loadComponent: () => import('./update/profile-update.component').then(m => m.ProfileUpdateComponent),
  },
  {
    path: 'no-profile',
    loadComponent: () => import('./no-profile/no-profile.component').then(m => m.NoProfileComponent),
  },
  {
    path: 'deleteForm',
    component: ProfileDeleteDialogComponent,
    canActivate: [UserRouteAccessService], // Ensure user is logged in
  },
];
export default profileRoutes;
