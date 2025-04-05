import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ActivityTypeMapping, IActivityMatch, NewActivityMatch } from '../activity-match.model';
import { IProfile } from 'app/entities/profile/profile.model';
import { ActivityType } from '../../enumerations/activity-type.model';

export type PartialUpdateActivityMatch = Partial<IActivityMatch> & Pick<IActivityMatch, 'id'>;

export type EntityResponseType = HttpResponse<IActivityMatch>;
export type EntityArrayResponseType = HttpResponse<IActivityMatch[]>;

@Injectable({ providedIn: 'root' })
export class ActivityMatchService {
  protected readonly apiUrl = inject(ApplicationConfigService).getEndpointFor('api');

  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/activity-matches');
  protected profileUrl = this.applicationConfigService.getEndpointFor('api/profiles');

  create(activityMatch: NewActivityMatch): Observable<EntityResponseType> {
    return this.http.post<IActivityMatch>(this.resourceUrl, activityMatch, { observe: 'response' });
  }

  update(activityMatch: IActivityMatch): Observable<EntityResponseType> {
    return this.http.put<IActivityMatch>(`${this.resourceUrl}/${this.getActivityMatchIdentifier(activityMatch)}`, activityMatch, {
      observe: 'response',
    });
  }

  partialUpdate(activityMatch: PartialUpdateActivityMatch): Observable<EntityResponseType> {
    return this.http.patch<IActivityMatch>(`${this.resourceUrl}/${this.getActivityMatchIdentifier(activityMatch)}`, activityMatch, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IActivityMatch>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IActivityMatch[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getActivityMatchIdentifier(activityMatch: Pick<IActivityMatch, 'id'>): number {
    return activityMatch.id;
  }

  compareActivityMatch(o1: Pick<IActivityMatch, 'id'> | null, o2: Pick<IActivityMatch, 'id'> | null): boolean {
    return o1 && o2 ? this.getActivityMatchIdentifier(o1) === this.getActivityMatchIdentifier(o2) : o1 === o2;
  }

  addActivityMatchToCollectionIfMissing<Type extends Pick<IActivityMatch, 'id'>>(
    activityMatchCollection: Type[],
    ...activityMatchesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const activityMatches: Type[] = activityMatchesToCheck.filter(isPresent);
    if (activityMatches.length > 0) {
      const activityMatchCollectionIdentifiers = activityMatchCollection.map(activityMatchItem =>
        this.getActivityMatchIdentifier(activityMatchItem),
      );
      const activityMatchesToAdd = activityMatches.filter(activityMatchItem => {
        const activityMatchIdentifier = this.getActivityMatchIdentifier(activityMatchItem);
        if (activityMatchCollectionIdentifiers.includes(activityMatchIdentifier)) {
          return false;
        }
        activityMatchCollectionIdentifiers.push(activityMatchIdentifier);
        return true;
      });
      return [...activityMatchesToAdd, ...activityMatchCollection];
    }
    return activityMatchCollection;
  }
  /**
   * Fetch profiles by preferred activity.
   *
   * @param activityType the activity type to filter by.
   * @return an Observable of the list of profiles.
   */

  getProfilesByPreferredActivity(buddyType: string): Observable<HttpResponse<IProfile[]>> {
    const activityType = ActivityTypeMapping[buddyType as keyof typeof ActivityTypeMapping];
    return this.http.get<IProfile[]>(`${this.profileUrl}/preferred-activity`, {
      params: { activityType },
      observe: 'response',
    });
  }

  // getProfilesByPreferredActivity(activityType: ActivityType): Observable<HttpResponse<IProfile[]>> {
  //   return this.http.get<IProfile[]>(`${this.profileUrl}/preferred-activity`, {
  //     params: { activityType },
  //     observe: 'response',
  //   });
  // }
}
