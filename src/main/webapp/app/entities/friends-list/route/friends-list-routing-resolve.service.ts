import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFriendsList } from '../friends-list.model';
import { FriendsListService } from '../service/friends-list.service';

const friendsListResolve = (route: ActivatedRouteSnapshot): Observable<null | IFriendsList> => {
  const id = route.params.id;
  if (id) {
    return inject(FriendsListService)
      .find(id)
      .pipe(
        mergeMap((friendsList: HttpResponse<IFriendsList>) => {
          if (friendsList.body) {
            return of(friendsList.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default friendsListResolve;
