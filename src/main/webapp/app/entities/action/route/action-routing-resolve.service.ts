import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAction } from '../action.model';
import { ActionService } from '../service/action.service';

const actionResolve = (route: ActivatedRouteSnapshot): Observable<null | IAction> => {
  const id = route.params.id;
  if (id) {
    return inject(ActionService)
      .find(id)
      .pipe(
        mergeMap((action: HttpResponse<IAction>) => {
          if (action.body) {
            return of(action.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default actionResolve;
