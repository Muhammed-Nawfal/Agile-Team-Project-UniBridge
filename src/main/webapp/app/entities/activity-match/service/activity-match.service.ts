import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IActivityMatch, NewActivityMatch } from '../activity-match.model';
import { IProfile } from 'app/entities/profile/profile.model';
import { ActivityType } from '../../enumerations/activity-type.model';

export type PartialUpdateActivityMatch = Partial<IActivityMatch> & Pick<IActivityMatch, 'id'>;

type RestOf<T extends IActivityMatch | NewActivityMatch> = Omit<T, 'matchDate' | 'matchTime' | 'createdAt' | 'responseAt'> & {
  matchDate?: string | null;
  matchTime?: string | null;
  createdAt?: string | null;
  responseAt?: string | null;
};

export type RestActivityMatch = RestOf<IActivityMatch>;

export type NewRestActivityMatch = RestOf<NewActivityMatch>;

export type PartialUpdateRestActivityMatch = RestOf<PartialUpdateActivityMatch>;

export type EntityResponseType = HttpResponse<IActivityMatch>;
export type EntityArrayResponseType = HttpResponse<IActivityMatch[]>;

@Injectable({ providedIn: 'root' })
export class ActivityMatchService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/activity-matches');
  protected profileUrl = this.applicationConfigService.getEndpointFor('api/profiles');

  getProfilesByPreferredActivity(activityType: ActivityType): Observable<HttpResponse<IProfile[]>> {
    return this.http.get<IProfile[]>(`${this.profileUrl}/preferred-activity`, {
      params: { activityType },
      observe: 'response',
    });
  }

  create(activityMatch: NewActivityMatch): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activityMatch);
    return this.http
      .post<RestActivityMatch>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(activityMatch: IActivityMatch): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activityMatch);
    return this.http
      .put<RestActivityMatch>(`${this.resourceUrl}/${this.getActivityMatchIdentifier(activityMatch)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(activityMatch: PartialUpdateActivityMatch): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activityMatch);
    return this.http
      .patch<RestActivityMatch>(`${this.resourceUrl}/${this.getActivityMatchIdentifier(activityMatch)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestActivityMatch>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestActivityMatch[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
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

  forUser(userId: number): Observable<HttpResponse<IActivityMatch[]>> {
    return this.http.get<IActivityMatch[]>(`${this.resourceUrl}/for-user/${userId}`, { observe: 'response' });
  }

  protected convertDateFromClient<T extends IActivityMatch | NewActivityMatch | PartialUpdateActivityMatch>(activityMatch: T): RestOf<T> {
    return {
      ...activityMatch,
      matchDate: activityMatch.matchDate?.format(DATE_FORMAT) ?? null,
      matchTime: activityMatch.matchTime?.toJSON() ?? null,
      createdAt: activityMatch.createdAt?.toJSON() ?? null,
      responseAt: activityMatch.responseAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restActivityMatch: RestActivityMatch): IActivityMatch {
    return {
      ...restActivityMatch,
      matchDate: restActivityMatch.matchDate ? dayjs(restActivityMatch.matchDate) : undefined,
      matchTime: restActivityMatch.matchTime ? dayjs(restActivityMatch.matchTime) : undefined,
      createdAt: restActivityMatch.createdAt ? dayjs(restActivityMatch.createdAt) : undefined,
      responseAt: restActivityMatch.responseAt ? dayjs(restActivityMatch.responseAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestActivityMatch>): HttpResponse<IActivityMatch> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestActivityMatch[]>): HttpResponse<IActivityMatch[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }

  // getProfilesByPreferredActivity(buddyType: string): Observable<HttpResponse<IProfile[]>> {
  //   const activityType = ActivityTypeMapping[buddyType as keyof typeof ActivityTypeMapping];
  //   return this.http.get<IProfile[]>(`${this.profileUrl}/preferred-activity`, {
  //     params: { activityType },
  //     observe: 'response',
  //   });
  // }
}
