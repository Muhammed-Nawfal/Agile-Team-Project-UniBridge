import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IActivityParticipant } from '../activity-participant.model';
import { ActivityParticipantService } from '../service/activity-participant.service';

const activityParticipantResolve = (route: ActivatedRouteSnapshot): Observable<null | IActivityParticipant> => {
  const id = route.params.id;
  if (id) {
    return inject(ActivityParticipantService)
      .find(id)
      .pipe(
        mergeMap((activityParticipant: HttpResponse<IActivityParticipant>) => {
          if (activityParticipant.body) {
            return of(activityParticipant.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default activityParticipantResolve;
