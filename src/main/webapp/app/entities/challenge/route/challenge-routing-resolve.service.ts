import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IChallenge } from '../challenge.model';
import { ChallengeService } from '../service/challenge.service';

const challengeResolve = (route: ActivatedRouteSnapshot): Observable<null | IChallenge> => {
  const id = route.params.id;
  if (id) {
    return inject(ChallengeService)
      .find(id)
      .pipe(
        mergeMap((challenge: HttpResponse<IChallenge>) => {
          if (challenge.body) {
            return of(challenge.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default challengeResolve;
