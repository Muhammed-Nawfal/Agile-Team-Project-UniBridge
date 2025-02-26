import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IRanking } from '../ranking.model';
import { RankingService } from '../service/ranking.service';

const rankingResolve = (route: ActivatedRouteSnapshot): Observable<null | IRanking> => {
  const id = route.params.id;
  if (id) {
    return inject(RankingService)
      .find(id)
      .pipe(
        mergeMap((ranking: HttpResponse<IRanking>) => {
          if (ranking.body) {
            return of(ranking.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default rankingResolve;
