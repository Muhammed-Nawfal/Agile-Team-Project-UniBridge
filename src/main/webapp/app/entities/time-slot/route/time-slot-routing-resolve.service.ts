import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITimeSlot } from '../time-slot.model';
import { TimeSlotService } from '../service/time-slot.service';

const timeSlotResolve = (route: ActivatedRouteSnapshot): Observable<null | ITimeSlot> => {
  const id = route.params.id;
  if (id) {
    return inject(TimeSlotService)
      .find(id)
      .pipe(
        mergeMap((timeSlot: HttpResponse<ITimeSlot>) => {
          if (timeSlot.body) {
            return of(timeSlot.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default timeSlotResolve;
