// import { Pipe, PipeTransform } from '@angular/core';
// import { IActivity } from 'app/entities/activity/activity.model';
// import { ProfileService } from 'app/entities/profile/service/profile.service';
// import { map, Observable, of } from 'rxjs';
//
// @Pipe({
//   name: 'creatorFilter',
//   pure: false, // Mark as impure since we need to re-evaluate when the current user changes
// })
// export class CreatorFilterPipe implements PipeTransform {
//   constructor(private profileService: ProfileService) {}
//
//   transform(activities: IActivity[] | null): Observable<IActivity[]> {
//     if (!activities || activities.length === 0) {
//       return of([]);
//     }
//
//     return this.profileService.getCurrentUserProfile().pipe(
//       map(currentProfile => {
//         if (!currentProfile) {
//           return [];
//         }
//
//         // Filter activities where the current user is the creator
//         return activities.filter(activity => activity.creator && activity.creator.id === currentProfile.id);
//       }),
//     );
//   }
// }
