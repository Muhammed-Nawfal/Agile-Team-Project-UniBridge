import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IRanking, NewRanking } from '../ranking.model';
import { RestFriendsList } from '../../friends-list/service/friends-list.service';

export type PartialUpdateRanking = Partial<IRanking> & Pick<IRanking, 'id'>;

export type EntityResponseType = HttpResponse<IRanking>;
export type EntityArrayResponseType = HttpResponse<IRanking[]>;

@Injectable({ providedIn: 'root' })
export class RankingService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/rankings');

  create(ranking: NewRanking): Observable<EntityResponseType> {
    return this.http.post<IRanking>(this.resourceUrl, ranking, { observe: 'response' });
  }

  update(ranking: IRanking): Observable<EntityResponseType> {
    return this.http.put<IRanking>(`${this.resourceUrl}/${this.getRankingIdentifier(ranking)}`, ranking, { observe: 'response' });
  }

  partialUpdate(ranking: PartialUpdateRanking): Observable<EntityResponseType> {
    return this.http.patch<IRanking>(`${this.resourceUrl}/${this.getRankingIdentifier(ranking)}`, ranking, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IRanking>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IRanking[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  // getUserLogin(userID: number | undefined): Observable<EntityArrayResponseType> {
  //   return this.http
  //     .get<RestRanking[]>(`${this.resourceUrl}/getLogin/${userID}`, { observe: 'response' })
  //     .pipe(map(res => this.convertResponseArrayFromServer(res)));
  // }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getRankingIdentifier(ranking: Pick<IRanking, 'id'>): number {
    return ranking.id;
  }

  compareRanking(o1: Pick<IRanking, 'id'> | null, o2: Pick<IRanking, 'id'> | null): boolean {
    return o1 && o2 ? this.getRankingIdentifier(o1) === this.getRankingIdentifier(o2) : o1 === o2;
  }

  getRankingsByProfile(profileId: number): Observable<EntityArrayResponseType> {
    const url = `${this.resourceUrl}/by-rankGiven/${profileId}`;
    return this.http.get<IRanking[]>(url, { observe: 'response' });
  }

  addRankingToCollectionIfMissing<Type extends Pick<IRanking, 'id'>>(
    rankingCollection: Type[],
    ...rankingsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const rankings: Type[] = rankingsToCheck.filter(isPresent);
    if (rankings.length > 0) {
      const rankingCollectionIdentifiers = rankingCollection.map(rankingItem => this.getRankingIdentifier(rankingItem));
      const rankingsToAdd = rankings.filter(rankingItem => {
        const rankingIdentifier = this.getRankingIdentifier(rankingItem);
        if (rankingCollectionIdentifiers.includes(rankingIdentifier)) {
          return false;
        }
        rankingCollectionIdentifiers.push(rankingIdentifier);
        return true;
      });
      return [...rankingsToAdd, ...rankingCollection];
    }
    return rankingCollection;
  }
}
