import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IActivityParticipant, NewActivityParticipant } from '../activity-participant.model';
import { IActivity } from '../../activity/activity.model';

export type PartialUpdateActivityParticipant = Partial<IActivityParticipant> & Pick<IActivityParticipant, 'id'>;

type RestOf<T extends IActivityParticipant | NewActivityParticipant> = Omit<T, 'joinedDate'> & {
  joinedDate?: string | null;
};

export type RestActivityParticipant = RestOf<IActivityParticipant>;

export type NewRestActivityParticipant = RestOf<NewActivityParticipant>;

export type PartialUpdateRestActivityParticipant = RestOf<PartialUpdateActivityParticipant>;

export type EntityResponseType = HttpResponse<IActivityParticipant>;
export type EntityArrayResponseType = HttpResponse<IActivityParticipant[]>;

@Injectable({ providedIn: 'root' })
export class ActivityParticipantService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/activity-participants');

  create(activityParticipant: NewActivityParticipant): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activityParticipant);
    return this.http
      .post<RestActivityParticipant>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(activityParticipant: IActivityParticipant): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activityParticipant);
    return this.http
      .put<RestActivityParticipant>(`${this.resourceUrl}/${this.getActivityParticipantIdentifier(activityParticipant)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(activityParticipant: PartialUpdateActivityParticipant): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(activityParticipant);
    return this.http
      .patch<RestActivityParticipant>(`${this.resourceUrl}/${this.getActivityParticipantIdentifier(activityParticipant)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestActivityParticipant>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestActivityParticipant[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getActivityParticipantIdentifier(activityParticipant: Pick<IActivityParticipant, 'id'>): number {
    return activityParticipant.id;
  }

  compareActivityParticipant(o1: Pick<IActivityParticipant, 'id'> | null, o2: Pick<IActivityParticipant, 'id'> | null): boolean {
    return o1 && o2 ? this.getActivityParticipantIdentifier(o1) === this.getActivityParticipantIdentifier(o2) : o1 === o2;
  }

  addActivityParticipantToCollectionIfMissing<Type extends Pick<IActivityParticipant, 'id'>>(
    activityParticipantCollection: Type[],
    ...activityParticipantsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const activityParticipants: Type[] = activityParticipantsToCheck.filter(isPresent);
    if (activityParticipants.length > 0) {
      const activityParticipantCollectionIdentifiers = activityParticipantCollection.map(activityParticipantItem =>
        this.getActivityParticipantIdentifier(activityParticipantItem),
      );
      const activityParticipantsToAdd = activityParticipants.filter(activityParticipantItem => {
        const activityParticipantIdentifier = this.getActivityParticipantIdentifier(activityParticipantItem);
        if (activityParticipantCollectionIdentifiers.includes(activityParticipantIdentifier)) {
          return false;
        }
        activityParticipantCollectionIdentifiers.push(activityParticipantIdentifier);
        return true;
      });
      return [...activityParticipantsToAdd, ...activityParticipantCollection];
    }
    return activityParticipantCollection;
  }

  /**
   * Join an activity for the current logged-in user
   *
   * @param activityId the ID of the activity to join
   * @returns the created ActivityParticipant entity
   */
  joinActivity(activityId: number): Observable<IActivityParticipant> {
    return this.http.post<IActivityParticipant>(`${this.resourceUrl}/activities/${activityId}/join`, {});
  }

  /**
   * checks if the current user has joined an activity
   *
   * @param activityId the ID of the activity to check
   * @returns true if the user has joined, false otherwise
   */
  hasUserJoinedActivity(activityId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.resourceUrl}/activities/${activityId}/has-joined`);
  }

  /**
   * gets all participants for an activity
   *
   * @param activityId the ID of the activity
   * @returns the list of activity participants
   */
  getActivityParticipants(activityId: number): Observable<IActivityParticipant[]> {
    return this.http.get<IActivityParticipant[]>(`${this.resourceUrl}/activities/${activityId}/participants`);
  }

  /**
   * gets all activities joined by the current user
   *
   * @returns the list of activity participants
   */
  getUserActivities(): Observable<IActivityParticipant[]> {
    return this.http.get<IActivityParticipant[]>(`${this.resourceUrl}/profiles/activities`);
  }

  // New method to get activity details including status
  getActivityDetails(activityId: number): Observable<HttpResponse<IActivity>> {
    // This endpoint should return the activity details from your activity API
    return this.http.get<IActivity>(`api/activities/${activityId}`, { observe: 'response' });
  }

  protected convertDateFromClient<T extends IActivityParticipant | NewActivityParticipant | PartialUpdateActivityParticipant>(
    activityParticipant: T,
  ): RestOf<T> {
    return {
      ...activityParticipant,
      joinedDate: activityParticipant.joinedDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restActivityParticipant: RestActivityParticipant): IActivityParticipant {
    return {
      ...restActivityParticipant,
      joinedDate: restActivityParticipant.joinedDate ? dayjs(restActivityParticipant.joinedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestActivityParticipant>): HttpResponse<IActivityParticipant> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestActivityParticipant[]>): HttpResponse<IActivityParticipant[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
