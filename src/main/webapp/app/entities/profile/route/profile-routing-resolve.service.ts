import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IProfile } from '../profile.model';
import { ProfileService } from '../service/profile.service';
import { AccountService } from 'app/core/auth/account.service';

// Example: if you add a method that returns the current user's profile
const profileResolve = (route: ActivatedRouteSnapshot): Observable<IProfile> => {
  return inject(ProfileService)
    .findMyProfile()
    .pipe(
      mergeMap((profileResponse: HttpResponse<IProfile>) => {
        if (profileResponse.body) {
          return of(profileResponse.body);
        }
        inject(Router).navigate(['404']);
        return EMPTY;
      }),
    );
};

export default profileResolve;
