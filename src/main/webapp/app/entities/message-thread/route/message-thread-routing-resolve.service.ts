import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IMessageThread } from '../message-thread.model';
import { MessageThreadService } from '../service/message-thread.service';

const messageThreadResolve = (route: ActivatedRouteSnapshot): Observable<null | IMessageThread> => {
  const id = route.params.id;
  if (id) {
    return inject(MessageThreadService)
      .find(id)
      .pipe(
        mergeMap((messageThread: HttpResponse<IMessageThread>) => {
          if (messageThread.body) {
            return of(messageThread.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default messageThreadResolve;
