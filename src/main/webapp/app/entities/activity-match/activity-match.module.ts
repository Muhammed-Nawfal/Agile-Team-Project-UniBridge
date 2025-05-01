import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import activityMatchRoute from './activity-match.routes';

@NgModule({
  imports: [
    activityMatchRoute,
    RouterModule,
    // Any other shared modules you need
  ],
  declarations: [
    // Only non-standalone components would go here
  ],
})
export class ActivityMatchModule {}
