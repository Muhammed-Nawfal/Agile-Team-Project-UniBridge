import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IActivityMatch } from '../activity-match.model';
import { ActivityMatchService } from '../service/activity-match.service';

const activityMatchResolve = (route: ActivatedRouteSnapshot): Observable<null | IActivityMatch> => {
  const id = route.params.id;
  if (id) {
    return inject(ActivityMatchService)
      .find(id)
      .pipe(
        mergeMap((activityMatch: HttpResponse<IActivityMatch>) => {
          if (activityMatch.body) {
            return of(activityMatch.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default activityMatchResolve;
