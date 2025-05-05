import { Routes } from '@angular/router';
import { MyActivitiesComponent } from './my-activities.component';

const myActivitiesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./my-activities.component').then(m => m.MyActivitiesComponent),
  },
];

export default myActivitiesRoutes;
