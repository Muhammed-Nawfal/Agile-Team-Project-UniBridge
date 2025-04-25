import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IChallenge, NewChallenge } from '../challenge.model';

export type PartialUpdateChallenge = Partial<IChallenge> & Pick<IChallenge, 'id'>;

type RestOf<T extends IChallenge | NewChallenge> = Omit<T, 'date'> & {
  date?: string | null;
};

export type RestChallenge = RestOf<IChallenge>;

export type NewRestChallenge = RestOf<NewChallenge>;

export type PartialUpdateRestChallenge = RestOf<PartialUpdateChallenge>;

export type EntityResponseType = HttpResponse<IChallenge>;
export type EntityArrayResponseType = HttpResponse<IChallenge[]>;

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/challenges');

  create(challenge: NewChallenge): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(challenge);
    return this.http
      .post<RestChallenge>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(challenge: IChallenge): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(challenge);
    return this.http
      .put<RestChallenge>(`${this.resourceUrl}/${this.getChallengeIdentifier(challenge)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(challenge: PartialUpdateChallenge): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(challenge);
    return this.http
      .patch<RestChallenge>(`${this.resourceUrl}/${this.getChallengeIdentifier(challenge)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestChallenge>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestChallenge[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getChallengeIdentifier(challenge: Pick<IChallenge, 'id'>): number {
    return challenge.id;
  }

  compareChallenge(o1: Pick<IChallenge, 'id'> | null, o2: Pick<IChallenge, 'id'> | null): boolean {
    return o1 && o2 ? this.getChallengeIdentifier(o1) === this.getChallengeIdentifier(o2) : o1 === o2;
  }

  addChallengeToCollectionIfMissing<Type extends Pick<IChallenge, 'id'>>(
    challengeCollection: Type[],
    ...challengesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const challenges: Type[] = challengesToCheck.filter(isPresent);
    if (challenges.length > 0) {
      const challengeCollectionIdentifiers = challengeCollection.map(challengeItem => this.getChallengeIdentifier(challengeItem));
      const challengesToAdd = challenges.filter(challengeItem => {
        const challengeIdentifier = this.getChallengeIdentifier(challengeItem);
        if (challengeCollectionIdentifiers.includes(challengeIdentifier)) {
          return false;
        }
        challengeCollectionIdentifiers.push(challengeIdentifier);
        return true;
      });
      return [...challengesToAdd, ...challengeCollection];
    }
    return challengeCollection;
  }

  protected convertDateFromClient<T extends IChallenge | NewChallenge | PartialUpdateChallenge>(challenge: T): RestOf<T> {
    return {
      ...challenge,
      date: challenge.date?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restChallenge: RestChallenge): IChallenge {
    return {
      ...restChallenge,
      date: restChallenge.date ? dayjs(restChallenge.date) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestChallenge>): HttpResponse<IChallenge> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestChallenge[]>): HttpResponse<IChallenge[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
