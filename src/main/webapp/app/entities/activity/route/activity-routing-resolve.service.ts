import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IActivity } from '../activity.model';
import { ActivityService } from '../service/activity.service';

const activityResolve = (route: ActivatedRouteSnapshot): Observable<null | IActivity> => {
  const id = route.params.id;
  if (id) {
    return inject(ActivityService)
      .find(id)
      .pipe(
        mergeMap((activity: HttpResponse<IActivity>) => {
          if (activity.body) {
            return of(activity.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default activityResolve;
